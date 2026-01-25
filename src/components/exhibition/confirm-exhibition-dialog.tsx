import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { exhibitionService } from "@/services/exhibitionService";
import { toast } from "sonner";
import type { UniversityParticipationResponse } from "@/types/university";
import type { SchoolParticipationResponse } from "@/types/school-participation";

interface ConfirmExhibitionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exhibitionId: number;
    universities: UniversityParticipationResponse[];
    schools: SchoolParticipationResponse[];
    onSuccess: () => void;
}

export function ConfirmExhibitionDialog({
    open,
    onOpenChange,
    exhibitionId,
    universities,
    schools,
    onSuccess
}: ConfirmExhibitionDialogProps) {
    const [finalizationDeadline, setFinalizationDeadline] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);

    // Check if all universities are CONFIRMED and PAID (matching backend logic)
    // Backend filters out CANCELLED universities and checks: status == CONFIRMED && paymentStatus == PAID
    const allUniversitiesReady = universities
        .filter(u => u.status !== 'CANCELLED')
        .every(u => u.status === 'CONFIRMED' && u.paymentStatus === 'PAID');

    // Check if all schools are ACCEPTED or better (matching backend logic)
    // Backend filters out CANCELLED and REJECTED, then checks status == ACCEPTED
    const allSchoolsReady = schools
        .filter(s => s.status !== 'CANCELLED' && s.status !== 'REJECTED')
        .every(s => s.status === 'ACCEPTED' || s.status === 'CONFIRMED' || s.status === 'FINALIZED');

    const canConfirm = allUniversitiesReady && allSchoolsReady;

    // Get not ready universities (excluding CANCELLED)
    const notReadyUniversities = universities
        .filter(u => u.status !== 'CANCELLED')
        .filter(u => u.status !== 'CONFIRMED' || u.paymentStatus !== 'PAID');

    // Get not ready schools (excluding CANCELLED and REJECTED)
    const notReadySchools = schools
        .filter(s => s.status !== 'CANCELLED' && s.status !== 'REJECTED')
        .filter(s => !['ACCEPTED', 'CONFIRMED', 'FINALIZED'].includes(s.status));

    const handleConfirm = async () => {
        if (!finalizationDeadline) {
            toast.error("يرجى تحديد الموعد النهائي للإتمام");
            return;
        }

        if (!canConfirm) {
            toast.error("لا يمكن تأكيد المعرض. يجب تجهيز جميع المشاركين أولاً");
            return;
        }

        // Debug logging
        console.log('Confirming exhibition with:', {
            exhibitionId,
            finalizationDeadline,
            universities: universities.map(u => ({
                id: u.id,
                name: u.universityName,
                status: u.status,
                paymentStatus: u.paymentStatus
            })),
            schools: schools.map(s => ({
                id: s.id,
                name: s.schoolName,
                status: s.status
            }))
        });

        try {
            setIsConfirming(true);
            await exhibitionService.confirmExhibition(exhibitionId, finalizationDeadline);
            toast.success("تم تأكيد المعرض بنجاح! انتقل إلى الخطوة 3 لمشاهدة التفاصيل المالية والجدول الزمني");
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to confirm exhibition:', error);
            const errorMessage = (error as {response?: {data?: {message?: string}}})?.response?.data?.message || "فشل في تأكيد المعرض";
            toast.error(errorMessage);
        } finally {
            setIsConfirming(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right text-xl">تأكيد المعرض</DialogTitle>
                    <DialogDescription className="text-right">
                        تأكد من أن جميع المشاركين جاهزون قبل تأكيد المعرض
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4" dir="rtl">
                    {/* Status Summary */}
                    <div className="space-y-3">
                        <Card className={allUniversitiesReady ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {allUniversitiesReady ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <span className={`font-semibold ${allUniversitiesReady ? 'text-green-900' : 'text-red-900'}`}>
                                        الجامعات ({universities.length})
                                    </span>
                                </div>
                                {allUniversitiesReady ? (
                                    <p className="text-sm text-green-700">
                                        ✓ جميع الجامعات مؤكدة ومدفوعة
                                    </p>
                                ) : (
                                    <div className="text-sm text-red-700 space-y-1">
                                        <p className="font-medium">الجامعات غير الجاهزة ({notReadyUniversities.length}):</p>
                                        {notReadyUniversities.map((uni, idx) => (
                                            <p key={idx} className="text-xs">
                                                • {uni.universityName}
                                                <br />
                                                &nbsp;&nbsp;- الحالة: {uni.status} {uni.status !== 'CONFIRMED' ? '❌ (يجب CONFIRMED)' : '✓'}
                                                <br />
                                                &nbsp;&nbsp;- الدفع: {uni.paymentStatus} {uni.paymentStatus !== 'PAID' ? '❌ (يجب PAID)' : '✓'}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className={allSchoolsReady ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {allSchoolsReady ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <span className={`font-semibold ${allSchoolsReady ? 'text-green-900' : 'text-red-900'}`}>
                                        المدارس ({schools.length})
                                    </span>
                                </div>
                                {allSchoolsReady ? (
                                    <p className="text-sm text-green-700">
                                        ✓ جميع المدارس مقبولة
                                    </p>
                                ) : (
                                    <div className="text-sm text-red-700 space-y-1">
                                        <p className="font-medium">المدارس غير الجاهزة ({notReadySchools.length}):</p>
                                        {notReadySchools.map((school, idx) => (
                                            <p key={idx} className="text-xs">
                                                • {school.schoolName} - الحالة: {school.status}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Prerequisites Alert */}
                    {!canConfirm && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                    <div className="text-sm text-orange-800">
                                        <p className="font-semibold mb-1">المتطلبات:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>يجب أن تكون جميع الجامعات النشطة (غير الملغاة) في حالة CONFIRMED مع حالة دفع PAID</li>
                                            <li>يجب أن تكون جميع المدارس النشطة (غير الملغاة/المرفوضة) في حالة ACCEPTED على الأقل</li>
                                        </ul>
                                        <p className="mt-2 text-xs">
                                            ملاحظة: تأكد من تأكيد الدفع لجميع الجامعات النشطة قبل محاولة تأكيد المعرض
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Finalization Deadline Input */}
                    <div className="space-y-2">
                        <Label htmlFor="finalizationDeadline" className="text-right block">
                            الموعد النهائي للإتمام *
                        </Label>
                        <Input
                            id="finalizationDeadline"
                            type="datetime-local"
                            value={finalizationDeadline}
                            onChange={(e) => setFinalizationDeadline(e.target.value)}
                            className="text-right"
                            disabled={!canConfirm}
                            required
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            الموعد النهائي الذي يجب على المشاركين إتمام تأكيدهم قبله
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 justify-end mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isConfirming}
                    >
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isConfirming || !canConfirm || !finalizationDeadline}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isConfirming ? (
                            <>
                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                جاري التأكيد...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 ml-2" />
                                تأكيد المعرض
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
