import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { createMetric } from "@/services/metric-service"
import { toast } from "sonner"
import { useMetricsStore } from "@/stores/metrics-store"

export default function AddMetricSheet() {
  const navigate = useNavigate()
  const { baseTestId } = useParams()
  const [code, setCode] = useState("")
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { addMetric } = useMetricsStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!baseTestId) {
      toast.error("معرف الاختبار الأساسي مفقود")
      return
    }

    setIsLoading(true)
    
    try {
      const newMetric = await createMetric({ 
        code, 
        label, 
        description,
        baseTestId: Number(baseTestId)
      })
      addMetric(newMetric)
      toast.success("تم إنشاء المقياس بنجاح")
      console.log("Created metric:", newMetric)
      navigate(`/dashboard/baseTests/${baseTestId}`)
    } catch (error) {
      console.error("Failed to create metric:", error)
      const axiosError = error as { response?: { data?: string }; message?: string }
      const backendMessage = axiosError?.response?.data || axiosError?.message
      
      // Translate common error messages to Arabic
      let arabicMessage = "حدث خطأ غير معروف"
      if (backendMessage?.includes("already exists")) {
        arabicMessage = "رمز المقياس موجود بالفعل"
      } else if (backendMessage) {
        arabicMessage = backendMessage
      }
      
      toast.error(`فشل في إنشاء المقياس: ${arabicMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => navigate(`/dashboard/baseTests/${baseTestId}`)}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle>إضافة مقياس جديد</DialogTitle>
            <DialogDescription>
              قم بإنشاء مقياس جديد. أدخل البيانات المطلوبة واضغط على حفظ.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="code">رمز المقياس</Label>
              <Input
                id="code"
                name="code"
                placeholder="مثال: EXTRAVERSION"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="label">اسم المقياس</Label>
              <Input
                id="label"
                name="label"
                placeholder="مثال: الانبساطية"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="وصف المقياس..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                إلغاء
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
