import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { jwtDecode } from "jwt-decode";
import { AvatarSelector } from "@/components/profile/avatar-selector";
import { useState } from "react";

interface TokenPayload {
  sub: string;
  roles: string[];
  exp: number;
}

export default function Profile() {
  const { accessToken, roles } = useAuthStore();
  
  const username = accessToken ? jwtDecode<TokenPayload>(accessToken).sub : null;
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const getUserRole = () => {
    if (roles === "ROLE_ADMIN") return "admin";
    if (roles === "ROLE_TEACHER") return "teacher";
    if (roles === "ROLE_MANAGER") return "manager";
    return "student";
  };

  const handleAvatarSelect = (url: string) => {
    setAvatarUrl(url);
    // TODO: Save avatar URL to backend
    localStorage.setItem("userAvatar", url);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
     

        {/* Profile Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24 md:w-32 md:h-32">
                  <AvatarImage src={avatarUrl || localStorage.getItem("userAvatar") || ""} />
                  <AvatarFallback className="text-3xl md:text-4xl text-primary-foreground font-bold bg-gradient-to-br from-primary to-primary/80">
                    {username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <AvatarSelector 
                  currentAvatar={avatarUrl || localStorage.getItem("userAvatar") || ""} 
                  userRole={getUserRole()}
                  onAvatarSelect={handleAvatarSelect}
                />
              </div>
              <div className="text-center md:text-right flex-1">
                <CardTitle className="text-2xl md:text-3xl mb-2">
                  {username || "مستخدم"}
                </CardTitle>
                <p className="text-muted-foreground text-lg">
                  {roles === "ROLE_ADMIN" ? "مسؤول النظام" : "مستخدم"}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                المعلومات الشخصية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-right block">
                    اسم المستخدم
                  </Label>
                  <Input
                    id="username"
                    value={username || ""}
                    readOnly
                    className="text-right bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-right block">
                    البريد الإلكتروني
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      className="text-right pr-10 bg-muted/50"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-right block">
                    رقم الهاتف
                  </Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+966 XX XXX XXXX"
                      className="text-right pr-10 bg-muted/50"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joinDate" className="text-right block">
                    تاريخ الانضمام
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="joinDate"
                      type="text"
                      value={new Date().toLocaleDateString('ar-SA')}
                      className="text-right pr-10 bg-muted/50"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="text-right block">
                    الموقع
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      type="text"
                      placeholder="المملكة العربية السعودية"
                      className="text-right pr-10 bg-muted/50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled
              >
                تعديل الملف الشخصي
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-accent text-accent hover:bg-accent/10"
                disabled
              >
                تغيير كلمة المرور
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center pt-2">
              سيتم تفعيل خاصية التعديل قريباً
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
