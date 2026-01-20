import { useState } from "react";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Mock municipalities data
const municipalities = [
    {
        id: 1,
        name: "بلدية بيروت",
        location: "بيروت",
        capacity: 500,
        image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400&h=300&fit=crop",
        gradient: "from-[hsl(239,84%,67%)] to-[hsl(230,94%,62%)]"
    },
    {
        id: 2,
        name: "بلدية طرابلس",
        location: "طرابلس",
        capacity: 400,
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
        gradient: "from-[hsl(200,84%,67%)] to-[hsl(190,94%,62%)]"
    },
    {
        id: 3,
        name: "بلدية صيدا",
        location: "صيدا",
        capacity: 350,
        image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=300&fit=crop",
        gradient: "from-[hsl(280,84%,67%)] to-[hsl(270,94%,62%)]"
    },
    {
        id: 4,
        name: "بلدية زحلة",
        location: "البقاع",
        capacity: 300,
        image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&h=300&fit=crop",
        gradient: "from-[hsl(160,84%,67%)] to-[hsl(150,94%,62%)]"
    },
    {
        id: 5,
        name: "بلدية جبيل",
        location: "جبل لبنان",
        capacity: 250,
        image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop",
        gradient: "from-[hsl(320,84%,67%)] to-[hsl(310,94%,62%)]"
    },
    {
        id: 6,
        name: "بلدية صور",
        location: "الجنوب",
        capacity: 280,
        image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
        gradient: "from-[hsl(40,84%,67%)] to-[hsl(30,94%,62%)]"
    },
];

interface RequestVenueProps {
    onNext?: () => void;
    onPrevious?: () => void;
}

export default function RequestVenue({ onNext, onPrevious }: RequestVenueProps) {
    const [selectedMunicipality, setSelectedMunicipality] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [locationFilter, setLocationFilter] = useState("الكل");

    const filteredMunicipalities = municipalities.filter(m => {
        const matchesSearch = m.name.includes(searchQuery);
        const matchesLocation = locationFilter === "الكل" || m.location === locationFilter;
        return matchesSearch && matchesLocation;
    });

    const locations = ["الكل", ...Array.from(new Set(municipalities.map(m => m.location)))];

    return (
        <div className="flex-1 flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                اختر البلدية لإقامة المعرض
            </h1>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث عن بلدية..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-[200px]">
                        <MapPin className="w-4 h-4 ml-2" />
                        <SelectValue placeholder="الموقع" />
                    </SelectTrigger>
                    <SelectContent>
                        {locations.map(loc => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Municipality Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 overflow-y-auto flex-1">
                {filteredMunicipalities.map((municipality) => (
                    <div
                        key={municipality.id}
                        onClick={() => setSelectedMunicipality(municipality.id)}
                        className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all h-fit ${selectedMunicipality === municipality.id
                            ? "border-primary ring-4 ring-primary/20"
                            : "border-border hover:border-primary/50"
                            }`}
                    >
                        {/* Image */}
                        <div className="relative h-32 overflow-hidden">
                            <img
                                src={municipality.image}
                                alt={municipality.name}
                                className="w-full h-full object-cover"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-br ${municipality.gradient} opacity-40`} />
                        </div>

                        {/* Content */}
                        <div className="p-4 bg-card">
                            <h3 className="font-bold text-foreground mb-2">{municipality.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin className="w-4 h-4" />
                                <span>{municipality.location}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                السعة: {municipality.capacity} شخص
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center pt-6 border-t border-border">
                <button
                    onClick={onPrevious}
                    disabled
                    className="inline-flex items-center gap-2 px-6 py-3 text-muted-foreground bg-muted/50 rounded-xl font-medium cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                </button>
                <button
                    onClick={onNext}
                    disabled={!selectedMunicipality}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
