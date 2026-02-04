import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Check, X, Info } from "lucide-react";
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
import { RadialChart } from "@/components/charts/radial-chart";
import type { ChartConfig } from "@/components/ui/chart";
import PendingRequestsAnimation from "@/assets/animations/waiting_requests_animation.json";
import RejectedRequestsAnimation from "@/assets/animations/rejected-requests-animation.json";
import ApprovedRequestsAnimation from "@/assets/animations/accepted-requests-animation.json";
import TotalRequestsAnimation from "@/assets/animations/total-requests-animation.json";
import DeadlineAnimation from "@/assets/animations/deadline_clock.json";


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

    // // Calculate meaningful stats from real data
    // const pendingCount = venueRequests.filter(r => r.status === 'PENDING').length;
    // const approvedCount = venueRequests.filter(r => r.status === 'APPROVED').length;
    // const rejectedCount = venueRequests.filter(r => r.status === 'REJECTED').length;

    // // Calculate urgent deadlines (within next 7 days)
    // const now = new Date();
    // const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // const urgentDeadlinesCount = venueRequests.filter(r => {
    //     if (!r.responseDeadline) return false;
    //     const deadline = new Date(r.responseDeadline);
    //     return deadline >= now && deadline <= sevenDaysFromNow && r.status === 'PENDING';
    // }).length;



    // Format date to Arabic
    // const formatDate = (dateString: string) => {
    //     const date = new Date(dateString);
    //     return date.toLocaleDateString('ar-SA', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric'
    //     });
    // };

    // const formatDateTime = (dateString: string | null) => {
    //     if (!dateString) return "غير محدد";
    //     try {
    //         const date = new Date(dateString);
    //         return date.toLocaleString('ar-SA', {
    //             year: 'numeric',
    //             month: '2-digit',
    //             day: '2-digit',
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             hour12: true
    //         });
    //     } catch {
    //         return dateString;
    //     }
    // };

    return (
        <div className="bg-background p-6 flex flex-col min-h-screen lg:min-h-0 lg:h-[650px] lg:overflow-hidden" dir="rtl">
            {/* Stats Cards with RadialChart */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {/* Total Requests */}
                <Card className="flex flex-col items-center">
                    <CardContent className="pt-3 pb-2 px-2">
                        <div className="relative flex items-center justify-center w-20 h-20">
                            <Lottie animationData={TotalRequestsAnimation} loop={true} style={{ width: '80px', height: '80px' }} />
                        </div>
                        <div className="mt-1 text-center">
                            <div className="text-xs font-medium text-muted-foreground">
                                إجمالي الطلبات - {venueRequests.length}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Requests */}
                <RadialChart
                    title="قيد الانتظار"
                    value={venueRequests.filter((r) => r.status === "PENDING").length}
                    maxValue={venueRequests.length}
                    fillColor="var(--chart-2)"
                    config={{
                        value: {
                            label: "Requests",
                            color: "var(--chart-2)",
                        },
                    } satisfies ChartConfig}
                    animationData={PendingRequestsAnimation}
                    innerRadius={40}
                    outerRadius={50}
                />

                {/* Approved Requests */}
                <RadialChart
                    title="مقبول"
                    value={venueRequests.filter((r) => r.status === "APPROVED").length}
                    maxValue={venueRequests.length}
                    fillColor="var(--chart-3)"
                    config={{
                        value: {
                            label: "Requests",
                            color: "var(--chart-3)",
                        },
                    } satisfies ChartConfig}
                    animationData={ApprovedRequestsAnimation}
                    innerRadius={40}
                    outerRadius={50}
                />

                {/* Rejected Requests */}
                <RadialChart
                    title="مرفوض"
                    value={venueRequests.filter((r) => r.status === "REJECTED").length}
                    maxValue={venueRequests.length}
                    fillColor="var(--chart-4)"
                    config={{
                        value: {
                            label: "Requests",
                            color: "var(--chart-4)",
                        },
                    } satisfies ChartConfig}
                    animationData={RejectedRequestsAnimation}
                    innerRadius={40}
                    outerRadius={50}
                />

                {/* Urgent Deadlines (Within 7 Days) */}
                <RadialChart
                    title="أقل من أسبوع"
                    value={venueRequests.filter((r) => {
                        if (!r.responseDeadline || r.status !== "PENDING") return false;
                        const deadline = new Date(r.responseDeadline);
                        const now = new Date();
                        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        return deadline >= now && deadline <= sevenDaysFromNow;
                    }).length}
                    maxValue={venueRequests.filter((r) => r.status === "PENDING").length}
                    fillColor="var(--chart-6)"
                    config={{
                        value: {
                            label: "Requests",
                            color: "var(--chart-6)",
                        },
                    } satisfies ChartConfig}
                    innerRadius={40}
                    outerRadius={50}
                    animationData={DeadlineAnimation}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:flex-1 lg:overflow-hidden">
                {/* Recent Requests */}
                <Card className="lg:col-span-3 border-border flex flex-col lg:overflow-hidden">
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
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الموعد النهائي</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">التفاصيل</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {venueRequests.slice(0, 5).map((request) => {
                                            const venue = venues.get(request.venueId);
                                            const exhibition = exhibitions.get(request.exhibitionId);

                                            // Check if deadline is within 7 days
                                            const isUrgent = (() => {
                                                if (!request.responseDeadline || request.status !== 'PENDING') return false;
                                                const deadline = new Date(request.responseDeadline);
                                                const now = new Date();
                                                const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                                                return deadline >= now && deadline <= sevenDaysFromNow;
                                            })();

                                            return (
                                                <tr key={request.id} className={`border-b border-border last:border-0 ${isUrgent ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
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
                                                        {request.responseDeadline ? (() => {
                                                            const date = new Date(request.responseDeadline);
                                                            const dateStr = date.toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit'
                                                            });
                                                            const timeStr = date.toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            });
                                                            return `${dateStr} (${timeStr})`;
                                                        })() : "غير محدد"}
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
                <Card className="lg:w-73 lg:h-100 border-0 bg-linear-to-br from-primary to-foreground text-white overflow-hidden relative">
                    <CardContent className="p-6 relative z-10">
                        <h3 className="text-xl font-bold mb-3">
                            مرحباً بك في لوحة التحكم
                        </h3>
                        <p className="text-sm text-white/90 mb-6">
                            راجع طلبات الأماكن الجديدة واتخذ القرارات المناسبة لخدمة المجتمع بشكل أفضل
                        </p>
                        <div className="flex justify-center">
                            <Lottie
                                animationData={Animation}
                                loop={true}
                                style={{ width: '200px', height: '200px' }}
                            />
                        </div>
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
                                {selectedRequest && new Date(selectedRequest.requestedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
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
