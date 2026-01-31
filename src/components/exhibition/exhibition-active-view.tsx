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
import { universityParticipationService } from "@/services/university-participation-service";
import { attendanceService } from "@/services/attendance-service";
import type { StudentRegistrationResponse } from "@/types/student-registration";
import type { UniversityParticipationResponse } from "@/types/university";
import { exhibitionService } from "@/services/exhibitionService";
import { Building2, CheckCircle2, Users } from "lucide-react";

interface ExhibitionActiveViewProps {
    exhibitionId: number;
    exhibition: ExhibitionResponse;
    onExhibitionUpdate?: () => void;
}

export function ExhibitionActiveView({ exhibitionId, exhibition, onExhibitionUpdate }: ExhibitionActiveViewProps) {
    const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistrationResponse[]>([]);
    const [universityParticipations, setUniversityParticipations] = useState<UniversityParticipationResponse[]>([]);
    const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
    const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
    const [isApproving, setIsApproving] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [markingAttendanceId, setMarkingAttendanceId] = useState<number | null>(null);
    const [markingAttendanceType, setMarkingAttendanceType] = useState<'student' | 'university' | null>(null);

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

    const fetchUniversityParticipations = useCallback(async () => {
        try {
            setIsLoadingUniversities(true);
            const participations = await universityParticipationService.getParticipationsByExhibition(exhibitionId);
            setUniversityParticipations(participations);
        } catch (error) {
            console.error('Failed to fetch university participations:', error);
            toast.error("فشل في تحميل مشاركات الجامعات");
        } finally {
            setIsLoadingUniversities(false);
        }
    }, [exhibitionId]);

    useEffect(() => {
        fetchStudentRegistrations();
        fetchUniversityParticipations();
    }, [fetchStudentRegistrations, fetchUniversityParticipations]);

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
            setMarkingAttendanceType('student');
            await attendanceService.markStudentAttendance(registrationId, attended);
            toast.success(attended ? 'تم تسجيل الحضور بنجاح' : 'تم تسجيل عدم الحضور');
            fetchStudentRegistrations();
        } catch (error) {
            console.error('Failed to mark attendance:', error);
            toast.error('فشل في تسجيل الحضور، ربما لأن المعرض لم يبدأ بعد');
        } finally {
            setMarkingAttendanceId(null);
            setMarkingAttendanceType(null);
        }
    };

    const handleMarkUniversityAttendance = async (participationId: number) => {
        try {
            setMarkingAttendanceId(participationId);
            setMarkingAttendanceType('university');
            await attendanceService.markUniversityAttendance(participationId);
            toast.success('تم تسجيل حضور الجامعة بنجاح');
            fetchUniversityParticipations();
        } catch (error) {
            console.error('Failed to mark university attendance:', error);
            toast.error('فشل في تسجيل حضور الجامعة، ربما لأن المعرض لم يبدأ بعد');
        } finally {
            setMarkingAttendanceId(null);
            setMarkingAttendanceType(null);
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

            {/* University Attendance */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-right">
                            <Building2 className="w-5 h-5 text-primary" />
                            حضور الجامعات المشاركة
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingUniversities ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : universityParticipations.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">اسم الجامعة</TableHead>
                                        <TableHead className="text-right">الحالة</TableHead>
                                        <TableHead className="text-right">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {universityParticipations.map((participation) => (
                                        <TableRow key={participation.id}>
                                            <TableCell className="font-medium text-right">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-primary" />
                                                    <span>{participation.universityName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(() => {
                                                    const labels: Record<string, string> = {
                                                        'INVITED': 'مدعو',
                                                        'REGISTERED': 'مسجل',
                                                        'ACCEPTED': 'مقبول',
                                                        'REJECTED': 'مرفوض',
                                                        'CONFIRMED': 'مؤكد',
                                                        'CANCELLED': 'ملغي',
                                                        'FINALIZED': 'نهائي'
                                                    };
                                                    const colors: Record<string, string> = {
                                                        'INVITED': 'outline',
                                                        'REGISTERED': 'secondary',
                                                        'ACCEPTED': 'outline',
                                                        'REJECTED': 'destructive',
                                                        'CONFIRMED': 'secondary',
                                                        'CANCELLED': 'destructive',
                                                        'FINALIZED': 'default'
                                                    };
                                                    const label = labels[participation.status] || participation.status;
                                                    const variant = (colors[participation.status] || 'outline') as "default" | "secondary" | "outline" | "destructive";
                                                    return <Badge variant={variant}>{label}</Badge>;
                                                })()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {participation.status === 'FINALIZED' && !participation.attendedAt && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleMarkUniversityAttendance(participation.id)}
                                                        disabled={markingAttendanceId === participation.id && markingAttendanceType === 'university'}
                                                        variant="default"
                                                    >
                                                        {markingAttendanceId === participation.id && markingAttendanceType === 'university' ? (
                                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="w-4 h-4 ml-2" />
                                                        )}
                                                        تسجيل الحضور
                                                    </Button>
                                                )}
                                                {participation.attendedAt && (
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        حضر في: {new Date(participation.attendedAt).toLocaleDateString('en-US')}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">لا توجد جامعات مشاركة</p>
                    )}
                </CardContent>
            </Card>

            {/* Student Registrations */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-right">
                            <Users className="w-5 h-5" />
                            تسجيلات الطلاب والحضور
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
                                    <h3 className="text-lg font-semibold mb-2 text-right">الطلاب المعتمدون وسجل الحضور ({approvedStudents.length})</h3>
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
    );
}
