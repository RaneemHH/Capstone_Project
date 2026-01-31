import { Card, CardContent } from "@/components/ui/card";
import { Building2, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Lottie from "lottie-react";
import Animation from "../assets/animations/activity_providers.json";
import { useExhibitionStore } from "@/stores/exhibition-store";
import { useActivityProviderStore } from "@/stores/activity-provider-store";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { activityProviderService } from "@/services/activity-provider-service";
import { activityService } from "@/services/activity-service";
import type { ActivityProviderRequestStatus, ActivityProviderRequestResponse } from "@/types/activity-provider";
import type { ActivityResponse } from "@/types/activity";
import { getActivityTypeLabel } from "@/types/activity";

// ... previous imports


// Helper function to get status label in Arabic
const getStatusLabel = (status: ActivityProviderRequestStatus): string => {
    const statusMap: Record<ActivityProviderRequestStatus, string> = {
        INVITED: "تمت الدعوة",
        PROPOSED: "مقترح",
        APPROVED: "مقبول",
        REJECTED: "مرفوض",
        CONFIRMED: "مؤكد",
        CANCELLED: "ملغي",
        FINALIZED: "منتهي"
    };
    return statusMap[status] || status;
};

// Helper function to get status color
const getStatusColor = (status: ActivityProviderRequestStatus): string => {
    const colorMap: Record<ActivityProviderRequestStatus, string> = {
        INVITED: "bg-blue-500/10 text-blue-700 border-blue-200",
        PROPOSED: "bg-purple-500/10 text-purple-700 border-purple-200",
        APPROVED: "bg-green-500/10 text-green-700 border-green-200",
        REJECTED: "bg-red-500/10 text-red-700 border-red-200",
        CONFIRMED: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
        CANCELLED: "bg-gray-500/10 text-gray-700 border-gray-200",
        FINALIZED: "bg-indigo-500/10 text-indigo-700 border-indigo-200"
    };
    return colorMap[status] || "bg-gray-500/10 text-gray-700 border-gray-200";
};

// Helper function to check if deadline has passed
const isDeadlinePassed = (deadline: string | null | undefined): boolean => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
};

export default function ActivityProviderDashboard() {
    const { accessToken } = useAuthStore();
    const { exhibitions, fetchAllExhibitions } = useExhibitionStore();
    const {
        ownerProviders,
        providerRequests,
        isLoadingOwnerProviders,
        fetchProvidersByOwnerId,
        fetchRequestsByProviderId
    } = useActivityProviderStore();

    const [expandedProviders, setExpandedProviders] = useState<Set<number>>(new Set());
    const [proposeDialogOpen, setProposeDialogOpen] = useState(false);

    // Cancellation Dialog State
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [requestToCancel, setRequestToCancel] = useState<ActivityProviderRequestResponse | null>(null);
    const [cancellationReason, setCancellationReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ActivityProviderRequestResponse | null>(null);
    const [proposalText, setProposalText] = useState<string>('');
    const [proposedBoothsCount, setProposedBoothsCount] = useState<number>(1);
    const [totalCost, setTotalCost] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinalizingRequest, setIsFinalizingRequest] = useState(false);
    const [activities, setActivities] = useState<ActivityResponse[]>([]);
    const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);

    // Fetch all exhibitions on mount
    useEffect(() => {
        fetchAllExhibitions();
    }, [fetchAllExhibitions]);

    // Fetch all activities on mount
    useEffect(() => {
        const loadActivities = async () => {
            setIsLoadingActivities(true);
            try {
                const data = await activityService.getAllActivities();
                setActivities(data);
            } catch (error) {
                console.error('Failed to fetch activities:', error);
                toast.error('فشل في تحميل الأنشطة');
            } finally {
                setIsLoadingActivities(false);
            }
        };
        loadActivities();
    }, []);

    // Fetch owner's providers on mount
    useEffect(() => {
        if (accessToken?.userId) {
            fetchProvidersByOwnerId(accessToken.userId);
        }
    }, [accessToken?.userId, fetchProvidersByOwnerId]);

    // Auto-fetch requests for all providers when loaded
    useEffect(() => {
        if (ownerProviders.length > 0) {
            ownerProviders.forEach(provider => {
                if (!providerRequests.has(provider.id)) {
                    fetchRequestsByProviderId(provider.id);
                }
            });
        }
    }, [ownerProviders, providerRequests, fetchRequestsByProviderId]);

    // Helper function to get exhibition name by ID
    const getExhibitionName = (exhibitionId: number): string => {
        const exhibition = exhibitions.find(e => e.id === exhibitionId);
        return exhibition ? exhibition.title : `معرض #${exhibitionId}`;
    };

    // Calculate total requests
    const totalProviderRequests = Array.from(providerRequests.values()).flat();
    const totalRequests = totalProviderRequests.length;

    const toggleProvider = (providerId: number) => {
        const newExpanded = new Set(expandedProviders);
        if (newExpanded.has(providerId)) {
            newExpanded.delete(providerId);
        } else {
            newExpanded.add(providerId);
            // TODO: Fetch requests if not already loaded
            // if (!providerRequests.has(providerId)) {
            //     fetchRequestsByProviderId(providerId);
            // }
        }
        setExpandedProviders(newExpanded);
    };

    const openProposeDialog = (request: ActivityProviderRequestResponse) => {
        setSelectedRequest(request);
        setProposalText('');
        setProposedBoothsCount(1);
        setTotalCost('');
        setSelectedActivityIds([]);
        setProposeDialogOpen(true);
    };

    const handlePropose = async () => {
        if (!selectedRequest) return;

        // Validate proposal text is filled
        if (!proposalText.trim()) {
            toast.error('يرجى ملء تفاصيل الاقتراح');
            return;
        }

        // Validate cost is filled
        if (!totalCost || parseFloat(totalCost) <= 0) {
            toast.error('يرجى إدخال التكلفة المقترحة');
            return;
        }

        // Validate at least one activity is selected
        if (selectedActivityIds.length === 0) {
            toast.error('يرجى اختيار نشاط واحد على الأقل');
            return;
        }

        // Validate response deadline not passed
        if (selectedRequest.responseDeadline) {
            const deadline = new Date(selectedRequest.responseDeadline);
            if (deadline < new Date()) {
                toast.error('انتهى الموعد النهائي للرد');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await activityProviderService.submitProposal(
                selectedRequest.id,
                {
                    proposalText,
                    boothsCount: proposedBoothsCount,
                    totalCost: parseFloat(totalCost),
                    activityIds: selectedActivityIds
                }
            );

            toast.success('تم تقديم الاقتراح بنجاح');
            setProposeDialogOpen(false);

            // Refresh requests
            if (selectedRequest.providerId) {
                fetchRequestsByProviderId(selectedRequest.providerId);
            }
        } catch (error) {
            console.error('Failed to submit proposal:', error);
            toast.error('فشل في تقديم الاقتراح');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenCancelDialog = (request: ActivityProviderRequestResponse) => {
        setRequestToCancel(request);
        setCancellationReason("");
        setCancelDialogOpen(true);
    };

    const handleCancelRequest = async () => {
        if (!requestToCancel) return;

        if (!cancellationReason.trim()) {
            toast.error('يرجى ذكر سبب الإلغاء');
            return;
        }

        setIsCancelling(true);
        try {
            await activityProviderService.cancelRequest(requestToCancel.id, cancellationReason);
            toast.success('تم إلغاء المشاركة بنجاح');

            // Refresh requests
            if (requestToCancel.providerId) {
                fetchRequestsByProviderId(requestToCancel.providerId);
            }
            setCancelDialogOpen(false);
        } catch (error) {
            console.error('Failed to cancel request:', error);

            let errorMessage = 'فشل في إلغاء المشاركة';

            if (error && typeof error === 'object') {
                const axiosError = error as {
                    response?: {
                        data?: { message?: string; error?: string; };
                    };
                    message?: string;
                };

                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                } else if (axiosError.response?.data?.error) {
                    errorMessage = axiosError.response.data.error;
                } else if (axiosError.message) {
                    errorMessage = axiosError.message;
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsCancelling(false);
            setRequestToCancel(null);
        }
    };
    const handleFinalizeRequest = async (request: ActivityProviderRequestResponse) => {
        // Get exhibition details
        const exhibition = exhibitions.find(e => e.id === request.exhibitionId);

        // Validation: Exhibition status must be CONFIRMED
        if (!exhibition || exhibition.status !== 'CONFIRMED') {
            toast.error('لا يمكن إتمام المشاركة', {
                description: 'يجب أن تكون حالة المعرض "مؤكد" لإتمام المشاركة'
            });
            return;
        }

        setIsFinalizingRequest(true);
        try {
            await activityProviderService.finalizeParticipation(request.id);
            toast.success('تم إتمام المشاركة بنجاح');

            // Refresh requests
            if (request.providerId) {
                fetchRequestsByProviderId(request.providerId);
            }
        } catch (error) {
            console.error('Failed to finalize request:', error);

            let errorMessage = 'فشل في إتمام المشاركة';

            if (error && typeof error === 'object') {
                const axiosError = error as {
                    response?: {
                        data?: { message?: string; error?: string; };
                    };
                    message?: string;
                };

                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                } else if (axiosError.response?.data?.error) {
                    errorMessage = axiosError.response.data.error;
                } else if (axiosError.message) {
                    errorMessage = axiosError.message;
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsFinalizingRequest(false);
        }
    };

    return (
        <div className="bg-background p-6" dir="rtl">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Providers List with Requests */}
                <Card className="lg:col-span-2 border-border">
                    <div>
                        {/* Header */}
                        <div className="sticky top-0 bg-card border-b border-border p-4">
                            <h2 className="text-xl font-bold text-foreground">مقدمو الأنشطة ومشاركاتهم</h2>
                            <p className="text-sm text-muted-foreground">عرض مقدمي الأنشطة والمعارض المشاركة فيها</p>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {isLoadingOwnerProviders ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : ownerProviders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Building2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        لا توجد مقدمي أنشطة مسجلين
                                    </h3>
                                    <p className="text-muted-foreground max-w-md">
                                        لم يتم العثور على مقدمي أنشطة تابعين لحسابك
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ownerProviders.map((provider) => {
                                        const isExpanded = expandedProviders.has(provider.id);
                                        const requests = providerRequests.get(provider.id) || [];

                                        return (
                                            <Card key={provider.id} className="border-border">
                                                {/* Provider Header */}
                                                <div
                                                    className="p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                                                    onClick={() => toggleProvider(provider.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                                <Building2 className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-foreground">
                                                                    {provider.name}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {provider.contactEmail}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {requests.length > 0 && (
                                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                                    {requests.length} معرض
                                                                </Badge>
                                                            )}
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Requests List */}
                                                {isExpanded && (
                                                    <div className="border-t border-border">
                                                        {requests.length === 0 ? (
                                                            <div className="p-6 text-center">
                                                                <p className="text-sm text-muted-foreground">
                                                                    لا توجد طلبات للمعارض لمقدم الأنشطة هذا
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="divide-y divide-border">
                                                                {requests.map((request) => (
                                                                    <div key={request.id} className="p-4 hover:bg-accent/5 transition-colors">
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <h4 className="font-medium text-foreground text-lg">
                                                                                        {getExhibitionName(request.exhibitionId)}
                                                                                    </h4>
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={getStatusColor(request.status)}
                                                                                    >
                                                                                        {getStatusLabel(request.status)}
                                                                                    </Badge>
                                                                                </div>

                                                                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                                                    {request.invitedAt && (
                                                                                        <div className="text-muted-foreground">
                                                                                            <span className="font-medium">تاريخ الدعوة: </span>
                                                                                            {new Date(request.invitedAt).toLocaleDateString('en-US')}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium">الموعد النهائي للرد: </span>
                                                                                        {request.responseDeadline
                                                                                            ? new Date(request.responseDeadline).toLocaleDateString('en-US')
                                                                                            : 'غير محدد'
                                                                                        }
                                                                                    </div>
                                                                                    {request.proposedAt && (
                                                                                        <div className="text-muted-foreground">
                                                                                            <span className="font-medium">تاريخ الاقتراح: </span>
                                                                                            {new Date(request.proposedAt).toLocaleDateString('en-US')}
                                                                                        </div>
                                                                                    )}
                                                                                    {request.approvedAt && (
                                                                                        <div className="text-muted-foreground">
                                                                                            <span className="font-medium">تاريخ الموافقة: </span>
                                                                                            {new Date(request.approvedAt).toLocaleDateString('en-US')}
                                                                                        </div>
                                                                                    )}
                                                                                    {request.proposedBoothsCount !== null && (
                                                                                        <div className="text-muted-foreground">
                                                                                            <span className="font-medium">عدد الأماكن المقترحة: </span>
                                                                                            {request.proposedBoothsCount}
                                                                                        </div>
                                                                                    )}
                                                                                    {request.totalCost !== null && (
                                                                                        <div className="text-muted-foreground">
                                                                                            <span className="font-medium">التكلفة الإجمالية: </span>
                                                                                            ${request.totalCost}
                                                                                        </div>
                                                                                    )}
                                                                                    {request.orgRequirements && (
                                                                                        <div className="col-span-2 text-muted-foreground">
                                                                                            <span className="font-medium">متطلبات المنظمة: </span>
                                                                                            {request.orgRequirements}
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {request.status === 'INVITED' && (
                                                                                    <>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            className="mt-2 w-full"
                                                                                            onClick={() => openProposeDialog(request)}
                                                                                            disabled={isDeadlinePassed(request.responseDeadline)}
                                                                                        >
                                                                                            تقديم اقتراح
                                                                                        </Button>
                                                                                        {isDeadlinePassed(request.responseDeadline) && (
                                                                                            <p className="text-xs text-red-600 mt-1">
                                                                                                انتهى الموعد النهائي للرد
                                                                                            </p>
                                                                                        )}
                                                                                    </>
                                                                                )}


                                                                                {request.status === 'APPROVED' && (() => {
                                                                                    let confirmationDeadline = null;
                                                                                    if (request.orgResponse) {
                                                                                        try {
                                                                                            const parsed = JSON.parse(request.orgResponse);
                                                                                            confirmationDeadline = parsed.confirmationDeadline;
                                                                                        } catch (error) {
                                                                                            console.warn('Failed to parse orgResponse as JSON:', error);
                                                                                        }
                                                                                    }
                                                                                    const isConfirmDeadlinePassed = confirmationDeadline
                                                                                        ? isDeadlinePassed(confirmationDeadline)
                                                                                        : false;

                                                                                    // Check for exhibition status for cancel button visibility
                                                                                    const exhibition = exhibitions.find(e => e.id === request.exhibitionId);
                                                                                    const isExhibitionConfirmed = exhibition?.status === 'CONFIRMED';
                                                                                    const isExhibitionActiveOrCompleted = exhibition?.status === 'ACTIVE' || exhibition?.status === 'COMPLETED';

                                                                                    return (
                                                                                        <>
                                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    className="flex-1"
                                                                                                    onClick={() => handleFinalizeRequest(request)}
                                                                                                    disabled={isConfirmDeadlinePassed || !isExhibitionConfirmed || isFinalizingRequest}
                                                                                                >
                                                                                                    {isFinalizingRequest ? (
                                                                                                        <>
                                                                                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                                                            جاري...
                                                                                                        </>
                                                                                                    ) : !isExhibitionConfirmed ? (
                                                                                                        'المعرض غير مؤكد'
                                                                                                    ) : (
                                                                                                        'إتمام المشاركة'
                                                                                                    )}
                                                                                                </Button>

                                                                                                {!isExhibitionActiveOrCompleted && (
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="sm"
                                                                                                        className="text-accent hover:text-red-700 hover:bg-red-50"
                                                                                                        onClick={() => handleOpenCancelDialog(request)}
                                                                                                    >
                                                                                                        إلغاء
                                                                                                    </Button>
                                                                                                )}
                                                                                            </div>

                                                                                            {isConfirmDeadlinePassed && (
                                                                                                <p className="text-xs text-red-600 mt-1">
                                                                                                    انتهى الموعد النهائي للتأكيد
                                                                                                </p>
                                                                                            )}
                                                                                            {!isExhibitionConfirmed && !isConfirmDeadlinePassed && (
                                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                                    انتظر حتى يتم تأكيد المعرض لإتمام المشاركة
                                                                                                </p>
                                                                                            )}
                                                                                        </>
                                                                                    );
                                                                                })()}

                                                                                {request.status === 'CONFIRMED' && (() => {
                                                                                    const exhibition = exhibitions.find(e => e.id === request.exhibitionId);
                                                                                    const isExhibitionConfirmed = exhibition?.status === 'CONFIRMED';
                                                                                    const canFinalize = request.status === 'CONFIRMED';

                                                                                    const isExhibitionActiveOrCompleted = exhibition?.status === 'ACTIVE' || exhibition?.status === 'COMPLETED';

                                                                                    return (
                                                                                        <>
                                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                                <Button
                                                                                                    size="sm"
                                                                                                    className="flex-1"
                                                                                                    onClick={() => handleFinalizeRequest(request)}
                                                                                                    disabled={!canFinalize || isFinalizingRequest}
                                                                                                >
                                                                                                    {isFinalizingRequest ? (
                                                                                                        <>
                                                                                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                                                            جاري...
                                                                                                        </>
                                                                                                    ) : !isExhibitionConfirmed ? (
                                                                                                        'المعرض غير مؤكد'
                                                                                                    ) : (
                                                                                                        'إتمام المشاركة'
                                                                                                    )}
                                                                                                </Button>

                                                                                                {!isExhibitionActiveOrCompleted && (
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="sm"
                                                                                                        className="text-accent hover:text-red-700 hover:bg-red-50"
                                                                                                        onClick={() => handleOpenCancelDialog(request)}
                                                                                                    >
                                                                                                        إلغاء
                                                                                                    </Button>
                                                                                                )}
                                                                                            </div>
                                                                                            {!isExhibitionConfirmed && (
                                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                                    انتظر حتى يتم تأكيد المعرض
                                                                                                </p>
                                                                                            )}
                                                                                        </>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Right Column - Stats and Promotional Card */}
                <div className="space-y-4">
                    {/* Total Requests Stat */}
                    <Card className="border-border">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground mb-1">إجمالي الطلبات</p>
                                    <h3 className="text-2xl font-bold text-foreground">{totalRequests}</h3>
                                </div>
                                <div className="bg-primary/10 text-primary p-2 rounded-full">
                                    <FileText className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Promotional Card */}
                    <Card className="border-0 bg-linear-to-br from-primary to-foreground text-white overflow-hidden relative">
                        <CardContent className="p-6 relative z-10">
                            <h3 className="text-xl font-bold mb-3">
                                مرحباً بك في لوحة التحكم
                            </h3>
                            <p className="text-sm text-white/90 mb-6">
                                راجع الدعوات الجديدة وقدم اقتراحات الأنشطة للمعارض
                            </p>
                            <div className="max-h-[250px]">
                                <Lottie
                                    animationData={Animation}
                                    loop={true}
                                />
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-secondary/30 to-transparent" />
                    </Card>
                </div>
            </div>

            {/* Proposal Dialog */}
            <Dialog open={proposeDialogOpen} onOpenChange={setProposeDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تقديم اقتراح للمعرض</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedRequest && (
                            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                                <p className="text-sm font-medium">
                                    {getExhibitionName(selectedRequest.exhibitionId)}
                                </p>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    {selectedRequest.orgRequirements && (
                                        <p>متطلبات المنظمة: {selectedRequest.orgRequirements}</p>
                                    )}
                                    {selectedRequest.responseDeadline && (
                                        <p className="text-red-600">
                                            الموعد النهائي: {new Date(selectedRequest.responseDeadline).toLocaleDateString('en-US')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>اختر الأنشطة *</Label>
                            {isLoadingActivities ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-4">
                                    لا توجد أنشطة متاحة
                                </div>
                            ) : (
                                <div className="h-[200px] overflow-y-auto rounded-md border p-4">
                                    <div className="space-y-3">
                                        {activities
                                            .filter(activity =>
                                                selectedRequest &&
                                                activity.provider.id === selectedRequest.providerId &&
                                                activity.active
                                            )
                                            .map((activity) => (
                                                <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                                                    <Checkbox
                                                        id={`activity-${activity.id}`}
                                                        checked={selectedActivityIds.includes(activity.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedActivityIds([...selectedActivityIds, activity.id]);
                                                            } else {
                                                                setSelectedActivityIds(selectedActivityIds.filter(id => id !== activity.id));
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex-1">
                                                        <label
                                                            htmlFor={`activity-${activity.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {activity.name}
                                                        </label>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {getActivityTypeLabel(activity.type)} • {activity.suggestedDurationMinutes} دقيقة • حتى {activity.suggestedMaxParticipants} مشارك
                                                        </p>
                                                        {activity.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {activity.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        {selectedRequest && activities.filter(a =>
                                            a.provider.id === selectedRequest.providerId && a.active
                                        ).length === 0 && (
                                                <div className="text-sm text-muted-foreground text-center py-4">
                                                    لا توجد أنشطة متاحة لهذا المزود
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                            {selectedActivityIds.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    تم اختيار {selectedActivityIds.length} نشاط
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proposalText">تفاصيل الاقتراح *</Label>
                            <Textarea
                                id="proposalText"
                                placeholder="وصف الأنشطة المقترحة..."
                                value={proposalText}
                                onChange={(e) => setProposalText(e.target.value)}
                                rows={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="proposedBooths">عدد الأماكن المقترحة *</Label>
                            <Input
                                id="proposedBooths"
                                type="number"
                                min={1}
                                value={proposedBoothsCount}
                                onChange={(e) => setProposedBoothsCount(parseInt(e.target.value) || 1)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalCost">التكلفة الإجمالية ($) *</Label>
                            <Input
                                id="totalCost"
                                type="number"
                                min={0}
                                step="0.01"
                                value={totalCost}
                                onChange={(e) => setTotalCost(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProposeDialogOpen(false)} disabled={isSubmitting}>
                            إلغاء
                        </Button>
                        <Button onClick={handlePropose} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري التقديم...
                                </>
                            ) : (
                                'تقديم الاقتراح'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancellation Confirmation Dialog */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من رغبتك في إلغاء المشاركة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيؤدي هذا إلى إلغاء طلبك بالكامل ولا يمكن التراجع عن هذا الإجراء.
                            يرجى ذكر سبب الإلغاء أدناه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancelReason" className="mb-2 block">سبب الإلغاء *</Label>
                        <Textarea
                            id="cancelReason"
                            placeholder="اكتب سبب الإلغاء هنا..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>تراجع</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleCancelRequest();
                            }}
                            disabled={isCancelling}
                            className="bg-primary text-primary-foreground hover:bg-primary/80"
                        >
                            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نعم، قم بالإلغاء'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
