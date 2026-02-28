import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Bell, Menu, Home, Zap, Settings2 } from "lucide-react";

export function MobileBottomNav() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 md:hidden z-50">
      <div className="flex items-center justify-around">
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Events</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2">
          <Users className="h-5 w-5" />
          <span className="text-xs">Team</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-1 px-2 relative">
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center">
            3
          </div>
          <Bell className="h-5 w-5" />
          <span className="text-xs">Alerts</span>
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
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <Link to="/dashboard">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <Link to="/dashboard/events">
                  <Zap className="h-4 w-4" />
                  Events
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <Link to="/dashboard/team">
                  <Users className="h-4 w-4" />
                  Team
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="justify-start gap-2" asChild>
                <Link to="/dashboard/settings">
                  <Settings2 className="h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}