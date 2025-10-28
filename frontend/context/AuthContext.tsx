"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { account, storage } from "@/utils/appwrite";
import { Models } from "appwrite";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    username: string,
    pfpFile?: File | null
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  updateEmail: (newEmail: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "profile_pictures";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const current = await account.get();
        setUser(current);

        if (!current.emailVerification && pathname !== "/verify") {
          router.replace("/verify?mode=pending");
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [pathname, router]);

  const signup = async (
    email: string,
    password: string,
    username: string,
    pfpFile?: File | null
  ) => {
    try {
      const newUser = await account.create(
        "unique()",
        email,
        password,
        username
      );

      await account.createEmailPasswordSession(email, password);

      if (pfpFile) {
        try {
          await storage.createFile(BUCKET_ID, `pfp_${newUser.$id}`, pfpFile);
        } catch (uploadError) {
          console.error("Profile picture upload error:", uploadError);
          toast.warning("Account created, but profile picture upload failed");
        }
      }

      await account.createVerification(`${window.location.origin}/verify`);

      const current = await account.get();
      setUser(current);

      toast.success(
        "Signup successful! Check your inbox to verify your email."
      );
      router.push("/verify?mode=pending");
    } catch (err: unknown) {
      console.error("Signup error:", err);
      toast.error(err instanceof Error ? err.message : "Signup failed");
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const current = await account.get();
      setUser(current);

      if (!current.emailVerification) {
        toast.warning("Please verify your email first.");
        router.replace("/verify?mode=pending");
        return;
      }

      toast.success("Logged in successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);
      toast.error(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (err: unknown) {
      console.error("Logout error:", err);
      toast.error(err instanceof Error ? err.message : "Logout failed");
    }
  };

  const updateName = async (newName: string) => {
    if (!user) throw new Error("No user logged in");
    await account.updateName(newName);
    const current = await account.get();
    setUser(current);
  };

  const updateEmail = async (newEmail: string, password: string) => {
    if (!user) throw new Error("No user logged in");
    await account.updateEmail(newEmail, password);
    const current = await account.get();
    setUser(current);
  };

  const refreshUser = async () => {
    try {
      const current = await account.get();
      setUser(current);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        updateName,
        updateEmail,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
