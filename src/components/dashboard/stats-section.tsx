import { TrendingUp, CheckCircle, Star, Eye, type LucideIcon } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card.tsx"

interface Stat {
  icon: LucideIcon
  label: string
  value: string
  bgColor: string
  iconBg: string
  textColor?: string
}

export function StatsSection() {
  const stats: Stat[] = [
    {
      icon: TrendingUp,
      label: "نسبة الفتح",
      value: "83%",
      bgColor: "bg-muted/40",
      iconBg: "bg-muted",
    },
    {
      icon: CheckCircle,
      label: "الاكتمال",
      value: "77%",
      bgColor: "bg-secondary/40",
      iconBg: "bg-secondary",
    },
    {
      icon: Star,
      label: "المشاهدات الفريدة",
      value: "91",
      bgColor: "bg-primary/40",
      iconBg: "bg-primary",
      textColor: "text-foreground",
    },
    {
      icon: Eye,
      label: "إجمالي المشاهدات",
      value: "126",
      bgColor: "bg-accent/40",
      iconBg: "bg-accent",
    },
  ]

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">نظرة عامة</h3>

      {/* Desktop & Tablet: Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Mobile: Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-3 pb-2" style={{ width: "max-content" }}>
          {stats.map((stat, index) => (
            <div key={index} className="w-[170px] shrink-0">
              <StatsCard {...stat} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
