import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import type { ExhibitionResponse } from "@/types/exhibition";
import { toast } from "sonner";
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
import { studentRegistrationService } from "@/services/student-registration-service";
import { attendanceService } from "@/services/attendance-service";
import type { StudentRegistrationResponse } from "@/types/student-registration";
import { exhibitionService } from "@/services/exhibitionService";
import { Users } from "lucide-react";
import { RadialChartLabel } from "@/components/charts/radial-chart-label";
import { getParticipationStats, type StudentStats } from "@/services/dashboard-service";
import { ChartRadialStacked } from "@/components/charts/chart-radial-stacked";
import { exhibitionFinanceService } from "@/services/exhibition-finance-service";
import type { ExhibitionFinancialResponse } from "@/types/exhibition";
import MoneyAnimation from "@/assets/animations/money.json";
import Lottie from "lottie-react";
import { getMergedStudentRegistrations, getMockDataForExhibition } from "@/mockDataForCharts/mockExhibitionDetails";

interface ExhibitionActiveViewProps {
    exhibitionId: number;
    exhibition: ExhibitionResponse;
    onExhibitionUpdate?: () => void;
}

export function ExhibitionActiveView({ exhibitionId, exhibition, onExhibitionUpdate }: ExhibitionActiveViewProps) {
    const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistrationResponse[]>([]);
    const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [isApproving, setIsApproving] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [markingAttendanceId, setMarkingAttendanceId] = useState<number | null>(null);
    const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [financialData, setFinancialData] = useState<ExhibitionFinancialResponse | null>(null);
    const [isLoadingFinancials, setIsLoadingFinancials] = useState(false);

    const fetchParticipationStats = useCallback(async () => {
        try {
            setIsLoadingStats(true);
            const stats = await getParticipationStats(exhibitionId);
            
            // Merge with mock data if available for this exhibition
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.studentStats) {
                const mergedStats: StudentStats = {
                    registered: stats.students.registered + mockData.studentStats.registered,
                    attended: stats.students.attended + mockData.studentStats.attended,
                    noShow: stats.students.noShow + mockData.studentStats.noShow,
                    attendanceRate: ((stats.students.attended + mockData.studentStats.attended) / 
                        (stats.students.registered + mockData.studentStats.registered)) * 100
                };
                setStudentStats(mergedStats);
            } else {
                setStudentStats(stats.students);
            }
        } catch (error) {
            console.error('Failed to fetch participation stats:', error);
            // Use mock data if available
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.studentStats) {
                setStudentStats(mockData.studentStats as StudentStats);
            }
        } finally {
            setIsLoadingStats(false);
        }
    }, [exhibitionId]);

    const fetchFinancialData = useCallback(async () => {
        try {
            setIsLoadingFinancials(true);
            const data = await exhibitionFinanceService.calculateFinancials(exhibitionId);
            
            // Merge with mock data if available for this exhibition
            const mockData = getMockDataForExhibition(exhibitionId);
            if (mockData?.financialSummary) {
                const mergedData: ExhibitionFinancialResponse = {
                    totalRevenue: data.totalRevenue + mockData.financialSummary.totalRevenue,
                    totalExpenses: data.totalExpenses + mockData.financialSummary.totalExpenses,
                    netProfit: data.netProfit + mockData.financialSummary.netProfit
                };
                setFinancialData(mergedData);
            } else {
                setFinancialData(data);
            }
        } catch (error) {
            console.error('Failed to fetch financial data:', error);
            // Try fallback or use mock data for specific exhibition
            try {
                const data = await exhibitionFinanceService.getFinancialReport(exhibitionId);
                
                // Merge with mock data even for fallback
                const mockData = getMockDataForExhibition(exhibitionId);
                if (mockData?.financialSummary) {
                    const mergedData: ExhibitionFinancialResponse = {
                        totalRevenue: data.totalRevenue + mockData.financialSummary.totalRevenue,
                        totalExpenses: data.totalExpenses + mockData.financialSummary.totalExpenses,
                        netProfit: data.netProfit + mockData.financialSummary.netProfit
                    };
                    setFinancialData(mergedData);
                } else {
                    setFinancialData(data);
                }
            } catch (innerError) {
                console.error('Failed to get fallback financial report:', innerError);
                // Use mock data if available
                const mockData = getMockDataForExhibition(exhibitionId);
                if (mockData?.financialSummary) {
                    setFinancialData(mockData.financialSummary);
                }
            }
        } finally {
            setIsLoadingFinancials(false);
        }
    }, [exhibitionId]);

    const fetchStudentRegistrations = useCallback(async () => {
        try {
            setIsLoadingRegistrations(true);
            const registrations = await studentRegistrationService.getRegistrationsByExhibition(exhibitionId);
            const mergedRegistrations = getMergedStudentRegistrations(registrations, exhibitionId);
            setStudentRegistrations(mergedRegistrations);
        } catch (error) {
            console.error('Failed to fetch student registrations:', error);
            toast.error("فشل في تحميل تسجيلات الطلاب");
        } finally {
            setIsLoadingRegistrations(false);
        }
    }, [exhibitionId]);

    useEffect(() => {
        fetchStudentRegistrations();
        fetchParticipationStats();
        fetchFinancialData();
    }, [fetchStudentRegistrations, fetchParticipationStats, fetchFinancialData]);

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
            setSelectedStudents(new Set(pendingStudents.map((s) => s.id)));
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
            toast.error('فشل في تسجيل الحضور، ربما لأن المعرض لم يبدأ بعد');
        } finally {
            setMarkingAttendanceId(null);
        }
    };

    const handleCompleteExhibition = async () => {
        try {
            setIsCompleting(true);
            await exhibitionService.completeExhibition(exhibitionId);
            toast.success("تم إكمال المعرض بنجاح!");
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

    const pendingStudents = studentRegistrations.filter((s) => s.status === 'PENDING');
    const approvedStudents = studentRegistrations.filter((s) => s.status === 'REGISTERED' || s.approved);

    return (
        <div className="space-y-6" dir="rtl">
            {/* Fixed Complete Exhibition Button - Bottom Left */}
            {exhibition.status === 'ACTIVE' && (
                <div className="fixed bottom-6 left-6 z-50">
                    <Button
                        onClick={handleCompleteExhibition}
                        disabled={isCompleting}
                        variant="outline"
                        size="lg"
                        className="bg-muted/80 hover:bg-muted border-muted-foreground/20 text-muted-foreground hover:text-foreground shadow-lg backdrop-blur-sm"
                    >
                        {isCompleting ? (
                            <>
                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                جاري الإكمال...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5 ml-2" />
                                جاهز لإكمال المعرض؟
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Financial Summary Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-right">ملخص الميزانية</h2>
                
                {isLoadingFinancials || isLoadingStats ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:h-[300px]">
                        {/* Row 1 - Budget Summary Chart */}
                        <div className="h-full">
                            {financialData ? (
                                <ChartRadialStacked
                                    revenue={financialData.totalRevenue}
                                    expenses={financialData.totalExpenses}
                                />
                            ) : (
                                <Card className="bg-muted/30 border-dashed flex items-center justify-center h-full">
                                    <CardContent className="py-6 text-center text-muted-foreground">
                                        بيانات الملخص المالي غير متاحة
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Student Statistics - Row span 2 */}
                        <div className="md:row-span-2 lg:h-50">
                            {studentStats ? (
                                <RadialChartLabel
                                    data={[
                                        { name: "المسجلين", value: studentStats.registered, fill: "var(--chart-3)" },
                                        { name: "الغائبين", value: studentStats.noShow, fill: "var(--chart-2)" },
                                        { name: "الحاضرين", value: studentStats.attended, fill: "var(--chart-1)" },
                                    ]}
                                    title="إحصائيات الطلاب"
                                    description="عرض شامل لحضور الطلاب في المعرض"
                                    footerText={`المعرض: ${exhibition.title}`}
                                    trendText={`نسبة الحضور ${studentStats.attendanceRate.toFixed(1)}%`}
                                />
                            ) : (
                                <Card className="bg-muted/30 border-dashed flex items-center justify-center h-full">
                                    <CardContent className="py-6 text-center text-muted-foreground">
                                        إحصائيات الطلاب غير متاحة
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Row 2 - Net Profit Card */}
                        <div className="h-full">
                            {financialData ? (
                                <Card className={`h-full ${financialData.netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                                    <CardContent className="p-4 h-full flex items-center">
                                        <div className="flex items-center justify-between w-full">
                                            <div>
                                                <p className={`text-sm font-medium ${financialData.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                                    صافي الربح
                                                </p>
                                                <p className={`text-2xl font-bold mt-1 ${financialData.netProfit >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                                                    ${financialData.netProfit.toLocaleString()}
                                                </p>
                                            </div>
                                            <Lottie animationData={MoneyAnimation} loop={true} style={{ width: '60px', height: '60px' }} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="bg-muted/30 border-dashed flex items-center justify-center h-full">
                                    <CardContent className="py-6 text-center text-muted-foreground">
                                        بيانات صافي الربح غير متاحة
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Student Registrations Section */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-right">تسجيلات الطلاب والحضور</h2>
                
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-right">
                                <Users className="w-5 h-5" />
                                الطلاب المعتمدون وسجل الحضور ({approvedStudents.length})
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
                                        <h3 className="text-lg font-semibold mb-2 text-right">بانتظار الموافقة ({pendingStudents.length})</h3>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-12 text-right">
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
                                                            <TableCell className="font-medium text-right">{registration.studentName}</TableCell>
                                                            <TableCell className="text-right">{registration.studentEmail}</TableCell>
                                                            <TableCell className="text-right">
                                                                {registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString('en-US') : '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex gap-2 justify-end">
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
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="text-right">اسم الطالب</TableHead>
                                                        <TableHead className="text-right">الحالة</TableHead>
                                                        <TableHead className="text-right">الإجراءات</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {approvedStudents.map((registration) => (
                                                        <TableRow key={registration.id}>
                                                            <TableCell className="font-medium text-right">{registration.studentName}</TableCell>
                                                            <TableCell className="text-right">
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
                                                            <TableCell className="text-right">
                                                                {registration.status === 'REGISTERED' && (
                                                                    <div className="flex gap-0 justify-start">
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
                                                                        {/* <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={() => handleMarkAttendance(registration.id, false)}
                                                                            disabled={markingAttendanceId === registration.id}
                                                                        >
                                                                            لم يحضر
                                                                        </Button> */}
                                                                    </div>
                                                                )}
                                                                {(registration.status === 'ATTENDED' || registration.status === 'NO_SHOW') && (
                                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
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
            </div>
        </div>
    );
}
