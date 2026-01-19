"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Outlet, useNavigate } from "react-router-dom"
import { Pencil, Plus, Trash2, Layers, FileQuestion, Copy, Eye } from "lucide-react"
import { useEffect } from "react"
import { deleteTest, getAllTests, setTestActive, createVersion } from "@/services/test-api.ts"
import { useAdminTestsStore } from "@/stores/admin-tests-store.tsx"
import { useMetricsStore } from "@/stores/metrics-store.tsx"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import type { AdminTest } from "@/data/admin-test-schema.ts"
import { toast } from "sonner"

export default function TestList() {
  const navigate = useNavigate()
  const { adminTestsResponse, setAdminTestsResponse } = useAdminTestsStore()
  const { metrics } = useMetricsStore()

  const fetchTests = async () => {
    const res = await getAllTests()
    console.log("res", res)
    setAdminTestsResponse(res)
  }

  useEffect(() => {
    fetchTests()
  }, [])

  async function handleDelete(id: number) {
    await deleteTest(id)
    const updatedTests = await getAllTests()
    setAdminTestsResponse(updatedTests)
  }

  function handleEdit(testId: number) {
    navigate(`updateTest/${testId}`)
  }

  async function handleToggleActive(testId: number, checked: boolean) {
    console.log("i toggle active")
    await setTestActive(testId, checked)
    await fetchTests()
  }

  async function handleDuplicate(testId: number) {
    try {
      // Count existing versions to determine next version number
      const versionCount = adminTestsResponse.filter(t => 
        t.versionName && t.versionName.startsWith('نسخة')
      ).length

      await createVersion({
        baseTestId: testId,
        sourceTestId: testId,
        versionName: `نسخة ${versionCount + 1}`
      })

      await fetchTests()
      toast.success("تم نسخ الاختبار بنجاح")
    } catch (error) {
      console.error("Failed to duplicate test:", error)
      toast.error("فشل نسخ الاختبار")
    }
  }

  function handleView(testId: number) {
    navigate(`/dashboard/tests/${testId}/preview`)
  }

  console.log("testsResponse", adminTestsResponse)

  // Calculate total questions for a test
  const getTotalQuestions = (test: AdminTest) => {
    return test.sections.reduce((total, section) => {
      return total + section.questions.length
    }, 0)
  }

  const handleAddTest = () => {
    if (metrics.length === 0) {
      toast.error("يجب إضافة مقياس واحد على الأقل قبل إنشاء اختبار")
      return
    }
    navigate("addTestSheet")
  }

  return (
    <>
      <div className="flex-col md:flex">
        <Outlet />
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">الاختبارات</h2>
            </div>
            <Button
              onClick={handleAddTest}
              className="gap-2 shadow-sm hover:shadow transition-shadow"
              size="default"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">إضافة اختبار</span>
            </Button>
          </div>

          <div className="space-y-4">
            {adminTestsResponse.map((test) => {
              const isDraft = test.status === "DRAFT"
              const isPublished = test.status === "PUBLISHED"
              const totalQuestions = getTotalQuestions(test)

              return (
                <Card
                  key={test.id}
                  className="relative group transition-all duration-200 hover:shadow-md bg-card border border-border hover:border-border/80"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl font-semibold text-foreground">{test.title}</CardTitle>
                        <Badge
                          variant={isDraft ? "secondary" : "default"}
                          className={`text-xs ${
                            isDraft
                              ? "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                              : "bg-secondary/40 text-secondary-foreground hover:bg-secondary/60"
                          }`}
                        >
                          {isDraft ? "مسودة" : "منشور"}
                        </Badge>
                        {test.versionName && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-primary/10 text-primary border-primary/30"
                          >
                            {test.versionName}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {isDraft && (
                      <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                onClick={() => handleEdit(test.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>تعديل</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(test.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>حذف</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}

                    {isPublished && (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  onClick={() => handleView(test.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>عرض</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 text-muted-foreground hover:text-accent hover:bg-accent/10"
                                  onClick={() => handleDuplicate(test.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>نسخ</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground hidden sm:inline">
                                  {test.active ? "نشط" : "معطل"}
                                </span>
                                <Switch
                                  dir="ltr"
                                  checked={test.active}
                                  onCheckedChange={(checked) => handleToggleActive(test.id, checked)}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>تفعيل / تعطيل النشر</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <p className="text-base text-foreground/70 leading-relaxed">{test.description}</p>

                      <div className="flex items-center gap-3 pt-3 border-t border-border">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1.5 bg-secondary/40 text-secondary-foreground hover:bg-secondary/60 border-0 px-3 py-1.5"
                          dir="rtl"
                        >
                          <Layers className="w-4 h-4" />
                          <span className="font-medium">{test.sections.length} قسم</span>
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1.5 bg-primary/40 text-primary-foreground hover:bg-primary/60 border-0 px-3 py-1.5"
                          dir="rtl"
                        >
                          <FileQuestion className="w-4 h-4" />
                          <span className="font-medium">{totalQuestions} سؤال</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
