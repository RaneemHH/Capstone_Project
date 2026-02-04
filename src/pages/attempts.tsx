import { useState, useEffect } from "react";
import { Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/attempts-table/data-table";
import { columns } from "@/components/attempts/columns";
import { useTestAttemptsStore } from "@/stores/test-attempts-store";
import { getAllTestAttempts, getAttemptsByStudent } from "@/services/test-attempt";
import { useAuthStore } from "@/stores/auth-store";
import { ChartBarLabel, type BarChartDataItem } from "@/components/charts/chart-bar-label";
import { getTestAnalytics, type TestAnalyticsResponse } from "@/services/dashboard-service";
import { getMergedTestAnalytics, getMergedAttemptsData } from "@/mockDataForCharts/mockDataAttempts";
import Lottie from "lottie-react";
import AttemptsAdminAnimation from "@/assets/animations/Attempts_Admin.json";


export default function Attempts() {
  const [pageSize, setPageSize] = useState("10");
  const { attempts, loading, error, setAttempts } = useTestAttemptsStore();
  const { roles, accessToken } = useAuthStore(); // <-- get roles and user info
  const [testAnalytics, setTestAnalytics] = useState<TestAnalyticsResponse | null>(null);
  
  let studentId: number | undefined = undefined;
  if (accessToken) {
    studentId = accessToken.userId;
  }

  useEffect(() => {
    const fetchAttempts = async () => {
      let data;
      if (roles[0] === "ORG_OWNER" || roles[0] === "ROLE_ORG_OWNER") {
        data = await getAllTestAttempts();
      } else {
        // Assuming user.id is the studentId
        data = await getAttemptsByStudent(studentId ? studentId : 4);
      }
      // Merge with mock data for demo
      const mergedData = getMergedAttemptsData(data);
      setAttempts(mergedData);
    };
    fetchAttempts();
  }, [roles, setAttempts, studentId]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      console.log('Current role:', roles[0]);
      console.log('Is Org Owner:', roles[0] === "ORG_OWNER" || roles[0] === "ROLE_ORG_OWNER");
      
      if (roles[0] === "ORG_OWNER" || roles[0] === "ROLE_ORG_OWNER") {
        try {
          console.log('Fetching test analytics...');
          const analytics = await getTestAnalytics();
          console.log('Test Analytics Response:', analytics);
          console.log('attemptsByBaseTestType:', analytics?.attemptsByBaseTestType);
          // Merge with mock data for demo
          const mergedAnalytics = getMergedTestAnalytics(analytics);
          setTestAnalytics(mergedAnalytics);
        } catch (error) {
          console.error('Failed to fetch test analytics:', error);
          if (error instanceof Error) {
            console.error('Error message:', error.message);
          }
          // Use mock data if API fails
          setTestAnalytics(getMergedTestAnalytics(null));
        }
      }
    };
    fetchAnalytics();
  }, [roles]);

  // Transform analytics data for bar chart
  const barChartData: BarChartDataItem[] = testAnalytics
    ? Object.entries(testAnalytics.attemptsByBaseTestType).map(([category, value]) => ({
        category,
        value: Number(value),
      }))
    : [];

  const isOrgOwner = roles[0] === "ORG_OWNER" || roles[0] === "ROLE_ORG_OWNER";
  
  console.log('Render state:', { 
    isOrgOwner, 
    hasAnalytics: !!testAnalytics, 
    chartDataLength: barChartData.length,
    testAnalytics,
    barChartData 
  });

  return (
    <div className="min-h-screen gradient-bg p-8" dir="rtl">
      {/* Page Content */}
      <div className="space-y-6">
        {/* Analytics Section - Only for ORG_OWNER */}
        {isOrgOwner && testAnalytics && barChartData.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Animation Card */}
            <Card className="md:col-span-1 h-48">
              <CardContent className="flex items-center justify-center py-2 h-full">
                <Lottie 
                  animationData={AttemptsAdminAnimation} 
                  loop={true}
                  className="w-60 max-w-full"
                />
              </CardContent>
            </Card>

            {/* Chart Card */}
            <div className="md:col-span-2 h-48">
              <ChartBarLabel
                data={barChartData}
                title="توزيع المحاولات حسب نوع الاختبار"
              />
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">{/* Header */}
          {roles[0] === "ROLE_ADMIN" && (
            <div className="flex items-center justify-between mb-6">
              {/* Search */}
              <div className="relative w-80 ml-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن تلميذ"
                  className="pr-10 bg-background border border-border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Showing */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">عرض</span>
                  <Select value={pageSize} onValueChange={setPageSize}>
                    <SelectTrigger className="w-17 h-9 bg-card border border-border rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Export */}
                <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-border">
                  <Upload className="w-4 h-4" />
                  تصدير
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <DataTable columns={columns} data={attempts} pageSize={parseInt(pageSize)} />
          )}
        </div>
      </div>
    </div>
  );
}