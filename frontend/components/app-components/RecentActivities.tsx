"use client";

import { useEffect, useState } from "react";
import { getUserActivities, Activity } from "@/lib/activities";
import { Loader2, Clock, Trash2, RefreshCw, PlusCircle } from "lucide-react";
import { motion, spring } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  userId: string;
}

export default function RecentActivity({ userId }: Props) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Most Recent Activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getUserActivities(userId);
        if (data.length > 0) setActivity(data[0]);
      } catch (err) {
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [userId]);

  const getIcon = (type: string) => {
    switch (type) {
      case "delete":
        return <Trash2 className="w-6 h-6 text-red-500" />;
      case "refresh":
        return <RefreshCw className="w-6 h-6 text-blue-400" />;
      case "create":
        return <PlusCircle className="w-6 h-6 text-green-400" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { type: spring, stiffness: 100, damping: 15 },
      }}
    >
      <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden min-h-[226px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="relative flex-1 flex items-center justify-center">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-300">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
              Loading activity...
            </div>
          ) : !activity ? (
            <p className="text-gray-400 text-center text-sm">
              No recent activity found.
            </p>
          ) : (
            <div className="flex items-start gap-3 border-l-4 border-primary/50 pl-5 pr-1 py-4 rounded-lg bg-white/5 w-full max-w-full">
              {getIcon(activity.type)}
              <div>
                <p className="text-sm text-white">{activity.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
