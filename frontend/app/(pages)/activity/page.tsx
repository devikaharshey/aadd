"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence, spring } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Activity,
  Trash2,
  Loader2,
  RefreshCw,
  Clock,
  FolderOpen,
  Copy,
  Search,
  Plus,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  $id: string;
  message: string;
  timestamp: string;
  type: string;
  projectId?: string;
}

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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

const activityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  refresh: RefreshCw,
  delete: Trash2,
  copy: Copy,
  search: Search,
  create: Plus,
  default: Activity,
};

const activityColors: Record<string, string> = {
  refresh: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  delete: "text-red-400 bg-red-500/10 border-red-500/20",
  copy: "text-green-400 bg-green-500/10 border-green-500/20",
  search: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  create: "text-primary bg-primary/10 border-primary/20",
  default: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

export default function RecentActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [deleteSingleDialogOpen, setDeleteSingleDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Fetch Activities
  const fetchActivities = useCallback(
    async (showRefreshing = false) => {
      if (!user) return;
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/list?userId=${user.$id}`
        );
        setActivities(res.data.activities || []);
      } catch (err: unknown) {
        console.error(err);
        toast.error("Failed to fetch activities");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Delete Single Activity
  const handleDeleteClick = (activityId: string) => {
    setActivityToDelete(activityId);
    setDeleteSingleDialogOpen(true);
  };

  // Confirm Delete Single Activity
  const handleDeleteSingleConfirm = async () => {
    if (!user || !activityToDelete) return;

    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/delete-single`,
        {
          data: { userId: user.$id, activityId: activityToDelete },
        }
      );
      setActivities(activities.filter((a) => a.$id !== activityToDelete));
      toast.success("Activity deleted successfully!");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete activity");
    } finally {
      setDeleting(false);
      setDeleteSingleDialogOpen(false);
      setActivityToDelete(null);
    }
  };

  // Delete All Activities
  const handleDeleteAllConfirm = async () => {
    if (!user) return;

    setDeletingAll(true);
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities/delete?userId=${user.$id}`
      );

      setActivities([]);
      toast.success(res.data.message || "All activities deleted successfully!");
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Error deleting activities.");
      } else {
        toast.error("Error deleting activities.");
      }
    } finally {
      setDeletingAll(false);
      setDeleteAllDialogOpen(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Verify If User Is Logged In
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
            <span className="text-gray-400 text-lg">Loading...</span>
          </motion.div>
        </div>
      );
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-400 text-lg">Loading Activities...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-20 overflow-hidden">
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
        className="relative z-10 px-4 sm:px-6 md:px-10 py-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-3 sm:mb-4 px-4"
          >
            Recent Activity
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Track all your actions and project interactions
          </motion.p>
        </motion.div>

        {/* Stats Card */}
        <motion.section variants={itemVariants} className="mb-10 w-full">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-4">
                <div className="flex flex-col xs:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Activities</p>
                    <p className="text-3xl font-bold text-white">
                      {activities.length}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-end gap-3 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchActivities(true)}
                    disabled={refreshing}
                    className="gap-2 hover:bg-white/10"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                  {activities.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteAllDialogOpen(true)}
                      className="gap-2 border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-600/20 hover:text-orange-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete All
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-white/10"
                  >
                    <Link href="/dashboard">
                      <FolderOpen className="w-4 h-4" />
                      Back to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Activities List */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <Activity className="w-7 h-7 text-primary" />
              Activity Timeline
            </h2>
            {activities.length > 0 && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {activities.length}{" "}
                {activities.length === 1 ? "activity" : "activities"}
              </Badge>
            )}
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-20"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
              <span className="text-gray-300 text-lg">
                Loading activities...
              </span>
            </motion.div>
          ) : activities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-dashed bg-white/5 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="p-4 bg-primary/10 rounded-2xl mb-6"
                  >
                    <AlertCircle className="w-12 h-12 text-primary" />
                  </motion.div>
                  <p className="text-xl text-gray-300 font-medium mb-2">
                    No activities yet
                  </p>
                  <p className="text-gray-400 mb-6 text-center max-w-md">
                    Start using the dashboard to see your activity history
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Link href="/dashboard">
                      <FolderOpen className="w-5 h-5" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {activities.map((activity, index) => {
                  const IconComponent =
                    activityIcons[activity.type] || activityIcons.default;
                  const colorClass =
                    activityColors[activity.type] || activityColors.default;

                  return (
                    <motion.div
                      key={activity.$id || `activity-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{
                        delay: index * 0.03,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                      whileHover={{ x: 5 }}
                    >
                      <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-all duration-200 shadow-lg hover:shadow-xl">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-2.5 rounded-lg border ${colorClass} flex-shrink-0`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium mb-1">
                                {activity.message}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatTimestamp(activity.timestamp)}
                                </span>
                                {activity.projectId && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs font-mono"
                                  >
                                    {activity.projectId}
                                  </Badge>
                                )}
                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
                                  {activity.type}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(activity.$id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </motion.div>

      {/* Delete Single Activity Dialog */}
      <AlertDialog
        open={deleteSingleDialogOpen}
        onOpenChange={setDeleteSingleDialogOpen}
      >
        <AlertDialogContent className="border-red-500 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">
              Delete Activity?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this activity from your history. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSingleConfirm}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600/80"
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

      {/* Delete All Activities Dialog */}
      <AlertDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
      >
        <AlertDialogContent className="border-orange-500 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-orange-500">
              Delete All Activities?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all {activities.length} activities
              from your history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllConfirm}
              disabled={deletingAll}
              className="bg-orange-500 hover:bg-orange-600/80"
            >
              {deletingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
