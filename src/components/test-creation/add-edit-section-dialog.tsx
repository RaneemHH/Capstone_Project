import {
    Dialog,
    DialogClose,
    DialogContent,
    // DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    // DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx"

import { Button } from "@/components/ui/button.tsx";
import {useLocation, useNavigate, useParams} from "react-router-dom";

// import { useOutletContext } from "react-router-dom";


import { useState} from "react";
import type { Content } from "@tiptap/react";
import {MinimalTiptapEditor} from "@/components/ui/minimal-tiptap";
import {addSection, updateSection} from "@/services/test-api.ts";
import {AlertCircleIcon,} from "lucide-react";
import {useFetchAdminTest} from "@/hooks/useFetchAdminTest.ts";

export default function AddEditSectionDialog() {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const { title: sectionTitle } = location.state || {};


    const testId = params.testId;
    const sectionId = params.sectionId;
    const isEdit = Boolean(sectionId);

    const [title, setTitle] = useState(sectionTitle || "");
    const [value, setValue] = useState<Content>(sectionTitle ||"");
    const [showAlert, setShowAlert] = useState(false);
    const fetchAndSetTest = useFetchAdminTest();


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {


        if (!Number(testId) || !title) {
            setShowAlert(true);
            return;
        }
        if (isEdit) {
            await updateSection(Number(testId), Number(sectionId), { title });
            await fetchAndSetTest(Number(testId));

        } else {
            await addSection(Number(testId), { title });
            await fetchAndSetTest(Number(testId));

        }        setTitle("");
        } catch (error) {
            console.error("Failed to fetch test:", error);
        }
        navigate(-1);
    }

    function handleContentChange(value: Content) {
        setValue(value);
        setTitle(value as string);

    }

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) navigate(-1);
            }}

        >
            {/* <DialogTrigger>Open</DialogTrigger> */}
            <DialogContent className="!max-w-2xl"  >
                <form onSubmit={handleSubmit} >
                    <DialogHeader className="mb-4 text-right">
                        <DialogTitle className="text-xl font-bold text-foreground">{isEdit ? "تعديل القسم" : "قسم جديد"}</DialogTitle>
                    </DialogHeader>

                    {showAlert && (
                        <Alert variant="destructive" className="mb-4 text-right">
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertDescription>
                                يجب إدخال عنوان قبل الحفظ.
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="mb-6 bg-background border-2 border-border rounded-xl overflow-hidden
                                  focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20
                                  transition-all duration-300">
                        <MinimalTiptapEditor
                            value={value}
                            onChange={(e) => handleContentChange(e)}
                            className="w-full"
                            editorContentClassName="p-5"
                            output="html"
                            // placeholder="Enter your description"
                            autofocus={true}
                            editable={true}
                            editorClassName="focus:outline-hidden"
                        />
                    </div>
                    <DialogFooter className="flex-row-reverse gap-2">
                        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            {isEdit ? "حفظ التعديلات" : "حفظ القسم"}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">إلغاء</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
