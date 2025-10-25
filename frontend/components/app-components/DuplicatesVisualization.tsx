"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";

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

interface DuplicatesVisualizationProps {
  duplicates: DuplicateItem[];
  isLoading?: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  text: "#3b82f6",
  file: "#10b981",
  other: "#facc15",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  resolved: "#10b981",
  ignored: "#6b7280",
};

// Empty State Component
const EmptyState = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p className="mt-2 text-sm text-gray-400">No data to display</p>
    </div>
  </div>
);

// Loading State Component
const LoadingState = () => (
  <div className="flex items-center justify-center pt-10 h-full">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      <p className="mt-2 text-sm text-gray-400">Loading data...</p>
    </div>
  </div>
);

export function DuplicatesVisualization({
  duplicates,
  isLoading = false,
}: DuplicatesVisualizationProps) {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
    } else {
      const timer = setTimeout(() => setShowLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Parse duplicate data
  const parseDuplicateData = (data: string): ParsedDuplicateData => {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  };

  if (showLoading) {
    return <LoadingState />;
  }

  if (!duplicates || duplicates.length === 0) {
    return <EmptyState />;
  }

  // Data Processing
  const typeData = Object.entries(
    duplicates.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    type,
    count,
    percentage: ((count / duplicates.length) * 100).toFixed(1),
  }));

  const serviceData = Object.entries(
    duplicates.reduce((acc, d) => {
      acc[d.service] = (acc[d.service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([service, count]) => ({ service, count }));

  const statusData = Object.entries(
    duplicates.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count }));

  const bins = [0, 0.5, 0.75, 0.85, 0.95, 1.01];
  const labels = ["0-50%", "50-75%", "75-85%", "85-95%", "95-100%"];
  const similarityCounts = [0, 0, 0, 0, 0];
  duplicates.forEach((d) => {
    const score = parseDuplicateData(d.duplicateData).similarity_score ?? 0;
    for (let i = 0; i < bins.length - 1; i++) {
      if (score >= bins[i] && score < bins[i + 1]) similarityCounts[i]++;
    }
  });
  const similarityData = labels.map((r, i) => ({
    range: r,
    count: similarityCounts[i],
  }));

  const avgSimilarity =
    duplicates.length > 0
      ? (
          (duplicates.reduce(
            (sum, d) =>
              sum + (parseDuplicateData(d.duplicateData).similarity_score ?? 0),
            0
          ) /
            duplicates.length) *
          100
        ).toFixed(1)
      : "0";

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      payload?: { percentage?: string };
    }>;
  }) => {
    if (active && payload?.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-300 text-sm">Count: {data.value}</p>
          {data.payload?.percentage && (
            <p className="text-gray-400 text-xs">{data.payload.percentage}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, outerRadius, percent, type } = props;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="13"
      >
        {`${type} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Duplicates"
          value={duplicates.length}
          color="blue"
        />
        <StatCard
          label="Avg Similarity"
          value={`${avgSimilarity}%`}
          color="purple"
        />
        <StatCard label="Services" value={serviceData.length} color="green" />
        <StatCard label="Types" value={typeData.length} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Duplicates by Type">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label={renderCustomLabel}
                labelLine={false}
              >
                {typeData.map((d, i) => (
                  <Cell key={i} fill={TYPE_COLORS[d.type] || "#facc15"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Similarity Score">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={similarityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
              <XAxis
                dataKey="range"
                stroke="#9ca3af"
                tick={{ fill: "#9ca3af" }}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: "#9ca3af" }} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status Overview">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                labelLine={false}
              >
                {statusData.map((d, i) => (
                  <Cell key={i} fill={STATUS_COLORS[d.status] || "#6b7280"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200">
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <div className="h-[220px]">{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
    green: "from-green-500/20 to-green-600/10 border-green-500/20",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/20",
  };
  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} backdrop-blur-sm rounded-lg p-3 border hover:opacity-90 transition-all duration-200`}
    >
      <p className="text-white/80 text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
