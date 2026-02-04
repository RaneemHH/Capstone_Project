import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoreVertical, FolderUp, FileText, Cloud, Upload } from "lucide-react";
import { Spinner } from "@/components/ui/minimal-tiptap/components/spinner";
import TestList from "@/components/dashboard/test-list";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMetricsByBaseTestId } from "@/services/metric-service";
import { useMetricsStore } from "@/stores/metrics-store";
import { toast } from "sonner";
import { 
    uploadDocument, 
    getDocumentsByBaseTest, 
    deleteDocument,
    type CareerDocumentResponse 
} from "@/services/career-document-service";

export default function BaseTest() {
    const { baseTestId } = useParams();
    const navigate = useNavigate();
    const { metrics, setMetrics, setLoading } = useMetricsStore();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [documents, setDocuments] = useState<CareerDocumentResponse[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Define color schemes using colors from index.css
    const colorSchemes = [
        "bg-primary",      // #89ADFF - blue
        "bg-secondary",    // #BDE4FF - light blue
        "bg-accent",       // #EF7148 - orange
        "bg-muted",        // #DEFC8E - lime
    ];

    useEffect(() => {
        // Fetch base test details, metrics, and documents
        const fetchBaseTest = async () => {
            try {
                setIsLoading(true);
                
                if (baseTestId) {
                    setLoading(true);
                    
                    // Fetch metrics for this base test
                    const fetchedMetrics = await getMetricsByBaseTestId(Number(baseTestId));
                    setMetrics(fetchedMetrics);
                    
                    // Fetch documents for this base test
                    try {
                        const fetchedDocuments = await getDocumentsByBaseTest(Number(baseTestId));
                        setDocuments(fetchedDocuments);
                    } catch (docError) {
                        console.error("Failed to fetch documents:", docError);
                        // Don't show error toast for documents, just log it
                    }
                }
            } catch (error) {
                console.error("Failed to fetch base test:", error);
                toast.error("فشل في تحميل بيانات الاختبار");
            } finally {
                setIsLoading(false);
                setLoading(false);
            }
        };

        if (baseTestId) {
            fetchBaseTest();
        }
    }, [baseTestId, setLoading, setMetrics]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        
        try {
            setIsUploading(true);
            
            // Upload document with baseTestId
            const uploadedDoc = await uploadDocument(
                file,
                baseTestId ? Number(baseTestId) : undefined
            );
            
            // Add the new document to the list
            setDocuments(prev => [...prev, uploadedDoc]);
            
            toast.success(`تم رفع الملف: ${file.name}`);
            setIsUploadDialogOpen(false);
            
            // Reset the input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error("Failed to upload document:", error);
            toast.error("فشل في رفع الملف");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div> */}
                    <Spinner />
                    <p className="text-muted-foreground">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    const handleOpenDocument = async (documentId: number) => {
        try {
            // For now, open document details
            // TODO: Implement download when backend endpoint is ready
            toast.info(`فتح المستند #${documentId}`);
            console.log("Opening document:", documentId);
        } catch (error) {
            console.error("Failed to open document:", error);
            toast.error("فشل في فتح المستند");
        }
    };

    const handleDeleteDocument = async (documentId: number) => {
        try {
            await deleteDocument(documentId);
            
            // Remove the document from the list
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            
            toast.success("تم حذف المستند بنجاح");
        } catch (error) {
            console.error("Failed to delete document:", error);
            toast.error("فشل في حذف المستند");
        }
    };

    return (
        <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <div className="mb-6">
                {/* <h1 className="text-3xl font-bold text-foreground">
                    تفاصيل الاختبار الأساسي  {baseTestId} 
                </h1> */}
                {/* <p className="text-muted-foreground mt-2">
                    عرض تفاصيل ومعلومات الاختبار الأساسي
                </p> */}
            </div>

            {/* Documents Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">المستندات</h2>
                    <Button
                        onClick={() => setIsUploadDialogOpen(true)}
                        size="sm"
                        className="gap-2"
                    >
                        <FolderUp className="w-4 h-4" />
                        رفع مستند
                    </Button>
                </div>
                
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {documents.length > 0 ? documents.map((doc) => {
                            const fileExtension = doc.fileType?.toLowerCase();
                            const isWord = fileExtension === 'docx' || fileExtension === 'doc';
                            const isPdf = fileExtension === 'pdf';
                            
                            return (
                                <div
                                    key={doc.id}
                                    className="w-52 cursor-pointer hover:shadow-lg transition-shadow border-2 rounded-lg relative overflow-hidden bg-card"
                                    onClick={() => handleOpenDocument(doc.id)}
                                >
                                    {/* Document info */}
                                    <div className="p-3 space-y-1">
                                        <div className="flex items-start gap-2 justify-between">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                {isPdf ? (
                                                    <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center shrink-0">
                                                        <span className="text-white text-xs font-bold">P</span>
                                                    </div>
                                                ) : isWord ? (
                                                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
                                                        <span className="text-white text-xs font-bold">W</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center shrink-0">
                                                        <FileText className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-sm truncate" title={doc.originalFilename}>
                                                        {doc.originalFilename}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        Opened {new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* 3-dot menu */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-muted shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenDocument(doc.id);
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <span>فتح في نافذة جديدة</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteDocument(doc.id);
                                                        }}
                                                        className="cursor-pointer text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                    >
                                                        <span>حذف</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="w-full text-center py-8">
                                <p className="text-muted-foreground">لا توجد مستندات</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Right side - Metrics */}
                <div className="lg:col-span-1 space-y-4 bg-secondary/50 border-2 border-primary/30 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">المقاييس</h2>
                        <Button
                            onClick={() => navigate("addMetric")}
                            size="sm"
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            إضافة مقياس
                        </Button>
                    </div>

                    {metrics.length > 0 ? (
                        <div className="space-y-3">
                            {metrics.map((metric, index) => {
                                const bgColor = colorSchemes[index % colorSchemes.length];
                                
                                return (
                                    <Card
                                        key={metric.id}
                                        className={`${bgColor} border-0 shadow-lg hover:shadow-xl transition-shadow relative`}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-lg font-bold text-white flex-1">
                                                    {metric.label} - ({metric.code})
                                                </CardTitle>
                                                
                                                {/* 3-dot menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-white hover:bg-white/20"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="w-30">
                                                        <div dir="rtl">
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`editMetric/${metric.id}`);
                                                                }}
                                                                className="gap-2 cursor-pointer hover:text-destructive-foreground hover:bg-destructive"
                                                            >
                                                                
                                                                <span>تعديل المقياس</span>
                                                                {/* <Pencil className="h-4 w-4" /> */}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`deleteMetric/${metric.id}`);
                                                                }}
                                                                className="gap-2 cursor-pointer text-foreground hover:text-destructive-foreground hover:bg-destructive"
                                                            >
                                                                <span>حذف المقياس</span>
                                                                {/* <Trash2 className="h-4 w-4 text-destructive" /> */}

                                                            </DropdownMenuItem>
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <p className="text-sm text-white/90 leading-relaxed">
                                                {metric.description || "لا يوجد وصف"}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Plus className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">لا توجد مقاييس بعد</p>
                            <Button
                                onClick={() => navigate("addMetric")}
                                size="sm"
                                variant="outline"
                            >
                                إضافة أول مقياس
                            </Button>
                        </div>
                    )}
                </div>

                {/* Left side - Tests */}
                <div className="lg:col-span-2">
                    <TestList />
                </div>
            </div>

            {/* Upload Document Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent className="sm:max-w-md" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">رفع مستند</DialogTitle>
                        <DialogDescription className="text-right">
                            اختر ملفًا من جهازك أو اسحبه وأفلته هنا
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                            isDragging 
                                ? 'border-primary bg-primary/5' 
                                : 'border-muted-foreground/25'
                        }`}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <Cloud className="w-24 h-24 text-muted-foreground/40" />
                            
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-2"
                                disabled={isUploading}
                            >
                                <Upload className="w-4 h-4" />
                                {isUploading ? 'جاري الرفع...' : 'Browse'}
                            </Button>
                            
                            <p className="text-sm text-muted-foreground">
                                or drag a file here
                            </p>
                        </div>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            accept=".pdf,.doc,.docx,.txt"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
