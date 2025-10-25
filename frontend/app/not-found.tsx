"use client";

import { easeInOut, motion, spring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchX, Home, ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

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

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: easeInOut,
    },
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen relative pt-16 sm:pt-20 overflow-hidden">
      {/* Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl pointer-events-none"
      />

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-10 sm:top-20 right-5 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-primary/30 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-48 h-48 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"
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
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

              <CardContent className="p-6 sm:p-8 md:p-12 relative">
                {/* Floating 404 */}
                <motion.div
                  variants={floatingVariants}
                  initial="initial"
                  animate="animate"
                  className="text-center mb-6 sm:mb-8"
                >
                  <h2 className="text-8xl sm:text-9xl md:text-[12rem] font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                    404
                  </h2>
                </motion.div>

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
                  <div className="p-4 sm:p-6 bg-primary/10 rounded-2xl border border-primary/20">
                    <SearchX className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-3 sm:mb-4"
                >
                  Page Not Found
                </motion.h1>

                {/* Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-gray-400 text-sm sm:text-base md:text-lg text-center max-w-2xl mx-auto mb-8 sm:mb-10 px-4"
                >
                  The page you&apos;re looking for doesn&apos;t exist or has
                  been moved. Let&apos;s get you back on track with your
                  duplicate detection journey.
                </motion.p>

                {/* Action Buttons */}
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
                >
                  <Button
                    asChild
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full sm:w-auto"
                  >
                    <Link href="/dashboard">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                      Go to Dashboard
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="gap-2 hover:bg-white/10 w-full sm:w-auto"
                  >
                    <Link href="/connect">
                      <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                      Connect Project
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

                {/* Quick Links */}
                <motion.div
                  variants={itemVariants}
                  className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/10"
                >
                  <p className="text-center text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                    Popular pages:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    <Link
                      href="/dashboard"
                      className="text-xs sm:text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <span className="text-gray-600">•</span>
                    <Link
                      href="/connect"
                      className="text-xs sm:text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      Connect Project
                    </Link>
                    <span className="text-gray-600">•</span>
                    <Link
                      href="/ai-garden"
                      className="text-xs sm:text-sm text-primary hover:underline hover:text-primary/80 transition-colors"
                    >
                      AI Garden
                    </Link>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
