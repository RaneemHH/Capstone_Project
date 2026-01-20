import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Mail, Phone, Building2, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock participants data
const mockParticipants = [
    {
        id: 1,
        name: "جامعة بيروت العربية",
        contactPerson: "د. أحمد محمود",
        email: "ahmad.mahmoud@bau.edu.lb",
        phone: "+961 1 300110",
        type: "جامعة",
        tablesRequested: 2,
        status: "موافق" as const,
        submittedDate: "2026-01-15",
    },
    {
        id: 2,
        name: "الجامعة الأمريكية في بيروت",
        contactPerson: "د. سارة حسن",
        email: "sarah.hassan@aub.edu.lb",
        phone: "+961 1 350000",
        type: "جامعة",
        tablesRequested: 3,
        status: "قيد_المراجعة" as const,
        submittedDate: "2026-01-16",
    },
    {
        id: 3,
        name: "جامعة القديس يوسف",
        contactPerson: "د. جورج خوري",
        email: "george.khoury@usj.edu.lb",
        phone: "+961 1 421000",
        type: "جامعة",
        tablesRequested: 2,
        status: "موافق" as const,
        submittedDate: "2026-01-14",
    },
    {
        id: 4,
        name: "الجامعة اللبنانية",
        contactPerson: "د. ليلى عبدالله",
        email: "layla.abdullah@ul.edu.lb",
        phone: "+961 1 612000",
        type: "جامعة",
        tablesRequested: 4,
        status: "مرفوض" as const,
        submittedDate: "2026-01-13",
    },
    {
        id: 5,
        name: "جامعة الروح القدس - الكسليك",
        contactPerson: "د. مارون سليم",
        email: "maron.salim@usek.edu.lb",
        phone: "+961 9 600000",
        type: "جامعة",
        tablesRequested: 2,
        status: "موافق" as const,
        submittedDate: "2026-01-17",
    },
    {
        id: 6,
        name: "الجامعة اللبنانية الأمريكية",
        contactPerson: "د. نادين كرم",
        email: "nadine.karam@lau.edu.lb",
        phone: "+961 1 786456",
        type: "جامعة",
        tablesRequested: 3,
        status: "قيد_المراجعة" as const,
        submittedDate: "2026-01-18",
    },
    {
        id: 7,
        name: "جامعة البلمند",
        contactPerson: "د. رامي نصر",
        email: "rami.nasr@balamand.edu.lb",
        phone: "+961 6 930250",
        type: "جامعة",
        tablesRequested: 2,
        status: "موافق" as const,
        submittedDate: "2026-01-12",
    },
    {
        id: 8,
        name: "جامعة الجنان",
        contactPerson: "د. فاطمة حمود",
        email: "fatima.hamoud@jinan.edu.lb",
        phone: "+961 6 444010",
        type: "جامعة",
        tablesRequested: 1,
        status: "موافق" as const,
        submittedDate: "2026-01-19",
    },
    {
        id: 9,
        name: "الجامعة الإسلامية في لبنان",
        contactPerson: "د. حسن علي",
        email: "hassan.ali@iul.edu.lb",
        phone: "+961 7 740000",
        type: "جامعة",
        tablesRequested: 2,
        status: "قيد_المراجعة" as const,
        submittedDate: "2026-01-11",
    },
    {
        id: 10,
        name: "جامعة الكفاءات",
        contactPerson: "د. ريم صالح",
        email: "reem.saleh@gu.edu.lb",
        phone: "+961 1 815515",
        type: "جامعة",
        tablesRequested: 1,
        status: "موافق" as const,
        submittedDate: "2026-01-10",
    },
    {
        id: 11,
        name: "جامعة طرابلس",
        contactPerson: "د. عمر فارس",
        email: "omar.fares@ut.edu.lb",
        phone: "+961 6 448888",
        type: "جامعة",
        tablesRequested: 2,
        status: "مرفوض" as const,
        submittedDate: "2026-01-09",
    },
    {
        id: 12,
        name: "الجامعة الأنطونية",
        contactPerson: "د. جوزيف حداد",
        email: "joseph.haddad@ua.edu.lb",
        phone: "+961 4 524081",
        type: "جامعة",
        tablesRequested: 1,
        status: "موافق" as const,
        submittedDate: "2026-01-08",
    },
];

interface ManageParticipantsProps {
    onNext?: () => void;
    onPrevious?: () => void;
}

const ITEMS_PER_PAGE = 5;

export default function ManageParticipants({ onNext, onPrevious }: ManageParticipantsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("الكل");
    const [currentPage, setCurrentPage] = useState(1);

    // Filter participants
    const filteredParticipants = mockParticipants.filter(p => {
        const matchesSearch = p.name.includes(searchQuery) || p.contactPerson.includes(searchQuery);
        const matchesStatus = statusFilter === "الكل" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentParticipants = filteredParticipants.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "موافق":
                return (
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-green-500/20">
                        <CheckCircle2 className="w-3 h-3 ml-1" />
                        موافق
                    </Badge>
                );
            case "مرفوض":
                return (
                    <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 border-red-500/20">
                        <XCircle className="w-3 h-3 ml-1" />
                        مرفوض
                    </Badge>
                );
            case "قيد_المراجعة":
                return (
                    <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/20 border-yellow-500/20">
                        <Clock className="w-3 h-3 ml-1" />
                        قيد المراجعة
                    </Badge>
                );
            default:
                return null;
        }
    };


    return (
        <div className="flex-1 flex flex-col">
            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث عن جامعة أو شخص..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="الكل">الكل</SelectItem>
                        <SelectItem value="موافق">موافق</SelectItem>
                        <SelectItem value="قيد_المراجعة">قيد المراجعة</SelectItem>
                        <SelectItem value="مرفوض">مرفوض</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border rounded-xl overflow-hidden mb-6 flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">الجامعة</TableHead>
                                <TableHead className="text-right">الشخص المسؤول</TableHead>
                                <TableHead className="text-right">معلومات التواصل</TableHead>
                                <TableHead className="text-right">الطاولات</TableHead>
                                <TableHead className="text-right">تاريخ التقديم</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentParticipants.length > 0 ? (
                                currentParticipants.map((participant) => (
                                    <TableRow key={participant.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-primary" />
                                                <span>{participant.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{participant.contactPerson}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{participant.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{participant.phone}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{participant.tablesRequested}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>{participant.submittedDate}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(participant.status)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        لا توجد نتائج
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t p-4 flex items-center justify-between bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                            عرض {startIndex + 1} - {Math.min(endIndex, filteredParticipants.length)} من {filteredParticipants.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                                السابق
                            </button>
                            <span className="text-sm text-muted-foreground px-2">
                                صفحة {currentPage} من {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                التالي
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center pt-6 border-t border-border">
                <button
                    onClick={onPrevious}
                    className="inline-flex items-center gap-2 px-6 py-3 text-foreground bg-muted hover:bg-muted/80 rounded-xl font-medium transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                </button>
                <button
                    onClick={onNext}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors font-medium shadow-sm"
                >
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
