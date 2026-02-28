import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { itemVariants } from "./constants/animations";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  color?: "blue" | "orange" | "green" | "purple" | "red" | "yellow" | "slate";
  description?: string;
  progress?: number;
  footer?: string;
  linkTo?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  description,
  progress,
  footer,
  linkTo,
  onClick
}: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  const colorClasses = {
    slate: {
      bg: "bg-slate-50 dark:bg-slate-950/30",
      border: "border-slate-200 dark:border-slate-800",
      icon: "bg-slate-500 text-white",
      gradient: "from-slate-500 to-slate-600",
      text: "text-slate-600 dark:text-slate-400",
      progress: "bg-slate-500"
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: "bg-blue-500 text-white",
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      progress: "bg-blue-500"
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-200 dark:border-orange-800",
      icon: "bg-orange-500 text-white",
      gradient: "from-orange-500 to-orange-600",
      text: "text-orange-600 dark:text-orange-400",
      progress: "bg-orange-500"
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
      icon: "bg-green-500 text-white",
      gradient: "from-green-500 to-green-600",
      text: "text-green-600 dark:text-green-400",
      progress: "bg-green-500"
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
      icon: "bg-purple-500 text-white",
      gradient: "from-purple-500 to-purple-600",
      text: "text-purple-600 dark:text-purple-400",
      progress: "bg-purple-500"
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      border: "border-red-200 dark:border-red-800",
      icon: "bg-red-500 text-white",
      gradient: "from-red-500 to-red-600",
      text: "text-red-600 dark:text-red-400",
      progress: "bg-red-500"
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      border: "border-yellow-200 dark:border-yellow-800",
      icon: "bg-yellow-500 text-white",
      gradient: "from-yellow-500 to-yellow-600",
      text: "text-yellow-600 dark:text-yellow-400",
      progress: "bg-yellow-500"
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  const Wrapper = linkTo ? Link : onClick ? "button" : "div";
  const wrapperProps = linkTo ? { to: linkTo } : onClick ? { onClick } : {};

  return (
    <motion.div
      variants={itemVariants}
      whileHover={!isMobile ? { y: -2 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full"
    >
      <Wrapper
        {...wrapperProps}
        className={cn(
          "block rounded-xl border p-4 sm:p-5 transition-all duration-300",
          colors.bg,
          colors.border,
          (onClick || linkTo) && "cursor-pointer active:scale-95 sm:active:scale-100 hover:shadow-lg"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              className={cn(
                "rounded-lg p-2 sm:p-2.5 shadow-sm transition-transform shrink-0",
                colors.icon,
                isHovered && "scale-110"
              )}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
              <h3 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] truncate">{value}</h3>
            </div>
          </div>

          {trend && !isMobile && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shrink-0",
                trend.direction === "up"
                  ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                  : trend.direction === "down"
                  ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {trend.direction === "up" && <ArrowUp className="h-3 w-3" />}
              {trend.direction === "down" && <ArrowDown className="h-3 w-3" />}
              <span>{trend.value}%</span>
              {trend.label && (
                <span className="text-muted-foreground ml-1 hidden sm:inline">{trend.label}</span>
              )}
            </div>
          )}

          {trend && isMobile && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                trend.direction === "up" ? "text-green-600" : trend.direction === "down" ? "text-red-600" : ""
              )}
            >
              {trend.direction === "up" && "↑"}
              {trend.direction === "down" && "↓"}
              {trend.value}%
            </Badge>
          )}
        </div>

        {description && (
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        {progress !== undefined && (
          <div className="mt-3 sm:mt-4 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className={cn("font-medium", colors.text)}>{progress}%</span>
            </div>
            <div className="h-1.5 sm:h-2 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", colors.progress)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        )}

        {footer && (
          <div className="mt-3 sm:mt-4 border-t border-border/50 pt-2 sm:pt-3">
            <p className="text-xs text-muted-foreground">{footer}</p>
          </div>
        )}

        {(onClick || linkTo) && (
          <div className="mt-2 sm:mt-3 flex items-center justify-end">
            <ChevronRight
              className={cn(
                "h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground transition-transform",
                isHovered && "translate-x-1"
              )}
            />
          </div>
        )}
      </Wrapper>
    </motion.div>
  );
}