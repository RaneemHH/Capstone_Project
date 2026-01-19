import {  useUserTestStore } from "@/stores/user-test-store.tsx";
import {getAllAnswersByTestAttemptId, getTestAttemptById} from "@/services/test-attempt.ts";
import {useEffect} from "react";
import {useUserAnswersStore} from "@/stores/user-answers-store.tsx";


export function useFetchUserTest(attemptId:number) {
    const { userTestResponse,setUserTestResponse } = useUserTestStore();
    const { setAnswers}= useUserAnswersStore();
    useEffect(() => {
        if (!userTestResponse) return;

        const fetchAnswers = async () => {
            const answers = await getAllAnswersByTestAttemptId(attemptId); // or getAnswersByAttempt(userTestResponse.id)
            console.log("answers",answers);
            // filter answers for this attempt only
            // const myAnswers = answers.filter(a => a.attemptId === userTestResponse.id);

            // save them in store
            setAnswers(answers); // see below for store approach
        };

        fetchAnswers();
    }, [userTestResponse]);
    return async function fetchAndSetUserTest(attemptId: number) {

        const test = await getTestAttemptById(attemptId);
        setUserTestResponse(test);

    };
}
