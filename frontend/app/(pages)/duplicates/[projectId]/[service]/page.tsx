"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence, spring } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  Trash2,
  RefreshCw,
  Search,
  ArrowUpDown,
  CheckSquare,
  Square,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { addUserActivity } from "@/lib/activities";
import { DuplicatesVisualization } from "@/components/app-components/DuplicatesVisualization";

interface DuplicateItem {
  $id: string;
  service: string;
  type: string;
  originalId: string;
  duplicateId: string;
  duplicateData: string;
  status: string;
  databaseId?: string;
  collectionId?: string;
  bucketId?: string;
}

interface ParsedDuplicateData {
  name?: string;
  url?: string;
  filename?: string;
  similarity_score?: number;
}

const TYPE_COLORS: Record<
  string,
  { border: string; bg: string; badge: string }
> = {
  text: {
    border: "border-blue-500/50",
    bg: "bg-blue-500/10",
    badge: "bg-blue-500/20 text-blue-300",
  },
  file: {
    border: "border-green-500/50",
    bg: "bg-green-500/10",
    badge: "bg-green-500/20 text-green-300",
  },
};

type SortOption = "name" | "similarity" | "type" | "service";

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export default function DuplicatesPage() {
  const { user } = useAuth();
  const { projectId, service } = useParams() as {
    projectId: string;
    service: string;
  };
  const searchParams = useSearchParams();
  const databaseId = searchParams.get("databaseId") || undefined;
  const collectionId = searchParams.get("collectionId") || undefined;

  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
  const [filteredDuplicates, setFilteredDuplicates] = useState<DuplicateItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [deleteData, setDeleteData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isScanning = useRef(false);

  const endpoint =
    searchParams.get("endpoint") || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const url = new URL(endpoint ?? "");
  const region = url.hostname.split(".")[0];

  // Fetch Duplicates
  const fetchDuplicates = useCallback(async () => {
    if (!user) return;

    if (isScanning.current) {
      console.log("Scan already in progress, skipping...");
      return;
    }

    isScanning.current = true;
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/duplicates/scan`,
        {
          userId: user.$id,
          projectId,
          service,
          databaseId,
          collectionId,
        }
      );

      if (res.data.status === "success") {
        setDuplicates(res.data.data || []);
        setFilteredDuplicates(res.data.data || []);
        setSelectedIds(new Set());

        await addUserActivity(
          user.$id,
          `Scanned duplicates for ${service.toUpperCase()}${
            databaseId ? ` database ${databaseId}` : ""
          }${collectionId ? ` collection ${collectionId}` : ""}`,
          "scan",
          projectId
        );
      } else {
        setDuplicates([]);
        setFilteredDuplicates([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch duplicates");
    } finally {
      setLoading(false);
      isScanning.current = false;
    }
  }, [user, projectId, service, databaseId, collectionId]);

  useEffect(() => {
    fetchDuplicates();
  }, [fetchDuplicates]);

  // Filter + Sort Duplicates
  useEffect(() => {
    let filtered = [...duplicates];

    // Search Filter
    if (searchQuery) {
      filtered = filtered.filter((dup) => {
        const dupInfo = parseDuplicateData(dup.duplicateData);
        const searchLower = searchQuery.toLowerCase();
        return (
          dupInfo.name?.toLowerCase().includes(searchLower) ||
          dup.duplicateId.toLowerCase().includes(searchLower) ||
          dup.type.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const aData = parseDuplicateData(a.duplicateData);
      const bData = parseDuplicateData(b.duplicateData);

      switch (sortBy) {
        case "name":
          return (aData.name || a.duplicateId).localeCompare(
            bData.name || b.duplicateId
          );
        case "similarity":
          return (bData.similarity_score || 0) - (aData.similarity_score || 0);
        case "type":
          return a.type.localeCompare(b.type);
        case "service":
          return a.service.localeCompare(b.service);
        default:
          return 0;
      }
    });

    setFilteredDuplicates(filtered);
  }, [duplicates, searchQuery, sortBy]);

  // Duplicate Data Parser
  const parseDuplicateData = (data: string): ParsedDuplicateData => {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  };

  // Select All Handler
  const handleSelectAll = () => {
    if (selectedIds.size === filteredDuplicates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDuplicates.map((d) => d.$id)));
    }
  };

  // Select One Handler
  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Deletion Handler
  const handleDelete = async () => {
    if (!user || selectedIds.size === 0) return;

    setIsDeleting(true);

    try {
      // Multiple Delete
      if (selectedIds.size > 1) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/duplicates/delete_bulk`,
          {
            userId: user.$id,
            projectId,
            duplicateIds: Array.from(selectedIds),
            deleteData,
          }
        );

        const { successCount, failCount } = response.data;

        if (successCount > 0) {
          toast.success(`Successfully deleted ${successCount} duplicate(s)`);
          setDuplicates((prev) => prev.filter((d) => !selectedIds.has(d.$id)));
          setSelectedIds(new Set());

          await addUserActivity(
            user.$id,
            `Deleted ${successCount} duplicate(s) from ${service.toUpperCase()}`,
            "delete",
            projectId
          );
        }

        if (failCount > 0) {
          toast.error(`Failed to delete ${failCount} duplicate(s)`);
        }
      } else {
        // Single Delete
        const dupId = Array.from(selectedIds)[0];
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/duplicates/delete_single`,
          {
            userId: user.$id,
            projectId,
            duplicateId: dupId,
            deleteData,
          }
        );

        toast.success("Duplicate deleted successfully");
        setDuplicates((prev) => prev.filter((d) => d.$id !== dupId));
        setSelectedIds(new Set());

        await addUserActivity(
          user.$id,
          `Deleted 1 duplicate from ${service.toUpperCase()}`,
          "delete",
          projectId
        );
      }
    } catch (err: unknown) {
      console.error("Delete error:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        // @ts-expect-error: err may have response property
        toast.error(err.response?.data?.error || "Failed to delete duplicates");
      } else {
        toast.error("Failed to delete duplicates");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Get Type Based File Icon
  const getFileIcon = (type: string, filename?: string) => {
    if (type === "text") return <FileText className="w-5 h-5" />;

    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return <ImageIcon className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  // Similarity Color
  const getSimilarityColor = (score: number) => {
    if (score >= 0.95) return "text-red-400";
    if (score >= 0.85) return "text-orange-400";
    if (score >= 0.75) return "text-yellow-400";
    return "text-green-400";
  };

  // Loader
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-400 text-lg">Authenticating...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-10 pt-20 pb-10 relative overflow-hidden">
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
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Header + Title */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary mb-2 sm:mb-3 break-words"
          >
            Duplicate Files — {service.toUpperCase()}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Manage and clean up duplicate files in your Appwrite project
          </motion.p>
        </motion.div>

        {/* Visualization Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="max-w-7xl mx-auto px-2 sm:px-0">
            <DuplicatesVisualization
              duplicates={filteredDuplicates}
              isLoading={loading}
            />
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  Total:{" "}
                  <span className="ml-2 font-bold text-primary">
                    {filteredDuplicates.length}
                  </span>
                </Badge>
                {selectedIds.size > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Badge
                      variant="default"
                      className="text-base px-4 py-2 bg-primary/20"
                    >
                      Selected:{" "}
                      <span className="ml-2 font-bold">{selectedIds.size}</span>
                    </Badge>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="delete-source"
                    checked={deleteData}
                    onCheckedChange={() => setDeleteData(!deleteData)}
                  />
                  <label
                    htmlFor="delete-source"
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    Delete from source
                  </label>
                </div>

                <Button
                  onClick={fetchDuplicates}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-white/10"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50"
                />
              </div>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border-white/10">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border-white/10">
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="similarity">Sort by Similarity</SelectItem>
                  <SelectItem value="type">Sort by Type</SelectItem>
                  <SelectItem value="service">Sort by Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {filteredDuplicates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-white/10"
                >
                  {selectedIds.size === filteredDuplicates.length ? (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" />
                      Select All
                    </>
                  )}
                </Button>

                <AnimatePresence>
                  {selectedIds.size > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <Button
                        onClick={() => setShowDeleteDialog(true)}
                        variant="destructive"
                        size="sm"
                        className="gap-2 bg-red-500 hover:bg-red-600/80"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedIds.size})
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <Loader2 className="animate-spin w-8 h-8 mr-3 text-primary" />
            <span className="text-gray-300 text-lg">
              Scanning for duplicates...
            </span>
          </motion.div>
        ) : filteredDuplicates.length === 0 ? (
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
                  className="text-6xl text-center mb-4"
                >
                  🎉
                </motion.div>
                <p className="text-xl text-center text-gray-300 font-medium mb-2">
                  {searchQuery
                    ? "No duplicates match your search"
                    : "No duplicate files detected!"}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="link"
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredDuplicates.map((dup: DuplicateItem, index: number) => {
                const dupInfo = parseDuplicateData(dup.duplicateData);
                const isSelected = selectedIds.has(dup.$id);
                const colorScheme = TYPE_COLORS[dup.type] || TYPE_COLORS.file;

                let fileUrl: string | null = null;
                if (
                  dup.service === "storage" &&
                  dup.bucketId &&
                  dup.duplicateId
                ) {
                  fileUrl = `https://cloud.appwrite.io/console/project-${region}-${projectId}/storage/bucket-${dup.bucketId}/file-${dup.duplicateId}`;
                }

                let consoleUrl: string | null = null;
                if (
                  dup.service === "database" &&
                  dup.databaseId &&
                  dup.collectionId
                ) {
                  consoleUrl = `https://cloud.appwrite.io/console/project-${region}-${projectId}/databases/database-${dup.databaseId}/table-${dup.collectionId}/row-${dup.duplicateId}`;
                }

                return (
                  <motion.div
                    key={dup.$id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.03,
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card
                      className={`relative transition-all duration-200 hover:shadow-xl ${
                        isSelected
                          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
                          : ""
                      } ${colorScheme.border} ${
                        colorScheme.bg
                      } backdrop-blur-sm`}
                    >
                      <CardContent className="p-4">
                        {/* Selection Checkbox */}
                        <div className="absolute top-3 right-3 z-10">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectOne(dup.$id)}
                            className="border-2"
                          />
                        </div>

                        {/* Icon + Badges */}
                        <div className="flex items-start gap-3 mb-3">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="p-2 rounded-lg bg-white/5"
                          >
                            {getFileIcon(dup.type, dupInfo.filename)}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <Badge
                              className={`${colorScheme.badge} text-xs mb-2`}
                            >
                              {dup.type.toUpperCase()}
                            </Badge>
                            {dupInfo.similarity_score !== undefined && (
                              <div
                                className={`text-sm font-mono ${getSimilarityColor(
                                  dupInfo.similarity_score
                                )}`}
                              >
                                {(dupInfo.similarity_score * 100).toFixed(1)}%
                                match
                              </div>
                            )}
                          </div>
                        </div>

                        {/* File Info */}
                        <div className="space-y-2 mb-4">
                          <h3 className="text-white font-medium truncate text-sm">
                            {dupInfo.name ||
                              dupInfo.filename ||
                              dup.duplicateId}
                          </h3>
                          <p className="text-xs text-gray-400 truncate font-mono">
                            ID: {dup.duplicateId}
                          </p>
                          <div className="flex gap-2 text-xs text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {dup.service.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          {fileUrl && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 hover:bg-white/10"
                            >
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View in Console
                              </a>
                            </Button>
                          )}
                          {consoleUrl && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 hover:bg-white/10"
                            >
                              <a
                                href={consoleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Open in Appwrite
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-red-500 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">
              Delete {selectedIds.size} duplicate(s)?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteData
                ? "This will permanently delete the selected duplicates from both the database and the source."
                : "This will remove the selected duplicates from the duplicates list only."}
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600/80"
            >
              {isDeleting ? (
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
