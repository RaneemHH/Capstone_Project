import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet.tsx"
import {createTest, getAllTestsByBaseId} from "@/services/test-api.ts";
import {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useAdminTestsStore} from "@/stores/admin-tests-store.tsx";

export default function AddTestSheet(){
    const[title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const navigate = useNavigate();
    const { baseTestId } = useParams();
    const {setAdminTestsResponse} = useAdminTestsStore();

    async function handleAddTest(){
        if (!baseTestId) {
            console.error("baseTestId is missing");
            return;
        }
        
        const newTest ={
            title:title,
            description:description,
            baseTestId: Number(baseTestId),
            versionName: `version-${Date.now()}` // Generate unique version name
        }
        try{
            const createdtest = await createTest(newTest);
            console.log("createdtest",createdtest);
            const updatedTests = await getAllTestsByBaseId(Number(baseTestId));
            setAdminTestsResponse(updatedTests);

        }catch(error){
            console.log("❌ Failed to create task:",error)
        }
        setTitle("")
        setDescription("")
        navigate(-1);
    }
    return(
        <Sheet  open
                onOpenChange={(open) => {
                    if (!open) navigate(-1);
                }}>
            <SheetTrigger asChild>

            </SheetTrigger>
            <SheetContent >
                <SheetHeader>
                    <SheetTitle className="mt-8">تفاصيل الاختبار</SheetTitle>
                    <SheetDescription>
                        يرجى إدخال عنوان ووصف موجز للاختبار
                    </SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-name">العنوان</Label>
                        <Input id="sheet-demo-name"
                        placeholder="أدخل عنوان اختبار الشخصية"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}/>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="sheet-demo-description">توصيف</Label>
                        <Textarea 
                            id="sheet-demo-description"
                            placeholder="اشرح ما يحتويه الاختبار أو هدفه"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            className="resize-none"
                        />
                    </div>
                </div>
                <SheetFooter>
                    <Button type="submit"
                    onClick={handleAddTest}
                    >إنشاء اختبار</Button>
                    <SheetClose asChild>
                        <Button
                            variant="outline">إلغاء</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}