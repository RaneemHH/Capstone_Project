import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { financialAidService } from "@/services/financial-aid-service";
import type { FinancialAidApplyRequest } from "@/types/financial-aid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ApplyFinancialAid() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<FinancialAidApplyRequest, 'idCard' | 'universityFees' | 'gradeProof'> & {
    idCard: File | null;
    universityFees: File | null;
    gradeProof: File | null;
  }>({
    organizationId: 1,
    studentName: "",
    studentPhone: "",
    requestedAmount: 0,
    gpa: 0,
    fieldOfStudy: "",
    universityName: "",
    familyIncome: 0,
    idCard: null,
    universityFees: null,
    gradeProof: null,
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.requestedAmount <= 0) {
      toast.error("المبلغ المطلوب يجب أن يكون أكبر من 0");
      return;
    }

    if (formData.gpa < 0 || formData.gpa > 4) {
      toast.error("المعدل يجب أن يكون بين 0 و 4");
      return;
    }

    if (!formData.idCard || !formData.universityFees || !formData.gradeProof) {
      toast.error("يرجى رفع جميع المستندات المطلوبة");
      return;
    }

    try {
      setLoading(true);
      await financialAidService.requestFinancialAid({
        ...formData,
        idCard: formData.idCard,
        universityFees: formData.universityFees,
        gradeProof: formData.gradeProof,
      });
      toast.success("تم تقديم الطلب بنجاح");
      navigate("/dashboard/financial-aid");
    } catch (error) {
      console.error("Failed to submit request:", error);
      toast.error("فشل في تقديم الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/financial-aid")}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الطلب</CardTitle>
          <CardDescription>جميع الحقول المطلوبة مميزة بعلامة *</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">المعلومات الشخصية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">اسم الطالب *</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentPhone">رقم الهاتف *</Label>
                  <Input
                    id="studentPhone"
                    type="tel"
                    value={formData.studentPhone}
                    onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                    placeholder="+96170123456"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">المعلومات الأكاديمية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="universityName">اسم الجامعة *</Label>
                  <Input
                    id="universityName"
                    value={formData.universityName}
                    onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fieldOfStudy">التخصص *</Label>
                  <Input
                    id="fieldOfStudy"
                    value={formData.fieldOfStudy}
                    onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpa">المعدل التراكمي (GPA) *</Label>
                  <Input
                    id="gpa"
                    type="number"
                    value={formData.gpa || ""}
                    onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
                    min="0"
                    max="4"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-muted-foreground">المعدل يجب أن يكون بين 0 و 4</p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">المعلومات المالية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedAmount">المبلغ المطلوب ($) *</Label>
                  <Input
                    id="requestedAmount"
                    type="number"
                    value={formData.requestedAmount || ""}
                    onChange={(e) => setFormData({ ...formData, requestedAmount: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familyIncome">دخل العائلة ($) *</Label>
                  <Input
                    id="familyIncome"
                    type="number"
                    value={formData.familyIncome || ""}
                    onChange={(e) => setFormData({ ...formData, familyIncome: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Documents Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">المستندات المطلوبة</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idCard">بطاقة الهوية *</Label>
                  <Input
                    id="idCard"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, idCard: e.target.files?.[0] || null })}
                    required
                  />
                  {formData.idCard && (
                    <p className="text-xs text-muted-foreground">تم اختيار: {formData.idCard.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="universityFees">إيصال الرسوم الجامعية *</Label>
                  <Input
                    id="universityFees"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, universityFees: e.target.files?.[0] || null })}
                    required
                  />
                  {formData.universityFees && (
                    <p className="text-xs text-muted-foreground">تم اختيار: {formData.universityFees.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradeProof">إثبات الدرجات *</Label>
                  <Input
                    id="gradeProof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFormData({ ...formData, gradeProof: e.target.files?.[0] || null })}
                    required
                  />
                  {formData.gradeProof && (
                    <p className="text-xs text-muted-foreground">تم اختيار: {formData.gradeProof.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">سبب الطلب</h3>
              <div className="space-y-2">
                <Label htmlFor="reason">اشرح لماذا تحتاج إلى المساعدة المالية *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="اشرح لماذا تحتاج إلى المساعدة المالية..."
                  rows={6}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/dashboard/financial-aid")}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "جاري التقديم..." : "تقديم الطلب"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
