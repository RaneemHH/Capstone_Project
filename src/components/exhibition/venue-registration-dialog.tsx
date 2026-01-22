import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface VenueRegistrationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    venueName: string;
    onConfirm: (orgNotes: string) => void;
    isLoading?: boolean;
}

export default function VenueRegistrationDialog({
    open,
    onOpenChange,
    venueName,
    onConfirm,
    isLoading = false
}: VenueRegistrationDialogProps) {
    const [orgNotes, setOrgNotes] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(orgNotes);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="text-right sm:text-right">
                        <DialogTitle>تسجيل طلب حجز المكان</DialogTitle>
                        <DialogDescription>
                            أنت على وشك تسجيل طلب حجز لـ <strong>{venueName}</strong>.
                            يمكنك إضافة ملاحظات إضافية للبلدية.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3">
                            <Label htmlFor="orgNotes">ملاحظات المنظمة (اختياري)</Label>
                            <Textarea
                                id="orgNotes"
                                name="orgNotes"
                                placeholder="أضف أي ملاحظات أو متطلبات خاصة للبلدية..."
                                value={orgNotes}
                                onChange={(e) => setOrgNotes(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                سيتم إرسال الطلب إلى البلدية للمراجعة والموافقة
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="sm:flex-row-reverse">
                        <DialogClose asChild>
                            <Button variant="outline" type="button" disabled={isLoading}>
                                إلغاء
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "جاري التسجيل..." : "تأكيد التسجيل"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
