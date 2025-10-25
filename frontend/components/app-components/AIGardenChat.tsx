import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Sparkles } from "lucide-react";
import axios from "axios";

interface User {
  $id: string;
}

interface GardenData {
  health: number;
  total_scans: number;
  total_duplicates: number;
  total_cleaned: number;
  plant_name?: string;
}

interface AIGardenerChatProps {
  user: User;
  gardenData: GardenData;
}

function AIGardenerChat({ user, gardenData }: AIGardenerChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "gardener",
      text: "Hello there! 🌱 I'm your plant's spirit. How may I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [plantName, setPlantName] = useState("Your Plant");

  useEffect(() => {
    if (gardenData.plant_name) {
      setPlantName(gardenData.plant_name);
    }
  }, [gardenData.plant_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isChatOpen]);

  // Send Message to AI Gardener
  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages([...messages, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/garden/chat`,
        {
          userId: user.$id,
          message: userMsg,
          gardenState: gardenData,
        }
      );

      setMessages((prev) => [
        ...prev,
        { sender: "gardener", text: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "gardener",
          text: "The garden is quiet... I can't hear you just now. 🍃",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter Key Press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPlantEmoji = () => {
    const health = gardenData.health;
    if (health >= 85) return "🌺";
    if (health >= 60) return "🌸";
    if (health >= 30) return "🌱";
    return "🥀";
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-primary-light to-primary-dark shadow-2xl flex items-center justify-center cursor-pointer z-50 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
      >
        <AnimatePresence mode="wait">
          {isChatOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="plant"
              initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-3xl"
            >
              {getPlantEmoji()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulsing ring effect */}
        {!isChatOpen && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/80"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{
                duration: 2,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/40"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{
                duration: 2,
                ease: "easeOut",
                repeat: Infinity,
                repeatDelay: 0.5,
                delay: 1,
              }}
            />
          </>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-28 right-8 w-[380px] max-w-[calc(100vw-4rem)] bg-gradient-to-br from-white/10 to-white/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-primary/40 border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-xl">
                    {getPlantEmoji()}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {plantName}
                    </h3>
                    <p className="text-xs text-primary-light font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Gardener
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                  Health: {gardenData.health}%
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-hidden">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-primary-light/30 to-primary/20 text-white rounded-br-sm"
                        : "bg-white/10 text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 text-gray-400 p-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0,
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.2,
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.4,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-4 bg-gradient-to-r from-primary/20 to-primary/40">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your plant..."
                  disabled={loading}
                  className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-white/10 transition placeholder-white/40"
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-primary-light to-primary hover:from-primary-light/80 hover:to-primary/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIGardenerChat;
