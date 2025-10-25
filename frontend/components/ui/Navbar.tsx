"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { storage } from "@/utils/appwrite";
import {
  Menu,
  X,
  LogOut,
  User,
  Home,
  Sparkles,
  LayoutDashboard,
  ChevronDown,
  Sprout,
} from "lucide-react";

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "profile_pictures";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch Profile Picture
  useEffect(() => {
    if (user) {
      try {
        const url = storage
          .getFileView(BUCKET_ID, `pfp_${user.$id}`)
          .toString();
        setPfpUrl(url);
      } catch (error) {
        console.error("Could not load profile picture:", error);
        setPfpUrl(null);
      }
    }
  }, [user]);

  // Close Profile Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dropdown Positioning
  useEffect(() => {
    if (isProfileOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        left: rect.right - 192,
      });
    }
  }, [isProfileOpen]);

  // Logout Handler
  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ai-garden", label: "AI Garden", icon: Sprout },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg backdrop-blur-sm border border-primary/30 group-hover:border-primary/50 transition-colors"
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary hidden sm:inline">
              AADD
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(link.href)
                        ? "bg-white/10 text-primary"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Profile Menu */}
                <div ref={profileRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 group-hover:border-primary/50 transition-colors bg-gradient-to-br from-primary/20 to-primary/10">
                      {pfpUrl ? (
                        <Image
                          src={pfpUrl}
                          alt={user.name || "Profile"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary/50" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-300 hidden sm:inline max-w-[100px] truncate">
                      {user.name || "User"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  {/* Dropdown Menu */}
                  {typeof window !== "undefined" &&
                    createPortal(
                      <AnimatePresence>
                        {isProfileOpen && dropdownPos && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: "fixed",
                              top: dropdownPos.top,
                              left: dropdownPos.left,
                              zIndex: 9999,
                            }}
                            className="w-48 rounded-xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-2xl backdrop-saturate-150 shadow-2xl supports-[backdrop-filter]:bg-white/10"
                          >
                            <div className="p-3 border-b border-white/10">
                              <p className="text-sm text-gray-300 font-medium truncate">
                                {user.name || "User"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>

                            <div className="p-2 space-y-1">
                              <Link href="/profile">
                                <motion.div
                                  whileHover={{
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 rounded text-sm text-gray-300 hover:text-primary transition-colors"
                                >
                                  <User className="w-4 h-4" />
                                  Profile
                                </motion.div>
                              </Link>
                            </div>

                            <div className="p-2 border-t border-white/10">
                              <motion.button
                                whileHover={{
                                  backgroundColor: "rgba(255,255,255,0.1)",
                                }}
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                Logout
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>,
                      document.body
                    )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-lg transition-all"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/5 bg-white/5"
            >
              <div className="p-4 space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <motion.div
                        whileHover={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          isActive(link.href)
                            ? "bg-white/10 text-primary"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {link.label}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}

                {!user && (
                  <div className="flex gap-2 pt-2">
                    <Link href="/login" className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="w-full px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        Sign In
                      </motion.button>
                    </Link>
                    <Link href="/signup" className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="w-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg"
                      >
                        Sign Up
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
