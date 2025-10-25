"use client";

import { useEffect } from "react";
import { motion, spring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: spring,
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen relative pt-16 sm:pt-20 overflow-hidden">
      {/* Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent blur-3xl pointer-events-none"
      />

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-10 sm:top-20 right-5 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-red-500/30 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-48 h-48 sm:w-96 sm:h-96 bg-red-500/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 px-4 sm:px-6 md:px-10 py-6 sm:py-10 max-w-4xl mx-auto"
      >
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <motion.div variants={itemVariants} className="w-full">
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />

              <CardContent className="p-6 sm:p-8 md:p-12 relative">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.3,
                  }}
                  className="flex justify-center mb-6 sm:mb-8"
                >
                  <div className="p-4 sm:p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                  variants={itemVariants}
                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-500 to-red-600 mb-3 sm:mb-4"
                >
                  Oops! Something Went Wrong
                </motion.h1>

                {/* Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-gray-400 text-sm sm:text-base md:text-lg text-center max-w-2xl mx-auto mb-6 sm:mb-8 px-4"
                >
                  We encountered an unexpected error while processing your
                  request. Don&apos;t worry, your data is safe. Try refreshing
                  the page or go back home.
                </motion.p>

                {/* Error Details */}
                {process.env.NODE_ENV === "development" && (
                  <motion.div
                    variants={itemVariants}
                    className="mb-6 sm:mb-8 p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <p className="text-xs sm:text-sm text-red-400 font-mono break-all">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-gray-500 mt-2">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
                >
                  <Button
                    onClick={reset}
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-red-500 to-red-500/80 hover:from-red-500/90 hover:to-red-500/70 w-full sm:w-auto"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    Try Again
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="gap-2 hover:bg-white/10 w-full sm:w-auto"
                  >
                    <Link href="/dashboard">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                      Go to Dashboard
                    </Link>
                  </Button>

                  <Button
                    onClick={() => window.history.back()}
                    variant="ghost"
                    size="lg"
                    className="gap-2 hover:bg-white/10 w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    Go Back
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
