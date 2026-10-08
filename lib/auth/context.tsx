"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/supabase/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        // First check localStorage for instant hydration
        const cached = localStorage.getItem("campusfind_user");
        if (cached) {
          setUser(JSON.parse(cached));
        }

        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user) {
            localStorage.setItem("campusfind_user", JSON.stringify(data.user));
          } else {
            localStorage.removeItem("campusfind_user");
          }
        }
      } catch (err) {
        console.warn("Auth session check failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  const login = async (identifier: string, password?: string): Promise<User> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Authentication failed");
    }

    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("campusfind_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem("campusfind_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
