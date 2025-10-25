"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { motion, spring } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sprout, TrendingUp, Edit2, Check } from "lucide-react";
import AIGardenerChat from "@/components/app-components/AIGardenChat";
import Link from "next/link";

export default function AIGardenPage() {
  const { user } = useAuth();
  type GardenData = {
    health: number;
    total_scans: number;
    total_duplicates: number;
    total_cleaned: number;
    plant_name?: string;
  };

  const [gardenData, setGardenData] = useState<GardenData | null>(null);
  const [dailyMessage, setDailyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [plantName, setPlantName] = useState("Your Plant");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(plantName);

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

  // Fetch garden stats
  useEffect(() => {
    if (!user) return;

    const fetchGarden = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/garden/status?userId=${user.$id}`
        );
        setGardenData(res.data);

        const msgRes = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/garden/daily-message?userId=${user.$id}&health=${res.data.health}`
        );
        setDailyMessage(msgRes.data.message);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGarden();
  }, [user]);

  useEffect(() => {
    if (gardenData?.plant_name) {
      setPlantName(gardenData.plant_name);
      setTempName(gardenData.plant_name);
    }
  }, [gardenData]);

  // Save Plant Name
  const savePlantName = async () => {
    const trimmedName = tempName.trim();
    if (!trimmedName) return;

    try {
      if (!user) throw new Error("User not authenticated");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/garden/plant-name`,
        { userId: user.$id, plantName: trimmedName }
      );

      if (res.data.success) {
        setPlantName(trimmedName);
        setIsEditingName(false);
      } else {
        console.error("Failed to update plant name:", res.data.error);
      }
    } catch (err) {
      console.error("Error updating plant name:", err);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setShowLoader(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Verify If User is Logged In
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
            <span className="text-gray-400 text-lg">Loading Garden...</span>
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

  // Loader
  if (loading || !gardenData)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-gray-400 text-lg">Loading Garden...</span>
        </motion.div>
      </div>
    );

  const { health, total_scans, total_duplicates, total_cleaned } = gardenData;

  const getPlantState = () => {
    if (health >= 85) return "flourishing";
    if (health >= 60) return "blooming";
    if (health >= 30) return "recovering";
    return "wilting";
  };

  const plantState = getPlantState();

  const getPlantColor = () => {
    if (plantState === "flourishing") return "#10b981";
    if (plantState === "blooming") return "#22c55e";
    if (plantState === "recovering") return "#84cc16";
    return "#64748b";
  };

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
        className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/30 rounded-full blur-[120px] pointer-events-none"
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
            Your AI Garden
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto"
          >
            {dailyMessage}
          </motion.p>
        </motion.div>

        {/* Health Badge */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center mb-8"
        >
          <Badge
            variant="secondary"
            className="text-sm px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-emerald-500/30"
          >
            <Sprout className="w-6 h-6 mr-2 text-emerald-400" />
            {plantName} Health: {health}%
          </Badge>
        </motion.div>

        {/* Editable Plant Name */}
        <motion.div
          variants={itemVariants}
          className="
    absolute 
    -top-6 left-1/2 transform -translate-x-1/2 
    sm:-top-8 md:-top-10 
    flex justify-center
    z-20
  "
        >
          <Badge
            variant="secondary"
            className="
      text-sm px-3 sm:px-4 py-1.5 
      flex items-center gap-2 
      bg-primary-dark/30
      border-primary/40
      backdrop-blur-md
      rounded-full
      shadow-lg
    "
          >
            {isEditingName ? (
              <>
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && savePlantName()}
                  className="
            bg-white/10 text-white text-sm 
            px-2 py-1 rounded border border-white/20 
            focus:border-primary outline-none 
            w-28 sm:w-32
          "
                  autoFocus
                />
                <button
                  onClick={savePlantName}
                  className="text-primary hover:text-primary-light transition"
                >
                  <Check className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="font-semibold truncate max-w-[6rem] sm:max-w-[8rem]">
                  {plantName}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-gray-400 hover:text-primary transition"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </>
            )}
          </Badge>
        </motion.div>

        {/* Plant Visualization */}
        <motion.div variants={itemVariants} className="mb-12">
          <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <CardContent className="p-4 sm:p-8 md:p-12 relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
                className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[400px] aspect-[5/6] mx-auto"
              >
                <svg viewBox="0 0 200 240" className="w-full h-full">
                  <defs>
                    <radialGradient id="soilGradient">
                      <stop offset="0%" stopColor="#2d1810" />
                      <stop offset="100%" stopColor="#1a0f0a" />
                    </radialGradient>
                    <linearGradient
                      id="stemGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        stopColor={getPlantColor()}
                        stopOpacity="1"
                      />
                      <stop
                        offset="100%"
                        stopColor={getPlantColor()}
                        stopOpacity="0.7"
                      />
                    </linearGradient>
                    <radialGradient id="leafGradient">
                      <stop
                        offset="0%"
                        stopColor={getPlantColor()}
                        stopOpacity="1"
                      />
                      <stop
                        offset="100%"
                        stopColor={getPlantColor()}
                        stopOpacity="0.6"
                      />
                    </radialGradient>
                  </defs>

                  {(plantState === "flourishing" ||
                    plantState === "blooming") && (
                    <g opacity="0.3">
                      {[0, 30, 60, 90, 120, 150].map((angle, i) => (
                        <motion.line
                          key={i}
                          x1="100"
                          y1="30"
                          x2="100"
                          y2="10"
                          stroke="#fbbf24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          initial={{ opacity: 0, pathLength: 0 }}
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            pathLength: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          transform={`rotate(${angle}, 100, 20)`}
                        />
                      ))}
                    </g>
                  )}

                  <ellipse
                    cx="100"
                    cy="200"
                    rx="85"
                    ry="15"
                    fill="url(#soilGradient)"
                    opacity="0.9"
                  />
                  <ellipse
                    cx="100"
                    cy="198"
                    rx="80"
                    ry="12"
                    fill="#3a2418"
                    opacity="0.7"
                  />

                  <motion.path
                    d={`M 100 200 Q 98 ${
                      plantState === "wilting" ? 160 : 145
                    } 100 ${plantState === "wilting" ? 150 : 120}`}
                    stroke="url(#stemGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{
                      pathLength: 1,
                      d:
                        plantState === "wilting"
                          ? "M 100 200 Q 95 160 90 150"
                          : "M 100 200 Q 98 145 100 120",
                    }}
                    transition={{ duration: 1.2, type: "spring" }}
                  />

                  {plantState !== "wilting" && (
                    <>
                      <motion.path
                        d="M 100 165 Q 92 163 85 162"
                        stroke="url(#stemGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      />
                      <motion.path
                        d="M 100 165 Q 108 163 115 162"
                        stroke="url(#stemGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                      />
                      <motion.path
                        d="M 100 150 Q 92 149 85 148"
                        stroke="url(#stemGradient)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                      />
                      <motion.path
                        d="M 100 150 Q 108 149 115 148"
                        stroke="url(#stemGradient)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                      />
                    </>
                  )}

                  <motion.path
                    d="M 85 162 Q 70 152, 60 165 Q 68 175, 85 162 Z"
                    fill="url(#leafGradient)"
                    opacity={plantState === "wilting" ? 0.3 : 0.9}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: [0, -2, 0],
                    }}
                    transition={{
                      scale: { delay: 0.8, type: "spring" },
                      rotate: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    style={{ transformOrigin: "85px 162px" }}
                  />

                  <motion.path
                    d="M 115 162 Q 130 152, 140 165 Q 132 175, 115 162 Z"
                    fill="url(#leafGradient)"
                    opacity={plantState === "wilting" ? 0.3 : 0.9}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: [0, 2, 0],
                    }}
                    transition={{
                      scale: { delay: 0.8, type: "spring" },
                      rotate: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    style={{ transformOrigin: "115px 162px" }}
                  />

                  <motion.path
                    d="M 85 148 Q 70 138, 60 151 Q 68 161, 85 148 Z"
                    fill="url(#leafGradient)"
                    opacity={plantState === "wilting" ? 0.35 : 0.9}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: [0, -3, 0],
                    }}
                    transition={{
                      scale: { delay: 0.9, type: "spring" },
                      rotate: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    style={{ transformOrigin: "85px 148px" }}
                  />

                  <motion.path
                    d="M 115 148 Q 130 138, 140 151 Q 132 161, 115 148 Z"
                    fill="url(#leafGradient)"
                    opacity={plantState === "wilting" ? 0.35 : 0.9}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: [0, 3, 0],
                    }}
                    transition={{
                      scale: { delay: 0.9, type: "spring" },
                      rotate: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    style={{ transformOrigin: "115px 148px" }}
                  />

                  <motion.path
                    d="M 95 135 Q 80 125, 70 138 Q 78 148, 95 135 Z"
                    fill="url(#leafGradient)"
                    opacity={plantState === "wilting" ? 0.4 : 0.95}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: [0, -4, 0],
                    }}
                    transition={{
                      scale: { delay: 1.0, type: "spring" },
                      rotate: {
                        duration: 3.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    style={{ transformOrigin: "85px 135px" }}
                  />

                  <motion.path
                    d="M 105 135 Q 120 125, 130 138 Q 122 148, 105 135 Z"
                    fill="url(#leafGradient)"
                    opacity={plantState === "wilting" ? 0.4 : 0.95}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: [0, 4, 0],
                    }}
                    transition={{
                      scale: { delay: 1.0, type: "spring" },
                      rotate: {
                        duration: 3.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    style={{ transformOrigin: "115px 135px" }}
                  />

                  <motion.path
                    d="M 100 120 Q 85 110, 75 123 Q 83 133, 100 120 Z"
                    fill="url(#leafGradient)"
                    opacity={plantState === "wilting" ? 0.5 : 1}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: [0, -1.5, 0],
                    }}
                    transition={{
                      scale: { delay: 1.1, type: "spring" },
                      rotate: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    style={{ transformOrigin: "92px 119px" }}
                  />

                  <motion.path
                    d="M 100 120 Q 115 110, 125 123 Q 117 133, 100 120 Z"
                    fill="url(#leafGradient)"
                    opacity={plantState === "wilting" ? 0.5 : 1}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      rotate: [0, 1.5, 0],
                    }}
                    transition={{
                      scale: { delay: 1.1, type: "spring" },
                      rotate: {
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    style={{ transformOrigin: "108px 119px" }}
                  />

                  {(plantState === "blooming" ||
                    plantState === "flourishing") && (
                    <>
                      <defs>
                        <radialGradient id="petalGradient">
                          <stop offset="0%" stopColor="#fce7f3" />
                          <stop offset="50%" stopColor="#f9a8d4" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </radialGradient>
                        <radialGradient id="petalGradient2">
                          <stop offset="0%" stopColor="#fef3c7" />
                          <stop offset="50%" stopColor="#fcd34d" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </radialGradient>
                      </defs>

                      <g>
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(
                          (angle, i) => (
                            <motion.path
                              key={`outer-${i}`}
                              d={`M 100 ${
                                plantState === "flourishing" ? 100 : 110
                              } 
          Q ${100 + Math.cos(((angle - 20) * Math.PI) / 180) * 18} ${
                                (plantState === "flourishing" ? 100 : 110) +
                                Math.sin(((angle - 20) * Math.PI) / 180) * 18
                              }
          ${100 + Math.cos((angle * Math.PI) / 180) * 22} ${
                                (plantState === "flourishing" ? 100 : 110) +
                                Math.sin((angle * Math.PI) / 180) * 22
                              }
          Q ${100 + Math.cos(((angle + 20) * Math.PI) / 180) * 18} ${
                                (plantState === "flourishing" ? 100 : 110) +
                                Math.sin(((angle + 20) * Math.PI) / 180) * 18
                              }
          100 ${plantState === "flourishing" ? 100 : 110}`}
                              fill="url(#petalGradient)"
                              stroke="#ec4899"
                              strokeWidth="0.5"
                              opacity="0.95"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: 1,
                                opacity: 0.95,
                                y: [0, -1, 0],
                              }}
                              transition={{
                                scale: {
                                  delay: 1.5 + i * 0.08,
                                  type: "spring",
                                  stiffness: 200,
                                },
                                y: {
                                  duration: 3,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: "easeInOut",
                                },
                              }}
                            />
                          )
                        )}

                        {[30, 90, 150, 210, 270, 330].map((angle, i) => (
                          <motion.path
                            key={`middle-${i}`}
                            d={`M 100 ${
                              plantState === "flourishing" ? 100 : 110
                            } 
          Q ${100 + Math.cos(((angle - 15) * Math.PI) / 180) * 12} ${
                              (plantState === "flourishing" ? 100 : 110) +
                              Math.sin(((angle - 15) * Math.PI) / 180) * 12
                            }
          ${100 + Math.cos((angle * Math.PI) / 180) * 15} ${
                              (plantState === "flourishing" ? 100 : 110) +
                              Math.sin((angle * Math.PI) / 180) * 15
                            }
          Q ${100 + Math.cos(((angle + 15) * Math.PI) / 180) * 12} ${
                              (plantState === "flourishing" ? 100 : 110) +
                              Math.sin(((angle + 15) * Math.PI) / 180) * 12
                            }
          100 ${plantState === "flourishing" ? 100 : 110}`}
                            fill="#f9a8d4"
                            stroke="#f472b6"
                            strokeWidth="0.5"
                            opacity="0.98"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 0.98,
                              y: [0, -0.8, 0],
                            }}
                            transition={{
                              scale: {
                                delay: 1.8 + i * 0.08,
                                type: "spring",
                                stiffness: 200,
                              },
                              y: {
                                duration: 2.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: "easeInOut",
                              },
                            }}
                          />
                        ))}

                        {[45, 135, 225, 315].map((angle, i) => (
                          <motion.ellipse
                            key={`inner-${i}`}
                            cx={100 + Math.cos((angle * Math.PI) / 180) * 6}
                            cy={
                              (plantState === "flourishing" ? 100 : 110) +
                              Math.sin((angle * Math.PI) / 180) * 6
                            }
                            rx="6"
                            ry="8"
                            fill="#fce7f3"
                            opacity="1"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                            }}
                            transition={{
                              delay: 2.1 + i * 0.05,
                              type: "spring",
                              stiffness: 250,
                            }}
                          />
                        ))}

                        <motion.circle
                          cx="100"
                          cy={plantState === "flourishing" ? 100 : 110}
                          r="4"
                          fill="#fbbf24"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 2.3,
                            type: "spring",
                            stiffness: 300,
                          }}
                        />
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                          <motion.circle
                            key={`stamen-${i}`}
                            cx={100 + Math.cos((angle * Math.PI) / 180) * 3}
                            cy={
                              (plantState === "flourishing" ? 100 : 110) +
                              Math.sin((angle * Math.PI) / 180) * 3
                            }
                            r="1"
                            fill="#f59e0b"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: 2.4 + i * 0.03,
                              type: "spring",
                            }}
                          />
                        ))}
                      </g>

                      {plantState === "flourishing" && (
                        <>
                          <g>
                            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                              <motion.path
                                key={`left-${i}`}
                                d={`M 75 120
              Q ${75 + Math.cos(((angle - 20) * Math.PI) / 180) * 9} ${
                                  120 +
                                  Math.sin(((angle - 20) * Math.PI) / 180) * 9
                                }
              ${75 + Math.cos((angle * Math.PI) / 180) * 11} ${
                                  120 + Math.sin((angle * Math.PI) / 180) * 11
                                }
              Q ${75 + Math.cos(((angle + 20) * Math.PI) / 180) * 9} ${
                                  120 +
                                  Math.sin(((angle + 20) * Math.PI) / 180) * 9
                                }
              75 120`}
                                fill="url(#petalGradient2)"
                                stroke="#f59e0b"
                                strokeWidth="0.4"
                                opacity="0.9"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                  scale: 1,
                                  opacity: 0.9,
                                  y: [0, -0.8, 0],
                                }}
                                transition={{
                                  scale: {
                                    delay: 2.5 + i * 0.06,
                                    type: "spring",
                                  },
                                  y: {
                                    duration: 3.2,
                                    repeat: Infinity,
                                    delay: i * 0.12,
                                    ease: "easeInOut",
                                  },
                                }}
                              />
                            ))}
                            <motion.circle
                              cx="75"
                              cy="120"
                              r="3.5"
                              fill="#92400e"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 2.9, type: "spring" }}
                            />
                          </g>

                          <g>
                            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                              <motion.path
                                key={`right-${i}`}
                                d={`M 125 120
              Q ${125 + Math.cos(((angle - 20) * Math.PI) / 180) * 9} ${
                                  120 +
                                  Math.sin(((angle - 20) * Math.PI) / 180) * 9
                                }
              ${125 + Math.cos((angle * Math.PI) / 180) * 11} ${
                                  120 + Math.sin((angle * Math.PI) / 180) * 11
                                }
              Q ${125 + Math.cos(((angle + 20) * Math.PI) / 180) * 9} ${
                                  120 +
                                  Math.sin(((angle + 20) * Math.PI) / 180) * 9
                                }
              125 120`}
                                fill="#ddd6fe"
                                stroke="#a78bfa"
                                strokeWidth="0.4"
                                opacity="0.9"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                  scale: 1,
                                  opacity: 0.9,
                                  y: [0, -0.8, 0],
                                }}
                                transition={{
                                  scale: {
                                    delay: 2.6 + i * 0.06,
                                    type: "spring",
                                  },
                                  y: {
                                    duration: 3.5,
                                    repeat: Infinity,
                                    delay: i * 0.12,
                                    ease: "easeInOut",
                                  },
                                }}
                              />
                            ))}
                            <motion.circle
                              cx="125"
                              cy="120"
                              r="3.5"
                              fill="#7c3aed"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 3, type: "spring" }}
                            />
                          </g>
                        </>
                      )}
                    </>
                  )}

                  {plantState === "flourishing" && (
                    <>
                      <motion.g
                        initial={{ x: -20, y: 0, opacity: 0 }}
                        animate={{
                          x: [0, 40, 80, 40, 0],
                          y: [0, -20, -10, -30, 0],
                          opacity: [0, 1, 1, 1, 0],
                        }}
                        transition={{
                          duration: 8,
                          repeat: Infinity,
                          delay: 3,
                        }}
                      >
                        <ellipse
                          cx="50"
                          cy="80"
                          rx="4"
                          ry="6"
                          fill="#a855f7"
                          opacity="0.8"
                        />
                        <ellipse
                          cx="58"
                          cy="80"
                          rx="4"
                          ry="6"
                          fill="#a855f7"
                          opacity="0.8"
                        />
                      </motion.g>

                      <motion.g
                        initial={{ x: 150, y: 60, opacity: 0 }}
                        animate={{
                          x: [150, 120, 90, 120, 150],
                          y: [60, 40, 50, 30, 60],
                          opacity: [0, 1, 1, 1, 0],
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          delay: 5,
                        }}
                      >
                        <ellipse
                          cx="0"
                          cy="0"
                          rx="4"
                          ry="6"
                          fill="#ec4899"
                          opacity="0.8"
                        />
                        <ellipse
                          cx="8"
                          cy="0"
                          rx="4"
                          ry="6"
                          fill="#ec4899"
                          opacity="0.8"
                        />
                      </motion.g>
                    </>
                  )}

                  {plantState === "flourishing" && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.circle
                          key={i}
                          cx={60 + i * 16}
                          cy={80 + (i % 2) * 20}
                          r="2"
                          fill="#fbbf24"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3 + 2.5,
                          }}
                        />
                      ))}
                    </>
                  )}
                </svg>

                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl"
                  animate={{
                    background:
                      plantState === "flourishing"
                        ? "radial-gradient(circle at center, rgba(16,185,129,0.35), rgba(244,114,182,0.15), transparent 70%)"
                        : plantState === "blooming"
                        ? "radial-gradient(circle at center, rgba(34,197,94,0.25), transparent 70%)"
                        : plantState === "recovering"
                        ? "radial-gradient(circle at center, rgba(132,204,22,0.2), transparent 70%)"
                        : "radial-gradient(circle at center, rgba(100,116,139,0.15), transparent 70%)",
                  }}
                  transition={{ duration: 1.2 }}
                />

                {plantState === "flourishing" && (
                  <motion.div
                    className="absolute inset-0 rounded-full blur-2xl"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    style={{
                      background:
                        "radial-gradient(circle at center, rgba(244,114,182,0.3), transparent 60%)",
                    }}
                  />
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.7 }}
                className="text-center mt-4 sm:mt-6"
              >
                <p className="text-base sm:text-lg md:text-xl font-semibold text-white capitalize">
                  {plantState}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-primary" />
              Garden Statistics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-6 relative text-center">
                  <p className="text-sm text-gray-400 mb-2">Total Scans</p>
                  <p className="text-4xl font-bold text-blue-400">
                    {total_scans}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-6 relative text-center">
                  <p className="text-sm text-gray-400 mb-2">Duplicates Found</p>
                  <p className="text-4xl font-bold text-rose-400">
                    {total_duplicates}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                <CardContent className="p-6 relative text-center">
                  <p className="text-sm text-gray-400 mb-2">
                    Duplicates Cleaned
                  </p>
                  <p className="text-4xl font-bold text-emerald-400">
                    {total_cleaned}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>
      </motion.div>

      {/* Chat Component */}
      <AIGardenerChat user={user} gardenData={gardenData} />
    </div>
  );
}
