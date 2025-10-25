"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { motion, spring } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Upload,
  X,
  Camera,
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

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [pfp, setPfp] = useState<File | null>(null);
  const [pfpPreview, setPfpPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // File Selection Handler
  const handleFileSelect = (file: File | null): void => {
    if (file && file.type.startsWith("image/")) {
      setPfp(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPfpPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // File Drag-Over Handler
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  // File Drag-Leave Handler
  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  // File Drop Handler
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  // File Input Change Handler
  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Remove Profile Picture
  const removePfp = (): void => {
    setPfp(null);
    setPfpPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Signup Handler
  const handleSignup = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!email || !password || !username) {
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, username, pfp);
      router.push("/dashboard");
    } catch {
      // Errors already handled in AuthContext
    } finally {
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
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-3 sm:mb-4 px-4"
          >
            Join Us Today
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-base sm:text-lg max-w-md mx-auto"
          >
            Create your account to start managing your projects
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants} className="w-full max-w-md">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none rounded-lg" />

            <CardHeader className="relative">
              <CardTitle className="text-white text-xl flex items-center gap-2">
                Create Account
              </CardTitle>
            </CardHeader>

            <CardContent className="relative">
              <div className="space-y-5">
                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    Profile Picture
                  </Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    {pfpPreview ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30">
                          <Image
                            src={pfpPreview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            removePfp();
                          }}
                          className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Upload className="w-8 h-8 text-primary/50" />
                        <div>
                          <p className="text-sm text-gray-300 font-medium">
                            Drop your image here
                          </p>
                          <p className="text-xs text-gray-500">
                            or click to browse
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-gray-300 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-primary" />
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose your username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
                    }
                    className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-gray-500"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-300 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-gray-500"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-300 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-primary" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    className="bg-white/5 border-white/10 focus:border-primary/50 text-white placeholder:text-gray-500"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSignup}
                  disabled={loading || !email || !password || !username}
                  className="w-full gap-2 py-6 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 mt-6"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter className="relative flex flex-col gap-4">
              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Features List */}
        <motion.div
          variants={itemVariants}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full"
        >
          {[
            { icon: CheckCircle, text: "Free Account" },
            { icon: Sparkles, text: "AI-Powered Tools" },
            { icon: UserPlus, text: "Easy Setup" },
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
