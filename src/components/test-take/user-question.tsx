import {useUserTestStore} from "@/stores/user-test-store.tsx";
import UserSubQuestion from "@/components/test-take/user-sub-question.tsx";
import {useEffect, useState} from "react";
import {type AnswerRequest, submitAnswers, getAnswersByAttempt} from "@/services/test-attempt.ts";
import {useUserAnswersStore} from "@/stores/user-answers-store.tsx";
import {YesNoInput} from "@/components/question-Input/YesNoInput.tsx";

interface QuestionProps {
    questionId: number|undefined;
    testId: number;
    sectionId:number;
}

export default function UserQuestion({ questionId, sectionId }: QuestionProps) {
    const {userTestResponse} = useUserTestStore();

    const section = userTestResponse?.sections?.find(sec => sec.id === sectionId);
    const question = section?.questions?.find(q => q.id === questionId);
    const hasSubQuestions = question?.groupedSubQuestions &&
        Object.keys(question.groupedSubQuestions).length > 0;

    const { answers, setAnswers } = useUserAnswersStore();

    const [answerText, setAnswerText] = useState<string | undefined>(undefined);
    const [binaryValue, setBinaryValue] = useState<boolean | undefined>(undefined);
    const [scaleValue, setScaleValue] = useState<number | undefined>(undefined);

    const [selectedScales, setSelectedScales] = useState<Record<number, number>>({});
    const usedScaleValues = Object.values(selectedScales);

    const handleScaleSelect = (subQuestionId: number, value: number) => {
        setSelectedScales(prev => ({
            ...prev,
            [subQuestionId]: value
        }));
    };

    useEffect(() => {
        if (!questionId) return;
        console.log(answers,"answers in question component");
        const existingAnswer = answers.find(a => a.questionId === question?.id && !a.subQuestionId);

        if (existingAnswer) {
            setAnswerText(existingAnswer.openValues?.[0]);
            setBinaryValue(existingAnswer.binaryValue);
            setScaleValue(existingAnswer.scaleValue);
        }
    }, [question, answers]);

    useEffect(() => {
        if (!question || !userTestResponse) return;
        const nothingToSubmit =
            (!answerText) &&   binaryValue === undefined  && (scaleValue === undefined || scaleValue === null);

        if (nothingToSubmit) return;
        const timer = setTimeout(async () => {
            try {
                const data: AnswerRequest = {
                   questionId: question.id!,
                    // subQuestionId,
                   answerType:question?.answerType,
                    binaryValue,

                };
                if(answerText) data.openValues=[answerText]
                // if (binaryValue) data.binaryValue = binaryValue;
                if (scaleValue) data.scaleValue = scaleValue;

               await submitAnswers(userTestResponse.id, data);
                // Fetch updated answers and save to store
                const updatedAnswers = await getAnswersByAttempt(userTestResponse.id);
                setAnswers(updatedAnswers);
                console.log("Answer submitted and fetched:", updatedAnswers);
            } catch (error) {
                console.error("Failed to update question:", error);
            }
        }, 500);

        return () => clearTimeout(timer); // cancel previous timer if user types again
    }, [answerText,binaryValue,scaleValue]);

    // [NEW] Helper: smoothly scroll to next subquestion/question in the same section
    const scrollToNextItem = () => {
        if (!sectionId || !questionId) return;
        const elements = Array.from(
            document.querySelectorAll(
                `[data-section-id="${sectionId}"][data-question-id], [data-section-id="${sectionId}"][data-subquestion-id]`
            )
        ) as HTMLElement[];

        const currentIndex = elements.findIndex(el =>
            el.dataset.questionId === String(questionId) && !el.dataset.subquestionId
        );
        const nextEl = elements[currentIndex + 1];
        nextEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // [NEW] Answered overlay for Checkbox/Scale
    const isAnsweredBinaryOrScale =
        (question?.answerType === "CHECKBOX" && binaryValue !== undefined) ||
        (question?.answerType === "SCALE" && typeof scaleValue === "number");

    return(
        <>
            <div className="grid grid-cols-[20fr_1fr]">
                <div
                    data-section-id={sectionId}
                    data-question-id={questionId}
                    className="m-5 p-2 rounded-2xl grid grid-cols-2 grid-rows-[auto_1fr_auto] gap-2 relative"
                >
                    {/* Gray overlay for answered CHECKBOX or SCALE */}
                    {isAnsweredBinaryOrScale && (
                        <div className="absolute inset-0 bg-gray-300 opacity-30 rounded-2xl z-10 pointer-events-none" />
                    )}

                    <p className="col-span-2 w-full p-2">{question?.questionText}</p>

                    {!hasSubQuestions && (
                        <div className="col-span-2">
                            {/* Render input depending on answerType */}
                            {!hasSubQuestions && (
                            <div className="col-span-2">
                                {question?.answerType === "OPEN" && (
                                    <input
                                        type="text"
                                        className="w-full border p-2 rounded"
                                        placeholder="أدخل إجابتك"
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                    />
                                )}

                                {question?.answerType === "CHECKBOX" && (
                                    <div className="flex items-center justify-between gap-6">
                                        <span className="text-gray-700">
                                            {question?.questionText}
                                        </span>
                                        <YesNoInput
                                            value={binaryValue}
                                            onChange={(val) => {
                                                setBinaryValue(val);
                                                // [NEW] Auto-advance on Checkbox answer
                                                scrollToNextItem();
                                            }}
                                            yesLabel="نعم"
                                            noLabel="لا"
                                        />
                                    </div>
                                )}

                                {question?.answerType === "SCALE" && (
                                    <div className="w-full">
                                        <div className="flex items-center justify-center gap-3 mb-3">
                                            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                                                const isSelected = scaleValue === num;
                                                return (
                                                    <button
                                                        key={num}
                                                        onClick={() => {
                                                            setScaleValue(num);
                                                            // [NEW] Auto-advance on Scale answer
                                                            scrollToNextItem();
                                                        }}
                                                        className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
                                                            isSelected
                                                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-110'
                                                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                                        }`}
                                                    >
                                                        {num}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center justify-between px-2">
                                            <span className="text-sm text-gray-500">غير مناسب إطلاقاً</span>
                                            <span className="text-sm text-gray-500">مناسب جداً</span>
                                        </div>
                                    </div>
                                )}

                            </div>
                            )}

                        </div>
                    )}
                </div>
            </div>

            {userTestResponse?.sections
                //rja3e fhme hay ma3 testschema
                ?.filter(section => section.id === sectionId)
                .flatMap(section => section.questions ?? [])
                .filter(question => question.id === questionId)
                .flatMap(question =>
                    Object.entries(question.groupedSubQuestions ?? {}).flatMap(([trait, subQuestions]) =>
                        subQuestions.map(subQuestion => (
                            <UserSubQuestion
                                key={subQuestion.id}
                                subQuestion={subQuestion}
                                answerType={question.answerType}
                                questionId={question.id!}
                                // [NEW] Pass sectionId to support local scrolling in child
                                sectionId={sectionId}
                                usedValues={usedScaleValues}
                                onScaleSelect={(value) => handleScaleSelect(subQuestion.id!, value)}
                            />
                        ))
                    )
                )
            }
        </>
    );
}