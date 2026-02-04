import { useState, useMemo } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { DashboardLayout } from "@/layout/dashboard-layout.tsx";
import { Sidebar } from "@/layout/sidebar.tsx";
import { TopBar } from "@/layout/top-bar.tsx";
import { useBaseTestsStore } from "@/stores/base-tests-store.tsx";
import { useAdminTestStore } from "@/stores/admin-test-store.tsx";

export default function LayoutWrapper({ children }: { children?: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const { baseTestId, testId } = useParams();
  const { baseTests } = useBaseTestsStore();
  const { adminTestResponse } = useAdminTestStore();

  const handleMenuOpen = (): void => {
    setMobileMenuOpen(true);
  };

  const handleMenuClose = (): void => {
    setMobileMenuOpen(false);
  };

  // Generate breadcrumbs based on current route
  const breadcrumbs = useMemo(() => {
    const crumbs: Array<{ label: string; path?: string }> = [];
    
    // Check if we're on profile page
    if (location.pathname === "/profile") {
      crumbs.push({ label: "الملف الشخصي" });
      return crumbs;
    }
    
    // Check if we're on financial aid apply page
    if (location.pathname === "/dashboard/financial-aid/apply") {
      crumbs.push({ 
        label: "المساعدات المالية", 
        path: "/dashboard/financial-aid" 
      });
      crumbs.push({ 
        label: "طلب مساعدة مالية" 
      });
      return crumbs;
    }
    
    // Dashboard breadcrumb for all dashboard routes
    crumbs.push({ label: "لوحة التحكم", path: "/dashboard" });
    
    if (location.pathname.includes("/baseTests/") && baseTestId) {
      // Find base test by ID to get its code
      const baseTest = baseTests.find(bt => bt.id === Number(baseTestId));
      const baseTestLabel = baseTest?.code || baseTestId;
      
      crumbs.push({ 
        label: baseTestLabel, 
        path: `/dashboard/baseTests/${baseTestId}` 
      });
      
      // If we're on update test page, add test name
      if (location.pathname.includes("/updateTest/") && testId && adminTestResponse) {
        crumbs.push({ 
          label: adminTestResponse.title || `اختبار ${testId}` 
        });
      }
    }
    
    return crumbs;
  }, [location.pathname, baseTestId, testId, baseTests, adminTestResponse]);

  return (
    <DashboardLayout
      sidebar={<Sidebar mobileMenuOpen={mobileMenuOpen} onClose={handleMenuClose} />}
      header={<TopBar onMenuClick={handleMenuOpen} breadcrumbs={breadcrumbs} />}
    >
      {children || <Outlet />}
    </DashboardLayout>
  );
}
