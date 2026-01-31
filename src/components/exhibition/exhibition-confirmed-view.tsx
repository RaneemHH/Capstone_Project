import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Settings, Play } from "lucide-react";
import type { ExhibitionResponse } from "@/types/exhibition";
import { toast } from "sonner";
import { useBoothStore } from "@/stores/booth-store";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { universityParticipationService } from "@/services/university-participation-service";
import { activityProviderService } from "@/services/activity-provider-service";
import type { UniversityParticipationResponse } from "@/types/university";
import type { ActivityProviderRequestResponse } from "@/types/activity-provider";
import type { BoothResponse } from "@/types/booth";
import { BoothAllocationDialog } from "./booth-allocation-dialog";
import { exhibitionService } from "@/services/exhibitionService";

interface ExhibitionConfirmedViewProps {
    exhibitionId: number;
    exhibition: ExhibitionResponse;
    onExhibitionUpdate?: () => void;
}

export function ExhibitionConfirmedView({ exhibitionId, exhibition, onExhibitionUpdate }: ExhibitionConfirmedViewProps) {
    const { booths, isLoading: boothsLoading, fetchBooths } = useBoothStore();
    const [universityParticipations, setUniversityParticipations] = useState<UniversityParticipationResponse[]>([]);
    const [activityProviderRequests, setActivityProviderRequests] = useState<ActivityProviderRequestResponse[]>([]);
    const [selectedBooth, setSelectedBooth] = useState<BoothResponse | null>(null);
    const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    const fetchParticipations = useCallback(async () => {
        try {
            const [universities, providers] = await Promise.all([
                universityParticipationService.getParticipationsByExhibition(exhibitionId),
                activityProviderService.getRequestsByExhibition(exhibitionId)
            ]);
            setUniversityParticipations(universities);
            setActivityProviderRequests(providers);
        } catch (error) {
            console.error('Failed to fetch participations:', error);
        }
    }, [exhibitionId]);

    useEffect(() => {
        if (exhibition.status === 'CONFIRMED' || exhibition.status === 'ACTIVE' || exhibition.status === 'COMPLETED') {
            fetchBooths(exhibitionId);
            fetchParticipations();
        }
    }, [exhibition.status, fetchBooths, fetchParticipations, exhibitionId]);

    const getParticipantName = (booth: BoothResponse) => {
        if (booth.type === 'UNIVERSITY' && booth.universityParticipationId) {
            const participation = universityParticipations.find((p) => p.id === booth.universityParticipationId);
            return participation?.universityName || '-';
        } else if (booth.type === 'ACTIVITY_PROVIDER' && booth.activityProviderRequestId) {
            const request = activityProviderRequests.find((r) => r.id === booth.activityProviderRequestId);
            return request?.name || '-';
        }
        return '-';
    };

    const handleSetAllocation = (booth: BoothResponse) => {
        setSelectedBooth(booth);
        setIsAllocationDialogOpen(true);
    };

    const handleAllocationSuccess = () => {
        fetchBooths(exhibitionId);
    };

    const handleStartExhibition = async () => {
        // Validation: At least one finalized university or activity provider
        const hasFinalizedUniversity = universityParticipations.some(p => p.status === 'FINALIZED');
        const hasFinalizedProvider = activityProviderRequests.some(r => r.status === 'FINALIZED');

        if (!hasFinalizedUniversity && !hasFinalizedProvider) {
            toast.error("لا يمكن بدء المعرض بدون وجود مشارك واحد على الأقل (جامعة أو مزود أنشطة) أكمل مشاركته نهائياً");
            return;
        }

        try {
            setIsStarting(true);
            await exhibitionService.startExhibition(exhibitionId);
            toast.success("تم بدء المعرض بنجاح!");
            if (onExhibitionUpdate) {
                onExhibitionUpdate();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to start exhibition:', error);
            toast.error("فشل في بدء المعرض، يرجى التأكد من تخصيص جميع الأكشاك أولاً");
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Fixed Start Exhibition Button - Bottom Left */}
            {exhibition.status === 'CONFIRMED' && (
                <div className="fixed bottom-6 left-6 z-50">
                    <Button
                        onClick={handleStartExhibition}
                        disabled={isStarting}
                        variant="outline"
                        size="lg"
                        className="bg-muted/80 hover:bg-muted border-muted-foreground/20 text-muted-foreground hover:text-foreground shadow-lg backdrop-blur-sm"
                    >
                        {isStarting ? (
                            <>
                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                جاري البدء...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 ml-2" />
                                جاهز لبدء المعرض؟
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Booths Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-right">
                        <MapPin className="w-5 h-5" />
                        الأكشاك المخصصة
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {boothsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : booths.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">الرقم</TableHead>
                                        <TableHead className="text-right">النوع</TableHead>
                                        <TableHead className="text-right">المنطقة</TableHead>
                                        <TableHead className="text-right">رقم الكشك</TableHead>
                                        <TableHead className="text-right">المشارك</TableHead>
                                        <TableHead className="text-right">الإجراءات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booths.map((booth) => (
                                        <TableRow key={booth.id}>
                                            <TableCell className="font-medium text-right">{booth.id}</TableCell>
                                            <TableCell className="text-right">
                                                {booth.type === 'UNIVERSITY' ? 'جامعة' : 'مزود نشاط'}
                                            </TableCell>
                                            <TableCell className="text-right">{booth.zone}</TableCell>
                                            <TableCell className="text-right">{booth.boothNumber}</TableCell>
                                            <TableCell className="text-right">{getParticipantName(booth)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleSetAllocation(booth)}
                                                >
                                                    <Settings className="w-4 h-4 ml-2" />
                                                    تعيين التخصيص
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">لا توجد أكشاك مخصصة بعد</p>
                    )}
                </CardContent>
            </Card>

            <BoothAllocationDialog
                booth={selectedBooth}
                exhibitionId={exhibitionId}
                open={isAllocationDialogOpen}
                onOpenChange={setIsAllocationDialogOpen}
                onSuccess={handleAllocationSuccess}
            />
        </div>
    );
}
