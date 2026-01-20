import { useEffect } from "react";
import { useMunicipalityStore } from "@/stores/municipality-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Municipality() {
    const { municipalities, isLoading, error, selectedMunicipalityId, fetchMunicipalities, setSelectedMunicipality } = useMunicipalityStore();

    useEffect(() => {
        fetchMunicipalities();
    }, [fetchMunicipalities]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري تحميل البلديات...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive text-center">{error}</p>
                        <Button
                            onClick={() => fetchMunicipalities()}
                            className="mt-4 w-full"
                            variant="outline"
                        >
                            إعادة المحاولة
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">اختر البلدية</h2>
                <p className="text-muted-foreground">
                    اختر البلدية التي تريد طلب مكان المعرض منها
                </p>
            </div>

            {municipalities.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                            لا توجد بلديات متاحة حالياً
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {municipalities.map((municipality) => (
                        <Card
                            key={municipality.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedMunicipalityId === municipality.id
                                    ? "border-primary border-2 bg-primary/5"
                                    : "hover:border-primary/50"
                                }`}
                            onClick={() => setSelectedMunicipality(municipality.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">{municipality.name}</CardTitle>
                                    {selectedMunicipalityId === municipality.id && (
                                        <Badge className="bg-primary">محدد</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span>{municipality.region}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{municipality.contactEmail}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <span>{municipality.contactPhone}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedMunicipalityId && (
                <div className="flex justify-end mt-6">
                    <Button size="lg" className="px-8">
                        متابعة إلى اختيار المكان
                    </Button>
                </div>
            )}
        </div>
    );
}
