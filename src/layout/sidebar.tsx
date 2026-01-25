import {
  LayoutDashboard,
  type LucideIcon,
  Home,
  BarChart3,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logo from "@/assets/images/logo.jpg";
import { useAuthStore } from "@/stores/auth-store.tsx";

interface SidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  route: string;
}

export function Sidebar({
  mobileMenuOpen,
  onClose,
}: SidebarProps) {
  const { roles } = useAuthStore();
  const location = useLocation();
  const isOrgOwner = roles.includes("ORG_OWNER");
  const isActivityProvider = roles.includes("ACTIVITY_PROVIDER");
  const isMunicipalityAdmin = roles.includes("MUNICIPALITY_ADMIN");
  const isUniversityAdmin = roles.includes("UNIVERSITY_ADMIN");
  const isSchoolAdmin = roles.includes("SCHOOL_ADMIN");

  // Org Owner menu items
  const orgOwnerMenuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "لوحة التحكم",
      route: "/dashboard",
    },
    {
      icon: Calendar,
      label: "المعارض",
      route: "/dashboard/exhibitions",
    },
    {
      icon: BarChart3,
      label: "الإحصائيات",
      route: "/dashboard/analytics",
    },
    {
      icon: ClipboardList,
      label: "المحاولات",
      route: "/dashboard/attempts",
    },
  ];

  // Student menu items
  const studentMenuItems: MenuItem[] = [
    {
      icon: Home,
      label: "الرئيسية",
      route: "/dashboard",
    },
    {
      icon: Calendar,
      label: "المعارض",
      route: "/dashboard/exhibitions",
    },
    {
      icon: BarChart3,
      label: "الإحصائيات",
      route: "/dashboard/analytics",
    },
    {
      icon: ClipboardList,
      label: "محاولاتي",
      route: "/dashboard/attempts",
    },
  ];

  // Limited menu items for Activity Provider, Municipality Admin, and University Admin
  const limitedMenuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: "لوحة التحكم",
      route: "/dashboard",
    },
  ];

  const menuItems = isActivityProvider || isMunicipalityAdmin || isUniversityAdmin || isSchoolAdmin
    ? limitedMenuItems 
    : isOrgOwner 
    ? orgOwnerMenuItems 
    : studentMenuItems;

  return (
    <TooltipProvider delayDuration={300}>
      {/* Mobile Overlay - only for mobile state */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`
        bg-card border-l border-border
        transition-all duration-300 ease-in-out
        flex flex-col
        h-screen
        
        /* Mobile: fixed overlay drawer */
        fixed md:relative
        top-0 bottom-0 right-0
        ${mobileMenuOpen ? "z-50" : ""}
        ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        w-72
        ${mobileMenuOpen ? "shadow-2xl" : ""}
        
        /* Tablet: collapsed icon rail in normal flow */
        md:translate-x-0 md:w-16 md:z-auto md:shadow-none
        
        /* Desktop: expanded sidebar in normal flow */
        lg:w-64
      `}
      >
        <div className="p-4 md:p-2 lg:p-6 flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Logo */}


          <div className="flex items-center gap-3 mb-6 md:mb-8 md:justify-center lg:justify-start">
            {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold">P</span>
            </div> */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            >
              <img
                src={logo}
                alt="logo"
                className="h-12 w-12 rounded-full object-cover border-2 border-background shadow-lg group-hover:scale-110 transition-transform"
              />
              <span className="font-bold text-foreground md:hidden lg:block">
                جمعية المركز الإسلامي للتوجيه والتعليم العالي
              </span>
            </Link>
          </div>

          {/* Create Button */}
          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/dashboard/create-test">
                <Button className="w-full mb-6 md:w-12 md:h-12 md:p-0 lg:w-full">
                  <Plus className="w-5 h-5 shrink-0" />
                  <span className="md:hidden lg:inline">
                    إنشاء امتحان جديد
                  </span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="hidden md:block lg:hidden"
            >
              <p>إنشاء عرض جديد</p>
            </TooltipContent>
          </Tooltip> */}

          {/* Menu Items */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.route;

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Link to={item.route} className="block">
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full gap-3 md:w-12 md:h-12 md:p-0 lg:w-full justify-start md:justify-center lg:justify-start lg:px-4`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="md:hidden lg:inline">
                          {item.label}
                        </span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="hidden md:block lg:hidden"
                  >
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Upgrade Card - Desktop */}
          <Card
          // className="bg-gradient-to-br from-accent/20 to-accent/30 border-0 mt-auto md:hidden lg:block"
          >
            <CardContent className="p-4">
              <Button
                variant="default"
                className="w-full"
                size="sm"
              >
                ترقية
              </Button>
            </CardContent>
          </Card>

          {/* Tablet: Compact Upgrade Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="max-md:hidden md:flex lg:hidden w-12 h-12 items-center justify-center bg-gradient-to-br from-accent/20 to-accent/30 rounded-xl text-2xl mt-4 hover:bg-accent/40"
              >
                🚀
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>ترقية</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}