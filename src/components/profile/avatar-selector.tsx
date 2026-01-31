import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface AvatarOption {
  id: string;
  url: string;
  label: string;
}

const avatarOptions: Record<string, AvatarOption[]> = {
  student: [
    { id: "student-boy", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=happyboy&mouth=smile&eyes=happy&backgroundColor=b6e3f4", label: "طالب" },
    { id: "student-girl", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=happygirl&mouth=smile&eyes=happy&backgroundColor=ffd5dc&hairColor=auburn", label: "طالبة" },
  ],
  teacher: [
    { id: "teacher-boy", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacherboy&mouth=smile&eyes=happy&accessories=prescription02&backgroundColor=89adff", label: "معلم" },
    { id: "teacher-girl", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teachergirl&mouth=smile&eyes=happy&accessories=prescription01&backgroundColor=bde4ff&hairColor=auburn", label: "معلمة" },
  ],
  manager: [
    { id: "manager-boy", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=managerboy&mouth=smile&eyes=happy&accessories=prescription02&clothesColor=262e33&backgroundColor=ef7148", label: "مدير" },
    { id: "manager-girl", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=managergirl&mouth=smile&eyes=happy&accessories=prescription01&clothesColor=3c4f5c&backgroundColor=defc8e&hairColor=auburn", label: "مديرة" },
  ],
  admin: [
    { id: "admin-boy", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=adminboy&mouth=smile&eyes=happy&accessories=prescription02&clothesColor=262e33&backgroundColor=ef7148", label: "مسؤول" },
    { id: "admin-girl", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admingirl&mouth=smile&eyes=happy&accessories=prescription01&clothesColor=3c4f5c&backgroundColor=0f408f&hairColor=auburn", label: "مسؤولة" },
  ],
};

interface AvatarSelectorProps {
  currentAvatar?: string;
  userRole: "student" | "teacher" | "manager" | "admin";
  onAvatarSelect: (avatarUrl: string) => void;
}

export function AvatarSelector({ currentAvatar, userRole, onAvatarSelect }: AvatarSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");

  const roleAvatars = avatarOptions[userRole] || avatarOptions.student;

  const handleSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onAvatarSelect(avatarUrl);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-0 right-0 rounded-full w-10 h-10 border-2 border-background bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
        >
          <Camera className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-right">اختر صورة رمزية</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {roleAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.url)}
              className={`relative group transition-all duration-200 ${selectedAvatar === avatar.url
                  ? "ring-4 ring-primary rounded-full scale-105"
                  : "hover:scale-110"
                }`}
            >
              <Avatar className="w-full aspect-square">
                <AvatarImage src={avatar.url} alt={avatar.label} />
                <AvatarFallback>{avatar.label}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors" />
              {selectedAvatar === avatar.url && (
                <div className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
