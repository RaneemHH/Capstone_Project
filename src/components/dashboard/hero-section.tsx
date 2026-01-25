import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/stores/auth-store"
import { useUserProfileStore } from "@/stores/user-profile-store"
import Animation from "@/assets/animations/Man_remote_working.json"
import  Lottie from "lottie-react"

export function HeroSection() {
  const { roles } = useAuthStore()
  const { userProfile } = useUserProfileStore()

  const username = userProfile?.name || "مستخدم"
  const isOrgOwner = roles.includes("ORG_OWNER")

  const greeting = isOrgOwner
    ? "جاهز لإدارة الاختبارات وتحليل النتائج؟"
    : "هل أنت مستعد لاكتشاف شخصيتك المهنية؟"

  return (
    <Card className="md:h-40 lg:h-50 bg-gradient-to-br from-secondary/30 via-secondary/50 to-primary/30 border-0 mb-8 shadow-sm overflow-visible">
      <CardContent className="relative p-10 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[180px] md:min-h-[200px]">
        {/* Text Content - RIGHT side in RTL */}
        <div className="flex-1 md:pb-[80px] text-center md:text-right space-y-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            مرحباً، {username}
          </h2>
          <p className="text-foreground/80 text-lg md:text-xl font-medium">
            {greeting}
          </p>
        </div>

        {/* Overlapping Submarine/Astronaut Image - Below text on mobile, extends beyond top on larger screens */}
        <div className="relative w-50 md:absolute md:left-0 lg:left-16 md:-top-14 lg:-top-18 md:w-52 lg:w-64 z-20 pointer-events-none">
          {/* <img
            src={"src/assets/images/diver-floating-with-submarine.png"}
            alt="Submarine and Astronaut"
            className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
            style={{
              filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.12)) drop-shadow(0 8px 16px rgba(0, 0, 0, 0.08))",
            }}
          /> */}
          <Lottie
            animationData={Animation}
            loop={true}
          />
        </div>
      </CardContent>
    </Card>
  )
}
