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
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { createBaseTest } from "@/services/base-test-service"
import { toast } from "sonner"
import { useBaseTestsStore } from "@/stores/base-tests-store"

export default function AddBaseTestSheet() {
  const navigate = useNavigate()
  const [type, setType] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { addBaseTest } = useBaseTestsStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const newBaseTest = await createBaseTest({ code, type })
      addBaseTest(newBaseTest)
      toast.success("تم إنشاء الاختبار الأساسي بنجاح")
      console.log("Created base test:", newBaseTest)
      navigate("/dashboard")
    } catch (error) {
      console.error("Failed to create base test:", error)
      toast.error("فشل في إنشاء الاختبار الأساسي")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => navigate("/dashboard")}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle>إضافة اختبار أساسي جديد</DialogTitle>
            <DialogDescription>
              قم بإنشاء اختبار أساسي جديد. أدخل اسم الاختبار والرمز واضغط على حفظ.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="type">نوع الاختبار الأساسي</Label>
              <Input
                id="type"
                name="type"
                placeholder="مثال: PERSONALITY, MATH, IQ"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="code">رمز الاختبار</Label>
              <Input
                id="code"
                name="code"
                placeholder="مثال: PER_01, MAT350"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="sm:flex-row-reverse">
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
