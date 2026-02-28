import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GuideCardProps {
  icon: string;
  title: string;
  steps: string[];
  color?: "blue" | "amber" | "green" | "purple";
}

export function GuideCard({ icon, title, steps, color = "blue" }: GuideCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700"
  };

  const getIcon = () => {
    switch (icon) {
      case "Zap":
        return "⚡";
      case "Settings2":
        return "⚙️";
      case "Share2":
        return "📤";
      default:
        return "📌";
    }
  };

  return (
    <Card className={cn("border-0 shadow-sm", colorClasses[color])}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-lg">{getIcon()}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2 text-sm">
          {steps.map((step: string, index: number) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}