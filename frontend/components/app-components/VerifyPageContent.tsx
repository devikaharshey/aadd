"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { account } from "@/utils/appwrite";
import { motion, spring } from "framer-motion";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "pending" | "loading" | "success" | "error"
  >("pending");

  // Fetch verification status
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const user = await account.get();
        if (!user) {
          router.replace("/signup");
          return;
        }

        const mode = searchParams.get("mode");
        const userId = searchParams.get("userId");
        const secret = searchParams.get("secret");

        if (user.emailVerification) {
          setStatus("success");
          return;
        }

        if (mode === "pending") {
          setStatus("pending");
          return;
        }

        if (userId && secret) {
          setStatus("loading");
          try {
            await account.updateVerification(userId, secret);
            setStatus("success");
            toast.success("Email verified successfully!");
          } catch (err) {
            console.error(err);
            toast.error(
              "Verification failed. The link may have expired or is invalid."
            );
            setStatus("error");
          }
        }
      } catch {
        router.replace("/signup");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: spring, stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl pointer-events-none"
      />
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

      {/* Main Title */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 text-center mb-12"
      >
        <motion.h1
          variants={cardVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-3 sm:mb-4 px-4"
        >
          Verify Your Email
        </motion.h1>
        <motion.p
          variants={cardVariants}
          className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto"
        >
          Confirm your email to unlock your dashboard and manage your projects.
        </motion.p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-md bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 flex flex-col items-center text-center"
      >
        {status === "pending" && (
          <motion.div
            key="pending"
            variants={cardVariants}
            className="space-y-3"
          >
            <p className="text-lg font-medium text-primary">
              📩 Check Your Inbox
            </p>
            <p className="text-gray-400">
              We’ve sent you a verification email. Click the link inside to
              verify your account.
            </p>
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div
            key="loading"
            variants={cardVariants}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-gray-400">
              Verifying your email, please wait...
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            variants={cardVariants}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 12 }}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-green-500 text-white text-3xl shadow-lg shadow-green-500/30"
            >
              <Check className="w-8 h-8" />
            </motion.div>
            <p className="text-lg font-semibold text-green-400">
              Email Verified!
            </p>
            <p className="text-gray-400">You can now access your dashboard.</p>
            <Button
              className="mt-4 w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            variants={cardVariants}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 12 }}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-red-500 text-white text-3xl shadow-lg shadow-red-500/30"
            >
              <AlertCircle className="w-8 h-8" />
            </motion.div>
            <p className="text-lg font-semibold text-red-400">
              Verification Failed
            </p>
            <p className="text-gray-400">
              The link may have expired or is invalid. Request a new
              verification email.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
