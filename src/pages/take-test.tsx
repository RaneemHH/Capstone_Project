
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {useUserTestStore} from "@/stores/user-test-store.tsx";
import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useFetchUserTest} from "@/hooks/useFetchUserTest.ts";
import UserQuestion from "@/components/test-take/user-question.tsx";
import {useUserAnswersStore} from "@/stores/user-answers-store.tsx";
import {finalizeAttempt, getAnswersByAttempt} from "@/services/test-attempt.ts";
import {ChevronLeft, ChevronRight} from "lucide-react";

export default function TakeTest() {
    const navigate = useNavigate();
    const param = useParams();
    const attemptId = Number(param.attemptId);
    const testId = Number(param.testId);
    const {userTestResponse} = useUserTestStore();
    const fetchAndSetUserTest = useFetchUserTest(attemptId);
    const { answers, setAnswers } = useUserAnswersStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [activeSectionId, setActiveSectionId] = useState(
        localStorage.getItem("activeSectionId") || ""
    );
    // ... existing code ...

    // [NEW] Simple inline toast state and helper
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const showErrorToast = (message: string) => {
        setToastMessage(message);
        setToastOpen(true);
        setTimeout(() => setToastOpen(false), 3000);
    };
    function handleEditingSection(sectionId:number,sectionText:string){
        navigate(`editSectionDialog/${sectionId}`,{  state: { title: sectionText },});
    }
    // [FIX] Derive sections and currentIndex safely from the loaded test response
    const sections = userTestResponse?.sections ?? [];
    const currentIndex = sections.findIndex(s => s.id.toString() === activeSectionId);

    useEffect(() => {
        if (testId) {
            (async () => {
                try {
                    // if(!userTestResponse)return;
                    await fetchAndSetUserTest(attemptId);
                    console.log("userTestResponse",userTestResponse);
                    
                    // Fetch existing answers when test loads
                    const existingAnswers = await getAnswersByAttempt(attemptId);
                    setAnswers(existingAnswers);
                    console.log("Loaded existing answers:", existingAnswers);
                } catch (error) {
                    console.error("Failed to fetch test:", error);
                }
            })();
        }
    // [FIX] Ensure effect runs when attemptId/testId changes
    }, [attemptId, testId]);

    // Helper to check if an answer object satisfies the type requirements
    const isAnswerFilled = (ans: any, answerType?: string): boolean => {
        if (!answerType) return false;
        switch (answerType) {
            case "OPEN":
                return !!ans?.openValues?.[0] && String(ans.openValues[0]).trim().length > 0;
            case "CHECKBOX":
                return typeof ans?.binaryValue === "boolean";
            case "SCALE":
                return typeof ans?.scaleValue === "number";
            default:
                return false;
        }
    };

    // Check if a given section is fully answered:
    // - If question has sub-questions: all sub-questions must be answered (parent not required)
    // - If question has no sub-questions: the question itself must be answered
    const isSectionComplete = useMemo(() => {
        if (!userTestResponse?.sections?.length || !activeSectionId) return false;

        const section = userTestResponse.sections.find(s => s.id.toString() === activeSectionId);
        if (!section) return false;

        return (section.questions ?? []).every(q => {
            const hasSubQuestions = q?.groupedSubQuestions && Object.keys(q.groupedSubQuestions).length > 0;

            if (hasSubQuestions) {
                const allSubQs = Object.values(q.groupedSubQuestions ?? {}).flat();
                return allSubQs.every((subQ: any) => {
                    const ans = answers.find(a => a.questionId === q.id && a.subQuestionId === subQ.id);
                    return isAnswerFilled(ans, q.answerType);
                });
            } else {
                const ans = answers.find(a => a.questionId === q.id && !a.subQuestionId);
                return isAnswerFilled(ans, q.answerType);
            }
        });
    }, [userTestResponse, answers, activeSectionId]);

    // [NEW] Check if the entire test is fully answered (for submit button)
    const isTestComplete = useMemo(() => {
        if (!userTestResponse?.sections?.length) return false;

        return userTestResponse.sections.every((section) => {
            return (section.questions ?? []).every(q => {
                const hasSubQuestions = q?.groupedSubQuestions && Object.keys(q.groupedSubQuestions).length > 0;

                if (hasSubQuestions) {
                    const allSubQs = Object.values(q.groupedSubQuestions ?? {}).flat();
                    return allSubQs.every((subQ: any) => {
                        const ans = answers.find(a => a.questionId === q.id && a.subQuestionId === subQ.id);
                        return isAnswerFilled(ans, q.answerType);
                    });
                } else {
                    const ans = answers.find(a => a.questionId === q.id && !a.subQuestionId);
                    return isAnswerFilled(ans, q.answerType);
                }
            });
        });
    }, [userTestResponse, answers]);

    useEffect(() => {
        localStorage.setItem("activeSectionId", activeSectionId);
    }, [activeSectionId]);

    // [FIX] Use derived sections to validate activeSectionId
    useEffect(() => {
        if (sections.length) {
            const stillExists = sections.some(
                (s) => s.id.toString() === activeSectionId
            );

            if (!stillExists) {
                setActiveSectionId(sections[0].id.toString());
            }
        }
    }, [sections, activeSectionId]);

    // function handleSubmitTest() {
    //     navigate(`/dashboard/tests/${testId}/take/${attemptId}/result`);
    //
    // }
    async function handleSubmitTest() {
        setIsSubmitting(true);
        try {
            console.log("Finalizing test attempt:", attemptId);
            const result = await finalizeAttempt(attemptId);

            console.log("Test finalized successfully:", result);
            
            // Log the scoring calculation for verification
            if (result.metricScores) {
                const totalScore = Object.values(result.metricScores).reduce((sum: number, score: number) => sum + score, 0);
                console.log("=== Final Score Calculation ===");
                console.log("Metric Scores:", result.metricScores);
                console.log("Total Points:", totalScore);
                console.log("Scoring Logic:");
                console.log("  - CHECKBOX questions: 1 point per answered question to the connected metric");
                console.log("  - SCALE questions: Selected value (1-7) points to the connected trait");
                console.log("  - Total = Sum of all points from all answered questions");
                console.log("===============================");
            }
            
            // Clear answers after successful submission
            setAnswers([]);
            // Navigate to results page with attemptId
            navigate(`/dashboard/tests/${testId}/take/${attemptId}/result`, {
                state: { 
                    personalityResult: result,
                    attemptId: attemptId 
                }
            });

        } catch (error) {
            console.error("Failed to submit test:", error);
            alert("حدث خطأ: فشل إرسال الاختبار. يرجى التحقق من الإجابة على جميع الأسئلة.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Removed the useEffect that cleared answers on mount
    // useEffect(() => {
    //     // clear answers when entering test page
    //     setAnswers([]);
    // }, []);
    
    return (

        <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-4">اختبار هولاند المهني</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        اكتشف شخصيتك المهنية وأفضل المهن المناسبة لك من خلال اختبار هولاند المعتمد عالمياً
                    </p>
                </div>
            </div>

            <div className="m-5 p-2 rounded-xl flex flex-col space-y-4">
                <Tabs dir="rtl"
                      value={activeSectionId}
                      // [UPDATED] Allow only backward or next adjacent section (if current completed)
                      onValueChange={(val) => {
                          const targetIndex = sections.findIndex(s => s.id.toString() === val);
                          if (currentIndex === -1 || targetIndex === -1) {
                              setActiveSectionId(val);
                              return;
                          }
                          // Only allow: backward (<= currentIndex) or exactly next (currentIndex + 1 when current complete)
                          const tryingToSkipAhead = targetIndex > currentIndex + 1;
                          const tryingNextButNotComplete = targetIndex === currentIndex + 1 && !isSectionComplete;

                          if (tryingToSkipAhead || tryingNextButNotComplete) {
                              showErrorToast("يمكنك الانتقال إلى القسم التالي فقط بعد إكمال القسم الحالي.");
                              return;
                          }
                          setActiveSectionId(val);
                      }}
                      className="space-y-4">
                    <TabsList className="bg-muted/40 rounded-full p-1 border-0 w-fit mx-auto">
                        {/* [FIX] Use derived sections */}
                        {sections.map((section, idx) => (
                            <TabsTrigger
                                key={section.id}
                                value={section.id.toString()}
                                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow transition-all"
                                // [NEW] Disable triggers beyond the immediate next (unless moving backward)
                                disabled={
                                    currentIndex !== -1 &&
                                    !(
                                        idx <= currentIndex ||
                                        (isSectionComplete && idx === currentIndex + 1)
                                    )
                                }
                                aria-disabled={
                                    currentIndex !== -1 &&
                                    !(
                                        idx <= currentIndex ||
                                        (isSectionComplete && idx === currentIndex + 1)
                                    )
                                }
                            >
                                {/*<div dangerouslySetInnerHTML={{ __html: section.title }} />*/}

                                <span
                                    onDoubleClick={() => handleEditingSection(section.id, section.title)}
                                    dangerouslySetInnerHTML={{ __html: section.title }}
                                />
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* [FIX] Use sections here to avoid undefined access */}
                    {sections.map((section, index) => (
                        <TabsContent key={section.id} value={section.id.toString()} className="space-y-4">
                            {section.questions?.map((question) => (
                                <>
                                    <UserQuestion
                                        key={question.id}
                                        questionId={question.id}
                                        sectionId={section.id}
                                        // [FIX] Use param-derived testId to avoid possibly undefined access
                                        testId={testId}
                                    />
                                </>
                            ))}
                            <div className="flex items-center justify-center gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setActiveSectionId(sections[index - 1].id.toString())}
                                    disabled={index === 0}
                                    className={`w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors ${index === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>

                                {/* [UPDATED] Submit button: guard onClick + disabled styles */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isTestComplete) {
                                            showErrorToast("يرجى الإجابة على جميع أسئلة الاختبار قبل الإرسال.");
                                            return;
                                        }
                                        handleSubmitTest();
                                    }}
                                    disabled={!isTestComplete}
                                    aria-disabled={!isTestComplete}
                                    className={`px-12 py-3 rounded-full ${
                                        isTestComplete
                                            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <>جاري الإرسال...</>
                                    ) : (
                                        <>إرسال</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveSectionId(sections[index + 1].id.toString())}
                                    disabled={index === sections.length - 1 || !isSectionComplete}
                                    className={`w-12 h-12 flex items-center justify-center rounded-full border-2 ${index === sections.length - 1 || !isSectionComplete ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400" : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            {/* [NEW] Inline toast (Arabic message) */}
            {toastOpen && (
                <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg">
                    {toastMessage || "لم تُجب على جميع أسئلة الاختبار."}
                </div>
            )}

            {/* <div className="flex items-center justify-center mt-8">
           
            </div> */}
        </main>
    );
}
