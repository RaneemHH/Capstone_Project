import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { exhibitionService } from "@/services/exhibitionService";
import type { ExhibitionRequest } from "@/types/exhibition";

interface CreateExhibitionSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateExhibitionSheet({ open, onOpenChange }: CreateExhibitionSheetProps) {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ExhibitionRequest>({
        title: "",
        description: "",
        theme: "",
        startDate: "",
        endDate: "",
        startTime: "09:00:00",
        endTime: "17:00:00",
        totalAvailableBooths: 50,
        standardBoothSqm: 9.0,
        maxBoothsPerUniversity: 3,
        maxBoothsPerProvider: 2,
        expectedVisitors: 500,
        scheduleJson: "{}",
        finalizationDeadline: "",
    });

    const handleClose = () => {
        onOpenChange(false);
        navigate("/dashboard/exhibitions");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // TODO: Get actual orgId from auth context
            const orgId = 1;
            await exhibitionService.createExhibition(orgId, formData);

            // Reset form
            setFormData({
                title: "",
                description: "",
                theme: "",
                startDate: "",
                endDate: "",
                startTime: "09:00:00",
                endTime: "17:00:00",
                totalAvailableBooths: 50,
                standardBoothSqm: 9.0,
                maxBoothsPerUniversity: 3,
                maxBoothsPerProvider: 2,
                expectedVisitors: 500,
                scheduleJson: "{}",
                finalizationDeadline: "",
            });

            // Close sheet and navigate back
            handleClose();

            // Refresh exhibitions list
            window.location.reload();
        } catch (error) {
            console.error("Failed to create exhibition:", error);
            alert("فشل إنشاء المعرض. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full p-6 sm:max-w-xl overflow-y-auto scrollbar-hide" dir="rtl">
                <SheetHeader>
                    <SheetTitle>إنشاء معرض جديد</SheetTitle>
                    <SheetDescription>
                        أدخل تفاصيل المعرض لإنشاء معرض جديد
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">عنوان المعرض *</Label>
                        <Input
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="مثال: معرض التوجيه الجامعي - البقاع"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">الوصف *</Label>
                        <Textarea
                            id="description"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="وصف المعرض والأهداف..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="theme">الموضوع *</Label>
                        <Input
                            id="theme"
                            required
                            value={formData.theme}
                            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                            placeholder="مثال: التوجيه الجامعي"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">تاريخ البداية *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">تاريخ النهاية *</Label>
                            <Input
                                id="endDate"
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">وقت البداية *</Label>
                            <Input
                                id="startTime"
                                type="time"
                                required
                                value={formData.startTime.substring(0, 5)}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value + ":00" })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">وقت النهاية *</Label>
                            <Input
                                id="endTime"
                                type="time"
                                required
                                value={formData.endTime.substring(0, 5)}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value + ":00" })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="finalizationDeadline">الموعد النهائي للتسجيل *</Label>
                        <Input
                            id="finalizationDeadline"
                            type="datetime-local"
                            required
                            value={formData.finalizationDeadline.substring(0, 16)}
                            onChange={(e) => setFormData({ ...formData, finalizationDeadline: e.target.value + ":00" })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalAvailableBooths">عدد الطاولات المتاحة *</Label>
                            <Input
                                id="totalAvailableBooths"
                                type="number"
                                required
                                min="1"
                                value={formData.totalAvailableBooths}
                                onChange={(e) => setFormData({ ...formData, totalAvailableBooths: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="standardBoothSqm">مساحة الطاولة (م²) *</Label>
                            <Input
                                id="standardBoothSqm"
                                type="number"
                                required
                                min="0.1"
                                step="0.1"
                                value={formData.standardBoothSqm}
                                onChange={(e) => setFormData({ ...formData, standardBoothSqm: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxBoothsPerUniversity">الحد الأقصى للجامعات *</Label>
                            <Input
                                id="maxBoothsPerUniversity"
                                type="number"
                                required
                                min="1"
                                value={formData.maxBoothsPerUniversity}
                                onChange={(e) => setFormData({ ...formData, maxBoothsPerUniversity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxBoothsPerProvider">الحد الأقصى للمقدمين *</Label>
                            <Input
                                id="maxBoothsPerProvider"
                                type="number"
                                required
                                min="1"
                                value={formData.maxBoothsPerProvider}
                                onChange={(e) => setFormData({ ...formData, maxBoothsPerProvider: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expectedVisitors">عدد الزوار المتوقع *</Label>
                        <Input
                            id="expectedVisitors"
                            type="number"
                            required
                            min="1"
                            value={formData.expectedVisitors}
                            onChange={(e) => setFormData({ ...formData, expectedVisitors: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? "جاري الإنشاء..." : "إنشاء المعرض"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}
