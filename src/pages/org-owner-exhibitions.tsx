import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Calendar,
    MapPin,
    Users,
    Building2,
    CheckCircle2,
    Clock,
    Plus,
    Search,
    ArrowUpDown,
    Filter,
    ChevronUp,
    AlertCircle,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import { CreateExhibitionSheet } from "@/components/exhibition/create-exhibition-sheet";
import { useExhibitionStore } from "@/stores/exhibition-store";
import { ExhibitionStatusLabels, getStepFromStatus } from "@/types/exhibition";
import type { ExhibitionStatus } from "@/types/exhibition";

// Helper function to get next action based on status
function getNextAction(status: ExhibitionStatus): string {
    const actionMap: Record<ExhibitionStatus, string> = {
        DRAFT: "إكمال تفاصيل المعرض وطلب المكان",
        VENUE_PENDING: "بانتظار موافقة البلدية على المكان",
        VENUE_APPROVED: "دعوة مقدمي الأنشطة للمشاركة",
        PLANNING: "مراجعة واعتماد طلبات المشاركة",
        CONFIRMED: "إنهاء الجدول الزمني وإرسال التأكيدات",
        ACTIVE: "متابعة الفعالية وجمع التقييمات",
        COMPLETED: "عرض الإحصائيات وتحميل التقارير",
        CANCELLED_BY_ORG: "المعرض ملغى من المنظمة",
        CANCELLED_BY_MUNICIPALITY: "المعرض ملغى من البلدية",
    };
    return actionMap[status] || "لا يوجد إجراء";
}

function getStatusBadgeConfig(status: ExhibitionStatus): {
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
} {
    const statusMap: Record<ExhibitionStatus, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
        DRAFT: {
            variant: "outline" as const,
            className: "bg-muted/50 text-muted-foreground border-border",
        },
        VENUE_PENDING: {
            variant: "secondary" as const,
            className: "bg-secondary/30 text-secondary-foreground border-secondary/50",
        },
        VENUE_APPROVED: {
            variant: "default" as const,
            className: "bg-primary/20 text-primary border-primary/40",
        },
        PLANNING: {
            variant: "default" as const,
            className: "bg-accent/30 text-accent-foreground border-accent/50",
        },
        CONFIRMED: {
            variant: "default" as const,
            className: "bg-primary/30 text-primary-foreground border-primary/50",
        },
        ACTIVE: {
            variant: "default" as const,
            className: "bg-primary/40 text-primary-foreground border-primary/60",
        },
        COMPLETED: {
            variant: "secondary" as const,
            className: "bg-secondary/40 text-secondary-foreground border-secondary/60",
        },
        CANCELLED_BY_ORG: {
            variant: "destructive" as const,
            className: "bg-destructive/20 text-destructive border-destructive/40",
        },
        CANCELLED_BY_MUNICIPALITY: {
            variant: "destructive" as const,
            className: "bg-destructive/20 text-destructive border-destructive/40",
        },
    };
    return statusMap[status];
}

function getCardBackgroundClass(status: ExhibitionStatus): string {
    const bgMap: Record<ExhibitionStatus, string> = {
        DRAFT: "bg-secondary/30",
        VENUE_PENDING: "bg-secondary/30",
        VENUE_APPROVED: "bg-secondary/30",
        PLANNING: "bg-secondary/30",
        CONFIRMED: "bg-secondary/30",
        ACTIVE: "bg-secondary/30",
        COMPLETED: "bg-secondary/30",
        CANCELLED_BY_ORG: "bg-secondary/20",
        CANCELLED_BY_MUNICIPALITY: "bg-secondary/20",
    };
    return bgMap[status];
}

function getStepProgress(step: number): number {
    return (step / 4) * 100;
}

export default function OrgOwnerExhibitions() {
    const navigate = useNavigate();
    const location = useLocation();
    const { exhibitions, isLoading, fetchExhibitions } = useExhibitionStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ExhibitionStatus | "ALL">("ALL");
    const [sortBy, setSortBy] = useState<string>("الأحدث");
    const [isStatsExpanded, setIsStatsExpanded] = useState(false);
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

    // Fetch exhibitions on mount
    useEffect(() => {
        // TODO: Get actual orgId from auth context
        const orgId = 1;
        fetchExhibitions(orgId);
    }, [fetchExhibitions]);

    // Open sheet when route is /dashboard/exhibitions/createExhibition
    useEffect(() => {
        if (location.pathname === "/dashboard/exhibitions/createExhibition") {
            setIsCreateSheetOpen(true);
        } else {
            setIsCreateSheetOpen(false);
        }
    }, [location.pathname]);

    const handleCreateClick = () => {
        navigate("/dashboard/exhibitions/createExhibition");
    };

    const handleSheetOpenChange = (open: boolean) => {
        if (!open) {
            navigate("/dashboard/exhibitions");
        }
        setIsCreateSheetOpen(open);
    };

    const filteredExhibitions = exhibitions
        .filter((ex) => {
            const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "ALL" || ex.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === "الأحدث") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            if (sortBy === "الأقدم") return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            if (sortBy === "أقرب موعد نهائي") {
                const aDeadline = a.finalizationDeadline || a.startDate;
                const bDeadline = b.finalizationDeadline || b.startDate;
                return new Date(aDeadline).getTime() - new Date(bDeadline).getTime();
            }
            return 0;
        });

    const totalExhibitions = exhibitions.length;
    const inSetup = exhibitions.filter((ex) =>
        ["DRAFT", "VENUE_PENDING", "VENUE_APPROVED"].includes(ex.status)
    ).length;
    const activeNow = exhibitions.filter((ex) => ex.status === "ACTIVE").length;
    const completed = exhibitions.filter((ex) => ex.status === "COMPLETED").length;

    return (
        <TooltipProvider>
            <div dir="rtl" className="flex flex-col h-full bg-background">
                {/* Fixed Header Section */}
                <div className="flex-shrink-0 p-2 space-y-2 border-b border-border bg-background">
                    {/* KPI Cards */}
                    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 ${isStatsExpanded ? 'block' : 'hidden lg:grid'}`}>
                        <Card className="border-none bg-primary/30">
                            <CardContent className="p-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm text-primary-foreground/80">إجمالي المعارض</p>
                                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mt-0.5">{totalExhibitions}</p>
                                    </div>
                                    <Building2 className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-secondary/30">
                            <CardContent className="p-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm text-secondary-foreground/80">قيد الإعداد</p>
                                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary-foreground mt-0.5">{inSetup}</p>
                                    </div>
                                    <Clock className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-secondary-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-accent/20">
                            <CardContent className="p-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm text-primary-foreground/80">نشطة الآن</p>
                                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary-foreground mt-0.5">{activeNow}</p>
                                    </div>
                                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none bg-muted/50">
                            <CardContent className="p-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs md:text-sm text-muted-foreground/80">مكتملة</p>
                                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-muted-foreground mt-0.5">{completed}</p>
                                    </div>
                                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Filters */}
                    {/* <Card className="border-none bg-card p-0"> */}
                    <CardContent className="p-1">
                        <div className="flex gap-1">
                            {/* Stats Toggle Button - Only on small/medium screens */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                                className="h-8 px-2 lg:hidden"
                            >
                                {isStatsExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <BarChart3 className="w-4 h-4" />
                                )}
                            </Button>

                            <div className="flex-1 relative">
                                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="ابحث باسم المعرض..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pr-9 bg-background h-8 text-sm"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 px-3">
                                        <Filter className="w-4 h-4" />
                                        <span className="hidden md:inline ml-2">
                                            الحالة: {statusFilter === "ALL" ? "الكل" : ExhibitionStatusLabels[statusFilter]}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                                        الكل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("DRAFT")}>
                                        مسودة
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("VENUE_PENDING")}>
                                        بانتظار البلدية
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("VENUE_APPROVED")}>
                                        المكان موافق
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("PLANNING")}>
                                        التخطيط
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("CONFIRMED")}>
                                        مؤكد
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>
                                        نشط
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>
                                        مكتمل
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED_BY_ORG")}>
                                        ملغى من المنظمة
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("CANCELLED_BY_MUNICIPALITY")}>
                                        ملغى من البلدية
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 px-3">
                                        <ArrowUpDown className="w-4 h-4" />
                                        <span className="hidden md:inline ml-2">ترتيب: {sortBy}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {["الأحدث", "الأقدم", "أقرب موعد نهائي"].map((sort) => (
                                        <DropdownMenuItem key={sort} onClick={() => setSortBy(sort)}>
                                            {sort}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                size="sm"
                                className="bg-primary text-primary-foreground h-8 px-2"
                                onClick={handleCreateClick}
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden md:inline ml-2">إنشاء معرض</span>
                            </Button>
                        </div>
                    </CardContent>
                    {/* </Card> */}
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                    {/* Exhibitions Grid */}
                    {isLoading ? (
                        <Card className="border-dashed border-2 border-border bg-muted/10">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Clock className="w-16 h-16 text-muted-foreground mb-4 animate-spin" />
                                <h3 className="text-lg font-semibold mb-2">جاري التحميل...</h3>
                            </CardContent>
                        </Card>
                    ) : filteredExhibitions.length === 0 ? (
                        <Card className="border-dashed border-2 border-border bg-muted/10">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">لا توجد معارض</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    {searchQuery || statusFilter !== "ALL"
                                        ? "جرب تعديل الفلاتر"
                                        : "أنشئ معرضك الأول للبدء"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {filteredExhibitions.map((exhibition) => {
                                const statusInfo = getStatusBadgeConfig(exhibition.status);
                                const cardBg = getCardBackgroundClass(exhibition.status);
                                const currentStep = getStepFromStatus(exhibition.status);
                                const progress = getStepProgress(currentStep);
                                const nextAction = getNextAction(exhibition.status);

                                return (
                                    <Card
                                        key={exhibition.id}
                                        className={`border-border shadow-md hover:shadow-lg transition-all duration-300 ${cardBg} flex flex-col cursor-pointer`}
                                        onClick={() => navigate(`/dashboard/exhibitions/${exhibition.id}`)}
                                    >
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg line-clamp-2">
                                                {exhibition.title}
                                            </CardTitle>
                                            <Badge className={`${statusInfo.className} border w-fit mt-2`}>
                                                {ExhibitionStatusLabels[exhibition.status]}
                                            </Badge>
                                        </CardHeader>

                                        {/* Main content - flexible */}
                                        <CardContent className="space-y-3 flex-1">
                                            {/* Date */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(exhibition.startDate).toLocaleDateString("ar")}</span>
                                            </div>

                                            {/* Capacity */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="w-4 h-4 shrink-0" />
                                                <span>
                                                    0 / {exhibition.totalAvailableBooths} طاولة
                                                </span>
                                            </div>

                                            {/* Deadline */}
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4 shrink-0" />
                                                <span className="text-xs">
                                                    الموعد النهائي: {new Date(exhibition.finalizationDeadline).toLocaleDateString("ar")}
                                                </span>
                                            </div>
                                        </CardContent>

                                        {/* Fixed footer - Next Action and Progress */}
                                        <CardContent className="pt-0 space-y-2">
                                            <div className="pt-2 border-t border-primary">
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-muted-foreground"> التالي: {nextAction}</span>
                                                    <span className="font-medium text-xs">{currentStep} / 4</span>
                                                </div>
                                                <Progress value={progress} className="h-2" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create Exhibition Sheet */}
                <CreateExhibitionSheet
                    open={isCreateSheetOpen}
                    onOpenChange={handleSheetOpenChange}
                />
            </div>
        </TooltipProvider>
    );
}
