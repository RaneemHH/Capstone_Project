import { useEffect, useState } from "react";
import { financialAidService } from "@/services/financial-aid-service";
import type { FinancialAidResponse } from "@/types/financial-aid";
import { FinancialAidStatus } from "@/types/financial-aid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, DollarSign, Calendar, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RequestDetailsDialog } from "@/components/financial-aid/request-details-dialog";
import { ReviewRequestDialog } from "@/components/financial-aid/review-request-dialog";

export default function OrgFinancialAid() {
  const [requests, setRequests] = useState<FinancialAidResponse[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<FinancialAidResponse | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch based on active tab
      if (activeTab === "pending") {
        const data = await financialAidService.getPendingRequests();
        setRequests(data.requests);
      } else if (activeTab === "all") {
        const data = await financialAidService.getAllRequests();
        setRequests(data.requests);
      } else {
        const data = await financialAidService.getAllRequests(activeTab as FinancialAidStatus);
        setRequests(data.requests);
      }

      // Fetch donors and stats
      const [statsData] = await Promise.all([
        financialAidService.getStats()
      ]);
      
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleViewDetails = (request: FinancialAidResponse) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleReview = (request: FinancialAidResponse) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  const handleDisburse = async (requestId: number) => {
    try {
      await financialAidService.disburseAid(requestId);
      toast.success("تم صرف المساعدة المالية بنجاح");
      fetchData();
    } catch (error) {
      console.error("Failed to disburse aid:", error);
      toast.error("فشل في صرف المساعدة المالية");
    }
  };

  const handleCancel = async (requestId: number) => {
    try {
      await financialAidService.cancelRequest(requestId);
      toast.success("تم إلغاء الطلب بنجاح");
      fetchData();
    } catch (error) {
      console.error("Failed to cancel request:", error);
      toast.error("فشل في إلغاء الطلب");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      PENDING: { label: "قيد الانتظار", variant: "secondary" },
      APPROVED: { label: "مقبول", variant: "default" },
      DISBURSED: { label: "تم الصرف", variant: "default" },
      REJECTED: { label: "مرفوض", variant: "destructive" },
      CANCELLED: { label: "ملغى", variant: "outline" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">إدارة المساعدات المالية</h1>
        <p className="text-muted-foreground mt-1">
          إدارة ومراجعة طلبات المساعدة المالية
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              إجمالي الطلبات
            </CardDescription>
            <CardTitle className="text-2xl">{Number(stats.totalRequests) || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              قيد الانتظار
            </CardDescription>
            <CardTitle className="text-2xl">{Number(stats.pendingRequests) || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              مقبول
            </CardDescription>
            <CardTitle className="text-2xl">{Number(stats.approvedRequests) || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              الميزانية المتاحة
            </CardDescription>
            <CardTitle className="text-xl">{Number(stats.availableBudget || 0).toLocaleString()} $</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value={FinancialAidStatus.APPROVED}>مقبول</TabsTrigger>
          <TabsTrigger value={FinancialAidStatus.DISBURSED}>تم الصرف</TabsTrigger>
          <TabsTrigger value={FinancialAidStatus.REJECTED}>مرفوض</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>الطلبات</CardTitle>
              <CardDescription>
                {activeTab === "pending" && "الطلبات قيد الانتظار للمراجعة"}
                {activeTab === "all" && "جميع الطلبات"}
                {activeTab === FinancialAidStatus.APPROVED && "الطلبات المقبولة"}
                {activeTab === FinancialAidStatus.DISBURSED && "الطلبات المصروفة"}
                {activeTab === FinancialAidStatus.REJECTED && "الطلبات المرفوضة"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{request.studentName}</h3>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(request.requestedAt).toLocaleDateString("ar-SA")}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {request.requestedAmount.toLocaleString()} $
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(request)}
                            >
                              التفاصيل
                            </Button>
                            {request.status === "PENDING" && (
                              <Button
                                size="sm"
                                onClick={() => handleReview(request)}
                              >
                                مراجعة
                              </Button>
                            )}
                            {request.status === "APPROVED" && (
                              <Button
                                size="sm"
                                onClick={() => handleDisburse(request.id)}
                              >
                                <CheckCircle className="w-4 h-4 ml-1" />
                                صرف
                              </Button>
                            )}
                            {(request.status === "PENDING" || request.status === "APPROVED") && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancel(request.id)}
                              >
                                <XCircle className="w-4 h-4 ml-1" />
                                إلغاء
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">الجامعة:</span>
                            <span className="font-medium ml-2">{request.universityName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">التخصص:</span>
                            <span className="font-medium ml-2">{request.fieldOfStudy}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">المعدل:</span>
                            <span className="font-medium ml-2">{request.gpa.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <RequestDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        request={selectedRequest}
      />
      
      <ReviewRequestDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        request={selectedRequest}
        onSuccess={fetchData}
      />
    </div>
  );
}

