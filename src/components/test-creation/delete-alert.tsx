import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {useNavigate, useParams} from "react-router-dom";
import {deleteQuestion, deleteSection, deleteSubQuestion} from "@/services/test-api.ts";
import {useFetchAdminTest} from "@/hooks/useFetchAdminTest.ts";



export function DeleteAlertDialog() {
    const navigate = useNavigate();
    const fetchAndSetTest = useFetchAdminTest();
    // const params = useParams();
    const { type, id, testId } = useParams();

    // const testId = params.testId;
    // const sectionId = params.sectionId;
    async function handleDelete() {
        if (!id || !type) return;

        switch (type) {
            case "section":
                await deleteSection(Number(testId), Number(id));
                break;
            case "question":
                await deleteQuestion(Number(testId), Number(id));
                break;
            case "subQuestion":
                await deleteSubQuestion(Number(testId), Number(id));
                break;
            default:
                console.error("Unknown delete type:", type);
                return;
        }

        await fetchAndSetTest(Number(testId));
        // navigate(-1);
        // console.log("i enter delete");
        // await deleteSection(Number(testId),Number(sectionId));
        // await fetchAndSetTest(Number(testId));
    }
    const titles: Record<string, string> = {
        section: "هل أنت متأكد من حذف القسم؟",
        question: "هل أنت متأكد من حذف السؤال؟",
        subQuestion: "هل أنت متأكد من حذف السؤال الفرعي؟",
    };

    const descriptions: Record<string, string> = {
        section: "سيتم حذف القسم وجميع أسئلته وأسئلته الفرعية نهائيًا.",
        question: "سيتم حذف السؤال وجميع أسئلته الفرعية نهائيًا.",
        subQuestion: "سيتم حذف السؤال الفرعي نهائيًا.",
    };
    return (
        <AlertDialog
            open
            onOpenChange={(open) => {
                if (!open) navigate(-1);
            }}>
            <AlertDialogTrigger asChild>
                {/*<Button variant="outline">Show Dialog</Button>*/}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader className="text-right">
                    <AlertDialogTitle className="text-xl font-bold text-destructive">{titles[type!]}</AlertDialogTitle>

                    <AlertDialogDescription className="text-right text-base">
                        {descriptions[type!]}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row-reverse gap-2">
                    <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        إكمال الحذف
                    </AlertDialogAction>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
