import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, MapPin, TrendingUp, TrendingDown, Loader2, Check, X } from "lucide-react";
import Lottie from "lottie-react";
import Animation from "../assets/animations/Customer_Support.json";
import { useVenueRequestStore } from "@/stores/venue-request-store";
import { VenueRequestStatusLabels, getVenueRequestStatusBadgeClass } from "@/types/municipality";

export default function MunicipalityDashboard() {
    const { venueRequests, isLoading, error, fetchVenueRequests, reviewVenueRequest } = useVenueRequestStore();
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const handleReview = async (requestId: number, approve: boolean) => {
        if (actionLoading) return;

        setActionLoading(requestId);
        try {
            await reviewVenueRequest(requestId, approve, approve ? "تمت الموافقة على الطلب" : "تم رفض الطلب");
        } finally {
            setActionLoading(null);
        }
    };

    // Fetch venue requests on component mount
    // TODO: Replace with actual exhibition ID from context or props
    useEffect(() => {
        // Example: Fetch requests for exhibition ID 1
        // You should replace this with the actual exhibition ID from your app context
        fetchVenueRequests(2);
    }, [fetchVenueRequests]);

    // Mock data for stats
    const stats = [
        {
            title: "إجمالي الطلبات",
            value: venueRequests.length.toString(),
            change: "+18%",
            isPositive: true,
            icon: FileText,
            color: "text-[#EF7148]",
            bgColor: "bg-[#EF7148]/10"
        },
        {
            title: "الأماكن المتاحة",
            value: "1,423",
            change: "+8%",
            isPositive: true,
            icon: MapPin,
            color: "text-[#89ADFF]",
            bgColor: "bg-[#89ADFF]/10"
        },
        {
            title: "المنظمات",
            value: "216",
            change: "+23%",
            isPositive: true,
            icon: Building2,
            color: "text-[#0F408F]",
            bgColor: "bg-[#0F408F]/10"
        },
        {
            title: "نسبة الموافقة",
            value: venueRequests.length > 0
                ? `${Math.round((venueRequests.filter(r => r.status === 'APPROVED').length / venueRequests.length) * 100)}%`
                : "0%",
            change: "-2%",
            isPositive: false,
            icon: TrendingUp,
            color: "text-[#DEFC8E]",
            bgColor: "bg-[#DEFC8E]/20"
        }
    ];

    // Format date to Arabic
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-background p-6 flex flex-col min-h-screen lg:min-h-0 lg:h-[650px] lg:overflow-hidden" dir="rtl">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="border-border">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                                        <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {stat.change}
                                            </span>
                                            {stat.isPositive ? (
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div className={`${stat.bgColor} ${stat.color} p-2 rounded-full`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:flex-1 lg:overflow-hidden">
                {/* Recent Requests */}
                <Card className="lg:col-span-2 border-border flex flex-col lg:overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-foreground">الطلبات الأخيرة</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 lg:overflow-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="mr-3 text-muted-foreground">جاري تحميل الطلبات...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <p className="text-red-600">{error}</p>
                            </div>
                        ) : venueRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">رقم الطلب</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">تاريخ الإنشاء</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">اسم المكان</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">العنوان</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الحالة</th>
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {venueRequests.slice(0, 5).map((request) => (
                                            <tr key={request.id} className="border-b border-border last:border-0">
                                                <td className="py-4 px-4 text-sm font-medium text-foreground">#{request.id}</td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">{formatDate(request.requestedAt)}</td>
                                                <td className="py-4 px-4 text-sm text-foreground">{request.venueName}</td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">{request.venueAddress}</td>
                                                <td className="py-4 px-4">
                                                    <Badge className={getVenueRequestStatusBadgeClass(request.status)}>
                                                        {VenueRequestStatusLabels[request.status]}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    {request.status === 'PENDING' && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleReview(request.id, true)}
                                                                disabled={actionLoading === request.id}
                                                            >
                                                                {actionLoading === request.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleReview(request.id, false)}
                                                                disabled={actionLoading === request.id}
                                                            >
                                                                {actionLoading === request.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Promotional Card */}
                <Card className="border-0 bg-gradient-to-br from-[#89ADFF] to-[#0F408F] text-white overflow-hidden relative">
                    <CardContent className="p-6 relative z-10">
                        <h3 className="text-xl font-bold mb-3">
                            مرحباً بك في لوحة التحكم
                        </h3>
                        <p className="text-sm text-white/90 mb-6">
                            راجع طلبات الأماكن الجديدة واتخذ القرارات المناسبة لخدمة المجتمع بشكل أفضل
                        </p>
                        <Lottie
                            animationData={Animation}
                            loop={true}
                        />
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#BDE4FF]/30 to-transparent" />
                </Card>
            </div>
        </div>
    );
}
