import { useState } from "react";
import type { FinancialAidResponse } from "@/types/financial-aid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { financialAidService } from "@/services/financial-aid-service";

interface ReviewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FinancialAidResponse | null;
  onSuccess: () => void;
}

export function ReviewRequestDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: ReviewRequestDialogProps) {
  const [decision, setDecision] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!request) return;

    try {
      setSubmitting(true);

      if (decision === "APPROVE") {
        const amount = parseFloat(approvedAmount);
        if (isNaN(amount) || amount <= 0) {
          toast.error("يرجى إدخال مبلغ صحيح");
          return;
        }
        if (amount > request.requestedAmount) {
          toast.error("المبلغ المعتمد لا يمكن أن يكون أكبر من المبلغ المطلوب");
          return;
        }

        await financialAidService.reviewRequest(request.id, {
          decision: "APPROVE",
          approvedAmount: amount,
        });
        toast.success("تم قبول الطلب بنجاح");
      } else {
        if (!rejectionReason.trim()) {
          toast.error("يرجى إدخال سبب الرفض");
          return;
        }

        await financialAidService.reviewRequest(request.id, {
          decision: "REJECT",
          rejectionReason: rejectionReason.trim(),
        });
        toast.success("تم رفض الطلب");
      }

      onOpenChange(false);
      onSuccess();
      // Reset form
      setDecision("APPROVE");
      setApprovedAmount("");
      setRejectionReason("");
    } catch (error) {
      console.error("Failed to review request:", error);
      toast.error("فشل في مراجعة الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>مراجعة طلب المساعدة المالية</DialogTitle>
          <DialogDescription>
            مراجعة طلب {request.studentName} - المبلغ المطلوب: {request.requestedAmount.toLocaleString()} $
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Details Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">الجامعة:</span>
                <span className="font-medium ml-2">{request.universityName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">التخصص:</span>
                <span className="font-medium ml-2">{request.fieldOfStudy}</span>
              </div>
              <div>
                <span className="text-muted-foreground">المعدل:</span>
                <span className="font-medium ml-2">{request.gpa.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">السنة:</span>
                <span className="font-medium ml-2">السنة {request.gpa > 3 ? 'الثالثة' : 'الأولى'}</span>
              </div>
            </div>
            {request.reason && (
              <div className="mt-2">
                <span className="text-muted-foreground">السبب:</span>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
            )}
          </div>

          {/* Decision */}
          <div className="space-y-3">
            <Label>القرار</Label>
            <Select value={decision} onValueChange={(value: string) => setDecision(value as "APPROVE" | "REJECT")}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القرار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVE">قبول الطلب</SelectItem>
                <SelectItem value="REJECT">رفض الطلب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields */}
          {decision === "APPROVE" ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="amount">المبلغ المعتمد ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`0 - ${request.requestedAmount}`}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  min={0}
                  max={request.requestedAmount}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  الحد الأقصى: {request.requestedAmount.toLocaleString()} $
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="rejection">سبب الرفض</Label>
                <Textarea
                  id="rejection"
                  placeholder="اكتب سبب رفض الطلب..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "جاري الحفظ..." : "حفظ القرار"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
