import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useState } from "react"
import { deleteMetric } from "@/services/metric-service"
import { toast } from "sonner"
import { useMetricsStore } from "@/stores/metrics-store"

export default function DeleteMetricAlert() {
  const navigate = useNavigate()
  const { baseTestId, metricId } = useParams()
  const [isDeleting, setIsDeleting] = useState(false)
  const { removeMetric } = useMetricsStore()

  const handleDelete = async () => {
    if (!metricId) {
      toast.error("معرف المقياس مفقود")
      return
    }

    setIsDeleting(true)
    
    try {
      await deleteMetric(Number(metricId))
      removeMetric(Number(metricId))
      toast.success("تم حذف المقياس بنجاح")
      navigate(`/dashboard/baseTests/${baseTestId}`)
    } catch (error) {
      console.error("Failed to delete metric:", error)
      const axiosError = error as { response?: { data?: string }; message?: string }
      const backendMessage = axiosError?.response?.data || axiosError?.message
      
      let arabicMessage = "حدث خطأ غير معروف"
      if (backendMessage?.includes("published")) {
        arabicMessage = "لا يمكن حذف المقياس لأن أحد الاختبارات المرتبطة به منشور"
      } else if (backendMessage?.includes("in use") || backendMessage?.includes("referenced")) {
        arabicMessage = "لا يمكن حذف المقياس لأنه مستخدم في أسئلة موجودة"
      } else if (backendMessage) {
        arabicMessage = backendMessage
      }
      
      toast.error(`فشل في حذف المقياس: ${arabicMessage}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog 
      open={true} 
      onOpenChange={() => navigate(`/dashboard/baseTests/${baseTestId}`)}
    >
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader className="text-right">
          <AlertDialogTitle className="text-right">هل أنت متأكد من حذف هذا المقياس؟</AlertDialogTitle>
          <AlertDialogDescription className="text-right">
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المقياس نهائياً من قاعدة البيانات.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <Alert variant="destructive" className="my-4 border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>تحذير:</strong> سيتم حذف جميع الأسئلة والأسئلة الفرعية المرتبطة بهذا المقياس. إذا كان أحد الاختبارات المرتبطة منشوراً، لن يمكن الحذف.
          </AlertDescription>
        </Alert>

        <AlertDialogFooter className="justify-end">
          <AlertDialogCancel disabled={isDeleting}>
            إلغاء
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "جاري الحذف..." : "حذف المقياس"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
