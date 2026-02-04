
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {genders} from "@/data/test-data.tsx";
import {useEffect, useRef, useState} from "react";
import type {subQuestion} from "@/data/admin-test-schema.ts";
import {type SubQuestionRequest, updateSubQuestion} from "@/services/test-api.ts";
import {useFetchAdminTest} from "@/hooks/useFetchAdminTest.ts";
import {Trash2} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useMetricsStore} from "@/stores/metrics-store.tsx";

interface SubQuestionProps {
    subQuestion: subQuestion;
    testId:number;
}

export default function SubQuestion({ subQuestion, testId }: SubQuestionProps){
    const navigate = useNavigate();
    const fetchAndSetTest = useFetchAdminTest();
    const { metrics } = useMetricsStore();
    const [subQuestionText, setSubQuestionText] = useState("");
    const [gender, setGender] = useState<string | null>(null);
    const [metricId, setMetricId] = useState<number | null>(null);
    const subQuestionTextRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!subQuestion) return;
        if (subQuestion) {
            setSubQuestionText(subQuestion.subQuestionText || "");
            setGender(subQuestion.targetGender ?? null);
            setMetricId(subQuestion.metric?.id ?? null);
        }
    }, [subQuestion]);

    useEffect(() => {
        if (!subQuestion) return;

        // Check if values actually changed from the original
        const originalText = subQuestion.subQuestionText || "";
        const originalGender = subQuestion.targetGender ?? null;
        const originalMetricId = subQuestion.metric?.id ?? null;
        
        const hasChanged = 
            subQuestionText !== originalText ||
            gender !== originalGender ||
            metricId !== originalMetricId;

      

        if (!hasChanged) return;

        const timer = setTimeout(async () => {
            try {
                console.log("Updating sub-question with:", { subQuestionText, metricId, gender });
                
                const data: SubQuestionRequest = {
                    subQuestionText,
                };
                if (metricId) data.metricId = metricId;
                if (gender) data.targetGender = gender;

                await updateSubQuestion(Number(testId), subQuestion.id, data);
                await fetchAndSetTest(testId);
            } catch (error) {
                console.error("Failed to update question:", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [subQuestionText, gender, metricId, subQuestion, testId, fetchAndSetTest]);

    // Auto-resize subQuestionText textarea
    useEffect(() => {
        const textarea = subQuestionTextRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    }, [subQuestionText]);

    function handleDelete() {
        navigate(`delete/subQuestion/${subQuestion.id}`);
    }
    console.log("Rendering metrics:", metrics);
    return(
        <div className="group relative">
            {/* Connection Line */}
            <div className="absolute -right-8 top-0 bottom-0 w-8 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-primary/40 to-transparent"></div>
                <div className="absolute right-0 w-2 h-2 bg-primary rounded-full"></div>
            </div>

            {/* Sub-Question Card */}
            <div className="relative bg-secondary/10 rounded-xl
                          border-2 border-secondary hover:border-primary
                          shadow-sm hover:shadow-md transition-all duration-300">

                {/* Delete Button */}
                <button
                    onClick={handleDelete}
                    className="absolute -top-2 -left-2 z-10 p-1.5 bg-destructive hover:bg-destructive/90
                             text-destructive-foreground rounded-full shadow-md hover:shadow-lg
                             transform hover:scale-110 transition-all duration-300
                             opacity-0 group-hover:opacity-100"
                    title="حذف السؤال الفرعي"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="p-5 space-y-3">
                    {/* Sub-Question Label */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-1 bg-secondary text-foreground text-xs font-semibold rounded-md">
                            سؤال فرعي
                        </div>
                    </div>

                    {/* Sub-Question Text Input */}
                    <div className="relative">
                        <textarea
                            ref={subQuestionTextRef}
                            className="w-full px-3 py-2.5 text-right bg-background border-2 border-border
                                     rounded-lg focus:outline-none focus:border-primary focus:ring-2
                                     focus:ring-primary/20 transition-all duration-300
                                     placeholder:text-muted-foreground/50 resize-none overflow-hidden"
                            placeholder="اكتب نص السؤال الفرعي..."
                            rows={1}
                            value={subQuestionText}
                            onChange={(e) => setSubQuestionText(e.target.value)}
                        />
                    </div>

                    {/* Gender and Trait Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Gender Select */}
                        <div className="space-y-1.5">
                            <Label htmlFor="sub-gender" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                الجنس
                            </Label>
                            <Select
                                dir="rtl"
                                value={gender ?? ""}
                                onValueChange={(value) => setGender(value)}
                            >
                                <SelectTrigger
                                    id="sub-gender"
                                    className="w-full bg-background border-2 border-border hover:border-primary
                                             focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-lg h-9 text-sm"
                                >
                                    <SelectValue placeholder="حدد الجنس" />
                                </SelectTrigger>
                                <SelectContent>
                                    {genders.map((gender) => (
                                        <SelectItem value={gender.value} key={gender.value} className="cursor-pointer text-sm">
                                            <div className="flex items-center gap-2">
                                                {gender.icon && <span className="w-3.5 h-3.5"><gender.icon /></span>}
                                                <span>{gender.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Metric Select */}
                        <div className="space-y-1.5">
                            <Label htmlFor="sub-metric" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                                المقياس
                            </Label>
                            <Select
                                dir="rtl"
                                value={metricId?.toString() ?? ""}
                                onValueChange={(value) => setMetricId(Number(value))}
                            >
                                <SelectTrigger
                                    id="sub-metric"
                                    className="w-full bg-background border-2 border-border hover:border-accent
                                             focus:ring-2 focus:ring-accent/20 transition-all duration-300 rounded-lg h-9 text-sm"
                                >
                                    <SelectValue placeholder="حدد المقياس" />
                                </SelectTrigger>
                                <SelectContent>
                                    {metrics.map((metric) => (
                                        <SelectItem value={metric.id.toString()} key={metric.id} className="cursor-pointer text-sm">
                                            <span>{metric.label} ({metric.code})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
