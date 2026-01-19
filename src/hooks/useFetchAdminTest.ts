import { getTestById } from "@/services/test-api.ts";
import {  useAdminTestStore } from "@/stores/admin-test-store.tsx";


export function useFetchAdminTest() {
    const { setAdminTestResponse } = useAdminTestStore();

    // return async function fetchAndSetTasks(table :Table<Task>) {
    return async function fetchAndSetAdminTest(testId: number) {

        const fetched = await getTestById(testId);

        setAdminTestResponse(fetched);
        // console.log(fetched);

    };
}
