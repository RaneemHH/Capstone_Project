import { useEffect, useState } from "react";
import { financialAidService } from "@/services/financial-aid-service";
import type { FinancialAidResponse } from "@/types/financial-aid";
import { FinancialAidStatus } from "@/types/financial-aid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { RequestDetailsDialog } from "@/components/financial-aid/request-details-dialog";
import { ReviewRequestDialog } from "@/components/financial-aid/review-request-dialog";
import { RadialChart } from "@/components/charts/radial-chart";
import { ChartScatter } from "@/components/charts/chart-scatter";
import type { ChartConfig } from "@/components/ui/chart";
import { getMergedFinancialAidData } from "@/mockDataForCharts/mockDataFinancialAid";
import TotalRequestsAnimation from "@/assets/animations/total-requests-animation.json";
import PendingRequestsAnimation from "@/assets/animations/waiting_requests_animation.json";
import ApprovedRequestsAnimation from "@/assets/animations/accepted-requests-animation.json";
import WalletAnimation from "@/assets/animations/wallet_animation.json";
import Lottie from "lottie-react";

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

  // Merge mock data with real data for demo
  const displayScatterData = getMergedFinancialAidData(null); // Replace null with real API data when available

  return (
    <div className="p-6 space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Scatter Chart - Left (3 columns, 2 rows) */}
        <div className="md:col-span-3 md:row-span-2 h-100">
          <ChartScatter
            data={displayScatterData}
            title="توزيع المساعدات المالية"
            description="عرض عدد الطلبات والمبالغ المطلوبة لكل جامعة"
          />
        </div>

        {/* Stats Cards - Right (2 columns, each card takes 1 cell) */}
        {/* Total Requests Card */}
        <Card className="flex flex-col items-center">
          <CardContent className="pt-2 pb-1 px-2">
            <div className="relative flex items-center justify-center w-16 h-16">
              <Lottie animationData={TotalRequestsAnimation} loop={true} style={{ width: '50px', height: '50px' }} />
            </div>
            <div className="mt-1 text-center">
              <div className="text-xs font-medium text-muted-foreground">
                إجمالي الطلبات - {Number(stats.totalRequests) || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests Stat with Animation */}
        <RadialChart
          title="قيد الانتظار"
          value={Number(stats.pendingRequests) || 0}
          maxValue={Number(stats.totalRequests) || 0}
          fillColor="var(--chart-2)"
          config={{
            value: {
              label: "Requests",
              color: "var(--chart-2)",
            },
          } satisfies ChartConfig}
          animationData={PendingRequestsAnimation}
          innerRadius={25}
          outerRadius={35}
        />

        {/* Approved Requests Stat with Animation */}
        <RadialChart
          title="مقبول"
          value={Number(stats.approvedRequests) || 0}
          maxValue={Number(stats.totalRequests) || 0}
          fillColor="var(--chart-3)"
          config={{
            value: {
              label: "Requests",
              color: "var(--chart-3)",
            },
          } satisfies ChartConfig}
          animationData={ApprovedRequestsAnimation}
          innerRadius={25}
          outerRadius={35}
        />

        {/* Available Budget Card */}
        <Card className="flex flex-col items-center">
          <CardContent className="pt-2 pb-1 px-2">
            <div className="relative flex items-center justify-center w-16 h-16">
              <Lottie animationData={WalletAnimation} loop={true} style={{ width: '50px', height: '50px' }} />
            </div>
            <div className="mt-1 text-center">
              <div className="text-xs font-medium text-muted-foreground">
                الميزانية المتاحة - {Number(stats.availableBudget || 0).toLocaleString()} $
              </div>
            </div>
          </CardContent>
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد طلبات
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex flex-col p-4 bg-card border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <h3 className="font-semibold text-sm">{request.studentName}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {request.requestedAmount.toLocaleString()} $
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                        className="h-8 bg-muted text-muted-foreground hover:bg-muted/80"
                      >
                        التفاصيل
                      </Button>
                      {request.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={() => handleReview(request)}
                          className="h-8"
                        >
                          مراجعة
                        </Button>
                      )}
                      {request.status === "APPROVED" && (
                        <Button
                          size="sm"
                          onClick={() => handleDisburse(request.id)}
                          className="h-8"
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          صرف
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs pt-2 border-t">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-normal">الجامعة</span>
                      <span className="font-medium text-foreground">{request.universityName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-normal">التخصص</span>
                      <span className="font-medium text-foreground">{request.fieldOfStudy}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-normal">المعدل</span>
                      <span className="font-medium text-foreground">{request.gpa.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

