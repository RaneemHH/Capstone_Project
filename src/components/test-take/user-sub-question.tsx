import type {subQuestion} from "@/data/admin-test-schema.ts";
import {useEffect, useState} from "react";
import {type AnswerRequest, submitAnswers, getAnswersByAttempt} from "@/services/test-attempt.ts";
import {useUserTestStore} from "@/stores/user-test-store.tsx";
import {useUserAnswersStore} from "@/stores/user-answers-store.tsx";
import {YesNoInput} from "@/components/question-Input/YesNoInput.tsx";
import type { AnswerType } from "@/types/test-attempt-with-answers-response";

interface SubQuestionProps {
    subQuestion: subQuestion;
    answerType: AnswerType;
    questionId: number;
    selectedValue?: number;
    usedValues?: number[];
    onScaleSelect?: (value: number) => void;
    // [NEW] sectionId to allow local scrolling in the same section
    sectionId: number;
}

export default function UserSubQuestion({
    subQuestion,
    answerType,
    questionId,
    usedValues = [],
    onScaleSelect,
    sectionId
 }: SubQuestionProps){
    const [answerText, setAnswerText] = useState<string | undefined>(undefined);
    const [binaryValue, setBinaryValue] = useState<boolean | undefined>(undefined);
    const [scaleValue, setScaleValue] = useState<number | undefined>(undefined);
    const {userTestResponse} = useUserTestStore();
    const { answers, setAnswers } = useUserAnswersStore();

    useEffect(() => {
        if (!subQuestion) return;

        const existingAnswer = answers.find(a =>
            a.questionId === questionId && a.subQuestionId === subQuestion.id
        );

        if (existingAnswer) {
            setAnswerText(existingAnswer.openValues?.[0]);
            setBinaryValue(existingAnswer.binaryValue);
            setScaleValue(existingAnswer.scaleValue);
        }
    }, [subQuestion, answers]);

    useEffect(() => {
        if (!subQuestion || !userTestResponse) return;
        const nothingToSubmit =
            (!answerText) &&   binaryValue === undefined  && (scaleValue === undefined || scaleValue === null);
        if (nothingToSubmit) return;

        const submit = async () => {
            try {
                const data: AnswerRequest = {
                    questionId: questionId,
                    subQuestionId: subQuestion.id!,
                    answerType,
                    binaryValue,
                };

                if (answerText) data.openValues = [answerText];
                // if (binaryValue) data.binaryValue = binaryValue;
                if (scaleValue) data.scaleValue = Number(scaleValue);
                console.log("payload", data);

                await submitAnswers(userTestResponse.id, data);
                // Fetch updated answers and save to store
                const updatedAnswers = await getAnswersByAttempt(userTestResponse.id);
                setAnswers(updatedAnswers);
                console.log("Answer submitted and fetched:", updatedAnswers);

            } catch (error) {
                console.error("Failed to update question:", error);
            }
        };

        submit();
    }, [answerText, binaryValue, scaleValue]);

    // [NEW] Helper: smoothly scroll to next subquestion/question within this section
    const scrollToNextItem = () => {
        if (!sectionId || !questionId || !subQuestion?.id) return;
        const elements = Array.from(
            document.querySelectorAll(
                `[data-section-id="${sectionId}"][data-question-id], [data-section-id="${sectionId}"][data-subquestion-id]`
            )
        ) as HTMLElement[];

        const currentIndex = elements.findIndex(el =>
            el.dataset.questionId === String(questionId) &&
            el.dataset.subquestionId === String(subQuestion.id)
        );
        const nextEl = elements[currentIndex + 1];
        nextEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // [NEW] Answered overlay only for Checkbox/Scale
    const isAnsweredBinaryOrScale =
        (answerType === "CHECKBOX" && binaryValue !== undefined) ||
        (answerType === "SCALE" && typeof scaleValue === "number");

    return(
        <div
            data-section-id={sectionId}
            data-question-id={questionId}
            data-subquestion-id={subQuestion?.id}
            className="bg-white rounded-2xl shadow-sm p-10 relative"
        >
            {/* Gray overlay for answered CHECKBOX or SCALE */}
            {isAnsweredBinaryOrScale && (
                <div className="absolute inset-0 bg-gray-400 opacity-40 rounded-2xl z-10 pointer-events-none" />
            )}

            {answerType === "CHECKBOX" ? (
                <div className="flex items-center justify-between gap-6">
                    <span className="text-gray-700">
                        {subQuestion?.subQuestionText}
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
            ) : (
                <label className="mb-4 text-gray-700 text-center block">
                    {subQuestion?.subQuestionText}
                </label>
            )}

            {answerType === "OPEN" && (
                <input
                    type="text"
                    className="w-full border p-2 rounded"
                    placeholder="أدخل إجابتك"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                />
            )}

            {answerType === "SCALE" && (
                <div className="w-full">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                            const isSelected = scaleValue === num;
                            const isUsed = usedValues.includes(num);
                            const isDisabled = isUsed && !isSelected;
                            return (
                                <button
                                    key={num}
                                    onClick={() => {
                                        setScaleValue(num);
                                        onScaleSelect?.(num);
                                        // [NEW] Auto-advance on Scale answer
                                        scrollToNextItem();
                                    }}
                                    disabled={isDisabled}
                                    className={`w-12 h-12 rounded-full transition-all duration-200 flex items-center justify-center ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-110'
                                            : isDisabled
                                                ? 'bg-gray-300 text-gray-400'
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
    );
}