"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { storage, account } from "@/utils/appwrite";
import { User, Edit2, Trash2, Save, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "profile_pictures";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [emailChanged, setEmailChanged] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch User Profile Picture
  useEffect(() => {
    if (user) {
      try {
        const url = storage
          .getFileView(BUCKET_ID, `pfp_${user.$id}`)
          .toString();
        setPfpUrl(url);
      } catch {
        setPfpUrl(null);
      }
    }
  }, [user]);

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Loader & Verification For Logged In User
  if (!user) {
    if (showLoader)
      return (
        <div className="flex justify-center items-center min-h-screen px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3"
          >
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
            <span className="text-gray-400 text-base sm:text-lg">
              Loading Profile...
            </span>
          </motion.div>
        </div>
      );

    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 text-center"
        >
          <span className="text-gray-400 text-base sm:text-lg">
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

  // Profile Edit Handler
  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (name !== user.name) {
        await account.updateName(name);
      }

      if (emailChanged && email !== user.email) {
        if (!currentPassword)
          throw new Error("Current password required to change email");
        await account.updateEmail(email, currentPassword);
      }

      await refreshUser();

      toast.success("Profile updated successfully!");
      setEditing(false);
      setEmailChanged(false);
      setCurrentPassword("");
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err.message || "Error updating profile.");
      } else {
        toast.error("Error updating profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Account Deletion Handler
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/delete-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.$id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Failed to delete account");
      }

      toast.success("Account deleted successfully!");
      localStorage.removeItem("cookieFallback");
      window.location.href = "/";
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        toast.error(err.message || "Error deleting account.");
      } else {
        toast.error("Error deleting account.");
      }
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-3xl pointer-events-none"
      />

      {/* Content Wrapper */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
              {pfpUrl ? (
                <Image
                  src={pfpUrl}
                  alt={user.name || "Profile"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary/50" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center sm:items-start gap-2 flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-100 truncate w-full text-center sm:text-left">
                {user.name || "User"}
              </h2>
              <p className="text-sm sm:text-base text-gray-400 truncate w-full text-center sm:text-left">
                {user.email}
              </p>

              <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditing(!editing)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-primary/20 hover:bg-primary/30 text-white rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
                  {editing ? "Cancel" : "Edit Profile"}
                </motion.button>

                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={loading}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600/20 hover:bg-red-600/30 text-red-100 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> Delete Account
                  </motion.button>

                  <AlertDialogContent className="border-red-500 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl w-[90vw] max-w-md mx-4">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-500 text-lg sm:text-xl">
                        Delete Account?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm sm:text-base">
                        This will permanently remove your account. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel
                        disabled={deleting}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteConfirm}
                        disabled={deleting}
                        className="bg-red-500 hover:bg-red-600/80 w-full sm:w-auto"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <form
              onSubmit={handleEditSubmit}
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs sm:text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs sm:text-sm">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailChanged(e.target.value !== user?.email);
                  }}
                  className="p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              {emailChanged && (
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="text-gray-400 text-xs sm:text-sm flex items-center gap-1">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4" /> Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="p-2 sm:p-3 text-sm sm:text-base rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="sm:col-span-2 px-4 py-2 sm:py-3 text-sm sm:text-base bg-primary/30 hover:bg-primary/50 text-white rounded-lg flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Details */}
          {!editing && (
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1 sm:gap-2">
                <span className="text-gray-400 text-xs sm:text-sm">
                  Username
                </span>
                <span className="text-gray-200 font-medium text-sm sm:text-base truncate">
                  {user.name || "N/A"}
                </span>
              </div>
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1 sm:gap-2">
                <span className="text-gray-400 text-xs sm:text-sm">Email</span>
                <span className="text-gray-200 font-medium text-sm sm:text-base truncate">
                  {user.email || "N/A"}
                </span>
              </div>
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1 sm:gap-2">
                <span className="text-gray-400 text-xs sm:text-sm">
                  User ID
                </span>
                <span className="text-gray-200 font-medium text-xs sm:text-sm break-all">
                  {user.$id}
                </span>
              </div>
              <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1 sm:gap-2">
                <span className="text-gray-400 text-xs sm:text-sm">
                  Member Since
                </span>
                <span className="text-gray-200 font-medium text-sm sm:text-base">
                  {user.$createdAt
                    ? new Date(user.$createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
