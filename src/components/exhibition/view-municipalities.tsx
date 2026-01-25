import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMunicipalityStore } from "@/stores/municipality-store";
import { useVenueRequestStore } from "@/stores/venue-request-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Building2, Loader2, ChevronLeft, Info, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VenueRequestStatusLabels, getVenueRequestStatusBadgeClass, type VenueRequestStatus, type VenueRequestResponse } from "@/types/municipality";

export default function Municipality() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { municipalities, isLoading, error, selectedMunicipalityId, fetchMunicipalities, setSelectedMunicipality } = useMunicipalityStore();
    const { venueRequests, isLoading: requestsLoading, fetchVenueRequests } = useVenueRequestStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<VenueRequestResponse | null>(null);

    const exhibitionId = id ? parseInt(id) : undefined;

    useEffect(() => {
        fetchMunicipalities();
        if (exhibitionId) {
            fetchVenueRequests(exhibitionId);
        }
    }, [fetchMunicipalities, fetchVenueRequests, exhibitionId]);

    const handleVenueClick = (municipalityId: number) => {
        setSelectedMunicipality(municipalityId);
        navigate(`/dashboard/exhibitions/${id}/venues`, { state: { municipalityId } });
    };

    const handleWhyClick = (request: VenueRequestResponse) => {
        setSelectedRequest(request);
        setIsDialogOpen(true);
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return "غير محدد";
        try {
            const date = new Date(dateString);
            return date.toLocaleString('ar-SA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateString;
        }
    };

    const getStatusIcon = (status: VenueRequestStatus) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'REJECTED':
                return <XCircle className="h-4 w-4" />;
            case 'PENDING':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    if (isLoading || requestsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري تحميل البلديات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive text-center">{error}</p>
                        <Button
                            onClick={() => fetchMunicipalities()}
                            className="mt-4 w-full"
                            variant="outline"
                        >
                            إعادة المحاولة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="space-y-4">
                {/* <div className="mb-4 md:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">اختر البلدية</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        اختر البلدية التي تريد طلب مكان المعرض منها
                    </p>
                </div> */}

            {/* Venue Requests Table */}
            {venueRequests.length > 0 && (
                // <Card className="border-none bg-transparent p-0">
                <>
                    <CardHeader className="p-0 m-0">
                        <CardTitle className="text-base sm:text-lg bg-transparent">طلبات الأماكن</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="rounded-md border bg-transparent overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right whitespace-nowrap">الحالة</TableHead>
                                        <TableHead className="text-right whitespace-nowrap">المكان</TableHead>
                                        <TableHead className="text-right whitespace-nowrap hidden sm:table-cell">العنوان</TableHead>
                                        <TableHead className="text-right whitespace-nowrap hidden md:table-cell">تاريخ الطلب</TableHead>
                                        <TableHead className="text-right whitespace-nowrap hidden lg:table-cell">الموعد النهائي</TableHead>
                                        <TableHead className="text-right whitespace-nowrap hidden xl:table-cell">تاريخ الرد</TableHead>
                                        <TableHead className="text-center whitespace-nowrap">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {venueRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="whitespace-nowrap">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    {getStatusIcon(request.status as VenueRequestStatus)}
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`${getVenueRequestStatusBadgeClass(request.status as VenueRequestStatus)} text-xs`}
                                                    >
                                                        {VenueRequestStatusLabels[request.status as VenueRequestStatus]}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[150px] sm:max-w-none truncate">
                                                {request.venueName}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground max-w-[200px] truncate hidden sm:table-cell">
                                                {request.venueAddress}
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                                                {formatDateTime(request.requestedAt)}
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">
                                                {formatDateTime(request.responseDeadline)}
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">
                                                {formatDateTime(request.reviewedAt)}
                                            </TableCell>
                                            <TableCell className="text-center whitespace-nowrap">
                                                {(request.status === 'APPROVED' || request.status === 'REJECTED') && request.municipalityResponse && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleWhyClick(request)}
                                                        className="text-xs sm:text-sm"
                                                    >
                                                        <Info className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                                                        <span className="hidden sm:inline">لماذا؟</span>
                                                        <span className="sm:hidden">؟</span>
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                {/*  </Card> */}
                </>
            )}

            {municipalities.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            لا توجد بلديات متاحة حالياً
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {municipalities.map((municipality) => (
                        <Card
                            key={municipality.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedMunicipalityId === municipality.id
                                ? "border-primary border-2 bg-primary/5"
                                : "hover:border-primary/50"
                                }`}
                            onClick={() => setSelectedMunicipality(municipality.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{municipality.name}</CardTitle>

                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-primary p-0 h-auto font-semibold flex items-center gap-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVenueClick(municipality.id);
                                        }}
                                    >
                                        عرض الأماكن
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span>{municipality.region}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{municipality.contactEmail}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span>{municipality.contactPhone}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Why Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                
                <DialogContent dir="rtl">
                   <DialogHeader dir="rtl" className="text-right">
                        <DialogTitle dir="rtl" className="text-right">
                            {selectedRequest?.status === 'APPROVED' ? 'سبب الموافقة' : 'سبب الرفض'}
                        </DialogTitle>
                        <DialogDescription dir="rtl" className="text-right">
                            رد البلدية على طلب المكان
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="rounded-lg border p-4 bg-muted/50">
                            <p className="text-sm font-medium mb-2">المكان المطلوب:</p>
                            <p className="text-sm">{selectedRequest?.venueName}</p>
                            <p className="text-xs text-muted-foreground mt-1">{selectedRequest?.venueAddress}</p>
                        </div>
                        
                        <div className="rounded-lg border p-4">
                            <p className="text-sm font-medium mb-2">ملاحظات المنظمة:</p>
                            <p className="text-sm">{selectedRequest?.orgNotes || 'لا توجد ملاحظات'}</p>
                        </div>
                        
                        <div className="rounded-lg border p-4">
                            <p className="text-sm font-medium mb-2">رد البلدية:</p>
                            <p className="text-sm">{selectedRequest?.municipalityResponse || 'لا يوجد رد'}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="text-xs text-muted-foreground">
                                <span>تاريخ الطلب: {formatDateTime(selectedRequest?.requestedAt || null)}</span>
                            </div>
                            {selectedRequest?.reviewedAt && (
                                <div className="text-xs text-muted-foreground">
                                    <span>تاريخ المراجعة: {formatDateTime(selectedRequest.reviewedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    );
}
