import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string
  bgColor: string
  iconBg: string
  textColor?: string
}

export function StatsCard({ icon: Icon, label, value, bgColor, iconBg, textColor = "text-foreground" }: StatsCardProps) {
  return (
    <Card
      className={`${bgColor} h-[150px] border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer overflow-hidden`}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className={`text-sm font-medium ${textColor === "text-background" ? "text-background/90" : "text-foreground/70"}`}>
              {label}
            </p>
            <p className={`text-3xl font-bold ${textColor} tracking-tight`}>{value}</p>
          </div>
          <div className={`${iconBg} p-3 rounded-xl shadow-sm`}>
            <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
