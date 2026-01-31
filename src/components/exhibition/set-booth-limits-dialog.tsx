import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Building2, Briefcase } from "lucide-react";
import { boothService } from "@/services/booth-service";
import type { InvitationCapacityResponse } from "@/types/booth";
import { toast } from "sonner";

interface SetBoothLimitsDialogProps {
    exhibitionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function SetBoothLimitsDialog({
    exhibitionId,
    open,
    onOpenChange,
    onSuccess,
}: SetBoothLimitsDialogProps) {
    const [maxBoothsPerUniversity, setMaxBoothsPerUniversity] = useState<string>("");
    const [maxBoothsPerProvider, setMaxBoothsPerProvider] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [capacityResponse, setCapacityResponse] = useState<InvitationCapacityResponse | null>(null);
    const [totalBooths, setTotalBooths] = useState<number | null>(null);
    const [isLoadingBooths, setIsLoadingBooths] = useState(false);

    // Fetch total booths when dialog opens
    useEffect(() => {
        const fetchTotalBooths = async () => {
            if (open && exhibitionId) {
                setIsLoadingBooths(true);
                try {
                    const booths = await boothService.getBoothsByExhibition(exhibitionId);
                    setTotalBooths(booths.length);
                } catch (error) {
                    console.error('Failed to fetch booths:', error);
                    // Don't show error toast, just log it
                } finally {
                    setIsLoadingBooths(false);
                }
            }
        };

        fetchTotalBooths();
    }, [open, exhibitionId]);

    const handleSubmit = async () => {
        const uniBooths = parseInt(maxBoothsPerUniversity);
        const providerBooths = parseInt(maxBoothsPerProvider);

        if (isNaN(uniBooths) || uniBooths <= 0) {
            toast.error("الرجاء إدخال عدد صحيح للأماكن المخصصة للجامعات");
            return;
        }

        if (isNaN(providerBooths) || providerBooths <= 0) {
            toast.error("الرجاء إدخال عدد صحيح للأماكن المخصصة لمقدمي الأنشطة");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await boothService.setBoothLimits(exhibitionId, {
                maxBoothsPerUniversity: uniBooths,
                maxBoothsPerProvider: providerBooths,
            });
            setCapacityResponse(response);
            toast.success("تم تحديث حدود الأماكن بنجاح");

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to set booth limits:', error);
            toast.error("فشل في تحديث حدود الأماكن");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setMaxBoothsPerUniversity("");
            setMaxBoothsPerProvider("");
            setCapacityResponse(null);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right">تعديل حدود الأماكن</DialogTitle>
                    <DialogDescription className="text-right">
                        حدد الحد الأقصى للأماكن المخصصة للجامعات ومقدمي الأنشطة
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">


                    {/* Input Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="uniBooths" className="text-right block flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                الأماكن لكل جامعة *
                            </Label>
                            <Input
                                id="uniBooths"
                                type="number"
                                min="1"
                                value={maxBoothsPerUniversity}
                                onChange={(e) => setMaxBoothsPerUniversity(e.target.value)}
                                placeholder="مثال: 5"
                                className="text-right"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="providerBooths" className="text-right block flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                الأماكن لكل مقدم نشاط *
                            </Label>
                            <Input
                                id="providerBooths"
                                type="number"
                                min="1"
                                value={capacityResponse?.maxBoothsPerProvider}
                                onChange={(e) => setMaxBoothsPerProvider(e.target.value)}
                                placeholder="مثال: 3"
                                className="text-right"
                            />
                        </div>
                    </div>

                    {/* Capacity Response */}
                    {/* {capacityResponse && (
                        <Card className="bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground mb-1">إجمالي الأماكن المتاحة</div>
                                        <div className="text-2xl font-bold">{capacityResponse.totalAvailableBooths}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-1">الأماكن المتبقية</div>
                                        <div className="text-2xl font-bold text-green-600">{capacityResponse.remainingBooths}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-1">الحد الأقصى للجامعات</div>
                                        <div className="text-xl font-semibold">{capacityResponse.maxUniversitiesToInvite}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground mb-1">الحد الأقصى لمقدمي الأنشطة</div>
                                        <div className="text-xl font-semibold">{capacityResponse.maxProvidersToInvite}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )} */}
                </div>

                <DialogFooter className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        {capacityResponse ? "إغلاق" : "إلغاء"}
                    </Button>
                    {!capacityResponse && (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !maxBoothsPerUniversity || !maxBoothsPerProvider}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري التحديث...
                                </>
                            ) : (
                                "تحديث الحدود"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
