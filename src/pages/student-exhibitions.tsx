import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

export default function StudentExhibitions() {
    // Placeholder data - will be replaced with API data
    const exhibitions = [
        {
            id: 1,
            name: "معرض التوجيه المهني 2026",
            description: "معرض سنوي للتوجيه المهني والتعليم العالي",
            startDate: "2026-03-15",
            endDate: "2026-03-17",
            venue: "قاعة المؤتمرات الرئيسية",
            expectedVisitors: 500,
            status: "UPCOMING"
        },
        {
            id: 2,
            name: "معرض الجامعات 2026",
            description: "معرض للتعريف بالجامعات والتخصصات المتاحة",
            startDate: "2026-04-10",
            endDate: "2026-04-12",
            venue: "مركز المعارض",
            expectedVisitors: 1000,
            status: "UPCOMING"
        }
    ];

    return (
        <div className="h-full overflow-y-auto scrollbar-hide">
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">المعارض المتاحة</h1>
                    <p className="text-muted-foreground mt-1">
                        تصفح المعارض والفعاليات القادمة
                    </p>
                </div>

                {/* Exhibitions Grid */}
                {exhibitions.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">لا توجد معارض متاحة</h3>
                            <p className="text-muted-foreground text-center">
                                لا توجد معارض قادمة في الوقت الحالي
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exhibitions.map((exhibition) => (
                            <Card key={exhibition.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between mb-2">
                                        <CardTitle className="text-xl flex-1">{exhibition.name}</CardTitle>
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            قادم
                                        </span>
                                    </div>
                                    <CardDescription>{exhibition.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>{exhibition.startDate} - {exhibition.endDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            <span>{exhibition.venue}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            <span>{exhibition.expectedVisitors} زائر متوقع</span>
                                        </div>
                                    </div>
                                    <Button className="w-full">
                                        عرض التفاصيل والتسجيل
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
