import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useVenueStore } from "@/stores/venue-store";
import { useMunicipalityStore } from "@/stores/municipality-store";
import { useVenueRequestStore } from "@/stores/venue-request-store";
import { venueRequestService } from "@/services/venue-request-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    MapPin,
    Users,
    DollarSign,
    Maximize2,
    Loader2,
    Building2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { formatRentalFee, formatSpace, getAvailabilityLabel, getAvailabilityBadgeClass } from "@/types/venue";
import { VenueRequestStatusLabels, getVenueRequestStatusBadgeClass, type VenueRequestStatus } from "@/types/municipality";
import VenueRegistrationDialog from "@/components/exhibition/venue-registration-dialog";

export default function RequestVenue() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: exhibitionId } = useParams();
    const { venues, isLoading, error, selectedVenueId, fetchVenuesByMunicipality, setSelectedVenue } = useVenueStore();
    const { selectedMunicipalityId } = useMunicipalityStore();
    const { venueRequests, fetchVenueRequests } = useVenueRequestStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedVenueForRegistration, setSelectedVenueForRegistration] = useState<number | null>(null);

    // Get municipalityId from navigation state or from store
    const municipalityId = location.state?.municipalityId || selectedMunicipalityId;

    useEffect(() => {
        if (municipalityId) {
            fetchVenuesByMunicipality(municipalityId);
        }
        if (exhibitionId) {
            fetchVenueRequests(Number(exhibitionId));
        }
    }, [municipalityId, exhibitionId, fetchVenuesByMunicipality, fetchVenueRequests]);

    const filteredVenues = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper function to get venue request status
    const getVenueRequestStatus = (venueId: number) => {
        return venueRequests.find(req => req.venueId === venueId);
    };

    // Check if there's a pending request
    const hasPendingRequest = venueRequests.some(req => req.status === 'PENDING');
    const pendingRequest = venueRequests.find(req => req.status === 'PENDING');
    
    // Check if there's an approved request
    const hasApprovedRequest = venueRequests.some(req => req.status === 'APPROVED');
    const approvedRequest = venueRequests.find(req => req.status === 'APPROVED');

    const handleVenueSelect = (venueId: number) => {
        setSelectedVenue(venueId);
    };

    const handleRegisterClick = (venueId: number) => {
        setSelectedVenueForRegistration(venueId);
        setDialogOpen(true);
    };

    const handleRegister = async (orgNotes: string) => {
        if (!exhibitionId || !selectedVenueForRegistration) {
            toast.error("معرف المعرض أو المكان غير موجود");
            setDialogOpen(false);
            return;
        }

        setIsSubmitting(true);
        try {
            // Set response deadline to 7 days from now
            const responseDeadline = new Date();
            responseDeadline.setDate(responseDeadline.getDate() + 7);

            await venueRequestService.createVenueRequest({
                exhibitionId: Number(exhibitionId),
                venueId: selectedVenueForRegistration,
                orgNotes: orgNotes || "طلب حجز مكان للمعرض",
                responseDeadline: responseDeadline.toISOString()
            });

            toast.success("تم التسجيل بنجاح", {
                description: "تم إرسال طلب حجز المكان إلى البلدية"
            });

            setDialogOpen(false);
            setSelectedVenueForRegistration(null);

            // Navigate back or to next step after successful registration
            setTimeout(() => {
                navigate(`/dashboard/exhibitions/${exhibitionId}`);
            }, 1500);
        } catch (error) {
            console.error('Failed to create venue request:', error);
            toast.error("فشل التسجيل", {
                description: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الطلب"
            });
            setDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري تحميل الأماكن...</p>
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
                            onClick={() => municipalityId && fetchVenuesByMunicipality(municipalityId)}
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

    if (!municipalityId) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                            يرجى اختيار بلدية أولاً
                        </p>
                        <Button onClick={() => navigate(-1)}>
                            العودة لاختيار البلدية
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6">
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    اختر المكان للمعرض
                </h1>
                <p className="text-muted-foreground">
                    اختر المكان المناسب من الأماكن المتاحة
                </p>
            </div>

            {/* Approved Request Alert */}
            {hasApprovedRequest && (
                <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900 dark:text-green-100">تم قبول طلب المكان</AlertTitle>
                    <AlertDescription className="text-green-800 dark:text-green-200">
                        تم قبول طلبك للمكان "{approvedRequest?.venueName}". لا يمكنك تسجيل أماكن متعددة لنفس المعرض.
                    </AlertDescription>
                </Alert>
            )}

            {/* Pending Request Alert */}
            {hasPendingRequest && (
                <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900 dark:text-amber-100">في انتظار رد البلدية</AlertTitle>
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                        لديك طلب قيد المراجعة للمكان "{pendingRequest?.venueName}". لا يمكنك إرسال طلبات جديدة حتى ترد البلدية على طلبك الحالي.
                    </AlertDescription>
                </Alert>
            )}

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث عن مكان..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                </div>
            </div>

            {/* Venues Grid */}
            {filteredVenues.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            {searchQuery ? "لا توجد أماكن تطابق البحث" : "لا توجد أماكن متاحة في هذه البلدية"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 overflow-y-auto flex-1">
                    {filteredVenues.map((venue, index) => {
                        // Mock images array
                        const mockImages = [
                            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop",
                            "https://images.unsplash.com/photo-1519167758481-83f29da8c8b0?w=400&h=300&fit=crop",
                        ];

                        return (
                            <Card
                                key={venue.id}
                                className={`transition-all duration-200 overflow-hidden p-0 ${
                                    (hasPendingRequest || hasApprovedRequest)
                                        ? "opacity-60 cursor-not-allowed" 
                                        : "cursor-pointer hover:shadow-lg"
                                } ${selectedVenueId === venue.id
                                    ? "border-primary border-2 bg-primary/5"
                                    : "hover:border-primary/50"
                                    }`}
                                onClick={() => !(hasPendingRequest || hasApprovedRequest) && handleVenueSelect(venue.id)}
                            >
                                {/* Image */}
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={mockImages[index % mockImages.length]}
                                        alt={venue.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                                        <Badge
                                            className={`${getAvailabilityBadgeClass(venue.available)}`}
                                        >
                                            {getAvailabilityLabel(venue.available)}
                                        </Badge>
                                        {getVenueRequestStatus(venue.id) && (
                                            <Badge
                                                variant="outline"
                                                className={`${getVenueRequestStatusBadgeClass(getVenueRequestStatus(venue.id)!.status as VenueRequestStatus)}`}
                                            >
                                                {VenueRequestStatusLabels[getVenueRequestStatus(venue.id)!.status as VenueRequestStatus]}
                                            </Badge>
                                        )}
                                    </div>
                                    {selectedVenueId === venue.id && (
                                        <div className="absolute top-2 left-2">
                                            <CheckCircle2 className="w-6 h-6 text-primary bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>

                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{venue.name}</CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{venue.address}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4 shrink-0" />
                                        <span>السعة: {venue.maxCapacity.toLocaleString('ar')} شخص</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Maximize2 className="w-4 h-4 shrink-0" />
                                        <span>المساحة: {formatSpace(venue.spaceSqm)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <DollarSign className="w-4 h-4 shrink-0" />
                                        <span className="font-semibold text-foreground">
                                            {formatRentalFee(venue.rentalFeePerDay)} / يوم
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full mt-4 mb-4"
                                        variant={selectedVenueId === venue.id ? "default" : "outline"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!(hasPendingRequest || hasApprovedRequest)) {
                                                handleVenueSelect(venue.id);
                                                handleRegisterClick(venue.id);
                                            }
                                        }}
                                        disabled={!venue.available || isSubmitting || !!getVenueRequestStatus(venue.id) || hasPendingRequest || hasApprovedRequest}
                                    >
                                        {isSubmitting 
                                            ? "جاري التسجيل..." 
                                            : hasApprovedRequest
                                            ? "مكان مسجل بالفعل"
                                            : hasPendingRequest
                                            ? "في انتظار الرد"
                                            : getVenueRequestStatus(venue.id)
                                            ? "تم التسجيل"
                                            : venue.available 
                                            ? "تسجيل" 
                                            : "غير متاح"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Venue Registration Dialog */}
            <VenueRegistrationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                venueName={venues.find(v => v.id === selectedVenueForRegistration)?.name || ""}
                onConfirm={handleRegister}
                isLoading={isSubmitting}
            />
        </div>
    );
}
