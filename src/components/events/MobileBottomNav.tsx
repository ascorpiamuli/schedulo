import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Bell, Menu, Home, Zap, Settings2, BarChart3, Building2, CreditCard } from "lucide-react";

export function MobileBottomNav() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setShowMenu(false);
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => handleNavigation("/dashboard/events")}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Events</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => handleNavigation("/dashboard/team")}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">Team</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex flex-col items-center gap-1 h-auto py-1 px-2 relative"
          onClick={() => handleNavigation("/dashboard/bookings")}
        >
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center">
            3
          </div>
          <Bell className="h-5 w-5" />
          <span className="text-xs">Bookings</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center gap-1 h-auto py-1 px-2"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs">Menu</span>
        </Button>
      </div>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg p-2 mx-2 shadow-lg"
          >
            <div className="grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto">
              {/* Dashboard & Overview */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard")}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/events")}
              >
                <Zap className="h-4 w-4" />
                Event Types
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/availability")}
              >
                <Calendar className="h-4 w-4" />
                Availability
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/bookings")}
              >
                <Bell className="h-4 w-4" />
                Bookings
              </Button>

              {/* Team Section */}
              <div className="col-span-2 text-xs font-semibold text-muted-foreground px-2 pt-2 pb-1">
                Team
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team")}
              >
                <Users className="h-4 w-4" />
                Team Overview
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/members")}
              >
                <Users className="h-4 w-4" />
                Members
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/departments")}
              >
                <Building2 className="h-4 w-4" />
                Departments
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/invitations")}
              >
                <Users className="h-4 w-4" />
                Invitations
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/calendar")}
              >
                <Calendar className="h-4 w-4" />
                Team Calendar
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/availability")}
              >
                <Calendar className="h-4 w-4" />
                Team Availability
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/events")}
              >
                <Zap className="h-4 w-4" />
                Team Events
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/bookings")}
              >
                <Bell className="h-4 w-4" />
                Team Bookings
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/team/analytics")}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>

              {/* Settings & Organization */}
              <div className="col-span-2 text-xs font-semibold text-muted-foreground px-2 pt-2 pb-1">
                Settings
              </div>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/settings")}
              >
                <Settings2 className="h-4 w-4" />
                Profile
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/organization")}
              >
                <Building2 className="h-4 w-4" />
                Organization
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/billing")}
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/usage")}
              >
                <BarChart3 className="h-4 w-4" />
                Usage
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/integrations")}
              >
                <Zap className="h-4 w-4" />
                Integrations
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start gap-2"
                onClick={() => handleNavigation("/dashboard/security")}
              >
                <Settings2 className="h-4 w-4" />
                Security
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}