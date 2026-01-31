import { Card, CardContent } from "@/components/ui/card";
import { Building2, FileText, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Lottie from "lottie-react";
import Animation from "../assets/animations/unis.json";
import { useUniversityStore } from "@/stores/university-store";
import { useExhibitionStore } from "@/stores/exhibition-store";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { universityParticipationService } from "@/services/university-participation-service";
import { boothService } from "@/services/booth-service";
import type { ParticipationStatus, UniversityParticipationResponse } from "@/types/university";
import type { BoothResponse } from "@/types/booth";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { MapPin } from "lucide-react";

// Helper function to get status label in Arabic
const getStatusLabel = (status: ParticipationStatus): string => {
    const statusMap: Record<ParticipationStatus, string> = {
        INVITED: "تمت الدعوة",
        REGISTERED: "تم التسجيل",
        ACCEPTED: "مقبول",
        REJECTED: "مرفوض",
        CONFIRMED: "مؤكد",
        CANCELLED: "ملغي",
        FINALIZED: "منتهي"
    };
    return statusMap[status] || status;
};

// Helper function to get status color
const getStatusColor = (status: ParticipationStatus): string => {
    const colorMap: Record<ParticipationStatus, string> = {
        INVITED: "bg-blue-500/10 text-blue-700 border-blue-200",
        REGISTERED: "bg-purple-500/10 text-purple-700 border-purple-200",
        ACCEPTED: "bg-green-500/10 text-green-700 border-green-200",
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

export default function UniversityDashboard() {
    const { accessToken } = useAuthStore();
    const {
        ownerUniversities,
        universityParticipations,
        isLoadingOwnerUniversities,
        fetchUniversitiesByOwnerId,
        fetchParticipationsByUniversityId
    } = useUniversityStore();
    const { exhibitions, fetchAllExhibitions } = useExhibitionStore();

    const [expandedUniversities, setExpandedUniversities] = useState<Set<number>>(new Set());
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
    const [selectedParticipation, setSelectedParticipation] = useState<UniversityParticipationResponse | null>(null);
    const [requestedBooths, setRequestedBooths] = useState<number>(1);
    const [boothContent, setBoothContent] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinalizingParticipation, setIsFinalizingParticipation] = useState(false);
    const [boothsDialogOpen, setBoothsDialogOpen] = useState(false);
    const [allocatedBooths, setAllocatedBooths] = useState<BoothResponse[]>([]);
    const [isLoadingBooths, setIsLoadingBooths] = useState(false);
    const [isCancellingParticipation, setIsCancellingParticipation] = useState(false);

    // Cancellation Dialog State
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [participationToCancel, setParticipationToCancel] = useState<UniversityParticipationResponse | null>(null);


    // Fetch all exhibitions on mount
    useEffect(() => {
        fetchAllExhibitions();
    }, [fetchAllExhibitions]);

    // Fetch owner's universities on mount
    useEffect(() => {
        if (accessToken?.userId) {
            fetchUniversitiesByOwnerId(accessToken.userId);
        }
    }, [accessToken?.userId, fetchUniversitiesByOwnerId]);

    // Auto-fetch participations for all universities when loaded
    useEffect(() => {
        if (ownerUniversities.length > 0) {
            ownerUniversities.forEach(university => {
                if (!universityParticipations.has(university.id)) {
                    fetchParticipationsByUniversityId(university.id);
                }
            });
        }
    }, [ownerUniversities, universityParticipations, fetchParticipationsByUniversityId]);

    // Helper function to get exhibition name by ID
    const getExhibitionName = (exhibitionId: number): string => {
        const exhibition = exhibitions.find(e => e.id === exhibitionId);
        return exhibition ? exhibition.title : `معرض #${exhibitionId}`;
    };

    // Calculate total requests
    const totalParticipations = Array.from(universityParticipations.values()).flat();
    const totalRequests = totalParticipations.length;

    const toggleUniversity = (universityId: number) => {
        const newExpanded = new Set(expandedUniversities);
        if (newExpanded.has(universityId)) {
            newExpanded.delete(universityId);
        } else {
            newExpanded.add(universityId);
            // Fetch participations if not already loaded
            if (!universityParticipations.has(universityId)) {
                fetchParticipationsByUniversityId(universityId);
            }
        }
        setExpandedUniversities(newExpanded);
    };

    const openRegisterDialog = (participation: UniversityParticipationResponse) => {
        setSelectedParticipation(participation);
        setRequestedBooths(1);
        setBoothContent('');
        setRegisterDialogOpen(true);
    };

    const handleRegister = async () => {
        if (!selectedParticipation) return;

        // Get exhibition details
        const exhibition = exhibitions.find(e => e.id === selectedParticipation.exhibitionId);

        // Validate booth content is filled
        if (!boothContent.trim()) {
            toast.error('يرجى ملء تفاصيل المكان');
            return;
        }

        if (!exhibition) {
            toast.error("لم يتم العثور على المعرض");
            return;
        }

        // Validate response deadline not passed
        if (selectedParticipation.responseDeadline) {
            const deadline = new Date(selectedParticipation.responseDeadline);
            if (deadline < new Date()) {
                toast.error('انتهى الموعد النهائي للتسجيل');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            // Create boothDetails object with the same content for all requested booths
            const boothDetails: Record<number, { content: string }> = {};
            for (let i = 1; i <= requestedBooths; i++) {
                boothDetails[i] = { content: boothContent };
            }

            await universityParticipationService.registerUniversity(
                selectedParticipation.id,
                {
                    requestedBooths,
                    boothDetails
                }
            );

            toast.success('تم تسجيل المشاركة بنجاح');
            setRegisterDialogOpen(false);

            // Refresh participations
            if (selectedParticipation.universityId) {
                fetchParticipationsByUniversityId(selectedParticipation.universityId);
            }
        } catch (error) {
            console.error('Failed to register:', error);
            toast.error('فشل في تسجيل المشاركة');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinalizeParticipation = async (participation: UniversityParticipationResponse) => {
        // Get exhibition details
        const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);

        // Validation: Exhibition status must be CONFIRMED
        if (!exhibition || exhibition.status !== 'CONFIRMED') {
            toast.error('لا يمكن إتمام المشاركة', {
                description: 'يجب أن تكون حالة المعرض "مؤكد" لإتمام المشاركة'
            });
            return;
        }

        setIsFinalizingParticipation(true);
        try {
            await universityParticipationService.finalizeParticipation(participation.id);
            toast.success('تم إتمام المشاركة بنجاح');

            // Refresh participations
            if (participation.universityId) {
                fetchParticipationsByUniversityId(participation.universityId);
            }
        } catch (error) {
            console.error('Failed to finalize participation:', error);

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
            setIsFinalizingParticipation(false);
        }
    };

    const handleCancelParticipation = (participation: UniversityParticipationResponse) => {
        setParticipationToCancel(participation);
        setCancelDialogOpen(true);
    };

    const confirmCancellation = async () => {
        if (!participationToCancel) return;

        setIsCancellingParticipation(true);
        try {
            await universityParticipationService.cancelParticipation(participationToCancel.id);
            toast.success('تم إلغاء المشاركة بنجاح');

            // Refresh participations
            if (participationToCancel.universityId) {
                fetchParticipationsByUniversityId(participationToCancel.universityId);
            }
            setCancelDialogOpen(false);
        } catch (error) {
            console.error('Failed to cancel participation:', error);
            toast.error('فشل في إلغاء المشاركة');
        } finally {
            setIsCancellingParticipation(false);
            setParticipationToCancel(null);
        }
    };

    const handleOpenBoothsDialog = async (participation: UniversityParticipationResponse) => {
        setSelectedParticipation(participation);
        setBoothsDialogOpen(true);
        setIsLoadingBooths(true);
        try {
            const allBooths = await boothService.getBoothsByExhibition(participation.exhibitionId);
            const myBooths = allBooths.filter(b => b.universityParticipationId === participation.id);
            setAllocatedBooths(myBooths);
        } catch (error) {
            console.error('Failed to fetch booths:', error);
            toast.error('فشل في تحميل بيانات الأكشاك');
        } finally {
            setIsLoadingBooths(false);
        }
    };

    return (
        <div className="bg-background p-6" dir="rtl">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Universities List with Participations */}
                <Card className="lg:col-span-2 border-border">
                    <div>
                        {/* Header */}
                        <div className="sticky top-0 bg-card border-b border-border p-4">
                            <h2 className="text-xl font-bold text-foreground">جامعاتي ومشاركاتها</h2>
                            <p className="text-sm text-muted-foreground">عرض الجامعات والمعارض المشاركة فيها</p>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {isLoadingOwnerUniversities ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : ownerUniversities.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Building2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        لا توجد جامعات مسجلة
                                    </h3>
                                    <p className="text-muted-foreground max-w-md">
                                        لم يتم العثور على جامعات تابعة لحسابك
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ownerUniversities.map((university) => {
                                        const isExpanded = expandedUniversities.has(university.id);
                                        const participations = universityParticipations.get(university.id) || [];

                                        return (
                                            <Card key={university.id} className="border-border">
                                                {/* University Header */}
                                                <div
                                                    className="p-4 cursor-pointer hover:bg-accent/5 transition-colors"
                                                    onClick={() => toggleUniversity(university.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-primary/10 p-2 rounded-lg">
                                                                <Building2 className="w-5 h-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-foreground">
                                                                    {university.name}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {university.contactEmail}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {participations.length > 0 && (
                                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                                    {participations.length} معرض
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

                                                {/* Participations List */}
                                                {isExpanded && (
                                                    <div className="border-t border-border">
                                                        {participations.length === 0 ? (
                                                            <div className="p-6 text-center">
                                                                <p className="text-sm text-muted-foreground">
                                                                    لا توجد مشاركات في المعارض لهذه الجامعة
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="divide-y divide-border">
                                                                {participations.map((participation) => (
                                                                    <div key={participation.id} className="p-4 hover:bg-accent/5 transition-colors">
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-2 mb-3">
                                                                                    <h4 className="font-medium text-foreground text-lg">
                                                                                        {getExhibitionName(participation.exhibitionId)}
                                                                                    </h4>
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className={getStatusColor(participation.status)}
                                                                                    >
                                                                                        {getStatusLabel(participation.status)}
                                                                                    </Badge>
                                                                                </div>

                                                                                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                                                    {participation.invitedAt && (
                                                                                        <div className="text-muted-foreground">
                                                                                            <span className="font-medium">تاريخ الدعوة: </span>
                                                                                            {new Date(participation.invitedAt).toLocaleDateString('en-US')}
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium">الموعد النهائي للرد: </span>
                                                                                        {participation.responseDeadline
                                                                                            ? new Date(participation.responseDeadline).toLocaleDateString('en-US')
                                                                                            : 'غير محدد'
                                                                                        }
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium">تاريخ التسجيل: </span>
                                                                                        {participation.registeredAt
                                                                                            ? new Date(participation.registeredAt).toLocaleDateString('en-US')
                                                                                            : 'غير محدد'
                                                                                        }
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium">تاريخ التأكيد: </span>
                                                                                        {participation.confirmedAt
                                                                                            ? new Date(participation.confirmedAt).toLocaleDateString('en-US')
                                                                                            : 'غير محدد'
                                                                                        }
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium">عدد الأماكن: </span>
                                                                                        {participation.approvedBoothsCount !== null
                                                                                            ? participation.approvedBoothsCount
                                                                                            : 'غير محدد'
                                                                                        }
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium">رسوم المشاركة: </span>
                                                                                        {participation.participationFee
                                                                                            ? `$${participation.participationFee}`
                                                                                            : 'غير محدد'
                                                                                        }
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium">حالة الدفع: </span>
                                                                                        {participation.paymentStatus || 'غير محدد'}
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <span className="font-medium">تاريخ الدفع: </span>
                                                                                        {participation.paymentDate
                                                                                            ? new Date(participation.paymentDate).toLocaleDateString('en-US')
                                                                                            : 'غير محدد'
                                                                                        }
                                                                                    </div>
                                                                                </div>

                                                                                {participation.status === 'REGISTERED' && (
                                                                                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                                                        <p className="text-sm font-bold text-purple-700 text-right">
                                                                                            بانتظار المراجعة والقبول
                                                                                        </p>
                                                                                        <p className="text-xs text-purple-600 mt-1 text-right">
                                                                                            لقد تم تسجيل مشاركتك بنجاح، وهي الآن قيد المراجعة من قبل منظم المعرض.
                                                                                        </p>
                                                                                    </div>
                                                                                )}

                                                                                {participation.status === 'ACCEPTED' && (() => {
                                                                                    const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);
                                                                                    const startDate = exhibition?.startDate ? new Date(exhibition.startDate).toLocaleDateString('en-US') : 'غير محدد';
                                                                                    return (
                                                                                        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                                                                            <p className="text-sm font-bold text-primary">
                                                                                                يرجى دفع الرسوم لتأكيد مشاركتك
                                                                                            </p>
                                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                                بمجرد دفع رسوم المشاركة (${participation.participationFee})، سيتم تأكيد حجز المكان الخاص بك في المعرض.
                                                                                            </p>
                                                                                            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                                                                                                <strong>تنبيه:</strong> يجب إتمام الدفع قبل بدأ المعرض في {startDate}، وإلا سيتم إلغاء طلبك تلقائياً.
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })()}

                                                                                {participation.status === 'INVITED' && (() => {
                                                                                    const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);
                                                                                    const startDate = exhibition?.startDate ? new Date(exhibition.startDate).toLocaleDateString('en-US') : 'غير محدد';
                                                                                    return (
                                                                                        <>
                                                                                            <div className="text-xs text-green-600 font-medium mb-1">
                                                                                                تاريخ بدأ المعرض: {startDate}
                                                                                            </div>
                                                                                            <Button
                                                                                                size="sm"
                                                                                                className="mt-1"
                                                                                                onClick={() => openRegisterDialog(participation)}
                                                                                                disabled={isDeadlinePassed(participation.responseDeadline)}
                                                                                            >
                                                                                                تسجيل المشاركة
                                                                                            </Button>
                                                                                            {isDeadlinePassed(participation.responseDeadline) && (
                                                                                                <p className="text-xs text-red-600 mt-1">
                                                                                                    انتهى الموعد النهائي للتسجيل
                                                                                                </p>
                                                                                            )}
                                                                                        </>
                                                                                    );
                                                                                })()}

                                                                                {participation.status === 'CONFIRMED' && (() => {
                                                                                    const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);
                                                                                    const isExhibitionConfirmed = exhibition?.status === 'CONFIRMED';
                                                                                    const canFinalize = participation.status === 'CONFIRMED';

                                                                                    return (
                                                                                        <>
                                                                                            {isExhibitionConfirmed && (
                                                                                                <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                                                                                                    <strong>تنبيه:</strong> يجب إتمام المشاركة قبل بدأ المعرض في {exhibition?.startDate ? new Date(exhibition.startDate).toLocaleDateString('en-US') : 'غير محدد'}، وإلا سيتم إلغاء مشاركتك تلقائياً.
                                                                                                </div>
                                                                                            )}
                                                                                            <Button
                                                                                                size="sm"
                                                                                                className="mt-2"
                                                                                                onClick={() => handleFinalizeParticipation(participation)}
                                                                                                disabled={!canFinalize || isFinalizingParticipation}
                                                                                            >
                                                                                                {isFinalizingParticipation ? (
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
                                                                                            {!isExhibitionConfirmed && (
                                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                                    انتظر حتى يتم تأكيد المعرض
                                                                                                </p>
                                                                                            )}
                                                                                            {isExhibitionConfirmed && (
                                                                                                <Button
                                                                                                    variant="outline"
                                                                                                    size="sm"
                                                                                                    className="mt-2 mr-2 gap-2"
                                                                                                    onClick={() => handleOpenBoothsDialog(participation)}
                                                                                                >
                                                                                                    <MapPin className="w-4 h-4" />
                                                                                                    عرض الأكشاك المخصصة
                                                                                                </Button>
                                                                                            )}
                                                                                        </>
                                                                                    );
                                                                                })()}

                                                                                {(() => {
                                                                                    const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);
                                                                                    const isExhibitionActiveOrCompleted = ['ACTIVE', 'COMPLETED'].includes(exhibition?.status || '');
                                                                                    const isCancellable = ['INVITED', 'REGISTERED', 'ACCEPTED', 'CONFIRMED', 'FINALIZED'].includes(participation.status);

                                                                                    if (isCancellable && !isExhibitionActiveOrCompleted) {
                                                                                        return (
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                className="mt-2 text-accent hover:text-red-700 hover:bg-red-50"
                                                                                                onClick={() => handleCancelParticipation(participation)}
                                                                                            >
                                                                                                إلغاء المشاركة
                                                                                            </Button>
                                                                                        );
                                                                                    }
                                                                                    return null;
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
                                راجع الدعوات الجديدة وشارك في المعارض لعرض برامجك الأكاديمية
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

            {/* Registration Dialog */}
            <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>تسجيل مشاركة في المعرض</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedParticipation && (() => {
                            return (
                                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                                    <p className="text-sm font-medium">
                                        {getExhibitionName(selectedParticipation.exhibitionId)}
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>رسوم المشاركة: ${selectedParticipation.participationFee}</p>
                                        {selectedParticipation.responseDeadline && (
                                            <p className="text-red-600">
                                                الموعد النهائي: {new Date(selectedParticipation.responseDeadline).toLocaleDateString('en-US')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="space-y-2">
                            <Label htmlFor="requestedBooths">عدد الأماكن المطلوبة</Label>
                            <Input
                                id="requestedBooths"
                                type="number"
                                min={1}
                                value={requestedBooths}
                                onChange={(e) => setRequestedBooths(parseInt(e.target.value) || 1)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="boothContent">تفاصيل الأماكن</Label>
                            <Textarea
                                id="boothContent"
                                placeholder="وصف محتوى الأماكن..."
                                value={boothContent}
                                onChange={(e) => setBoothContent(e.target.value)}
                                rows={6}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRegisterDialogOpen(false)} disabled={isSubmitting}>
                            إلغاء
                        </Button>
                        <Button onClick={handleRegister} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري التسجيل...
                                </>
                            ) : (
                                'تسجيل المشاركة'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Allocated Booths Dialog */}
            <Dialog open={boothsDialogOpen} onOpenChange={setBoothsDialogOpen}>
                <DialogContent className="max-w-2xl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            الأكشاك المخصصة للمشاركة
                        </DialogTitle>
                    </DialogHeader>

                    {isLoadingBooths ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : allocatedBooths.length > 0 ? (
                        <div className="space-y-4">
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">رقم الكشك</TableHead>
                                            <TableHead className="text-right">المنطقة</TableHead>
                                            <TableHead className="text-right">التفاصيل</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allocatedBooths.map((booth) => (
                                            <TableRow key={booth.id}>
                                                <TableCell className="text-right font-medium">
                                                    {booth.boothNumber}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {booth.zone}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground text-xs">
                                                    تم التخصيص في {new Date(booth.createdAt).toLocaleDateString('en-US')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">لا توجد أكشاك مخصصة لهذه المشاركة بعد.</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setBoothsDialogOpen(false)}>
                            إغلاق
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
                            سيؤدي هذا إلى إلغاء حجزك بالكامل ولا يمكن التراجع عن هذا الإجراء.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancellingParticipation}>تراجع</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmCancellation();
                            }}
                            disabled={isCancellingParticipation}
                            className="bg-accent text-accent-foreground hover:bg-accent/80"
                        >
                            {isCancellingParticipation ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نعم، قم بالإلغاء'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
