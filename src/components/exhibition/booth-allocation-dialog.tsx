import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boothService } from "@/services/booth-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { BoothResponse } from "@/types/booth";

interface BoothAllocationDialogProps {
    booth: BoothResponse | null;
    exhibitionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function BoothAllocationDialog({
    booth,
    exhibitionId,
    open,
    onOpenChange,
    onSuccess
}: BoothAllocationDialogProps) {
    const [zone, setZone] = useState(booth?.zone || "");
    const [boothNumber, setBoothNumber] = useState(booth?.boothNumber.toString() || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!booth) return;

        const boothNum = parseInt(boothNumber);
        if (isNaN(boothNum) || boothNum <= 0) {
            toast.error("يرجى إدخال رقم كشك صحيح");
            return;
        }

        if (!zone.trim()) {
            toast.error("يرجى إدخال المنطقة");
            return;
        }

        try {
            setIsSubmitting(true);
            await boothService.updateBoothAllocation(exhibitionId, {
                boothId: booth.id,
                zone: zone.trim(),
                boothNumber: boothNum
            });
            
            toast.success("تم تحديث تخصيص الكشك بنجاح");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to update booth allocation:", error);
            toast.error("فشل في تحديث تخصيص الكشك");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update local state when booth changes
    useState(() => {
        if (booth) {
            setZone(booth.zone);
            setBoothNumber(booth.boothNumber.toString());
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>تعيين تخصيص الكشك</DialogTitle>
                        <DialogDescription>
                            قم بتعيين المنطقة ورقم الكشك
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="booth-id">رقم الكشك (ID)</Label>
                            <Input
                                id="booth-id"
                                value={booth?.id || ""}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="booth-type">النوع</Label>
                            <Input
                                id="booth-type"
                                value={booth?.type === 'UNIVERSITY' ? 'جامعة' : 'مزود نشاط'}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="zone">المنطقة *</Label>
                            <Input
                                id="zone"
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                                placeholder="مثال: A, B, C"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="booth-number">رقم الكشك *</Label>
                            <Input
                                id="booth-number"
                                type="number"
                                min="1"
                                value={boothNumber}
                                onChange={(e) => setBoothNumber(e.target.value)}
                                placeholder="مثال: 1, 2, 3"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                            حفظ التخصيص
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
