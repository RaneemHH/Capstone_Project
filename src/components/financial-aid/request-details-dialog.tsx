import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { FinancialAidResponse } from "@/types/financial-aid";
import { Calendar, DollarSign, FileText, GraduationCap, Phone, User, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { financialAidService } from "@/services/financial-aid-service";
import { toast } from "sonner";

interface RequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FinancialAidResponse | null;
}

export function RequestDetailsDialog({ open, onOpenChange, request }: RequestDetailsDialogProps) {
  if (!request) return null;

  const handleOpenDocument = async (documentPath: string, documentName: string) => {
    try {
      await financialAidService.openDocument(documentPath);
    } catch (error) {
      console.error(`Failed to open ${documentName}:`, error);
      toast.error(`فشل في فتح ${documentName}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "قيد الانتظار", variant: "secondary" },
      APPROVED: { label: "مقبول", variant: "default" },
      DISBURSED: { label: "تم الصرف", variant: "default" },
      REJECTED: { label: "مرفوض", variant: "destructive" },
      CANCELLED: { label: "ملغى", variant: "outline" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-0">
            تفاصيل الطلب #{request.id}
            {getStatusBadge(request.status)}
          </SheetTitle>
          <SheetDescription>
            معلومات تفصيلية عن طلب المساعدة المالية
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          {/* Basic Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">المعلومات الأساسية</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">المنظمة</p>
                  <p className="font-medium">{request.organizationName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">اسم الطالب</p>
                  <p className="font-medium">{request.studentName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                  <p className="font-medium">{request.studentPhone}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ التقديم</p>
                  <p className="font-medium">
                    {new Date(request.requestedAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">المعلومات الأكاديمية</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">الجامعة</p>
                  <p className="font-medium">{request.universityName}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">التخصص</p>
                  <p className="font-medium">{request.fieldOfStudy}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">المعدل التراكمي (GPA)</p>
                  <p className="font-medium">{request.gpa.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">دخل العائلة</p>
                  <p className="font-medium">{request.familyIncome.toLocaleString()} ل.ل</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">المعلومات المالية</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">المبلغ المطلوب</p>
                  <p className="font-medium text-base">{request.requestedAmount.toLocaleString()} ل.ل</p>
                </div>
              </div>

              {request.approvedAmount && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">المبلغ المعتمد</p>
                    <p className="font-medium text-base text-green-600">
                      {request.approvedAmount.toLocaleString()} ل.ل
                    </p>
                  </div>
                </div>
              )}

              {request.donorName && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">الجهة المانحة</p>
                    <p className="font-medium">{request.donorName}</p>
                  </div>
                </div>
              )}

              {request.reviewedAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ المراجعة</p>
                    <p className="font-medium">
                      {new Date(request.reviewedAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">سبب الطلب</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.reason}</p>
          </div>

          {/* Rejection Reason */}
          {request.status === "REJECTED" && request.rejectionReason && (
            <div className="space-y-1 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <h3 className="font-semibold text-sm text-red-600 dark:text-red-400">سبب الرفض</h3>
              <p className="text-sm text-red-800 dark:text-red-200">{request.rejectionReason}</p>
            </div>
          )}

          {/* Documents */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">المستندات المرفقة</h3>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => handleOpenDocument(request.documents.idCard, 'بطاقة الهوية')}
              >
                <span>بطاقة الهوية</span>
                <ExternalLink className="w-4 h-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => handleOpenDocument(request.documents.fees, 'إيصال الرسوم الجامعية')}
              >
                <span>إيصال الرسوم الجامعية</span>
                <ExternalLink className="w-4 h-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => handleOpenDocument(request.documents.grades, 'إثبات الدرجات')}
              >
                <span>إثبات الدرجات</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
