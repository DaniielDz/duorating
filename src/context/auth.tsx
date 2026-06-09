import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
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

  const fetchCouple = async (userId: string) => {
    const { data, error } = await supabase
      .from("couples")
      .select("*")
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
      .maybeSingle();

    if (error) {
      console.error("Error fetching couple:", error);
    }
    console.log("fetchCouple result for", userId, ":", data);
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
