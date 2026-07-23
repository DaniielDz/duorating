import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Couple } from "../types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  couple: Couple | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshCouple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const sessionExpiredRef = useRef(false);

  const handleSessionExpired = () => {
    if (sessionExpiredRef.current) return;
    sessionExpiredRef.current = true;
    supabase.auth.signOut();
    setCouple(null);
  };

  const fetchCouple = async (userId: string) => {
    const { data, error } = await supabase
      .from("couples")
      .select("*")
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .not("user_2_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST301" || error.code === "401") {
        handleSessionExpired();
      }
      if (error.code !== "PGRST116") {
        console.error("Error fetching couple:", error);
      }
    }
    setCouple(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCouple(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchCouple(session.user.id);
        } else {
          setCouple(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCouple(null);
  };

  const refreshCouple = async () => {
    if (user) {
      await fetchCouple(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, user, couple, loading, signIn, signUp, signOut, refreshCouple }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
