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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { getMetricById, updateMetric } from "@/services/metric-service"
import { toast } from "sonner"
import { useMetricsStore } from "@/stores/metrics-store"
import { Spinner } from "@/components/ui/minimal-tiptap/components/spinner"

export default function EditMetricSheet() {
  const navigate = useNavigate()
  const { baseTestId, metricId } = useParams()
  const [code, setCode] = useState("")
  const [label, setLabel] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const { updateMetricInStore } = useMetricsStore()

  useEffect(() => {
    const fetchMetric = async () => {
      if (!metricId) return
      
      try {
        setIsFetching(true)
        const metric = await getMetricById(Number(metricId))
        setCode(metric.code)
        setLabel(metric.label)
        setDescription(metric.description || "")
      } catch (error) {
        console.error("Failed to fetch metric:", error)
        const axiosError = error as { response?: { data?: string }; message?: string }
        const backendMessage = axiosError?.response?.data || axiosError?.message
        
        let arabicMessage = "حدث خطأ غير معروف"
        if (backendMessage?.includes("not found")) {
          arabicMessage = "المقياس غير موجود"
        } else if (backendMessage) {
          arabicMessage = backendMessage
        }
        
        toast.error(`فشل في تحميل بيانات المقياس: ${arabicMessage}`)
        navigate(`/dashboard/baseTests/${baseTestId}`)
      } finally {
        setIsFetching(false)
      }
    }

    fetchMetric()
  }, [metricId, baseTestId, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!metricId || !baseTestId) {
      toast.error("معرف المقياس أو الاختبار الأساسي مفقود")
      return
    }

    setIsLoading(true)
    
    try {
      const updatedMetric = await updateMetric(Number(metricId), { 
        code, 
        label, 
        description,
        baseTestId: Number(baseTestId)
      })
      updateMetricInStore(updatedMetric)
      toast.success("تم تحديث المقياس بنجاح")
      console.log("Updated metric:", updatedMetric)
      navigate(`/dashboard/baseTests/${baseTestId}`)
    } catch (error) {
      console.error("Failed to update metric:", error)
      const axiosError = error as { response?: { data?: string }; message?: string }
      const backendMessage = axiosError?.response?.data || axiosError?.message
      
      let arabicMessage = "حدث خطأ غير معروف"
      if (backendMessage?.includes("published")) {
        arabicMessage = "لا يمكن تحديث المقياس لأن أحد الاختبارات المرتبطة به منشور"
      } else if (backendMessage?.includes("already exists")) {
        arabicMessage = "رمز المقياس موجود بالفعل"
      } else if (backendMessage) {
        arabicMessage = backendMessage
      }
      
      toast.error(`فشل في تحديث المقياس: ${arabicMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <Dialog open={true} onOpenChange={() => navigate(`/dashboard/baseTests/${baseTestId}`)}>
        <DialogContent className="sm:max-w-[425px]" dir="rtl">
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={() => navigate(`/dashboard/baseTests/${baseTestId}`)}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle>تعديل المقياس</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات المقياس. التغييرات ستنعكس على جميع الأسئلة والأسئلة الفرعية المرتبطة به.
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="my-4 border-destructive" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>تنبيه:</strong> سيتم تحديث جميع الأسئلة والأسئلة الفرعية المرتبطة بهذا المقياس. إذا كان أحد الاختبارات منشوراً، لن يمكن التحديث.
            </AlertDescription>
          </Alert>

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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={isLoading}>
                إلغاء
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
