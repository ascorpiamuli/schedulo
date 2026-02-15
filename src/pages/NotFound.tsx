import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Home, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#1E3A8A] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#C2410C] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md mx-auto px-4"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="relative">
            <div className="bg-gradient-to-br from-[#1E3A8A] to-[#C2410C] p-3 rounded-2xl shadow-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#C2410C] rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#C2410C] rounded-full" />
          </div>
          <span className="text-2xl font-bold">
            SBP<span className="text-[#C2410C]">Meet</span>
          </span>
        </motion.div>

        {/* 404 Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative mb-8"
        >
          <div className="text-8xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#C2410C] bg-clip-text text-transparent">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <AlertCircle className="h-32 w-32 text-[#1E3A8A]" />
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-2xl font-bold text-[#1E3A8A] dark:text-white mb-2"
        >
          Page Not Found
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            asChild
            className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white gap-2"
          >
            <Link to="/">
              <Home className="h-4 w-4" />
              Go to Home
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white gap-2"
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </motion.div>

        {/* Help Text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-sm text-gray-500 dark:text-gray-500 mt-8"
        >
          If you believe this is an error, please{" "}
          <a 
            href="/contact" 
            className="text-[#1E3A8A] hover:text-[#C2410C] transition-colors font-medium"
          >
            contact support
          </a>
        </motion.p>

        {/* Parent Company Attribution */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-xs text-gray-400 dark:text-gray-600 mt-12"
        >
          A product of{" "}
          <a 
            href="https://sbpgroup.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#C2410C] transition-colors"
          >
            SBP Group
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;