import * as React from "react";
import { ChevronDown, Menu, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Separator } from "/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuthStore } from "@/stores/auth-store.tsx";
import { useUserProfileStore } from "@/stores/user-profile-store";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface TopBarProps {
  onMenuClick: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

export function TopBar({ onMenuClick, breadcrumbs }: TopBarProps) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { userProfile } = useUserProfileStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Generate initials from user name
  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userProfile?.name);
  const userName = userProfile?.name || "مستخدم";

  return (
    <header className="bg-card border-b border-border">
      <div className="px-4 md:px-6 lg:px-8 py-2 md:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Page Title on RIGHT in RTL */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="text-right">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <Breadcrumb>
                  <BreadcrumbList className="flex-row-reverse">
                    {[...breadcrumbs].reverse().map((crumb, index, arr) => (
                      <React.Fragment key={index}>
                        <BreadcrumbItem>
                          {crumb.path ? (
                            <BreadcrumbLink asChild>
                              <Link to={crumb.path} className="text-lg md:text-xl lg:text-2xl max-w-[150px] md:max-w-[200px] lg:max-w-[300px] truncate block">
                                {crumb.label}
                              </Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="text-lg md:text-xl lg:text-2xl max-w-[150px] md:max-w-[200px] lg:max-w-[400px] truncate block">
                              {crumb.label}
                            </BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                        {index < arr.length - 1 && (
                          <BreadcrumbSeparator>
                            <ChevronLeft className="w-4 h-4" />
                          </BreadcrumbSeparator>
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              ) : (
                <h1 className="text-foreground text-lg md:text-xl lg:text-2xl mb-0 md:mb-1">
                  لوحة التحكم
                </h1>
              )}
              {/* <p className="text-muted-foreground text-xs md:text-sm hidden md:block">
                الاثنين، 02 مارس 2026
              </p> */}
            </div>
          </div>
          {/* User Info on LEFT in RTL */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile: Avatar only */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                >
                  <Avatar>
                    <AvatarFallback className="text-primary-foreground font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    الملف الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop: Dropdown with name */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden md:flex gap-2 md:gap-3 px-2 md:px-3"
                >
                  <ChevronDown className="w-4 h-4 shrink-0" />
                  <span className="hidden lg:block">
                    {userName}
                  </span>
                  <Avatar>
                    <AvatarFallback className="text-primary-foreground font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    الملف الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute top-2 right-2 w-2 h-2 p-0 bg-accent border-0" />
            </Button> */}

            {/* Messages - Desktop only */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
            >
              <Mail className="w-5 h-5" />
            </Button> */}
          </div>
        </div>
      </div>
    </header>
  );
}