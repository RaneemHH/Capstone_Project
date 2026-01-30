// import { useState } from "react";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { financialAidService } from "@/services/financial-aid-service";
// import type { FinancialAidApplyRequest } from "@/types/financial-aid";
// import { toast } from "sonner";

// interface ApplyFinancialAidDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSuccess: () => void;
// }

// export function ApplyFinancialAidDialog({ open, onOpenChange, onSuccess }: ApplyFinancialAidDialogProps) {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState<FinancialAidApplyRequest>({
//     organizationId: 1,
//     studentName: "",
//     studentPhone: "",
//     requestedAmount: 0,
//     gpa: 0,
//     fieldOfStudy: "",
//     universityName: "",
//     familyIncome: 0,
//     idCardUrl: "",
//     universityFeesUrl: "",
//     gradeProofUrl: "",
//     reason: "",
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (formData.requestedAmount <= 0) {
//       toast.error("المبلغ المطلوب يجب أن يكون أكبر من 0");
//       return;
//     }

//     if (formData.gpa < 0 || formData.gpa > 4) {
//       toast.error("المعدل يجب أن يكون بين 0 و 4");
//       return;
//     }

//     try {
//       setLoading(true);
//       await financialAidService.requestFinancialAid(formData);
//       toast.success("تم تقديم الطلب بنجاح");
//       onSuccess();
//       onOpenChange(false);
//       // Reset form
//       setFormData({
//         organizationId: 1,
//         studentName: "",
//         studentPhone: "",
//         requestedAmount: 0,
//         gpa: 0,
//         fieldOfStudy: "",
//         universityName: "",
//         familyIncome: 0,
//         idCardUrl: "",
//         universityFeesUrl: "",
//         gradeProofUrl: "",
//         reason: "",
//       });
//     } catch (error) {
//       console.error("Failed to submit request:", error);
//       toast.error("فشل في تقديم الطلب");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>طلب مساعدة مالية</DialogTitle>
//           <DialogDescription>
//             قم بملء النموذج أدناه لتقديم طلب مساعدة مالية
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Student Name */}
//             <div className="space-y-2">
//               <Label htmlFor="studentName">اسم الطالب *</Label>
//               <Input
//                 id="studentName"
//                 value={formData.studentName}
//                 onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
//                 required
//               />
//             </div>

//             {/* Student Phone */}
//             <div className="space-y-2">
//               <Label htmlFor="studentPhone">رقم الهاتف *</Label>
//               <Input
//                 id="studentPhone"
//                 type="tel"
//                 value={formData.studentPhone}
//                 onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
//                 placeholder="+96170123456"
//                 required
//               />
//             </div>

//             {/* Requested Amount */}
//             <div className="space-y-2">
//               <Label htmlFor="requestedAmount">المبلغ المطلوب ($) *</Label>
//               <Input
//                 id="requestedAmount"
//                 type="number"
//                 value={formData.requestedAmount || ""}
//                 onChange={(e) => setFormData({ ...formData, requestedAmount: parseFloat(e.target.value) })}
//                 min="0"
//                 step="0.01"
//                 required
//               />
//             </div>

//             {/* GPA */}
//             <div className="space-y-2">
//               <Label htmlFor="gpa">المعدل التراكمي (GPA) *</Label>
//               <Input
//                 id="gpa"
//                 type="number"
//                 value={formData.gpa || ""}
//                 onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) })}
//                 min="0"
//                 max="4"
//                 step="0.01"
//                 required
//               />
//             </div>

//             {/* Field of Study */}
//             <div className="space-y-2">
//               <Label htmlFor="fieldOfStudy">التخصص *</Label>
//               <Input
//                 id="fieldOfStudy"
//                 value={formData.fieldOfStudy}
//                 onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
//                 required
//               />
//             </div>

//             {/* University Name */}
//             <div className="space-y-2">
//               <Label htmlFor="universityName">اسم الجامعة *</Label>
//               <Input
//                 id="universityName"
//                 value={formData.universityName}
//                 onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
//                 required
//               />
//             </div>

//             {/* Family Income */}
//             <div className="space-y-2">
//               <Label htmlFor="familyIncome">دخل العائلة ($) *</Label>
//               <Input
//                 id="familyIncome"
//                 type="number"
//                 value={formData.familyIncome || ""}
//                 onChange={(e) => setFormData({ ...formData, familyIncome: parseFloat(e.target.value) })}
//                 min="0"
//                 step="0.01"
//                 required
//               />
//             </div>
//           </div>

//           {/* Documents URLs */}
//           <div className="space-y-4">
//             <h3 className="font-semibold">المستندات المطلوبة</h3>
            
//             <div className="space-y-2">
//               <Label htmlFor="idCardUrl">رابط بطاقة الهوية *</Label>
//               <Input
//                 id="idCardUrl"
//                 type="url"
//                 value={formData.idCardUrl}
//                 onChange={(e) => setFormData({ ...formData, idCardUrl: e.target.value })}
//                 placeholder="https://example.com/id.jpg"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="universityFeesUrl">رابط إيصال الرسوم الجامعية *</Label>
//               <Input
//                 id="universityFeesUrl"
//                 type="url"
//                 value={formData.universityFeesUrl}
//                 onChange={(e) => setFormData({ ...formData, universityFeesUrl: e.target.value })}
//                 placeholder="https://example.com/fees.pdf"
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="gradeProofUrl">رابط إثبات الدرجات *</Label>
//               <Input
//                 id="gradeProofUrl"
//                 type="url"
//                 value={formData.gradeProofUrl}
//                 onChange={(e) => setFormData({ ...formData, gradeProofUrl: e.target.value })}
//                 placeholder="https://example.com/grades.pdf"
//                 required
//               />
//             </div>
//           </div>

//           {/* Reason */}
//           <div className="space-y-2">
//             <Label htmlFor="reason">سبب الطلب *</Label>
//             <Textarea
//               id="reason"
//               value={formData.reason}
//               onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
//               placeholder="اشرح لماذا تحتاج إلى المساعدة المالية..."
//               rows={4}
//               required
//             />
//           </div>

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               إلغاء
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading ? "جاري التقديم..." : "تقديم الطلب"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
