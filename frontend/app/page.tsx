"use client";

import Link from "next/link";
import { motion, spring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  Database,
  HardDrive,
  Layers,
  ArrowRight,
  CheckCircle,
  Zap,
} from "lucide-react";

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
  hidden: { opacity: 0, y: 30 },
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: spring,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Database,
      title: "Database Duplicates",
      description:
        "Detect duplicates in your Appwrite database collections effortlessly with AI-powered text analysis.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: HardDrive,
      title: "Storage Files",
      description:
        "Automatically identify duplicate images, documents, audio, and video files with perceptual hashing.",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Layers,
      title: "Multi-Project Support",
      description:
        "Connect multiple Appwrite projects and manage duplicates in a single, unified dashboard.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  const benefits = [
    "AI-powered duplicate detection",
    "Real-time scanning and analysis",
    "Bulk delete operations",
    "Similarity scoring",
    "Storage optimization",
    "Zero data loss guarantee",
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
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
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/40 rounded-full blur-[150px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[150px] pointer-events-none"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <Badge className="mb-4 px-4 py-2 text-sm bg-primary/20 border-primary/30">
            <Zap className="w-3 h-3 mr-2 inline" />
            Smart Duplicate Detection
          </Badge>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-6 max-w-5xl"
        >
          Appwrite AI Duplicates Detector
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed"
        >
          Detect, visualize and manage duplicates across all your Appwrite
          projects automatically with AI-powered intelligence & algorithms.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          {user ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="gap-2 px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gap-2 px-8 py-6 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-white/20 hover:bg-white/10"
                >
                  Login
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-20 max-w-3xl"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-2 text-left"
            >
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm text-gray-300">{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div variants={itemVariants} className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to keep your Appwrite projects clean and
              optimized
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Card className="h-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                    <CardContent className="p-8 flex flex-col items-center text-center h-full">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`p-4 ${feature.bgColor} rounded-2xl mb-4 border border-white/10`}
                      >
                        <Icon className={`w-8 h-8 ${feature.color}`} />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        {!user && (
          <motion.div
            variants={itemVariants}
            className="mt-20 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 max-w-3xl"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to optimize your projects?
            </h3>
            <p className="text-gray-300 mb-6">
              Start detecting and managing duplicates in seconds
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
