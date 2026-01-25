import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, FileText, Calendar, TrendingUp, TrendingDown, Users, Loader2 } from "lucide-react";
import { useSchoolParticipationStore } from "@/stores/school-participation-store";
import { useSchoolStore } from "@/stores/school-store";
import { useExhibitionStore } from "@/stores/exhibition-store";
import { useAuthStore } from "@/stores/auth-store";
import { schoolParticipationService } from "@/services/school-participation-service";
import type { SchoolParticipationStatus, SchoolParticipationResponse } from "@/types/school-participation";
import { toast } from "sonner";

export default function SchoolDashboard() {
    const { accessToken } = useAuthStore();
    const { ownerSchools, fetchSchoolsByOwnerId } = useSchoolStore();
    const { schoolParticipations, fetchParticipationsBySchoolId, isLoadingSchoolParticipations } = useSchoolParticipationStore();
    const { exhibitions, fetchAllExhibitions } = useExhibitionStore();
    
    const [respondDialogOpen, setRespondDialogOpen] = useState(false);
    const [selectedParticipation, setSelectedParticipation] = useState<SchoolParticipationResponse | null>(null);
    const [expectedStudents, setExpectedStudents] = useState<string>("");
    const [isResponding, setIsResponding] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);

    // Fetch owner's schools on mount
    useEffect(() => {
        if (accessToken?.userId) {
            fetchSchoolsByOwnerId(accessToken.userId);
        }
    }, [accessToken?.userId, fetchSchoolsByOwnerId]);

    // Fetch participations when schools are loaded
    useEffect(() => {
        if (ownerSchools.length > 0) {
            ownerSchools.forEach(school => {
                fetchParticipationsBySchoolId(school.id);
            });
        }
    }, [ownerSchools, fetchParticipationsBySchoolId]);

    // Fetch all exhibitions
    useEffect(() => {
        fetchAllExhibitions();
    }, [fetchAllExhibitions]);

    const isDeadlinePassed = (deadline: string | null): boolean => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const getExhibitionName = (exhibitionId: number): string => {
        const exhibition = exhibitions.find(e => e.id === exhibitionId);
        return exhibition ? exhibition.title : `معرض #${exhibitionId}`;
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
                ownerSchools.forEach(school => {
                    fetchParticipationsBySchoolId(school.id);
                });
            }
        } catch (error) {
            console.error('Failed to respond to invitation:', error);
            toast.error("فشل في الرد على الدعوة");
        } finally {
            setIsResponding(false);
        }
    };

    const handleConfirm = async (participationId: number) => {
        try {
            setIsConfirming(true);
            await schoolParticipationService.confirmSchool(participationId);
            toast.success("تم تأكيد المشاركة بنجاح");
            
            // Refresh participations
            if (ownerSchools.length > 0) {
                ownerSchools.forEach(school => {
                    fetchParticipationsBySchoolId(school.id);
                });
            }
        } catch (error) {
            console.error('Failed to confirm participation:', error);
            toast.error("فشل في تأكيد المشاركة");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleFinalize = async (participationId: number) => {
        try {
            setIsFinalizing(true);
            await schoolParticipationService.finalizeParticipation(participationId);
            toast.success("تم إتمام المشاركة بنجاح");
            
            // Refresh participations
            if (ownerSchools.length > 0) {
                ownerSchools.forEach(school => {
                    fetchParticipationsBySchoolId(school.id);
                });
            }
        } catch (error) {
            console.error('Failed to finalize participation:', error);
            toast.error("فشل في إتمام المشاركة");
        } finally {
            setIsFinalizing(false);
        }
    };

    // Calculate stats
    const totalParticipations = schoolParticipations.length;
    const confirmedParticipations = schoolParticipations.filter(p => p.status === 'CONFIRMED' || p.status === 'FINALIZED').length;
    const totalExpectedStudents = schoolParticipations
        .filter(p => p.expectedStudents !== null)
        .reduce((sum, p) => sum + (p.expectedStudents || 0), 0);

    // Mock data for stats
    const stats = [
        {
            title: "إجمالي المشاركات",
            value: totalParticipations.toString(),
            change: "+0%",
            isPositive: true,
            icon: FileText,
            color: "text-accent",
            bgColor: "bg-accent/10"
        },
        {
            title: "المعارض النشطة",
            value: schoolParticipations.filter(p => p.status !== 'CANCELLED' && p.status !== 'REJECTED').length.toString(),
            change: "+0%",
            isPositive: true,
            icon: Building2,
            color: "text-primary",
            bgColor: "bg-primary/10"
        },
        {
            title: "الطلاب المتوقعون",
            value: totalExpectedStudents.toString(),
            change: "+0%",
            isPositive: true,
            icon: Users,
            color: "text-foreground",
            bgColor: "bg-foreground/10"
        },
        {
            title: "المشاركات المؤكدة",
            value: totalParticipations > 0 ? `${Math.round((confirmedParticipations / totalParticipations) * 100)}%` : "0%",
            change: "0%",
            isPositive: false,
            icon: Calendar,
            color: "text-muted",
            bgColor: "bg-muted/20"
        }
    ];

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
                {/* Participations Table */}
                <Card className="lg:col-span-2 border-border flex flex-col lg:overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-foreground">المشاركات الأخيرة</CardTitle>
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
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">عدد الطلاب</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">تاريخ الدعوة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الموعد النهائي</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schoolParticipations.map((participation) => (
                                            <tr key={participation.id} className="border-b border-border last:border-0">
                                                <td className="py-4 px-4 text-sm font-medium text-foreground">
                                                    {getExhibitionName(participation.exhibitionId)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getStatusColor(participation.status)}>
                                                        {getStatusLabel(participation.status)}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-foreground">
                                                    {participation.expectedStudents || '-'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">
                                                    {participation.invitedAt ? new Date(participation.invitedAt).toLocaleDateString('ar') : '-'}
                                                </td>
                                                <td className="py-4 px-4">
                                                    {participation.responseDeadline ? (
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`text-sm ${
                                                                isDeadlinePassed(participation.responseDeadline) 
                                                                    ? 'text-red-600 font-semibold' 
                                                                    : 'text-muted-foreground'
                                                            }`}>
                                                                {new Date(participation.responseDeadline).toLocaleDateString('ar')}
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
                                                        {participation.status === 'ACCEPTED' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleConfirm(participation.id)}
                                                                disabled={isConfirming}
                                                            >
                                                                {isConfirming ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                        جاري...
                                                                    </>
                                                                ) : (
                                                                    'تأكيد المشاركة'
                                                                )}
                                                            </Button>
                                                        )}
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
                <Card className="border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground text-base">معلومات سريعة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                            <div className="bg-primary/10 text-primary p-2 rounded-lg">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground mb-1">المعارض القادمة</p>
                                <p className="text-xs text-muted-foreground">لا توجد معارض قادمة</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                            <div className="bg-accent/10 text-accent p-2 rounded-lg">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground mb-1">الدعوات المعلقة</p>
                                <p className="text-xs text-muted-foreground">لا توجد دعوات معلقة</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                            <div className="bg-foreground/10 text-foreground p-2 rounded-lg">
                                <Users className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground mb-1">إجمالي الطلاب</p>
                                <p className="text-xs text-muted-foreground">0 طالب مسجل</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Respond to Invitation Dialog */}
            <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">الرد على دعوة المعرض</DialogTitle>
                        <DialogDescription className="text-right">
                            {selectedParticipation && `المعرض: ${getExhibitionName(selectedParticipation.exhibitionId)}`}
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
        </div>
    );
}
