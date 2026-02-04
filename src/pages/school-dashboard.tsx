import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
import { Loader2, Calendar, FileText, Users } from "lucide-react";
import Lottie from "lottie-react";
import TotalRequestsAnimation from "@/assets/animations/total-requests-animation.json";
import PendingRequestsAnimation from "@/assets/animations/waiting_requests_animation.json";
import ApprovedRequestsAnimation from "@/assets/animations/accepted-requests-animation.json";
import RejectedRequestsAnimation from "@/assets/animations/rejected-requests-animation.json";
import BackToSchoolAnimation from "@/assets/animations/back_to_school.json";
import { RadialChart } from "@/components/charts/radial-chart";
import type { ChartConfig } from "@/components/ui/chart";
import { useSchoolParticipationStore } from "@/stores/school-participation-store";
import { useSchoolStore } from "@/stores/school-store";
import { useExhibitionStore } from "@/stores/exhibition-store";
import { useAuthStore } from "@/stores/auth-store";
import { schoolParticipationService } from "@/services/school-participation-service";
import { boothService } from "@/services/booth-service";
import type { SchoolParticipationStatus, SchoolParticipationResponse } from "@/types/school-participation";
import type { BoothResponse } from "@/types/booth";
import { toast } from "sonner";

export default function SchoolDashboard() {
    const { accessToken } = useAuthStore();
    const { ownerSchools, fetchSchoolsByOwnerId } = useSchoolStore();
    const { schoolParticipations, fetchParticipationsBySchoolIds, isLoadingSchoolParticipations } = useSchoolParticipationStore();
    const { exhibitions, fetchAllExhibitions } = useExhibitionStore();

    const [respondDialogOpen, setRespondDialogOpen] = useState(false);
    const [selectedParticipation, setSelectedParticipation] = useState<SchoolParticipationResponse | null>(null);
    const [expectedStudents, setExpectedStudents] = useState<string>("");
    const [isResponding, setIsResponding] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [participationToCancel, setParticipationToCancel] = useState<SchoolParticipationResponse | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [boothDialogOpen, setBoothDialogOpen] = useState(false);
    const [selectedExhibitionBooths, setSelectedExhibitionBooths] = useState<BoothResponse[]>([]);
    const [isLoadingBooths, setIsLoadingBooths] = useState(false);

    // Fetch owner's schools on mount
    useEffect(() => {
        if (accessToken?.userId) {
            fetchSchoolsByOwnerId(accessToken.userId);
        }
    }, [accessToken?.userId, fetchSchoolsByOwnerId]);

    // Fetch participations when schools are loaded
    useEffect(() => {
        if (ownerSchools.length > 0) {
            const schoolIds = ownerSchools.map(school => school.id);
            fetchParticipationsBySchoolIds(schoolIds);
        }
    }, [ownerSchools, fetchParticipationsBySchoolIds]);

    // Fetch all exhibitions
    useEffect(() => {
        fetchAllExhibitions();
    }, [fetchAllExhibitions]);

    const isDeadlinePassed = (deadline: string | null): boolean => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const getExhibitionName = (participation: SchoolParticipationResponse): string => {
        // Use enriched data first, fallback to looking up in store
        if (participation.exhibitionTitle) {
            return participation.exhibitionTitle;
        }
        const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);
        return exhibition ? exhibition.title : `معرض #${participation.exhibitionId}`;
    };

    const getExhibitionStartDate = (participation: SchoolParticipationResponse): string | null => {
        // Use enriched data first, fallback to looking up in store
        if (participation.exhibitionStartDate) {
            return participation.exhibitionStartDate;
        }
        const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);
        return exhibition?.startDate || null;
    };

    const getSchoolName = (participation: SchoolParticipationResponse): string => {
        // Use enriched data first, fallback to existing schoolName
        return participation.school?.name || participation.schoolName;
    };

    const getStatusLabel = (status: SchoolParticipationStatus) => {
        const labels: Record<SchoolParticipationStatus, string> = {
            'INVITED': 'مدعو',
            'REGISTERED': 'مسجل',
            'ACCEPTED': 'مقبول',
            'REJECTED': 'مرفوض',
            'CONFIRMED': 'مؤكد',
            'CANCELLED': 'ملغي',
            'FINALIZED': 'نهائي'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: SchoolParticipationStatus) => {
        const colors: Record<SchoolParticipationStatus, string> = {
            'INVITED': 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
            'REGISTERED': 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20',
            'ACCEPTED': 'bg-green-500/10 text-green-700 hover:bg-green-500/20',
            'REJECTED': 'bg-red-500/10 text-red-700 hover:bg-red-500/20',
            'CONFIRMED': 'bg-primary/10 text-primary hover:bg-primary/20',
            'CANCELLED': 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20',
            'FINALIZED': 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20'
        };
        return colors[status] || '';
    };

    const handleOpenRespondDialog = (participation: SchoolParticipationResponse) => {
        setSelectedParticipation(participation);
        setExpectedStudents("");
        setRespondDialogOpen(true);
    };

    const handleRespond = async (accept: boolean) => {
        if (!selectedParticipation) return;

        if (accept && (!expectedStudents || parseInt(expectedStudents) <= 0)) {
            toast.error("يرجى إدخال عدد الطلاب المتوقعين");
            return;
        }

        if (selectedParticipation.responseDeadline && isDeadlinePassed(selectedParticipation.responseDeadline)) {
            toast.error("انتهى الموعد النهائي للرد");
            return;
        }

        try {
            setIsResponding(true);
            await schoolParticipationService.respondToInvitation(
                selectedParticipation.id,
                {
                    accept,
                    expectedStudents: accept ? parseInt(expectedStudents) : undefined,
                    rejectionReason: !accept ? "غير مهتمين" : undefined
                }
            );
            toast.success(accept ? "تم قبول الدعوة بنجاح" : "تم رفض الدعوة");
            setRespondDialogOpen(false);

            // Refresh participations
            if (ownerSchools.length > 0) {
                const schoolIds = ownerSchools.map(school => school.id);
                fetchParticipationsBySchoolIds(schoolIds);
            }
        } catch (error) {
            console.error('Failed to respond to invitation:', error);
            toast.error("فشل في الرد على الدعوة");
        } finally {
            setIsResponding(false);
        }
    };

    const handleFinalize = async (participationId: number) => {
        try {
            setIsFinalizing(true);
            await schoolParticipationService.finalizeParticipation(participationId);
            toast.success("تم إتمام المشاركة بنجاح");

            // Refresh participations
            if (ownerSchools.length > 0) {
                const schoolIds = ownerSchools.map(school => school.id);
                fetchParticipationsBySchoolIds(schoolIds);
            }
        } catch (error) {
            console.error('Failed to finalize participation:', error);

            // Check if failure is due to exhibition not being confirmed
            const participation = schoolParticipations.find(p => p.id === participationId);
            const exhibition = participation ? exhibitions.find(e => e.id === participation.exhibitionId) : null;

            if (exhibition && exhibition.status !== 'CONFIRMED' && exhibition.status !== 'ACTIVE' && exhibition.status !== 'COMPLETED') {
                toast.error("لا يمكنك إتمام المشاركة قبل تأكيد المعرض");
            } else {
                toast.error("فشل في إتمام المشاركة");
            }
        } finally {
            setIsFinalizing(false);
        }
    };
    const handleCancelClick = (participation: SchoolParticipationResponse) => {
        setParticipationToCancel(participation);
        setCancelDialogOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!participationToCancel) return;

        setIsCancelling(true);
        try {
            await schoolParticipationService.cancelParticipation(participationToCancel.id);
            toast.success("تم إلغاء المشاركة بنجاح");

            // Refresh participations
            if (ownerSchools.length > 0) {
                const schoolIds = ownerSchools.map(school => school.id);
                fetchParticipationsBySchoolIds(schoolIds);
            }
            setCancelDialogOpen(false);
        } catch (error) {
            console.error('Failed to cancel participation:', error);
            toast.error("فشل في إلغاء المشاركة");
        } finally {
            setIsCancelling(false);
            setParticipationToCancel(null);
        }
    };

    const handleViewBooths = async (exhibitionId: number) => {
        setIsLoadingBooths(true);
        setBoothDialogOpen(true);
        try {
            const booths = await boothService.getBoothsByExhibition(exhibitionId);
            setSelectedExhibitionBooths(booths);
        } catch (error) {
            console.error('Failed to fetch booths:', error);
            toast.error("فشل في تحميل الأجنحة");
            setSelectedExhibitionBooths([]);
        } finally {
            setIsLoadingBooths(false);
        }
    };

    // Calculate stats
    const totalParticipations = schoolParticipations.length;
    const confirmedParticipations = schoolParticipations.filter(p => p.status === 'CONFIRMED' || p.status === 'FINALIZED').length;
    const registeredParticipations = schoolParticipations.filter(p => p.status === 'REGISTERED').length;
    const rejectedParticipations = schoolParticipations.filter(p => p.status === 'REJECTED' || p.status === 'CANCELLED').length;

    return (
        <div className="bg-background p-6 flex flex-col min-h-screen lg:min-h-0 lg:h-[650px] lg:overflow-hidden" dir="rtl">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Participations Card */}
                <Card className="flex flex-col items-center">
                    <CardContent className="pt-3 pb-2 px-3">
                        <div className="relative flex items-center justify-center w-24 h-24">
                            <Lottie animationData={TotalRequestsAnimation} loop={true} style={{ width: '80px', height: '80px' }} />
                        </div>
                        <div className="mt-1 text-center">
                            <div className="text-xs font-medium text-muted-foreground">
                                إجمالي المشاركات - {totalParticipations}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Registered Participations */}
                <RadialChart
                    title="بانتظار القبول"
                    value={registeredParticipations}
                    maxValue={totalParticipations}
                    fillColor="var(--chart-2)"
                    config={{
                        value: {
                            label: "Participations",
                            color: "var(--chart-2)",
                        },
                    } satisfies ChartConfig}
                    animationData={PendingRequestsAnimation}
                    innerRadius={40}
                    outerRadius={50}
                />

                {/* Confirmed Participations */}
                <RadialChart
                    title="المشاركات المؤكدة"
                    value={confirmedParticipations}
                    maxValue={totalParticipations}
                    fillColor="var(--chart-3)"
                    config={{
                        value: {
                            label: "Participations",
                            color: "var(--chart-3)",
                        },
                    } satisfies ChartConfig}
                    animationData={ApprovedRequestsAnimation}
                    innerRadius={40}
                    outerRadius={50}
                />

                {/* Rejected Participations */}
                <RadialChart
                    title="مرفوض"
                    value={rejectedParticipations}
                    maxValue={totalParticipations}
                    fillColor="var(--chart-4)"
                    config={{
                        value: {
                            label: "Participations",
                            color: "var(--chart-4)",
                        },
                    } satisfies ChartConfig}
                    animationData={RejectedRequestsAnimation}
                    innerRadius={40}
                    outerRadius={50}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:flex-1 lg:overflow-hidden">
                {/* Participations Table */}
                <Card className="lg:col-span-3 border-border flex flex-col lg:overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-foreground">الدعوات</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 lg:overflow-auto">
                        {isLoadingSchoolParticipations ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="mr-3 text-muted-foreground">جاري تحميل المشاركات...</span>
                            </div>
                        ) : schoolParticipations.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">لا توجد مشاركات حالياً</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المعرض</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">تاريخ البدء</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المدرسة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">عدد الطلاب</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الموعد النهائي</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الأجنحة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schoolParticipations.map((participation) => (
                                            <tr key={participation.id} className="border-b border-border last:border-0">
                                                <td className="py-4 px-4 text-sm font-medium text-foreground">
                                                    {getExhibitionName(participation)}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                                    {getExhibitionStartDate(participation) ? new Date(getExhibitionStartDate(participation)!).toLocaleDateString('en-US') : '-'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-foreground">
                                                    {getSchoolName(participation)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getStatusColor(participation.status)}>
                                                        {getStatusLabel(participation.status)}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-foreground">
                                                    {participation.expectedStudents || '-'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {participation.responseDeadline ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`text-sm ${isDeadlinePassed(participation.responseDeadline)
                                                                ? 'text-red-600 font-semibold'
                                                                : 'text-muted-foreground'
                                                                }`}>
                                                                {new Date(participation.responseDeadline).toLocaleDateString('en-US')}
                                                            </span>
                                                            {isDeadlinePassed(participation.responseDeadline) && (
                                                                <Badge variant="destructive" className="text-xs w-fit">
                                                                    منتهي
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">غير محدد</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewBooths(participation.exhibitionId)}
                                                    >
                                                        عرض
                                                    </Button>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex gap-2">
                                                        {participation.status === 'INVITED' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOpenRespondDialog(participation)}
                                                                disabled={isDeadlinePassed(participation.responseDeadline)}
                                                            >
                                                                الرد على الدعوة
                                                            </Button>
                                                        )}
                                                        {participation.status === 'ACCEPTED' && (() => {
                                                            const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);
                                                            const isExhibitionConfirmed = exhibition?.status === 'CONFIRMED' || exhibition?.status === 'ACTIVE' || exhibition?.status === 'COMPLETED';
                                                            
                                                            return (
                                                                <div className="flex flex-col gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleFinalize(participation.id)}
                                                                        disabled={isFinalizing || !isExhibitionConfirmed}
                                                                    >
                                                                        {isFinalizing ? (
                                                                            <>
                                                                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                                جاري...
                                                                            </>
                                                                        ) : (
                                                                            'تأكيد المشاركة'
                                                                        )}
                                                                    </Button>
                                                                    {!isExhibitionConfirmed && (
                                                                        <span className="text-xs text-amber-600">
                                                                            انتظر تأكيد المعرض
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                        {participation.status === 'CONFIRMED' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleFinalize(participation.id)}
                                                                disabled={isFinalizing}
                                                            >
                                                                {isFinalizing ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                        جاري...
                                                                    </>
                                                                ) : (
                                                                    'إتمام المشاركة'
                                                                )}
                                                            </Button>
                                                        )}
                                                        {(participation.status === 'FINALIZED' || participation.status === 'CANCELLED' || participation.status === 'REJECTED') && (
                                                            <span className="text-sm text-muted-foreground">-</span>
                                                        )}
                                                        {participation.status !== 'CANCELLED' && participation.status !== 'REJECTED' && (() => {
                                                            const exhibition = exhibitions.find(e => e.id === participation.exhibitionId);
                                                            const isExhibitionActive = exhibition?.status === 'ACTIVE' || exhibition?.status === 'COMPLETED';

                                                            if (!isExhibitionActive) {
                                                                return (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleCancelClick(participation)}
                                                                        disabled={isCancelling}
                                                                    >
                                                                        إلغاء
                                                                    </Button>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Info Card */}
                <Card className="border-0 p-0 bg-gradient-to-br from-primary to-foreground text-white overflow-hidden relative h-fit">
                    <CardContent className="p-4 relative z-10">
                        <h3 className="text-xl font-bold mb-3">
                            مرحباً بك في لوحة التحكم
                        </h3>
                        <p className="text-sm text-white/90 mb-6">
                            راجع الدعوات الجديدة واستجب لمشاركات المعارض
                        </p>
                        <div className="max-h-[250px]">
                            <Lottie
                                animationData={BackToSchoolAnimation}
                                loop={true}
                            />
                        </div>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-secondary/30 to-transparent" />
                </Card>
            </div>

            {/* Respond to Invitation Dialog */}
            <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">الرد على دعوة المعرض</DialogTitle>
                        <DialogDescription className="text-right">
                            {selectedParticipation && (
                                <div className="space-y-1">
                                    <div>المعرض: {getExhibitionName(selectedParticipation)}</div>
                                    {getExhibitionStartDate(selectedParticipation) && (
                                        <div className="text-xs">
                                            تاريخ البدء: {new Date(getExhibitionStartDate(selectedParticipation)!).toLocaleDateString('en-US')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4" dir="rtl">
                        <div className="space-y-2">
                            <Label htmlFor="expectedStudents" className="text-right block">
                                عدد الطلاب المتوقعين *
                            </Label>
                            <Input
                                id="expectedStudents"
                                type="number"
                                min="1"
                                value={expectedStudents}
                                onChange={(e) => setExpectedStudents(e.target.value)}
                                placeholder="أدخل عدد الطلاب المتوقعين"
                                className="text-right"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                حدد عدد الطلاب المتوقع حضورهم للمعرض
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setRespondDialogOpen(false)}
                            disabled={isResponding}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleRespond(false)}
                            disabled={isResponding}
                        >
                            {isResponding ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري...
                                </>
                            ) : (
                                'رفض'
                            )}
                        </Button>
                        <Button
                            onClick={() => handleRespond(true)}
                            disabled={isResponding || !expectedStudents}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isResponding ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري...
                                </>
                            ) : (
                                'قبول'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent dir="rtl">
                    <AlertDialogHeader className="text-right">
                        <AlertDialogTitle>هل أنت متأكد من إلغاء المشاركة؟</AlertDialogTitle>
                        <AlertDialogDescription className="text-right">
                            هذا الإجراء لا يمكن التراجع عنه. سيتم إلغاء مشاركة مدرستك في المعرض.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse gap-2">
                        <AlertDialogCancel className="mt-0">تراجع</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmCancel();
                            }}
                            className="bg-accent text-accent-foreground hover:bg-accent/80"
                            disabled={isCancelling}
                        >
                            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نعم، قم بالإلغاء'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Booths Dialog */}
            <Dialog open={boothDialogOpen} onOpenChange={setBoothDialogOpen}>
                <DialogContent className="sm:max-w-[600px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">الأجنحة المتاحة</DialogTitle>
                        <DialogDescription className="text-right">
                            قائمة بجميع الأجنحة في المعرض
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4" dir="rtl">
                        {isLoadingBooths ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="mr-3 text-muted-foreground">جاري تحميل الأجنحة...</span>
                            </div>
                        ) : selectedExhibitionBooths.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">لا توجد أجنحة متاحة</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">رقم الجناح</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المنطقة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">النوع</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">المدة (دقائق)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedExhibitionBooths.map((booth) => (
                                            <tr key={booth.id} className="border-b border-border last:border-0">
                                                <td className="py-3 px-4 text-sm text-foreground">
                                                    {booth.boothNumber}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-foreground">
                                                    {booth.zone}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-foreground">
                                                    {booth.type === 'UNIVERSITY' ? 'جامعة' : 'مزود نشاط'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {booth.durationMinutes || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setBoothDialogOpen(false)}
                        >
                            إغلاق
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
