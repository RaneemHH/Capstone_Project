
import { HeroSection } from "@/components/dashboard/hero-section.tsx"
import FolderCard from "@/components/dashboard/folder-card.tsx"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { getAllBaseTests } from "@/services/base-test-service"
import { useBaseTestsStore } from "@/stores/base-tests-store"
import { toast } from "sonner"

export default function Dashboard() {
  const navigate = useNavigate()
  const { baseTests, setBaseTests, setLoading, isLoading } = useBaseTestsStore()

  useEffect(() => {
    const fetchBaseTests = async () => {
      try {
        setLoading(true)
        const tests = await getAllBaseTests()
        setBaseTests(tests)
      } catch (error) {
        console.error("Failed to fetch base tests:", error)
        toast.error("فشل في تحميل الاختبارات الأساسية")
      } finally {
        setLoading(false)
      }
    }

    fetchBaseTests()
  }, [])

  return (
    <>
      <HeroSection />
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">الاختبارات</h2>
              <p className="text-sm text-muted-foreground mt-1">إدارة ومراقبة جميع الاختبارات</p>
            </div>
            <Button
              onClick={() => navigate("addBaseTestSheet")}
              className="gap-2 shadow-sm hover:shadow transition-shadow"
              size="default"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">إضافة اختبار</span>
            </Button>
            <Outlet />
          </div>

          <div className="space-y-4"></div>
          <main className="container mx-auto px-4 py-12">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : baseTests.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-muted-foreground">لا توجد اختبارات أساسية</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-8 justify-center md:justify-start">
                {baseTests.map((baseTest) => (
                  <FolderCard key={baseTest.id} baseTest={baseTest} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Outlet />
    </>
  )
}
