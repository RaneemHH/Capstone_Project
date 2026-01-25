import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Building2, FileText, MapPin, TrendingUp, TrendingDown, Loader2, Check, X, Info } from "lucide-react";
import Lottie from "lottie-react";
import Animation from "../assets/animations/Customer_Support.json";
import { useVenueRequestStore } from "@/stores/venue-request-store";
import { VenueRequestStatusLabels, getVenueRequestStatusBadgeClass } from "@/types/municipality";
import type { VenueRequestResponse } from '@/types/municipality';
import { venueService } from '@/services/venueService';
import { exhibitionService } from '@/services/exhibitionService';
import type { Venue } from '@/types/venue';
import type { ExhibitionResponse } from '@/types/exhibition';
import { toast } from "sonner";


export default function MunicipalityDashboard() {
    const { venueRequests, isLoading, error, fetchVenueRequests, reviewVenueRequest } = useVenueRequestStore();
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<VenueRequestResponse | null>(null);
    const [venues, setVenues] = useState<Map<number, Venue>>(new Map());
    const [exhibitions, setExhibitions] = useState<Map<number, ExhibitionResponse>>(new Map());
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewRequestId, setReviewRequestId] = useState<number | null>(null);
    const [isApproving, setIsApproving] = useState(false);
    const [municipalityResponse, setMunicipalityResponse] = useState('');

    const openReviewDialog = (requestId: number, approve: boolean) => {
        setReviewRequestId(requestId);
        setIsApproving(approve);
        setMunicipalityResponse('');
        setReviewDialogOpen(true);
    };

    const handleReview = async (requestId: number, approve: boolean) => {
        if (actionLoading) return;

        const request = venueRequests.find(r => r.id === requestId);
        if (!request) return;

        const venue = venues.get(request.venueId);
        const exhibition = exhibitions.get(request.exhibitionId);

        // Check if venue is available when approving
        if (approve && venue && !venue.available) {
            toast.error("لا يمكن قبول الطلب", {
                description: `هذا المكان "غير متاح" لأنه مسجل بالفعل لمعرض ${exhibition ? `"${exhibition.title}"` : "آخر"}`
            });
            return;
        }

        setActionLoading(requestId);
        try {
            await reviewVenueRequest(requestId, approve, municipalityResponse || (approve ? "تمت الموافقة على الطلب" : "تم رفض الطلب"));
            setReviewDialogOpen(false);
            setMunicipalityResponse('');
        } finally {
            setActionLoading(null);
        }
    };

    // Fetch all venue requests on component mount
    useEffect(() => {
        fetchVenueRequests();
    }, [fetchVenueRequests]);

    // Fetch venue and exhibition details when requests are loaded
    useEffect(() => {
        const fetchAdditionalData = async () => {
            const venueMap = new Map<number, Venue>();
            const exhibitionMap = new Map<number, ExhibitionResponse>();

            for (const request of venueRequests) {
                try {
                    if (!venueMap.has(request.venueId)) {
                        const venue = await venueService.getVenueById(request.venueId);
                        venueMap.set(request.venueId, venue);
                    }
                    if (!exhibitionMap.has(request.exhibitionId)) {
                        const exhibition = await exhibitionService.getExhibitionById(request.exhibitionId);
                        exhibitionMap.set(request.exhibitionId, exhibition);
                    }
                } catch (error) {
                    console.error('Failed to fetch venue or exhibition data:', error);
                }
            }

            setVenues(venueMap);
            setExhibitions(exhibitionMap);
        };

        if (venueRequests.length > 0) {
            fetchAdditionalData();
        }
    }, [venueRequests]);

    // Mock data for stats
    const stats = [
        {
            title: "إجمالي الطلبات",
            value: venueRequests.length.toString(),
            change: "+18%",
            isPositive: true,
            icon: FileText,
            color: "text-accent",
            bgColor: "bg-accent/10"
        },
        {
            title: "الأماكن المتاحة",
            value: "1,423",
            change: "+8%",
            isPositive: true,
            icon: MapPin,
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            title: "المنظمات",
            value: "216",
            change: "+23%",
            isPositive: true,
            icon: Building2,
            color: "text-foreground",
            bgColor: "bg-foreground/10"
        },
        {
            title: "نسبة الموافقة",
            value: venueRequests.length > 0
                ? `${Math.round((venueRequests.filter(r => r.status === 'APPROVED').length / venueRequests.length) * 100)}%`
                : "0%",
            change: "-2%",
            isPositive: false,
            icon: TrendingUp,
            color: "text-muted",
            bgColor: "bg-muted/20"
        }
    ];

    // Format date to Arabic
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    return (
        <div className="bg-background p-6 flex flex-col min-h-screen lg:min-h-0 lg:h-[650px] lg:overflow-hidden" dir="rtl">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="border-border">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                                        <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {stat.change}
                                            </span>
                                            {stat.isPositive ? (
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`${stat.bgColor} ${stat.color} p-2 rounded-full`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:flex-1 lg:overflow-hidden">
                {/* Recent Requests */}
                <Card className="lg:col-span-2 border-border flex flex-col lg:overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-foreground">الطلبات الأخيرة</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 lg:overflow-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="mr-3 text-muted-foreground">جاري تحميل الطلبات...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <p className="text-red-600">{error}</p>
                            </div>
                        ) : venueRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">رقم الطلب</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">اسم المعرض</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">اسم المكان</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">حالة المكان</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">تاريخ الطلب</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الموعد النهائي</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">تاريخ المراجعة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">التفاصيل</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {venueRequests.slice(0, 5).map((request) => {
                                            const venue = venues.get(request.venueId);
                                            const exhibition = exhibitions.get(request.exhibitionId);
                                            return (
                                            <tr key={request.id} className="border-b border-border last:border-0">
                                                <td className="py-4 px-4 text-sm font-medium text-foreground">#{request.id}</td>
                                                <td className="py-4 px-4 text-sm text-foreground">
                                                    {exhibition ? exhibition.title : 'جاري التحميل...'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-foreground">{request.venueName}</td>
                                                <td className="py-4 px-4">
                                                    {venue ? (
                                                        <Badge className={venue.available ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                                                            {venue.available ? 'متاح' : 'محجوز'}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">جاري...</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getVenueRequestStatusBadgeClass(request.status)}>
                                                        {VenueRequestStatusLabels[request.status]}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                                    {formatDateTime(request.requestedAt)}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                                    {formatDateTime(request.responseDeadline)}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                                    {formatDateTime(request.reviewedAt)}
                                                </td>
                                             
                                                <td className="py-4 px-4">
                                                    {request.status === 'PENDING' && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                                                                onClick={() => openReviewDialog(request.id, true)}
                                                                disabled={actionLoading === request.id}
                                                            >
                                                                {actionLoading === request.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                                onClick={() => openReviewDialog(request.id, false)}
                                                                disabled={actionLoading === request.id}
                                                            >
                                                                {actionLoading === request.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>

                                                    )}
                                                </td>
                                                   <td className="py-4 px-4">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-secondary-foreground hover:text-secondary-foreground/80 hover:bg-secondary/50"
                                                        onClick={() => setSelectedRequest(request)}
                                                    >
                                                        <Info className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Promotional Card */}
                <Card className="border-0 bg-linear-to-br from-primary to-foreground text-white overflow-hidden relative">
                    <CardContent className="p-6 relative z-10">
                        <h3 className="text-xl font-bold mb-3">
                            مرحباً بك في لوحة التحكم
                        </h3>
                        <p className="text-sm text-white/90 mb-6">
                            راجع طلبات الأماكن الجديدة واتخذ القرارات المناسبة لخدمة المجتمع بشكل أفضل
                        </p>
                        <Lottie
                            animationData={Animation}
                            loop={true}
                        />
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-secondary/30 to-transparent" />
                </Card>
            </div>

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">
                            {isApproving ? 'الموافقة على الطلب' : 'رفض الطلب'}
                        </DialogTitle>
                        <DialogDescription className="text-right">
                            {isApproving ? 'أضف سبب الموافقة' : 'أضف سبب الرفض'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4" dir="rtl">
                        <div>
                            <label className="text-sm font-semibold text-foreground mb-2 block">
                                رد البلدية
                            </label>
                            <Textarea
                                placeholder={isApproving ? "اكتب سبب الموافقة..." : "اكتب سبب الرفض..."}
                                value={municipalityResponse}
                                onChange={(e) => setMunicipalityResponse(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setReviewDialogOpen(false)}
                                disabled={actionLoading !== null}
                            >
                                إلغاء
                            </Button>
                            <Button
                                onClick={() => reviewRequestId && handleReview(reviewRequestId, isApproving)}
                                disabled={actionLoading !== null || !municipalityResponse.trim()}
                                className={isApproving ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"}
                            >
                                {actionLoading !== null ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                        جاري المعالجة...
                                    </>
                                ) : (
                                    isApproving ? 'تأكيد الموافقة' : 'تأكيد الرفض'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Request Details Dialog */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">تفاصيل الطلب #{selectedRequest?.id}</DialogTitle>
                        <DialogDescription className="text-right">
                            معلومات إضافية عن طلب المكان
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4" dir="rtl">
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">اسم المعرض</h4>
                            <p className="text-sm text-muted-foreground">
                                {selectedRequest && exhibitions.get(selectedRequest.exhibitionId)?.title || 'جاري التحميل...'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">اسم المكان</h4>
                            <p className="text-sm text-muted-foreground">{selectedRequest?.venueName}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">العنوان</h4>
                            <p className="text-sm text-muted-foreground">{selectedRequest?.venueAddress}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">تاريخ الإنشاء</h4>
                            <p className="text-sm text-muted-foreground">
                                {selectedRequest && formatDate(selectedRequest.requestedAt)}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">الحالة</h4>
                            <Badge className={selectedRequest ? getVenueRequestStatusBadgeClass(selectedRequest.status) : ''}>
                                {selectedRequest && VenueRequestStatusLabels[selectedRequest.status]}
                            </Badge>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-1">ملاحظات المنظمة</h4>
                            <div className="bg-muted p-3 rounded-md">
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {selectedRequest?.orgNotes || 'لا توجد ملاحظات'}
                                </p>
                            </div>
                        </div>
                        {selectedRequest?.municipalityResponse && (
                            <div>
                                <h4 className="text-sm font-semibold text-foreground mb-1">رد البلدية</h4>
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                        {selectedRequest.municipalityResponse}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
