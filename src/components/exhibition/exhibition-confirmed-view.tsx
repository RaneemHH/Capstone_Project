import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, TrendingUp, TrendingDown, MapPin, Settings, Play, Users, CheckCircle } from "lucide-react";
import { exhibitionFinanceService } from "@/services/exhibition-finance-service";
import type { ExhibitionFinancialResponse } from "@/types/exhibition";
import type { ExhibitionResponse } from "@/types/exhibition";
import { toast } from "sonner";
import { useBoothStore } from "@/stores/booth-store";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { universityParticipationService } from "@/services/university-participation-service";
import { activityProviderService } from "@/services/activity-provider-service";
import { studentRegistrationService } from "@/services/student-registration-service";
import { attendanceService } from "@/services/attendance-service";
import type { UniversityParticipationResponse } from "@/types/university";
import type { ActivityProviderRequestResponse } from "@/types/activity-provider";
import type { StudentRegistrationResponse } from "@/types/student-registration";
import type { BoothResponse } from "@/types/booth";
import { BoothAllocationDialog } from "./booth-allocation-dialog";
import { exhibitionService } from "@/services/exhibitionService";

interface ExhibitionConfirmedViewProps {
    exhibitionId: number;
    exhibition: ExhibitionResponse;
    onExhibitionUpdate?: () => void;
}

export function ExhibitionConfirmedView({ exhibitionId, exhibition, onExhibitionUpdate }: ExhibitionConfirmedViewProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [financialData, setFinancialData] = useState<ExhibitionFinancialResponse | null>(null);
    const { booths, isLoading: boothsLoading, fetchBooths } = useBoothStore();
    const [universityParticipations, setUniversityParticipations] = useState<UniversityParticipationResponse[]>([]);
    const [activityProviderRequests, setActivityProviderRequests] = useState<ActivityProviderRequestResponse[]>([]);
    const [selectedBooth, setSelectedBooth] = useState<BoothResponse | null>(null);
    const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistrationResponse[]>([]);
    const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [isApproving, setIsApproving] = useState(false);
    const [markingAttendanceId, setMarkingAttendanceId] = useState<number | null>(null);

    const fetchFinancialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await exhibitionFinanceService.getFinancialReport(exhibitionId);
            setFinancialData(data);
        } catch (error) {
            console.error('Failed to fetch financial data:', error);
            toast.error("فشل في تحميل البيانات المالية");
        } finally {
            setIsLoading(false);
        }
    }, [exhibitionId]);

    const fetchParticipations = useCallback(async () => {
        try {
            const [universities, providers] = await Promise.all([
                universityParticipationService.getParticipationsByExhibition(exhibitionId),
                activityProviderService.getRequestsByExhibition(exhibitionId)
            ]);
            setUniversityParticipations(universities);
            setActivityProviderRequests(providers);
        } catch (error) {
            console.error('Failed to fetch participations:', error);
        }
    }, [exhibitionId]);

    const fetchStudentRegistrations = useCallback(async () => {
        try {
            setIsLoadingRegistrations(true);
            const registrations = await studentRegistrationService.getRegistrationsByExhibition(exhibitionId);
            setStudentRegistrations(registrations);
        } catch (error) {
            console.error('Failed to fetch student registrations:', error);
            toast.error("فشل في تحميل تسجيلات الطلاب");
        } finally {
            setIsLoadingRegistrations(false);
        }
    }, [exhibitionId]);

    // Fetch financial data when component mounts or when exhibition is CONFIRMED, ACTIVE, or COMPLETED
    useEffect(() => {
        if (exhibition.status === 'CONFIRMED' || exhibition.status === 'ACTIVE' || exhibition.status === 'COMPLETED') {
            fetchFinancialData();
            fetchBooths(exhibitionId);
            fetchParticipations();
            fetchStudentRegistrations();
        }
    }, [exhibition.status, fetchFinancialData, fetchBooths, fetchParticipations, fetchStudentRegistrations, exhibitionId]);

    const getParticipantName = (booth: typeof booths[0]) => {
        if (booth.type === 'UNIVERSITY' && booth.universityParticipationId) {
            const participation = universityParticipations.find(p => p.id === booth.universityParticipationId);
            return participation?.universityName || '-';
        } else if (booth.type === 'ACTIVITY_PROVIDER' && booth.activityProviderRequestId) {
            const request = activityProviderRequests.find(r => r.id === booth.activityProviderRequestId);
            return request?.name || '-';
        }
        return '-';
    };

    const handleSetAllocation = (booth: BoothResponse) => {
        setSelectedBooth(booth);
        setIsAllocationDialogOpen(true);
    };

    const handleAllocationSuccess = () => {
        fetchBooths(exhibitionId);
    };

    const handleStartExhibition = async () => {
        try {
            setIsStarting(true);
            await exhibitionService.startExhibition(exhibitionId);
            toast.success("تم بدء المعرض بنجاح!");
            // Refresh the page or update the exhibition status
            if (onExhibitionUpdate) {
                onExhibitionUpdate();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to start exhibition:', error);
            toast.error("فشل في بدء المعرض");
        } finally {
            setIsStarting(false);
        }
    };

    const handleCompleteExhibition = async () => {
        try {
            setIsCompleting(true);
            await exhibitionService.completeExhibition(exhibitionId);
            toast.success("تم إكمال المعرض بنجاح!");
            // Refresh the page or update the exhibition status
            if (onExhibitionUpdate) {
                onExhibitionUpdate();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to complete exhibition:', error);
            toast.error("فشل في إكمال المعرض");
        } finally {
            setIsCompleting(false);
        }
    };

    const handleToggleStudent = (studentId: number) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const handleToggleAll = () => {
        if (selectedStudents.size === pendingStudents.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(pendingStudents.map(s => s.id)));
        }
    };

    const handleApproveSelected = async () => {
        if (selectedStudents.size === 0) {
            toast.error("الرجاء تحديد طلاب للموافقة");
            return;
        }

        try {
            setIsApproving(true);
            await studentRegistrationService.approveStudents(Array.from(selectedStudents));
            toast.success(`تمت الموافقة على ${selectedStudents.size} طالب`);
            setSelectedStudents(new Set());
            fetchStudentRegistrations();
        } catch (error) {
            console.error('Failed to approve students:', error);
            toast.error("فشل في الموافقة على الطلاب");
        } finally {
            setIsApproving(false);
        }
    };

    const handleApproveSingle = async (registrationId: number) => {
        try {
            await studentRegistrationService.approveStudent(registrationId);
            toast.success("تمت الموافقة على الطالب");
            fetchStudentRegistrations();
        } catch (error) {
            console.error('Failed to approve student:', error);
            toast.error("فشل في الموافقة على الطالب");
        }
    };

    const handleCancelRegistration = async (registrationId: number) => {
        try {
            await studentRegistrationService.cancelRegistration(registrationId);
            toast.success("تم إلغاء التسجيل");
            fetchStudentRegistrations();
        } catch (error) {
            console.error('Failed to cancel registration:', error);
            toast.error("فشل في إلغاء التسجيل");
        }
    };
    const handleMarkAttendance = async (registrationId: number, attended: boolean) => {
        try {
            setMarkingAttendanceId(registrationId);
            await attendanceService.markStudentAttendance(registrationId, attended);
            toast.success(attended ? 'تم تسجيل الحضور بنجاح' : 'تم تسجيل عدم الحضور');
            fetchStudentRegistrations();
        } catch (error) {
            console.error('Failed to mark attendance:', error);
            toast.error('فشل في تسجيل الحضور');
        } finally {
            setMarkingAttendanceId(null);
        }
    };
    const pendingStudents = studentRegistrations.filter(s => s.status === 'PENDING');
    const approvedStudents = studentRegistrations.filter(s => s.status === 'REGISTERED' || s.approved);

    // Show financial details and schedule when CONFIRMED
    return (
        <div className="space-y-6">
            {/* Start Exhibition Button */}
            {exhibition.status === 'CONFIRMED' && (
                <Card className="bg-primary/5 border-primary">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">جاهز لبدء المعرض؟</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    انقر على الزر لبدء المعرض وتفعيله
                                </p>
                            </div>
                            <Button
                                onClick={handleStartExhibition}
                                disabled={isStarting}
                                size="lg"
                                className="gap-2"
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري البدء...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        بدء المعرض
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Complete Exhibition Button */}
            {exhibition.status === 'ACTIVE' && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-green-900">جاهز لإكمال المعرض؟</h3>
                                <p className="text-sm text-green-700 mt-1">
                                    انقر على الزر لإكمال المعرض وإنهاء جميع الأنشطة
                                </p>
                            </div>
                            <Button
                                onClick={handleCompleteExhibition}
                                disabled={isCompleting}
                                size="lg"
                                className="gap-2 bg-green-600 hover:bg-green-700"
                            >
                                {isCompleting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        جاري الإكمال...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        إكمال المعرض
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Financial Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        الملخص المالي
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : financialData ? (
                        console.log('Financial Data:', financialData),
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-700 font-medium">إجمالي الإيرادات</p>
                                            <p className="text-2xl font-bold text-green-900 mt-1">
                                                ${financialData.totalRevenue.toLocaleString()}
                                            </p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-red-50 border-red-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-red-700 font-medium">إجمالي المصروفات</p>
                                            <p className="text-2xl font-bold text-red-900 mt-1">
                                                ${financialData.totalExpenses.toLocaleString()}
                                            </p>
                                        </div>
                                        <TrendingDown className="w-8 h-8 text-red-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={`${financialData.netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm font-medium ${financialData.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                                صافي الربح
                                            </p>
                                            <p className={`text-2xl font-bold mt-1 ${financialData.netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                                                ${financialData.netProfit.toLocaleString()}
                                            </p>
                                        </div>
                                        <DollarSign className={`w-8 h-8 ${financialData.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">لا توجد بيانات مالية متاحة</p>
                    )}
                </CardContent>
            </Card>

            {/* Booths Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        الأكشاك المخصصة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {boothsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : booths.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">الرقم</TableHead>
                                        <TableHead className="text-right">النوع</TableHead>
                                        <TableHead className="text-right">المنطقة</TableHead>
                                        <TableHead className="text-right">رقم الكشك</TableHead>
                                        <TableHead className="text-right">المشارك</TableHead>
                                        <TableHead className="text-right">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booths.map((booth) => (
                                        <TableRow key={booth.id}>
                                            <TableCell className="font-medium">{booth.id}</TableCell>
                                            <TableCell>
                                                {booth.type === 'UNIVERSITY' ? 'جامعة' : 'مزود نشاط'}
                                            </TableCell>
                                            <TableCell>{booth.zone}</TableCell>
                                            <TableCell>{booth.boothNumber}</TableCell>
                                            <TableCell>{getParticipantName(booth)}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSetAllocation(booth)}
                                                >
                                                    <Settings className="w-4 h-4 ml-2" />
                                                    تعيين التخصيص
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">لا توجد أكشاك متاحة</p>
                    )}
                </CardContent>
            </Card>

            {/* Student Registrations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            تسجيلات الطلاب
                        </CardTitle>
                        {selectedStudents.size > 0 && (
                            <Button
                                onClick={handleApproveSelected}
                                disabled={isApproving}
                                className="gap-2"
                            >
                                {isApproving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        جاري الموافقة...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        الموافقة على المحدد ({selectedStudents.size})
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingRegistrations ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : studentRegistrations.length > 0 ? (
                        <div className="space-y-4">
                            {/* Pending Registrations */}
                            {pendingStudents.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">بانتظار الموافقة ({pendingStudents.length})</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-12">
                                                        <Checkbox
                                                            checked={selectedStudents.size === pendingStudents.length && pendingStudents.length > 0}
                                                            onCheckedChange={handleToggleAll}
                                                        />
                                                    </TableHead>
                                                    <TableHead className="text-right">اسم الطالب</TableHead>
                                                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                                    <TableHead className="text-right">تاريخ التسجيل</TableHead>
                                                    <TableHead className="text-right">الإجراءات</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {pendingStudents.map((registration) => (
                                                    <TableRow key={registration.id}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedStudents.has(registration.id)}
                                                                onCheckedChange={() => handleToggleStudent(registration.id)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{registration.studentName}</TableCell>
                                                        <TableCell>{registration.studentEmail}</TableCell>
                                                        <TableCell>
                                                            {registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString('en-US') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleApproveSingle(registration.id)}
                                                                >
                                                                    <CheckCircle className="w-4 h-4 ml-2" />
                                                                    موافقة
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleCancelRegistration(registration.id)}
                                                                >
                                                                    إلغاء
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {/* Approved Registrations */}
                            {approvedStudents.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">الطلاب المعتمدون ({approvedStudents.length})</h3>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-right">اسم الطالب</TableHead>
                                                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                                    <TableHead className="text-right">تاريخ التسجيل</TableHead>
                                                    <TableHead className="text-right">تاريخ الموافقة</TableHead>
                                                    <TableHead className="text-right">الحالة</TableHead>
                                                    <TableHead className="text-right">الإجراءات</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {approvedStudents.map((registration) => (
                                                    <TableRow key={registration.id}>
                                                        <TableCell className="font-medium">{registration.studentName}</TableCell>
                                                        <TableCell>{registration.studentEmail}</TableCell>
                                                        <TableCell>
                                                            {registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString('en-US') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {registration.approvedAt ? new Date(registration.approvedAt).toLocaleDateString('en-US') : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {(() => {
                                                                const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
                                                                    PENDING: { label: "بانتظار الموافقة", variant: "outline" },
                                                                    REGISTERED: { label: "مسجل", variant: "secondary" },
                                                                    ATTENDED: { label: "حضر", variant: "default" },
                                                                    NO_SHOW: { label: "لم يحضر", variant: "destructive" },
                                                                    CANCELLED: { label: "ملغي", variant: "destructive" }
                                                                };
                                                                const config = statusConfig[registration.status] || { label: registration.status, variant: "outline" };
                                                                return <Badge variant={config.variant}>{config.label}</Badge>;
                                                            })()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {registration.status === 'REGISTERED' && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => handleMarkAttendance(registration.id, true)}
                                                                        disabled={markingAttendanceId === registration.id}
                                                                    >
                                                                        {markingAttendanceId === registration.id ? (
                                                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                        ) : (
                                                                            <CheckCircle className="w-4 h-4 ml-2" />
                                                                        )}
                                                                        حضر
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleMarkAttendance(registration.id, false)}
                                                                        disabled={markingAttendanceId === registration.id}
                                                                    >
                                                                        لم يحضر
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {(registration.status === 'ATTENDED' || registration.status === 'NO_SHOW') && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {registration.attendedAt ? new Date(registration.attendedAt).toLocaleDateString('en-US') : '-'}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">لا توجد تسجيلات طلاب</p>
                    )}
                </CardContent>
            </Card>

            <BoothAllocationDialog
                booth={selectedBooth}
                exhibitionId={exhibitionId}
                open={isAllocationDialogOpen}
                onOpenChange={setIsAllocationDialogOpen}
                onSuccess={handleAllocationSuccess}
            />
        </div>
    );
}
