import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {genders, questionTypes} from "@/data/test-data.tsx";
import {CornerDownLeft, Trash2} from "lucide-react";
import SubQuestion from "@/components/test-creation/sub-question.tsx";
import {useEffect, useRef, useState} from "react";
import {addSubQuestion, type QuestionRequest, updateQuestion} from "@/services/test-api.ts";
import {useFetchAdminTest} from "@/hooks/useFetchAdminTest.ts";
import {useAdminTestStore} from "@/stores/admin-test-store.tsx";
import {useNavigate} from "react-router-dom";
import {useMetricsStore} from "@/stores/metrics-store.tsx";

interface QuestionProps {
    questionId: number|undefined;
    testId: number;
    sectionId:number;
}

export default function Question({ questionId, testId, sectionId }: QuestionProps) {
    const navigate = useNavigate();
    const fetchAndSetAdminTest = useFetchAdminTest();
    const {adminTestResponse} = useAdminTestStore();
    const { metrics } = useMetricsStore();

    const [gender, setGender] = useState<string | null>(null);
    const [answerType, setAnswerType] = useState<string | null>(null);
    const [questionText, setQuestionText] = useState("");
    const questionTextRef = useRef<HTMLTextAreaElement>(null);

    const section = adminTestResponse?.sections?.find(sec => sec.id === sectionId);
    const question = section?.questions?.find(q => q.id === questionId);

    async function handleAddSubQuestion() {
        // Use the first available metric or default to undefined
        const firstMetricId = metrics.length > 0 ? metrics[0].id : undefined;
        
        await addSubQuestion(Number(testId), Number(questionId),
            {
                subQuestionText: "",
                targetGender: "ALL",
                metricId: firstMetricId,
            }
        );
        await fetchAndSetAdminTest(testId);
    }

    function handleDelete() {
        navigate(`delete/question/${questionId}`);
    }

    useEffect(() => {
        if (!adminTestResponse || !sectionId || !questionId) return;
        if (question) {
            setQuestionText(question.questionText || "");
            setGender(question.targetGender ?? null);
            setAnswerType(question.answerType ?? null);
        }
    }, [adminTestResponse, sectionId, questionId]);

    useEffect(() => {
        if (!question) return;

        const timer = setTimeout(async () => {
            try {
                const data: QuestionRequest = {
                    questionText,
                };
                if (answerType) data.answerType = answerType;
                if (gender) data.targetGender = gender;

                await updateQuestion(Number(testId), Number(questionId), data);
                await fetchAndSetAdminTest(testId);
            } catch (error) {
                console.error("Failed to update question:", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [questionText, gender, answerType]);

    // Auto-resize questionText textarea
    useEffect(() => {
        const textarea = questionTextRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [questionText]);

    return(
        <>
            <div className="group relative">
                {/* Main Question Card */}
                <div className="relative bg-card rounded-2xl
                              border-2 border-border hover:border-primary
                              shadow-sm hover:shadow-md transition-all duration-300">

                    {/* Delete Button - Top Right */}
                    <button
                        onClick={handleDelete}
                        className="absolute -top-3 -left-3 z-10 p-2 bg-destructive hover:bg-destructive/90
                                 text-destructive-foreground rounded-full shadow-md hover:shadow-lg
                                 transform hover:scale-110 transition-all duration-300
                                 opacity-0 group-hover:opacity-100"
                        title="حذف السؤال"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-6 space-y-4">
                        {/* Question Text Input */}
                        <div className="relative">
                            <textarea
                                ref={questionTextRef}
                                className="w-full px-4 py-3 text-lg text-right bg-background border-2 border-border
                                         rounded-xl focus:outline-none focus:border-primary focus:ring-2
                                         focus:ring-primary/20 transition-all duration-300
                                         placeholder:text-muted-foreground/50 resize-none overflow-hidden"
                                placeholder="اكتب نص السؤال هنا..."
                                rows={1}
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                            />
                        </div>

                        {/* Gender and Type Selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Gender Select */}
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                                    الجنس المستهدف
                                </Label>
                                <Select
                                    dir="rtl"
                                    value={gender ?? ""}
                                    onValueChange={(value) => setGender(value)}
                                >
                                    <SelectTrigger
                                        id="gender"
                                        className="w-full bg-background border-2 border-border hover:border-primary
                                                 focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                                    >
                                        <SelectValue placeholder="حدد الجنس المستهدف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {genders.map((gender) => (
                                            <SelectItem value={gender.value} key={gender.value} className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    {gender.icon && <span className="w-4 h-4"><gender.icon /></span>}
                                                    <span>{gender.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Question Type Select */}
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 bg-accent rounded-full"></span>
                                    نوع السؤال
                                </Label>
                                <Select
                                    dir="rtl"
                                    value={answerType ?? ""}
                                    onValueChange={(value) => setAnswerType(value)}
                                >
                                    <SelectTrigger
                                        id="type"
                                        className="w-full bg-background border-2 border-border hover:border-accent
                                                 focus:ring-2 focus:ring-accent/20 transition-all duration-300 rounded-xl"
                                    >
                                        <SelectValue placeholder="حدد نوع السؤال" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {questionTypes.map((type) => (
                                            <SelectItem value={type.value} key={type.value} className="cursor-pointer">
                                                <div className="flex items-center gap-2">
                                                    {type.icon && <span className="w-4 h-4"><type.icon /></span>}
                                                    <span>{type.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Add Sub-Question Button */}
                        <div className="pt-2 border-t border-border">
                            <button
                                onClick={handleAddSubQuestion}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                                         text-primary hover:text-primary-foreground hover:bg-primary
                                         rounded-lg border-2 border-primary/30 hover:border-primary
                                         transition-all duration-300 hover:shadow-md"
                                title="إضافة سؤال فرعي"
                            >
                                <CornerDownLeft className="w-4 h-4" />
                                <span>إضافة سؤال فرعي</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Questions */}
            <div className="mr-8 space-y-3 mt-3">
                {adminTestResponse?.sections
                    ?.filter(section => section.id === sectionId)
                    .flatMap(section => section.questions ?? [])
                    .filter(question => question.id === questionId)
                    .flatMap(question =>
                        Object.entries(question.groupedSubQuestions ?? {}).flatMap(([, subQuestions]) =>
                            subQuestions.map((subQuestion, index) => (
                                <div
                                    key={subQuestion.id}
                                    className="animate-in fade-in slide-in-from-right-2 duration-300"
                                    style={{animationDelay: `${index * 50}ms`}}
                                >
                                    <SubQuestion
                                        subQuestion={subQuestion}
                                        testId={testId}
                                    />
                                </div>
                            ))
                        )
                    )
                }
            </div>
        </>
    );
}