"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence, spring } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  HardDrive,
  Search,
  Loader2,
  FileStack,
  ChevronRight,
  RefreshCw,
  Layers,
} from "lucide-react";
import { addUserActivity } from "@/lib/activities";

interface AppwriteStorage {
  $id: string;
  name: string;
}

interface Collection {
  $id: string;
  name: string;
}

interface ProjectResources {
  storages: AppwriteStorage[];
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
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: spring,
      stiffness: 100,
      damping: 12,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.15 },
  },
};

export default function DuplicatesOverview({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { projectId } = use(params);

  const searchParams = useSearchParams();
  const endpoint =
    searchParams.get("endpoint") || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

  const [resources, setResources] = useState<ProjectResources>({
    storages: [],
  });
  const [databaseIdInput, setDatabaseIdInput] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingResources, setLoadingResources] = useState(true);

  // Fetch Project Resources (Databases, Storages)
  const fetchResources = useCallback(async () => {
    if (!user) return;
    setLoadingResources(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/duplicates/list`,
        { userId: user.$id, projectId }
      );
      if (res.data.status === "success") {
        setResources({ storages: res.data.storages || [] });
      } else {
        toast.error("Failed to fetch project resources");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project resources");
    } finally {
      setLoadingResources(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Fetch Collections for a given Database ID
  const fetchCollections = async () => {
    if (!user || !databaseIdInput.trim()) {
      toast.error("Please enter a database ID");
      return;
    }
    setLoadingCollections(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/duplicates/collections`,
        {
          userId: user.$id,
          projectId,
          databaseId: databaseIdInput.trim(),
        }
      );
      setCollections(res.data.collections || []);
      if (res.data.collections?.length === 0) {
        toast.info("No collections found in this database");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch collections");
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  };

  // Scanning Handler
  const handleScan = async (
    service: string,
    databaseId?: string,
    collectionId?: string
  ) => {
    let url = `/duplicates/${projectId}/${service}?endpoint=${encodeURIComponent(
      endpoint ?? ""
    )}`;
    if (service === "database" && databaseId) {
      url += `&databaseId=${databaseId}`;
      if (collectionId) url += `&collectionId=${collectionId}`;
    }

    if (user) {
      await addUserActivity(
        user.$id,
        `Started duplicate scan for ${service}${
          databaseId ? ` database ${databaseId}` : ""
        }${collectionId ? ` collection ${collectionId}` : ""}`,
        "scan",
        projectId
      );
    }
    router.push(url);
  };

  // Loader
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          <span className="text-gray-400 text-base sm:text-lg">
            Authenticating...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 pb-6 sm:pb-10 relative overflow-hidden">
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
        className="relative z-10 max-w-5xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-3 sm:mb-4 px-4"
          >
            Duplicate Detection
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4"
          >
            Find and manage duplicate files across your Appwrite project
          </motion.p>
        </motion.div>

        {/* Database Section */}
        <motion.section variants={itemVariants} className="mb-6 sm:mb-8">
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

              <CardHeader className="relative p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="p-2 sm:p-3 bg-primary/10 rounded-xl border border-primary/20 flex-shrink-0"
                    >
                      <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-lg sm:text-xl md:text-2xl flex items-center gap-2 flex-wrap">
                        Databases
                        <Badge variant="secondary" className="text-xs">
                          Collections
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Scan your database collections for duplicates
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      handleScan("database", databaseIdInput.trim())
                    }
                    disabled={!databaseIdInput.trim()}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 w-full sm:w-auto text-sm sm:text-base"
                  >
                    <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                    Scan Database
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter database ID..."
                      value={databaseIdInput}
                      onChange={(e) => setDatabaseIdInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && fetchCollections()}
                      className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 text-sm sm:text-base"
                    />
                  </div>

                  <Button
                    onClick={fetchCollections}
                    disabled={loadingCollections || !databaseIdInput.trim()}
                    variant="outline"
                    className="gap-2 w-full sm:w-auto text-sm sm:text-base hover:bg-white/10"
                  >
                    {loadingCollections ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
                        View Collections
                      </>
                    )}
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {collections.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 pt-2"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <FileStack className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-400">
                          {collections.length} collection
                          {collections.length !== 1 ? "s" : ""} found
                        </span>
                      </div>

                      <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 scrollbar-hidden">
                        <AnimatePresence>
                          {collections.map((col, index) => (
                            <motion.div
                              key={col.$id}
                              variants={listItemVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              custom={index}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 5 }}
                              className="group"
                            >
                              <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                      <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-medium truncate text-sm sm:text-base">
                                        {col.name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate font-mono">
                                        {col.$id}
                                      </p>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={() =>
                                      handleScan(
                                        "database",
                                        databaseIdInput.trim(),
                                        col.$id
                                      )
                                    }
                                    size="sm"
                                    className="gap-1 sm:gap-2 shrink-0 bg-gradient-to-r from-primary/80 to-primary/60 hover:from-primary hover:to-primary/80 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                                  >
                                    <Search className="w-3 h-3" />
                                    <span className="hidden xs:inline">
                                      Scan
                                    </span>
                                    <ChevronRight className="w-3 h-3" />
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>

        {/* Storage Section */}
        <motion.section variants={itemVariants}>
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

              <CardHeader className="relative p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className="p-2 sm:p-3 bg-primary/10 rounded-xl border border-primary/20 flex-shrink-0"
                    >
                      <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-lg sm:text-xl md:text-2xl flex items-center gap-2 flex-wrap">
                        Storage
                        <Badge variant="secondary" className="text-xs">
                          {resources.storages.length} bucket
                          {resources.storages.length !== 1 ? "s" : ""}
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Find duplicate files in your storage buckets
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      onClick={fetchResources}
                      disabled={loadingResources}
                      variant="outline"
                      size="sm"
                      className="gap-2 text-sm hover:bg-white/10"
                    >
                      <RefreshCw
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          loadingResources ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>

                    <Button
                      onClick={async () => {
                        if (user) {
                          await addUserActivity(
                            user.$id,
                            `Started duplicate scan for all storage buckets`,
                            "scan",
                            projectId
                          );
                        }
                        handleScan("storage");
                      }}
                      disabled={!resources.storages.length}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm"
                    >
                      <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Scan All</span>
                      <span className="xs:hidden">Scan</span> Storage
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative p-4 sm:p-6">
                {loadingResources ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-8 sm:py-12"
                  >
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary mr-3" />
                    <span className="text-gray-400 text-sm sm:text-base">
                      Loading storage buckets...
                    </span>
                  </motion.div>
                ) : resources.storages.length > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {resources.storages.map((st, index) => (
                        <motion.div
                          key={st.$id}
                          variants={listItemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          custom={index}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ x: 5 }}
                          className="group"
                        >
                          <Card className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                            <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                <HardDrive className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate text-sm sm:text-base">
                                  {st.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate font-mono">
                                  {st.$id}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className="bg-primary/10 text-primary border-primary/20 text-xs flex-shrink-0"
                              >
                                Bucket
                              </Badge>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 sm:py-12"
                  >
                    <div className="inline-flex p-3 sm:p-4 bg-white/5 rounded-2xl mb-3 sm:mb-4">
                      <HardDrive className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 mb-2 text-sm sm:text-base">
                      No storage buckets found
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm px-4">
                      Create storage buckets in your Appwrite project first
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.section>
      </motion.div>
    </div>
  );
}
