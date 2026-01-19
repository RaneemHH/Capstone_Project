// import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap";

// import {genders, questionTypes} from "@/data/test-data.tsx"
import {useEffect, useRef, useState} from "react";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select.tsx";
// import { Label } from "@/components/ui/label.tsx";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {icons} from "@/data/test-data.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import Question from "@/components/test-creation/question.tsx";
import {Outlet, useNavigate, useParams} from "react-router-dom";
import {addQuestion, confirmTest, updateTest} from "@/services/test-api.ts";
import {useAdminTestStore} from "@/stores/admin-test-store.tsx";
import {useFetchAdminTest} from "@/hooks/useFetchAdminTest.ts";
import {Button} from "@/components/ui/button.tsx";
import {FileText} from "lucide-react";
import {useMetricsStore} from "@/stores/metrics-store.tsx";
import {getMetricsByBaseTestId} from "@/services/metric-service";

export default function UpdateTest(){
    const param = useParams();
    const testId = Number(param.testId);
    const baseTestId = Number(param.baseTestId); // Get baseTestId from URL
    const navigate = useNavigate();
    const fetchAndSetTest = useFetchAdminTest();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const {adminTestResponse} = useAdminTestStore();
    const {setMetrics, setLoading} = useMetricsStore();
    const [activeSectionId, setActiveSectionId] = useState(
        localStorage.getItem("activeSectionId") || ""
    );

    async function handleUpdateTitle(newTitle: string){
        await updateTest(testId,{title: newTitle, description});
    }

    async function handleUpdateDescription(newDescription: string){
        await updateTest(testId,{title, description: newDescription});
    }

    useEffect(() => {
        if (testId) {
            (async () => {
                try {
                    console.log("📋 Fetching test data for testId:", testId);
                    await fetchAndSetTest(testId);
                } catch (error) {
                    console.error("Failed to fetch test:", error);
                }
            })();
        }
    }, [testId]);

    // Fetch metrics when component mounts (using baseTestId from URL)
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                console.log("🔍 Fetching metrics for baseTestId from URL:", baseTestId);
                if (baseTestId) {
                    setLoading(true);
                    const fetchedMetrics = await getMetricsByBaseTestId(baseTestId);
                    console.log("✅ Fetched metrics:", fetchedMetrics);
                    setMetrics(fetchedMetrics);
                }
            } catch (error) {
                console.error("❌ Failed to fetch metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        if (baseTestId) {
            fetchMetrics();
        }
    }, [baseTestId, setMetrics, setLoading]);

    useEffect(() => {
        if (adminTestResponse) {
            setTitle(adminTestResponse.title ?? "");
            setDescription(adminTestResponse.description ?? "");
        }
    }, [adminTestResponse]);

    // Auto-resize description textarea
    useEffect(() => {
        const textarea = descriptionRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [description]);

    async function handleAddQuestion(sectionId: string) {
        await addQuestion(Number(testId), Number(sectionId),{});
        await fetchAndSetTest(testId);
        setTitle(adminTestResponse?.title ?? "");
        setDescription(adminTestResponse?.description ?? "");
    }

    function handleAddSection() {
        navigate(`addSectionDialog`);
    }

    function handleEditingSection(sectionId:number,sectionText:string){
        navigate(`editSectionDialog/${sectionId}`,{state: { title: sectionText }});
    }

    async function handleDeleteSection(sectionId: string) {
        navigate(`delete/section/${sectionId}`);
    }

    useEffect(() => {
        localStorage.setItem("activeSectionId", activeSectionId);
    }, [activeSectionId]);

    useEffect(() => {
        if (adminTestResponse?.sections?.length) {
            const stillExists = adminTestResponse.sections.some(
                (s) => s.id.toString() === activeSectionId
            );

            if (!stillExists) {
                setActiveSectionId(adminTestResponse.sections[0].id.toString());
            }
        }
    }, [adminTestResponse]);

    async function handleSubmitTest() {
        await confirmTest(testId);
        navigate(-1);
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-card border-b border-border shadow-sm">
                <div className="container mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-6">
                    {/* Title and Description Inputs */}
                    <div className="space-y-4">
                        <div className="group">
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-3 text-lg font-semibold text-right bg-background border-2 border-border rounded-xl
                                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                                             transition-all duration-300 placeholder:text-muted-foreground/50"
                                    placeholder="عنوان الاختبار"
                                    value={title}
                                    onChange={(e) => {
                                        const newTitle = e.target.value;
                                        setTitle(newTitle);
                                        handleUpdateTitle(newTitle);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <div className="relative">
                                <textarea
                                    ref={descriptionRef}
                                    className="w-full px-4 py-3 text-right bg-background border-2 border-border rounded-xl
                                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                                             transition-all duration-300 placeholder:text-muted-foreground/50 resize-none overflow-hidden"
                                    placeholder="وصف الاختبار (اختياري)"
                                    rows={1}
                                    value={description}
                                    onChange={(e) => {
                                        const newDescription = e.target.value;
                                        setDescription(newDescription);
                                        handleUpdateDescription(newDescription);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-7xl px-4 md:px-6 py-6">
                <div className="grid grid-cols-[1fr_auto] gap-4 md:gap-6">
                    {/* Questions Section */}
                    <div className="bg-card rounded-2xl shadow-sm border-2 border-primary/30 overflow-hidden">
                        {(!adminTestResponse?.sections || adminTestResponse.sections.length === 0) ? (
                            <div className="text-center py-16 md:py-20 text-muted-foreground">
                                <FileText className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-primary/20" />
                                <p className="text-base md:text-lg font-semibold text-foreground">لا توجد أقسام في هذا الاختبار</p>
                                <p className="text-sm mt-2">انقر على "إضافة قسم" لبدء الإضافة</p>
                            </div>
                        ) : (
                            <Tabs
                                dir="rtl"
                                value={activeSectionId}
                                onValueChange={(val) => setActiveSectionId(val)}
                                className="w-full"
                            >
                                <div className="bg-secondary/20 border-b border-border px-4 md:px-6 py-3 md:py-4">
                                    <TabsList className="bg-card shadow-sm border border-border p-1">
                                        {adminTestResponse?.sections?.map((section) => (
                                            <TabsTrigger
                                                key={section.id}
                                                value={section.id.toString()}
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground
                                                         data-[state=active]:shadow-sm transition-all duration-300
                                                         hover:bg-secondary/30 text-sm md:text-base"
                                            >
                                                <span
                                                    onDoubleClick={() => handleEditingSection(section.id, section.title)}
                                                    dangerouslySetInnerHTML={{ __html: section.title }}
                                                    className="px-2"
                                                />
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <div className="p-4 md:p-6">
                                    {adminTestResponse?.sections?.map((section) => (
                                        <TabsContent
                                            key={section.id}
                                            value={section.id.toString()}
                                            className="space-y-4 mt-0"
                                        >
                                            {section.questions?.map((question, index) => (
                                                <div
                                                    key={question.id}
                                                    className="animate-in fade-in slide-in-from-right-2 duration-300"
                                                    style={{animationDelay: `${index * 50}ms`}}
                                                >
                                                    <Question
                                                        questionId={question.id}
                                                        sectionId={section.id}
                                                        testId={testId}
                                                    />
                                                </div>
                                            ))}

                                            {(!section.questions || section.questions.length === 0) && (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    <FileText className="w-16 h-16 mx-auto mb-3 text-primary/20" />
                                                    <p className="text-sm">لا توجد أسئلة في هذا القسم</p>
                                                    <p className="text-xs mt-1">انقر على "إضافة سؤال" لبدء الإضافة</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </div>
                            </Tabs>
                        )}
                    </div>

                    {/* Action Sidebar */}
                    <div className="bg-card rounded-2xl shadow-sm border-2 border-primary/30 p-3 md:p-4 h-fit sticky top-6">
                        <TooltipProvider>
                            <div className="flex flex-col items-center space-y-3">
                                {icons.map((icon) => (
                                    <Tooltip key={icon.name}>
                                        <TooltipTrigger asChild>
                                            <button
                                                className="group relative p-2.5 md:p-3 rounded-xl
                                                         hover:bg-primary hover:text-primary-foreground
                                                         bg-secondary/30 text-foreground shadow-sm hover:shadow-md
                                                         hover:scale-110 active:scale-95
                                                         transition-all duration-300 ease-out"
                                                onClick={() => {
                                                    switch (icon.name) {
                                                        case "Add Question":
                                                            handleAddQuestion(activeSectionId);
                                                            break;
                                                        case "Add Section":
                                                            handleAddSection();
                                                            break;
                                                        case "Delete Section":
                                                            handleDeleteSection(activeSectionId);
                                                            break;
                                                    }
                                                }}
                                            >
                                                <icon.value className="h-5 w-5 md:h-6 md:w-6 relative z-10" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">
                                            <p className="font-medium">{icon.name}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-4 md:mt-6 flex justify-start">
                    <Button
                        onClick={handleSubmitTest}
                        size="lg"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground
                                 font-semibold px-6 md:px-8 py-5 md:py-6 rounded-xl shadow-md hover:shadow-lg
                                 transform hover:scale-105 transition-all duration-300 text-base md:text-lg"
                    >
                        تأكيد وحفظ الاختبار
                    </Button>
                </div>
            </div>

            <Outlet />
        </div>
    );
}