import { Outlet, Link, useLocation } from "react-router-dom";
import logo from "@/assets/images/logo.jpg";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Home, LogIn, UserPlus, LayoutDashboard } from "lucide-react";

export function MainLayout() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
}

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { to: "/", label: "الرئيسية", icon: Home },
        { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
        { to: "/login", label: "تسجيل الدخول", icon: LogIn },
        { to: "/register", label: "إنشاء حساب", icon: UserPlus },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="bg-gradient-to-r from-blue-800 to-blue-900 border-2 border-black text-white m-5 rounded-2xl shadow-xl">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
                    >
                        <img
                            src={logo}
                            alt="logo"
                            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-lg group-hover:scale-110 transition-transform"
                        />
                        <span className="text-xl font-bold hidden sm:block">
                            اختبارات الشخصية
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link key={link.to} to={link.to}>
                                    <Button
                                        variant={isActive(link.to) ? "secondary" : "ghost"}
                                        className={`flex items-center gap-2 text-white hover:bg-blue-700 ${
                                            isActive(link.to)
                                                ? "bg-white text-blue-900 hover:bg-gray-100"
                                                : ""
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-blue-700"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="bg-blue-900 text-white border-l-2 border-black">
                            <SheetHeader>
                                <SheetTitle className="text-white text-right">
                                    <div className="flex items-center gap-3 justify-end">
                                        <span className="text-xl font-bold">اختبارات الشخصية</span>
                                        <img
                                            src={logo}
                                            alt="logo"
                                            className="h-10 w-10 rounded-full object-cover border-2 border-white"
                                        />
                                    </div>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-3 mt-8" dir="rtl">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Button
                                                variant={isActive(link.to) ? "secondary" : "ghost"}
                                                className={`w-full justify-start gap-3 text-white hover:bg-blue-800 ${
                                                    isActive(link.to)
                                                        ? "bg-white text-blue-900 hover:bg-gray-100"
                                                        : ""
                                                }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span className="text-lg">{link.label}</span>
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;