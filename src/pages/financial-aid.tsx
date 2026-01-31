import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { financialAidService } from "@/services/financial-aid-service";
import type { FinancialAidResponse } from "@/types/financial-aid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { RequestDetailsDialog } from "@/components/financial-aid/request-details-dialog";
import { RadialChart } from "@/components/charts/radial-chart";
import type { ChartConfig } from "@/components/ui/chart";
import TotalRequestsAnimation from "@/assets/animations/total-requests-animation.json";
import RejectedRequestsAnimation from "@/assets/animations/rejected-requests-animation.json";
import PendingRequestsAnimation from "@/assets/animations/waiting_requests_animation.json";
import ApprovedRequestsAnimation from "@/assets/animations/accepted-requests-animation.json";
import Lottie from "lottie-react";
export default function FinancialAid() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FinancialAidResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<FinancialAidResponse | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await financialAidService.getMyRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("فشل في تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelRequest = async (requestId: number) => {
    try {
      await financialAidService.cancelRequest(requestId);
      toast.success("تم إلغاء الطلب بنجاح");
      fetchRequests();
    } catch (error) {
      console.error("Failed to cancel request:", error);
      toast.error("فشل في إلغاء الطلب");
    }
  };

  const handleViewDetails = (request: FinancialAidResponse) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
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
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Requests Card */}
        <Card className="flex flex-col items-center">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="relative flex items-center justify-center w-36 h-36">
              <Lottie animationData={TotalRequestsAnimation} loop={true} style={{ width: '120px', height: '120px' }} />
              {/* <div className="text-5xl font-bold text-foreground">
                {requests.length}
              </div> */}
            </div>
            <div className="mt-2 text-center">
              <div className="text-xs font-medium text-muted-foreground">
                إجمالي الطلبات - {requests.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests Stat with Animation */}
        <RadialChart
          title="قيد الانتظار"
          value={requests.filter((r) => r.status === "PENDING").length}
          maxValue={requests.length}
          fillColor="var(--chart-2)"
          config={{
            value: {
              label: "Requests",
              color: "var(--chart-2)",
            },
          } satisfies ChartConfig}
          animationData={PendingRequestsAnimation}
        />

        {/* Approved Requests Stat with Animation */}
        <RadialChart
          title="مقبول"
          value={requests.filter((r) => r.status === "APPROVED" || r.status === "DISBURSED").length}
          maxValue={requests.length}
          fillColor="var(--chart-3)"
          config={{
            value: {
              label: "Requests",
              color: "var(--chart-3)",
            },
          } satisfies ChartConfig}
          animationData={ApprovedRequestsAnimation}
        />

        {/* Rejected Requests Stat with Animation */}
        <RadialChart
          title="مرفوض"
          value={requests.filter((r) => r.status === "REJECTED").length}
          maxValue={requests.length}
          fillColor="var(--chart-4)"
          config={{
            value: {
              label: "Requests",
              color: "var(--chart-4)",
            },
          } satisfies ChartConfig}
          animationData={RejectedRequestsAnimation}
        />
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">طلباتي</h2>
          <Button onClick={() => navigate("/dashboard/financial-aid/apply")}>
            <Plus className="w-4 h-4 ml-2" />
            طلب مساعدة مالية
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد طلبات حتى الآن. قم بإنشاء طلب جديد للبدء.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-card border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 flex-1 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 mb-1">
                      <span>{getStatusBadge(request.status)}</span>
                      <h3 className="font-semibold text-sm break-words whitespace-pre-line max-w-xs sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg 2xl:max-w-xl">{request.reason}</h3>
                    </div>
                  </div>
                  {/* Dates only visible on large screens */}
                  <div className="hidden lg:flex items-center gap-6 text-xs">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-muted-foreground font-normal">تاريخ الطلب</span>
                      <span className="font-bold text-foreground">
                        {new Date(request.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    {request.reviewedAt && (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-muted-foreground font-normal">تاريخ المراجعة</span>
                        <span className="font-bold text-foreground">
                          {new Date(request.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pr-5 pt-4 lg:pt-0">
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
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelRequest(request.id)}
                      className="h-8"
                    >
                      إلغاء
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <RequestDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        request={selectedRequest}
      />
    </div>
  );
}
