import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useUserProfileStore } from "@/stores/user-profile-store";
import { jwtDecode } from "jwt-decode";
import { AvatarSelector } from "@/components/profile/avatar-selector";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateUser } from "@/services/user-profile-service";

interface TokenPayload {
  sub: string;
  roles: string[];
  exp: number;
  userId: number;
}

export default function Profile() {
  const { accessToken, roles } = useAuthStore();
  const { userProfile, isLoading, fetchUserProfile } = useUserProfileStore();
  
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  // Safely decode token with validation
  let userId: number | null = null;
  let username: string | null = null;
  
  try {
    if (accessToken && typeof accessToken === 'string') {
      const decoded = jwtDecode<TokenPayload>(accessToken);
      userId = decoded.userId;
      username = decoded.sub;
    }
  } catch (error) {
    console.error("Failed to decode token:", error);
  }

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId, fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        password: "",
      });
    }
  }, [userProfile]);

  const getUserRole = () => {
    if (roles.includes("ORG_OWNER")) return "admin";
    if (roles.includes("STUDENT")) return "student";
    return "student";
  };

  const handleAvatarSelect = (url: string) => {
    setAvatarUrl(url);
    localStorage.setItem("userAvatar", url);
  };

  const handleSave = async () => {
    if (!userId || !userProfile) return;

    try {
      setIsSaving(true);
      
      const updateData: { name: string; password?: string } = {
        name: formData.name,
      };

      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      await updateUser(userId, updateData);
      
      // Refresh profile data
      await fetchUserProfile(userId);
      
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: "" }));
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("فشل في تحديث الملف الشخصي");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        password: "",
      });
    }
  };

  if (isLoading && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

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
                  <AvatarFallback className="text-3xl md:text-4xl text-primary-foreground font-bold bg-linear-to-br from-primary to-primary/80">
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
                  {userProfile?.name || username || "مستخدم"}
                </CardTitle>
                <p className="text-muted-foreground text-lg">
                  {roles.includes("ORG_OWNER") ? "مالك منظمة" : "طالب"}
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
                  <Label htmlFor="name" className="text-right block">
                    الاسم
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    readOnly={!isEditing}
                    className={`text-right ${!isEditing ? 'bg-muted/50' : ''}`}
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
                      value={userProfile?.email || ""}
                      className="text-right pr-10 bg-muted/50"
                      readOnly
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="password" className="text-right block">
                      كلمة المرور الجديدة (اختياري)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="اترك فارغًا إذا لم ترد التغيير"
                      className="text-right"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              {!isEditing ? (
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => setIsEditing(true)}
                >
                  تعديل الملف الشخصي
                </Button>
              ) : (
                <>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      "حفظ التغييرات"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    إلغاء
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
