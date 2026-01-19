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
    { id: "student-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=student1&backgroundColor=b6e3f4", label: "طالب 1" },
    { id: "student-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=student2&backgroundColor=ffd5dc", label: "طالب 2" },
    { id: "student-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=student3&backgroundColor=c0aede", label: "طالب 3" },
    { id: "student-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=student4&backgroundColor=ffdfbf", label: "طالب 4" },
    { id: "student-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=student5&backgroundColor=a8e6cf", label: "طالب 5" },
    { id: "student-6", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=student6&backgroundColor=fdcae1", label: "طالب 6" },
  ],
  teacher: [
    { id: "teacher-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1&backgroundColor=89adff&accessories=prescription02", label: "معلم 1" },
    { id: "teacher-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2&backgroundColor=bde4ff&accessories=prescription01", label: "معلم 2" },
    { id: "teacher-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3&backgroundColor=ef7148&accessories=prescription02", label: "معلم 3" },
    { id: "teacher-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher4&backgroundColor=defc8e&accessories=sunglasses", label: "معلم 4" },
    { id: "teacher-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher5&backgroundColor=89adff", label: "معلم 5" },
    { id: "teacher-6", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher6&backgroundColor=bde4ff", label: "معلم 6" },
  ],
  manager: [
    { id: "manager-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager1&backgroundColor=0f408f&accessories=prescription02&clothesColor=262e33", label: "مدير 1" },
    { id: "manager-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager2&backgroundColor=89adff&accessories=prescription01&clothesColor=3c4f5c", label: "مدير 2" },
    { id: "manager-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager3&backgroundColor=ef7148&accessories=prescription02&clothesColor=5199e4", label: "مدير 3" },
    { id: "manager-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager4&backgroundColor=bde4ff&clothesColor=65c9ff", label: "مدير 4" },
    { id: "manager-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager5&backgroundColor=0f408f", label: "مدير 5" },
    { id: "manager-6", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager6&backgroundColor=89adff", label: "مدير 6" },
  ],
  admin: [
    { id: "admin-1", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin1&backgroundColor=ef7148&accessories=prescription02&clothesColor=262e33", label: "مسؤول 1" },
    { id: "admin-2", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin2&backgroundColor=0f408f&accessories=prescription01&clothesColor=3c4f5c", label: "مسؤول 2" },
    { id: "admin-3", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin3&backgroundColor=89adff&accessories=sunglasses&clothesColor=e6e6e6", label: "مسؤول 3" },
    { id: "admin-4", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin4&backgroundColor=defc8e&clothesColor=5199e4", label: "مسؤول 4" },
    { id: "admin-5", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin5&backgroundColor=ef7148", label: "مسؤول 5" },
    { id: "admin-6", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin6&backgroundColor=bde4ff", label: "مسؤول 6" },
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
          <DialogTitle className="text-2xl text-center">اختر صورة رمزية</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {roleAvatars.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleSelect(avatar.url)}
              className={`relative group transition-all duration-200 ${
                selectedAvatar === avatar.url
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
