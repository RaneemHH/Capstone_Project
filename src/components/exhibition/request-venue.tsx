import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useVenueStore } from "@/stores/venue-store";
import { useMunicipalityStore } from "@/stores/municipality-store";
import { useVenueRequestStore } from "@/stores/venue-request-store";
import { venueRequestService } from "@/services/venue-request-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    MapPin,
    Users,
    Maximize2,
    Loader2,
    Building2,
    CheckCircle2,
    AlertCircle,
    Lock,
    FileText,
    Filter,
    X,
    ArrowRight
} from "lucide-react";
import { formatRentalFee, formatSpace, getAvailabilityLabel, getAvailabilityBadgeClass } from "@/types/venue";
import { VenueRequestStatusLabels, getVenueRequestStatusBadgeClass, type VenueRequestStatus } from "@/types/municipality";
import VenueRegistrationDialog from "@/components/exhibition/venue-registration-dialog";

export default function RequestVenue() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: exhibitionId } = useParams();
    const { venues, isLoading, error, selectedVenueId, fetchVenuesByMunicipality, setSelectedVenue } = useVenueStore();
    const { selectedMunicipalityId } = useMunicipalityStore();
    const { venueRequests, fetchVenueRequests } = useVenueRequestStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedVenueForRegistration, setSelectedVenueForRegistration] = useState<number | null>(null);
    const [capacityFilter, setCapacityFilter] = useState<string>("all");
    const [priceFilter, setPriceFilter] = useState<string>("all");
    const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");

    // Get municipalityId from navigation state or from store
    const municipalityId = location.state?.municipalityId || selectedMunicipalityId;

    useEffect(() => {
        if (municipalityId) {
            fetchVenuesByMunicipality(municipalityId);
        }
        if (exhibitionId) {
            fetchVenueRequests(Number(exhibitionId));
        }
    }, [municipalityId, exhibitionId, fetchVenuesByMunicipality, fetchVenueRequests]);

    const filteredVenues = venues.filter(venue => {
        // Search filter
        const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            venue.address.toLowerCase().includes(searchQuery.toLowerCase());

        // Capacity filter
        const matchesCapacity = capacityFilter === "all" ||
            (capacityFilter === "small" && venue.maxCapacity < 200) ||
            (capacityFilter === "medium" && venue.maxCapacity >= 200 && venue.maxCapacity < 500) ||
            (capacityFilter === "large" && venue.maxCapacity >= 500);

        // Price filter
        const matchesPrice = priceFilter === "all" ||
            (priceFilter === "low" && venue.rentalFeePerDay < 200) ||
            (priceFilter === "medium" && venue.rentalFeePerDay >= 200 && venue.rentalFeePerDay < 500) ||
            (priceFilter === "high" && venue.rentalFeePerDay >= 500);

        // Availability filter
        const matchesAvailability = availabilityFilter === "all" ||
            (availabilityFilter === "available" && venue.available) ||
            (availabilityFilter === "unavailable" && !venue.available);

        return matchesSearch && matchesCapacity && matchesPrice && matchesAvailability;
    });

    // Helper function to get venue request status
    const getVenueRequestStatus = (venueId: number) => {
        return venueRequests.find(req => req.venueId === venueId);
    };

    // Check if there's a pending request
    const hasPendingRequest = venueRequests.some(req => req.status === 'PENDING');
    const pendingRequest = venueRequests.find(req => req.status === 'PENDING');

    // Check if there's an approved request
    const hasApprovedRequest = venueRequests.some(req => req.status === 'APPROVED');
    const approvedRequest = venueRequests.find(req => req.status === 'APPROVED');

    const handleVenueSelect = (venueId: number) => {
        setSelectedVenue(venueId);
    };

    const handleRegisterClick = (venueId: number) => {
        setSelectedVenueForRegistration(venueId);
        setDialogOpen(true);
    };

    const handleRegister = async (orgNotes: string) => {
        if (!exhibitionId || !selectedVenueForRegistration) {
            toast.error("معرف المعرض أو المكان غير موجود");
            setDialogOpen(false);
            return;
        }

        setIsSubmitting(true);
        try {
            // Set response deadline to 7 days from now
            const responseDeadline = new Date();
            responseDeadline.setDate(responseDeadline.getDate() + 7);

            await venueRequestService.createVenueRequest({
                exhibitionId: Number(exhibitionId),
                venueId: selectedVenueForRegistration,
                orgNotes: orgNotes || "طلب حجز مكان للمعرض",
                responseDeadline: responseDeadline.toISOString()
            });

            toast.success("تم التسجيل بنجاح", {
                description: "تم إرسال طلب حجز المكان إلى البلدية"
            });

            setDialogOpen(false);
            setSelectedVenueForRegistration(null);

            // Navigate back or to next step after successful registration
            setTimeout(() => {
                navigate(`/dashboard/exhibitions/${exhibitionId}`);
            }, 1500);
        } catch (error) {
            console.error('Failed to create venue request:', error);
            toast.error("فشل التسجيل", {
                description: error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الطلب"
            });
            setDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري تحميل الأماكن...</p>
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
                            onClick={() => municipalityId && fetchVenuesByMunicipality(municipalityId)}
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

    if (!municipalityId) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                            يرجى اختيار بلدية أولاً
                        </p>
                        <Button onClick={() => navigate(-1)}>
                            العودة لاختيار البلدية
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col p-6">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="hover:bg-accent"
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                        اختر المكان للمعرض
                    </h1>
                </div>
                <p className="text-muted-foreground">
                    اختر المكان المناسب من الأماكن المتاحة
                </p>
            </div>

            {/* Approved Request Alert */}
            {hasApprovedRequest && (
                <Alert className="mb-6 border-t-4 border-green-500 bg-green-50 dark:bg-green-950 rounded-sm relative">
                    <CheckCircle2 className="h-5 w-5 !text-green-600 dark:!text-green-500" />
                    <div>
                        <AlertTitle className="text-green-800 dark:text-green-800 text-sm font-bold mb-1">
                            تم قبول طلب المكان
                        </AlertTitle>
                        <AlertDescription className="text-green-800 dark:text-green-800 text-sm">
                            تم قبول طلبك للمكان "{approvedRequest?.venueName}". لا يمكن تسجيل أكثر من مكان لنفس المعرض.
                        </AlertDescription>
                    </div>
                </Alert>
            )}



            {/* Pending Request Alert */}
            {
                hasPendingRequest && (
                    <Alert className="mb-6 border-t-4 border-accent bg-accent/10 dark:bg-accent relative">
                        <AlertCircle className="h-5 w-5 !text-accent dark:!text-accent shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <AlertTitle className="text-accent dark:text-accent text-sm font-bold mb-1">
                                في انتظار رد البلدية
                            </AlertTitle>
                            <AlertDescription className="text-accent dark:text-accent text-sm">
                                لديك طلب قيد المراجعة للمكان "{pendingRequest?.venueName}". لا يمكنك إرسال طلبات جديدة حتى ترد البلدية على طلبك الحالي.
                            </AlertDescription>
                        </div>


                    </Alert>
                )
            }

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="ابحث عن مكان..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 h-9"
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex gap-3 flex-wrap items-center">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">فلترة:</span>
                    </div>

                    <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="حسب السعة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع السعات</SelectItem>
                            <SelectItem value="small">صغيرة (&lt; 200)</SelectItem>
                            <SelectItem value="medium">متوسطة (200-500)</SelectItem>
                            <SelectItem value="large">كبيرة (&gt; 500)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="حسب السعر" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع الأسعار</SelectItem>
                            <SelectItem value="low">منخفض (&lt; $200)</SelectItem>
                            <SelectItem value="medium">متوسط ($200-$500)</SelectItem>
                            <SelectItem value="high">مرتفع (&gt; $500)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                        <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="حسب الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع الحالات</SelectItem>
                            <SelectItem value="available">متاح</SelectItem>
                            <SelectItem value="unavailable">غير متاح</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Venues Grid */}
            {
                filteredVenues.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-center">
                                {searchQuery ? "لا توجد أماكن تطابق البحث" : "لا توجد أماكن متاحة في هذه البلدية"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 overflow-y-auto flex-1">
                        {filteredVenues.map((venue, index) => {
                            // Mock images array
                            const mockImages = [
                                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
                                "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop",
                                "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop",
                                "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop",
                                "https://images.unsplash.com/photo-1519167758481-83f29da8c8b0?w=400&h=300&fit=crop",
                            ];

                            const isRegisteredVenue = approvedRequest?.venueId === venue.id || pendingRequest?.venueId === venue.id;
                            const venueRequestStatus = getVenueRequestStatus(venue.id);

                            return (
                                <Card
                                    key={venue.id}
                                    className={`transition-all duration-200 overflow-hidden p-0 ${(hasPendingRequest || hasApprovedRequest)
                                        ? "opacity-60 cursor-not-allowed"
                                        : "cursor-pointer hover:shadow-lg"
                                        } ${selectedVenueId === venue.id
                                            ? "border-primary border-2 bg-primary/5"
                                            : "hover:border-primary/50"
                                        }`}
                                    onClick={() => !(hasPendingRequest || hasApprovedRequest) && handleVenueSelect(venue.id)}
                                >
                                    {/* Image with Gradient Overlay and Venue Name */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={mockImages[index % mockImages.length]}
                                            alt={venue.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                        {/* Venue Name on Image */}
                                        <div className="absolute bottom-3 right-3 left-3">
                                            <h3 className="text-white font-bold text-xl drop-shadow-lg">
                                                {venue.name}
                                            </h3>
                                        </div>

                                        {/* Top Left Badges */}
                                        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                                            <Badge
                                                className={`${getAvailabilityBadgeClass(venue.available)} font-semibold shadow-md backdrop-blur-sm flex items-center gap-1`}
                                            >
                                                {venue.available ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                {getAvailabilityLabel(venue.available)}
                                            </Badge>

                                            {venueRequestStatus && (
                                                <Badge
                                                    variant="outline"
                                                    className={`${getVenueRequestStatusBadgeClass(venueRequestStatus.status as VenueRequestStatus)} font-semibold shadow-md backdrop-blur-sm bg-white/90 flex items-center gap-1`}
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    {VenueRequestStatusLabels[venueRequestStatus.status as VenueRequestStatus]}
                                                </Badge>
                                            )}

                                            {isRegisteredVenue && (
                                                <Badge className="bg-green-600 text-white font-bold shadow-md backdrop-blur-sm border-green-400 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    المكان المختار
                                                </Badge>
                                            )}
                                        </div>

                                        {selectedVenueId === venue.id && !isRegisteredVenue && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 className="w-7 h-7 text-primary bg-white rounded-full shadow-lg" />
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-4 space-y-4">
                                        {/* Address */}
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                                            <span className="text-muted-foreground line-clamp-2">{venue.address}</span>
                                        </div>

                                        {/* Two Column Info Grid */}
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 shrink-0 text-blue-600" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">السعة</span>
                                                    <span className="text-sm font-bold text-foreground">{venue.maxCapacity.toLocaleString('ar')}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Maximize2 className="w-4 h-4 shrink-0 text-purple-600" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">المساحة</span>
                                                    <span className="text-sm font-bold text-foreground">{formatSpace(venue.spaceSqm)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price - Full Width, Prominent */}
                                        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                                            <div className="flex items-center gap-2">
                                                {/* <DollarSign className="w-5 h-5 text-primary" /> */}
                                                <span className="text-lg font-bold text-foreground">
                                                    {formatRentalFee(venue.rentalFeePerDay)}
                                                </span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">/ يوم</span>
                                        </div>

                                        {/* Action Button */}
                                        <Button
                                            className={`w-full transition-all duration-200 ${isRegisteredVenue
                                                ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                                                : selectedVenueId === venue.id
                                                    ? "bg-primary hover:bg-primary/90 shadow-md"
                                                    : ""
                                                }`}
                                            variant={selectedVenueId === venue.id || isRegisteredVenue ? "default" : "outline"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!(hasPendingRequest || hasApprovedRequest)) {
                                                    handleVenueSelect(venue.id);
                                                    handleRegisterClick(venue.id);
                                                }
                                            }}
                                            disabled={!venue.available || isSubmitting || !!venueRequestStatus || hasPendingRequest || hasApprovedRequest}
                                        >
                                            {isSubmitting
                                                ? "جاري التسجيل..."
                                                : hasApprovedRequest
                                                    ? (approvedRequest?.venueId === venue.id ? " تم اختيار هذا المكان" : "لا يمكنك اختيار مكان آخر")
                                                    : hasPendingRequest
                                                        ? (pendingRequest?.venueId === venue.id ? "⏳ في انتظار الرد لهذا المكان" : "لا يمكنك اختيار مكان آخر")
                                                        : venueRequestStatus
                                                            ? "تم التسجيل"
                                                            : venue.available
                                                                ? "تسجيل هذا المكان"
                                                                : "غير متاح"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )
            }

            {/* Venue Registration Dialog */}
            <VenueRegistrationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                venueName={venues.find(v => v.id === selectedVenueForRegistration)?.name || ""}
                onConfirm={handleRegister}
                isLoading={isSubmitting}
            />
        </div >
    );
}
