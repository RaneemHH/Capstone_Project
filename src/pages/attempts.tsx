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
import { DataTable } from "@/components/attempts-table/data-table";
import { columns } from "@/components/attempts/columns";
import { useTestAttemptsStore } from "@/stores/test-attempts-store";
import { getAllTestAttempts, getAttemptsByStudent } from "@/services/test-attempt.ts";
import { useAuthStore } from "@/stores/auth-store.tsx"; // <-- import your auth store
import { jwtDecode } from "jwt-decode";

export default function Attempts() {
  const [pageSize, setPageSize] = useState("10");
  const { attempts, loading, error, setAttempts } = useTestAttemptsStore();
  const { roles,accessToken } = useAuthStore(); // <-- get roles and user info
let studentId: number | undefined = undefined;
if (accessToken) {
  try {
    const decoded = jwtDecode<{ userId?: number; id?: number; sub?: number }>(String(accessToken));
    studentId = decoded.userId || decoded.id || decoded.sub || undefined;
  } catch {
    studentId = undefined;
  }
}
  useEffect(() => {
    const fetchAttempts = async () => {
      if (roles[0] === "ROLE_ADMIN") {
        const data = await getAllTestAttempts();
        setAttempts(data);
      } else {
        // Assuming user.id is the studentId
        const data = await getAttemptsByStudent(studentId? studentId : 4);
        setAttempts(data);
      }
    };
    fetchAttempts();
  }, [roles, setAttempts]);

  return (
    <div className="min-h-screen gradient-bg p-8" dir="rtl">
      {/* Page Content */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
        {/* Header */}
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
  );
}