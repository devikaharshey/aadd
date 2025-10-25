"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Github, Mail, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl h-45"
    >
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Section — Powered by Appwrite */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Powered by</span>
          <Image
            src="/appwrite-logo.png"
            alt="Appwrite Logo"
            width={22}
            height={22}
            className="object-contain"
          />
          <span className="text-primary font-semibold">Appwrite</span>
        </div>

        {/* Center Section — Links */}
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/ai-garden"
            className="hover:text-primary transition-colors"
          >
            AI Garden
          </Link>
          <Link
            href="/user-guide"
            className="hover:text-primary transition-colors"
          >
            User Guide
          </Link>
        </div>

        {/* Right Section — Social Icons */}
        <div className="flex items-center gap-4">
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-primary transition-colors"
          >
            <Github className="w-4 h-4" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="https://www.linkedin.com/in/devika-harshey-b4b961290/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-primary transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.1 }}
            href="mailto:devika.harshey@gmail.com"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
          </motion.a>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Appwrite AI Duplicates Detector (AADD). All
        rights reserved.
      </div>
    </motion.footer>
  );
}
