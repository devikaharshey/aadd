"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, spring } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Server,
  Key,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  Info,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { addUserActivity } from "@/lib/activities";
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

export default function ConnectProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projectId, setProjectId] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Loader & Verification For Logged In User
  if (!user) {
    if (showLoader)
      return (
        <div className="flex justify-center items-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-gray-400 text-lg">
              Loading Connect Page...
            </span>
          </motion.div>
        </div>
      );

    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <span className="text-gray-400 text-lg">
            Please{" "}
            <Link href="/login" className="text-primary">
              login
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="text-primary">
              signup
            </Link>{" "}
            to continue
          </span>
        </motion.div>
      </div>
    );
  }

  // Project Connection Handler
  const handleConnect = async () => {
    if (!projectId || !endpoint || !apiKey) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/connect`,
        {
          userId: user.$id,
          projectId,
          endpoint,
          apiKey,
        }
      );

      await addUserActivity(
        user.$id,
        `Connected new project ${projectId}`,
        "create",
        projectId
      );

      toast.success("Project connected successfully!");
      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || err.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
      setLoading(false);
    }
  };

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
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-20 right-10 w-96 h-96 bg-primary/30 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="inline-block mb-4"
          >
            <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl backdrop-blur-sm border border-primary/30">
              <LinkIcon className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-3 sm:mb-4 px-4"
          >
            Connect Your Project
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto"
          >
            Link your Appwrite project to start detecting and managing
            duplicates
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants} className="w-full max-w-lg">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-lg" />

            <CardHeader className="relative">
              <CardTitle className="text-white text-xl flex items-center gap-2">
                Project Details
              </CardTitle>
            </CardHeader>

            <CardContent className="relative space-y-6">
              {/* Project ID */}
              <div className="space-y-2">
                <Label
                  htmlFor="projectId"
                  className="text-gray-300 flex items-center gap-2"
                >
                  <Server className="w-4 h-4 text-primary" />
                  Project ID
                </Label>
                <Input
                  id="projectId"
                  placeholder="Enter your Appwrite project ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-gray-500"
                  disabled={loading || success}
                />
              </div>

              {/* Endpoint */}
              <div className="space-y-2">
                <Label
                  htmlFor="endpoint"
                  className="text-gray-300 flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4 text-primary" />
                  Endpoint
                </Label>
                <Input
                  id="endpoint"
                  placeholder="https://cloud.appwrite.io/v1"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-gray-500"
                  disabled={loading || success}
                />
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label
                  htmlFor="apiKey"
                  className="text-gray-300 flex items-center gap-2"
                >
                  <Key className="w-4 h-4 text-primary" />
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-gray-500"
                  disabled={loading || success}
                />
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-white mb-1">Need help?</p>
                  <p>
                    Find your project credentials in the Appwrite Console under
                    Settings → API Keys.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleConnect}
                disabled={loading || success}
                className="w-full gap-2 py-6 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Connected! Redirecting...
                  </>
                ) : (
                  <>
                    Connect Project
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 font-medium">
                    Project connected successfully!
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Features List */}
        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full"
        >
          {[
            { icon: Server, text: "Secure Connection" },
            { icon: Sparkles, text: "AI-Powered Detection" },
            { icon: CheckCircle, text: "Instant Setup" },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-gray-300 text-sm font-medium">
                  {feature.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
