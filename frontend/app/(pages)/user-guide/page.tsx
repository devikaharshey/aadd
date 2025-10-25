"use client";

import { motion, spring } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Link as LinkIcon,
  LayoutDashboard,
  FolderOpen,
  Target,
  Search,
  Trash2,
  Sprout,
  UserCircle,
  Activity,
  CheckCircle,
  ArrowRight,
  Database,
  HardDrive,
  Clock,
  Filter,
  CheckSquare,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
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

export default function UserGuidePage() {
  const steps = [
    {
      number: "01",
      icon: User,
      title: "Sign Up / Login",
      description:
        "Create an account or log in using your email and password. Verify your email if it's your first time signing up.",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      number: "02",
      icon: LinkIcon,
      title: "Connect Project",
      description:
        "Navigate to the 'Connect Project' page and enter your Project ID, API Endpoint, and API Key for the Appwrite project you want to scan.",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      number: "03",
      icon: LayoutDashboard,
      title: "Dashboard Overview",
      description:
        "View your connected projects with quick stats, manage automated scan reminders, and access recent activities all in one place.",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      number: "04",
      icon: FolderOpen,
      title: "Select Project for Scan",
      description:
        "From the Dashboard, click 'Duplicates' on a project card to navigate to the project overview page.",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      number: "05",
      icon: Target,
      title: "Choose Scan Target",
      description:
        "Select Storage to scan all buckets, or input a Database ID to scan collections. Optionally load and scan specific collections.",
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
    {
      number: "06",
      icon: Search,
      title: "Scan & View Results",
      description:
        "Click 'Scan' to start detection. View duplicates with similarity scores and visual representations of duplicate distribution.",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      number: "07",
      icon: Trash2,
      title: "Manage Duplicates",
      description:
        "Filter, sort, and select duplicates. Use bulk operations to delete from source or remove from tracking list.",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    {
      number: "08",
      icon: Sprout,
      title: "AI Garden",
      description:
        "Visit the AI Garden to view your data health visualization, check cleaning statistics, and chat with the AI Gardener.",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      number: "09",
      icon: UserCircle,
      title: "Profile Management",
      description:
        "Update your name and email, upload a profile picture, or delete your account with comprehensive cleanup.",
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
    {
      number: "10",
      icon: Activity,
      title: "Activity Log",
      description:
        "Review a detailed log of all your actions including project connections, scan operations, and deletion activities.",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
  ];

  const features = [
    {
      icon: Database,
      title: "Database Scanning",
      items: [
        "Input specific Database ID",
        "Load and view all collections",
        "Scan entire database or specific collections",
        "AI-powered text similarity detection",
      ],
    },
    {
      icon: HardDrive,
      title: "Storage Scanning",
      items: [
        "Scan all storage buckets automatically",
        "Support for images, videos, audio, PDFs",
        "Perceptual hashing for media files",
        "Document and presentation analysis",
      ],
    },
    {
      icon: Filter,
      title: "Results Management",
      items: [
        "Search duplicates by name or content",
        "Sort by similarity, date, or size",
        "View similarity scores and percentages",
        "Visual circle packing charts",
      ],
    },
    {
      icon: CheckSquare,
      title: "Bulk Operations",
      items: [
        "Select individual duplicates",
        "Select all / Deselect all options",
        "Delete from Appwrite source directly",
        "Remove from tracking list only",
      ],
    },
    {
      icon: Clock,
      title: "Automated Scheduling",
      items: [
        "Configure scan reminders (hourly to monthly)",
        "Email notifications on completion",
        "Project-specific schedules",
        "Activity tracking and logging",
      ],
    },
    {
      icon: MessageSquare,
      title: "AI Garden Chat",
      items: [
        "Interactive AI Gardener assistant",
        "Data health tips and motivation",
        "Powered by Google Gemini API",
        "Visual plant-based progress tracking",
      ],
    },
  ];

  const tips = [
    "Always verify email after signup for full functionality",
    "Store API keys securely - they're encrypted in our system",
    "Start with small collections to understand the process",
    "Review similarity scores before bulk deletion",
    "Use 'Remove from list' first to preview before actual deletion",
    "Schedule regular scans to maintain data hygiene",
    "Check the AI Garden regularly for motivation",
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
        className="relative z-10 px-6 py-20"
      >
        {/* Header Section */}
        <div className="max-w-6xl mx-auto text-center mb-16">
          <motion.div variants={itemVariants} className="mb-6">
            <Badge className="mb-4 px-4 py-2 text-sm bg-primary/20 border-primary/30">
              Step-by-Step Guide
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-6"
          >
            How to Use AADD
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Follow this comprehensive guide to get started with detecting and
            managing duplicates in your Appwrite projects
          </motion.p>
        </div>

        {/* Steps Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Getting Started
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Ten simple steps to master duplicate detection and management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card
                    className={`h-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border ${step.borderColor} shadow-xl hover:shadow-primary/10 transition-all duration-300`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`p-3 ${step.bgColor} rounded-xl border border-white/10 shrink-0`}
                        >
                          <Icon className={`w-6 h-6 ${step.color}`} />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-2xl font-bold ${step.color}`}
                            >
                              {step.number}
                            </span>
                            <h3 className="text-xl font-semibold text-white">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-gray-400 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Key Features Explained
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Deep dive into the powerful capabilities of AADD
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                >
                  <Card className="h-full bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-primary/10 transition-all duration-300">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="p-3 bg-primary/10 rounded-xl mb-4 inline-block border border-white/10"
                      >
                        <Icon className="w-6 h-6 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white mb-4">
                        {feature.title}
                      </h3>
                      <ul className="space-y-2">
                        {feature.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-1" />
                            <span className="text-gray-400 text-sm">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tips Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/20 rounded-xl border border-primary/30">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Pro Tips
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-gray-300">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          className="max-w-3xl mx-auto text-center"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-xl border border-primary/20 shadow-2xl">
            <CardContent className="p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                Connect your first Appwrite project and experience the power of
                AI-driven duplicate detection
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/connect">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg text-white font-semibold shadow-lg shadow-primary/20 transition-all duration-300"
                  >
                    Connect Your Project
                  </motion.button>
                </Link>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold border border-white/20 transition-all duration-300"
                  >
                    View Dashboard
                  </motion.button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
