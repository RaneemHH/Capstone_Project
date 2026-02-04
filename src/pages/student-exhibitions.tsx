import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Calendar, Building, Users, CheckCircle, MessageSquare, Search, Filter } from "lucide-react";
import { exhibitionService } from "@/services/exhibitionService";
import { studentRegistrationService } from "@/services/student-registration-service";
import type { ExhibitionResponse } from "@/types/exhibition";
import type { StudentRegistrationResponse } from "@/types/student-registration";
import { toast } from "sonner";

export default function StudentExhibitions() {
    const navigate = useNavigate();
    const [exhibitions, setExhibitions] = useState<ExhibitionResponse[]>([]);
    const [myRegistrations, setMyRegistrations] = useState<StudentRegistrationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "ACTIVE" | "COMPLETED">("ALL");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [exhibitionsData, registrationsData] = await Promise.all([
                exhibitionService.getAllExhibitions(),
                studentRegistrationService.getStudentRegistrations(),
            ]);
            // Filter to show CONFIRMED, ACTIVE, and COMPLETED exhibitions
            const visibleExhibitions = exhibitionsData.filter(
                ex => ex.status === 'CONFIRMED' || ex.status === 'ACTIVE' || ex.status === 'COMPLETED'
            );
            setExhibitions(visibleExhibitions);
            setMyRegistrations(registrationsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error("فشل في تحميل البيانات");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (exhibitionId: number) => {
        try {
            setIsRegistering(exhibitionId);
            await studentRegistrationService.registerStudent({ exhibitionId, schoolId: 0 });
            toast.success("تم التسجيل بنجاح! في انتظار الموافقة");
            fetchData();
        } catch (error) {
            console.error('Failed to register:', error);
            toast.error("فشل في التسجيل");
        } finally {
            setIsRegistering(null);
        }
    };

    const isRegistered = (exhibitionId: number) => {
        return myRegistrations.some(r => r.exhibitionId === exhibitionId);
    };

    const getRegistrationStatus = (exhibitionId: number) => {
        const registration = myRegistrations.find(r => r.exhibitionId === exhibitionId);
        return registration?.status;
    };

    const getStatusBadge = (status?: string) => {
        if (!status) return null;

        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
            PENDING: { label: "بانتظار الموافقة", variant: "outline" },
            REGISTERED: { label: "مسجل", variant: "secondary" },
            ATTENDED: { label: "حضر", variant: "default" },
            CANCELLED: { label: "ملغي", variant: "destructive" },
        };

        const config = statusMap[status] || { label: status, variant: "outline" };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleViewFeedback = (exhibitionId: number) => {
        navigate(`/dashboard/exhibitions/${exhibitionId}/feedback`);
    };

    // Filter exhibitions based on search and status
    const filteredExhibitions = exhibitions.filter(exhibition => {
        const matchesSearch = exhibition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (exhibition.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                            (exhibition.theme?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === "ALL" || exhibition.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto scrollbar-hide" dir="rtl">
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="ابحث بالاسم أو الوصف او الموضوع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={statusFilter === "ALL" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("ALL")}
                        >
                            <Filter className="w-4 h-4 ml-1" />
                            الكل ({exhibitions.length})
                        </Button>
                        <Button
                            variant={statusFilter === "CONFIRMED" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("CONFIRMED")}
                        >
                            مؤكد ({exhibitions.filter(e => e.status === 'CONFIRMED').length})
                        </Button>
                        <Button
                            variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("ACTIVE")}
                        >
                            نشط ({exhibitions.filter(e => e.status === 'ACTIVE').length})
                        </Button>
                        <Button
                            variant={statusFilter === "COMPLETED" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter("COMPLETED")}
                        >
                            مكتمل ({exhibitions.filter(e => e.status === 'COMPLETED').length})
                        </Button>
                    </div>
                </div>

                {/* Exhibitions Grid */}
                {filteredExhibitions.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">لا توجد معارض متاحة</h3>
                            <p className="text-muted-foreground text-center">
                                {searchQuery || statusFilter !== "ALL" ? "لا توجد نتائج مطابقة للبحث" : "لا توجد معارض قادمة في الوقت الحالي"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExhibitions.map((exhibition) => {
                            const registered = isRegistered(exhibition.id);
                            const status = getRegistrationStatus(exhibition.id);

                            return (
                                <Card key={exhibition.id} className={`hover:shadow-lg transition-shadow ${registered ? "border-primary" : ""}`}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <CardTitle className="text-xl flex-1">{exhibition.title}</CardTitle>
                                            <div className="flex flex-col gap-2">
                                                <Badge variant={
                                                    exhibition.status === 'CONFIRMED' ? 'default' :
                                                        exhibition.status === 'ACTIVE' ? 'secondary' :
                                                            exhibition.status === 'COMPLETED' ? 'outline' : 'outline'
                                                }>
                                                    {exhibition.status === 'CONFIRMED' ? 'مؤكد' :
                                                        exhibition.status === 'ACTIVE' ? 'نشط' :
                                                            exhibition.status === 'COMPLETED' ? 'مكتمل' : exhibition.status}
                                                </Badge>
                                                {registered && getStatusBadge(status)}
                                            </div>
                                        </div>
                                        <CardDescription>{exhibition.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(exhibition.startDate).toLocaleDateString('en-US')} - {new Date(exhibition.endDate).toLocaleDateString('en-US')}
                                                </span>
                                            </div>

                                            {exhibition.theme && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Building className="w-4 h-4" />
                                                    <span>{exhibition.theme}</span>
                                                </div>
                                            )}

                                            {exhibition.expectedVisitors && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Users className="w-4 h-4" />
                                                    <span>متوقع {exhibition.expectedVisitors.toLocaleString()} زائر</span>
                                                </div>
                                            )}
                                        </div>

                                        {registered ? (
                                            <Button variant="outline" className="w-full" disabled>
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                مسجل بالفعل
                                            </Button>
                                        ) : (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="w-full">
                                                            <Button
                                                                onClick={() => handleRegister(exhibition.id)}
                                                                className="w-full"
                                                                disabled={isRegistering === exhibition.id || exhibition.status !== 'ACTIVE'}
                                                            >
                                                                {isRegistering === exhibition.id ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                        جاري التسجيل...
                                                                    </>
                                                                ) : (
                                                                    "التسجيل في المعرض"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </TooltipTrigger>
                                                    {exhibition.status !== 'ACTIVE' && (
                                                        <TooltipContent>
                                                            <p>لا يمكنك التسجيل بعد، المعرض لم يبدأ</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}

                                        {exhibition.status === 'COMPLETED' && (
                                            <Button
                                                onClick={() => handleViewFeedback(exhibition.id)}
                                                variant="secondary"
                                                className="w-full mt-2"
                                            >
                                                <MessageSquare className="w-4 h-4 ml-2" />
                                                عرض التقييمات
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
