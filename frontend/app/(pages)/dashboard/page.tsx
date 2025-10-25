"use client";

import { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence, spring } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderOpen,
  Plus,
  RefreshCw,
  Trash2,
  Copy,
  Server,
  Loader2,
  Search,
  TrendingUp,
  Check,
  Activity,
  AlarmClock,
  X,
} from "lucide-react";
import { addUserActivity } from "@/lib/activities";
import RecentActivities from "@/components/app-components/RecentActivities";
import Link from "next/link";

interface Reminder {
  $id: string;
  projectId: string;
  userId: string;
  frequency: string;
  service: string;
  enabled: boolean;
  lastRun: string;
  databaseId?: string;
  collectionId?: string;
}

interface Project {
  $id: string;
  projectId: string;
  endpoint: string;
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [addingReminder, setAddingReminder] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [reminderDeleteDialogOpen, setReminderDeleteDialogOpen] =
    useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [newReminder, setNewReminder] = useState({
    projectId: "",
    frequency: "weekly",
    service: "database",
    databaseId: "",
    collectionId: "",
  });

  // Fetch Reminders
  const fetchReminders = useCallback(async () => {
    if (!user) return;
    setLoadingReminders(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reminders/list?userId=${user.$id}`
      );
      setReminders(res.data.reminders || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reminders");
    } finally {
      setLoadingReminders(false);
    }
  }, [user]);

  // Fetch Projects
  const fetchProjects = useCallback(
    async (showRefreshing = false) => {
      if (!user) return;
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/list?userId=${user.$id}`
        );
        setProjects(res.data.projects || []);

        if (showRefreshing) {
          await addUserActivity(user.$id, "Refreshed project list", "refresh");
        }
      } catch (err: unknown) {
        console.error(err);
        toast.error("Failed to fetch projects");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    fetchProjects();
    fetchReminders();
  }, [fetchProjects, fetchReminders]);

  // Delete Project
  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  // Confirm Deletion
  const handleDeleteConfirm = async () => {
    if (!user || !projectToDelete) return;

    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/delete`,
        {
          data: { userId: user.$id, projectId: projectToDelete },
        }
      );
      setProjects(projects.filter((p) => p.$id !== projectToDelete));
      toast.success("Project deleted successfully!");
      console.log(`Deleted project ${projectToDelete}`);

      await addUserActivity(
        user.$id,
        `Deleted project ${projectToDelete}`,
        "delete",
        projectToDelete
      );
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete project");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  // Reminder Delete Handler
  const handleReminderDeleteClick = (reminderId: string) => {
    setReminderToDelete(reminderId);
    setReminderDeleteDialogOpen(true);
  };

  // Copy Button Handler
  const handleCopyEndpoint = async (projectId: string, endpoint: string) => {
    navigator.clipboard.writeText(endpoint);
    setCopiedProjectId(projectId);
    toast.success("Endpoint copied to clipboard!");
    setTimeout(() => setCopiedProjectId(null), 2000);
    if (user) {
      await addUserActivity(
        user.$id,
        "Copied project endpoint",
        "copy",
        projectId
      );
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Verify If User Is Logged In
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
              Loading Dashboard...
            </span>
          </motion.div>
        </div>
      );
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
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

  // Loader
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          <span className="text-gray-400 text-base sm:text-lg">
            Loading Dashboard...
          </span>
        </motion.div>
      </div>
    );
  }

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
        className="relative z-10 px-4 sm:px-6 md:px-10 py-6 sm:py-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-2 sm:mb-3 px-4"
          >
            Dashboard Overview
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4"
          >
            Manage your Appwrite projects and monitor duplicate detection
          </motion.p>
        </motion.div>

        {/* Metrics Cards */}
        <motion.section variants={itemVariants} className="mb-8 sm:mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
              <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardContent className="p-4 sm:p-6 relative">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">
                      Total Projects
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-white">
                      {projects.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }}>
              <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <CardContent className="p-4 sm:p-6 relative">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <Server className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Connected
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-1">
                      Active Endpoints
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-white">
                      {projects.filter((p) => p.endpoint).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="sm:col-span-2 lg:col-span-1">
              <RecentActivities userId={user.$id} />
            </div>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section variants={itemVariants} className="mb-8 sm:mb-10">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardHeader className="relative">
              <CardTitle className="text-white text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  asChild
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm sm:text-base w-full sm:w-auto"
                >
                  <a href="/connect">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      Connect New Project
                    </span>
                    <span className="sm:hidden">Connect Project</span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 text-sm sm:text-base w-full sm:w-auto hover:bg-white/10"
                  onClick={() => fetchProjects(true)}
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  {refreshing ? "Refreshing..." : "Refresh Projects"}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="gap-2 border-none bg-primary-dark/80 text-white hover:bg-primary-dark/70 hover:text-shadow-gray-200 text-sm sm:text-base w-full sm:w-auto"
                >
                  <Link href="/activity">
                    <Activity className="w-4 h-4" />
                    <span className="hidden sm:inline">View All Activity</span>
                    <span className="sm:hidden">Activity</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Projects Section */}
        <motion.section variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
              My Projects
            </h2>
            {projects.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit"
              >
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </Badge>
            )}
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-16 sm:py-20"
            >
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary mr-3" />
              <span className="text-gray-300 text-base sm:text-lg">
                Loading projects...
              </span>
            </motion.div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-dashed bg-white/5 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="p-3 sm:p-4 bg-primary/10 rounded-2xl mb-4 sm:mb-6"
                  >
                    <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                  </motion.div>
                  <p className="text-lg sm:text-xl text-gray-300 font-medium mb-2 text-center">
                    No projects connected yet
                  </p>
                  <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 text-center max-w-md px-4">
                    Connect your first Appwrite project to start detecting
                    duplicates
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <a href="/connect">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Connect Project
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence>
                {projects.map((project, index) => (
                  <motion.div
                    key={project.$id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    }}
                    whileHover={{ x: 5 }}
                  >
                    <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start sm:items-center gap-3 mb-3">
                              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                <Server className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                                  {project.projectId}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-400 truncate font-mono break-all">
                                  {project.endpoint}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCopyEndpoint(
                                  project.$id,
                                  project.endpoint
                                )
                              }
                              className={`gap-2 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto ${
                                copiedProjectId === project.$id
                                  ? "bg-green-600/20 border-green-500/40 text-green-400"
                                  : "hover:bg-white/10"
                              }`}
                            >
                              {copiedProjectId === project.$id ? (
                                <>
                                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                  Copy
                                </>
                              )}
                            </Button>

                            <Button
                              asChild
                              size="sm"
                              className="gap-2 bg-gradient-to-r from-primary/80 to-primary/60 hover:from-primary hover:to-primary/80 text-xs sm:text-sm w-full sm:w-auto"
                            >
                              <a
                                href={`/duplicates/${
                                  project.projectId
                                }?endpoint=${encodeURIComponent(
                                  project.endpoint
                                )}`}
                              >
                                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                                Duplicates
                              </a>
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(project.$id)}
                              className="gap-2 bg-red-500 text-xs sm:text-sm w-full sm:w-auto hover:bg-red-500/50"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>

        {/* Reminders Section */}
        <motion.section
          variants={itemVariants}
          className="mt-12 sm:mt-16 w-full"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <AlarmClock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
              Automated Reminders
            </h2>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {reminders.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                >
                  {reminders.length}{" "}
                  {reminders.length === 1 ? "reminder" : "reminders"}
                </Badge>
              )}

              <Button
                size="sm"
                onClick={() => {
                  if (reminders.length >= 5) {
                    toast.error("You can only create up to 5 reminders");
                    return;
                  }
                  setShowAddForm(!showAddForm);
                }}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full sm:w-auto text-xs sm:text-sm"
              >
                {showAddForm ? (
                  <>
                    <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Add Reminder
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Add Reminder Form */}
          {showAddForm && (
            <Card className="border-dashed bg-white/5 backdrop-blur-sm mb-6 sm:mb-8">
              <CardContent className="flex flex-col gap-3 items-stretch py-4 sm:py-6 px-4 sm:px-6">
                {/* Project Select */}
                <Select
                  value={newReminder.projectId}
                  onValueChange={(value) => {
                    setNewReminder({
                      ...newReminder,
                      projectId: value,
                      databaseId: "",
                      collectionId: "",
                    });
                  }}
                >
                  <SelectTrigger className="w-full bg-white/10 text-white border border-white/20 text-sm">
                    <SelectValue placeholder="Select Project" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-sm text-white border border-white/20">
                    {projects.map((p) => (
                      <SelectItem key={p.$id} value={p.projectId}>
                        {p.projectId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Frequency Select */}
                <Select
                  value={newReminder.frequency}
                  onValueChange={(value) =>
                    setNewReminder({ ...newReminder, frequency: value })
                  }
                >
                  <SelectTrigger className="w-full bg-white/10 text-white border border-white/20 text-sm">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-sm text-white border border-white/20">
                    <SelectItem value="30min">Every 30 Minutes</SelectItem>
                    <SelectItem value="hourly">Every 1 Hour</SelectItem>
                    <SelectItem value="daily">Every 24 Hours</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>

                {/* Service Select */}
                <Select
                  value={newReminder.service}
                  onValueChange={(value) =>
                    setNewReminder({ ...newReminder, service: value })
                  }
                >
                  <SelectTrigger className="w-full bg-white/10 text-white border border-white/20 text-sm">
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/10 backdrop-blur-sm text-white border border-white/20">
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                  </SelectContent>
                </Select>

                {/* Database ID Input - Replaced Select with Input */}
                {newReminder.service === "database" && (
                  <Input
                    type="text"
                    placeholder="Enter Database ID"
                    value={newReminder.databaseId}
                    onChange={(e) =>
                      setNewReminder({
                        ...newReminder,
                        databaseId: e.target.value,
                      })
                    }
                    disabled={!newReminder.projectId}
                    className="w-full bg-white/10 text-white border border-white/20 text-sm placeholder:text-gray-400"
                  />
                )}

                {/* Add Reminder Button */}
                <Button
                  onClick={async () => {
                    if (!newReminder.projectId) {
                      toast.error("Please select a project");
                      return;
                    }
                    if (
                      newReminder.service === "database" &&
                      !newReminder.databaseId
                    ) {
                      toast.error("Please enter a database ID");
                      return;
                    }
                    setAddingReminder(true);
                    try {
                      await axios.post(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reminders/add`,
                        {
                          ...newReminder,
                          userId: user.$id,
                          userEmail: user.email,
                        }
                      );
                      toast.success("Reminder added!");
                      fetchReminders();
                      setNewReminder({
                        projectId: "",
                        frequency: "weekly",
                        service: "database",
                        databaseId: "",
                        collectionId: "",
                      });
                      setShowAddForm(false);
                    } catch (err) {
                      const error = err as AxiosError<{ error: string }>;
                      console.error(error);
                      toast.error(
                        error.response?.data?.error || "Failed to add reminder"
                      );
                    } finally {
                      setAddingReminder(false);
                    }
                  }}
                  disabled={addingReminder || reminders.length >= 5}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm"
                >
                  {addingReminder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reminder
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reminder List */}
          {loadingReminders ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mb-3 text-primary" />
              <p className="text-xs sm:text-sm">Fetching reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <p className="text-gray-400 text-center py-8 sm:py-10 text-sm sm:text-base">
              No reminders yet.
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {reminders.map((r) => (
                <Card
                  key={r.$id}
                  className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-primary/30 transition-all duration-200"
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex-1">
                      <p className="text-white font-medium break-words text-sm sm:text-base">
                        {r.projectId}
                      </p>
                      <p className="text-gray-400 text-xs sm:text-sm capitalize">
                        {r.service} scan — {r.frequency}
                        {r.databaseId && ` — DB: ${r.databaseId}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last Run: {new Date(r.lastRun).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`${
                          r.enabled
                            ? "border-green-500/40 text-green-400 hover:bg-green-500/10"
                            : "border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                        } w-full sm:w-auto text-xs sm:text-sm`}
                        onClick={async () => {
                          setLoadingReminders(true);
                          try {
                            await axios.patch(
                              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reminders/toggle`,
                              { reminderId: r.$id, enabled: !r.enabled }
                            );
                            toast.success(
                              `Reminder ${r.enabled ? "disabled" : "enabled"}`
                            );
                            fetchReminders();
                          } catch {
                            toast.error("Failed to toggle reminder");
                          } finally {
                            setLoadingReminders(false);
                          }
                        }}
                      >
                        {r.enabled ? "Disable" : "Enable"}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2 bg-red-500 text-xs sm:text-sm w-full sm:w-auto hover:bg-red-500/50"
                        onClick={() => handleReminderDeleteClick(r.$id)}
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-red-500 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 text-lg sm:text-xl">
              Delete Project?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This will permanently remove this project from your dashboard.
              This action cannot be undone.
              <br />
              <br />
              Your Appwrite project itself will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deleting} className="w-full sm:w-auto">
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

      <AlertDialog
        open={reminderDeleteDialogOpen}
        onOpenChange={setReminderDeleteDialogOpen}
      >
        <AlertDialogContent className="border-red-500 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 text-lg sm:text-xl">
              Delete Reminder?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This will permanently remove this reminder. The scheduled scans
              associated with it will stop running.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={reminderLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!reminderToDelete) return;
                setReminderLoading(true);
                try {
                  await axios.delete(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reminders/delete`,
                    {
                      data: { reminderId: reminderToDelete },
                    }
                  );
                  toast.success("Reminder deleted");
                  fetchReminders();
                } catch {
                  toast.error("Failed to delete reminder");
                } finally {
                  setReminderLoading(false);
                  setReminderDeleteDialogOpen(false);
                  setReminderToDelete(null);
                }
              }}
              disabled={reminderLoading}
              className="bg-red-500 hover:bg-red-600/80 w-full sm:w-auto"
            >
              {reminderLoading ? (
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
  );
}
