import { useState, useEffect } from "react";
import { BackHandler } from "react-native";
import { useAuth } from "../../context/auth";
import { supabase } from "../../lib/supabase";
import { GradientBackground } from "../../components/ui/gradient-background";
import { useToast } from "../../components/ui/Toast";
import { ChooseMode } from "../../components/invite/choose-mode";
import { WaitingMode } from "../../components/invite/waiting-mode";
import { EnterMode } from "../../components/invite/enter-mode";

const CODE_EXPIRY_MINUTES = 10;

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function LinkScreen() {
  const { user, refreshCouple, signOut } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"choose" | "waiting" | "enter">("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isCodeValid = inviteCode && expiresAt && new Date(expiresAt).getTime() > Date.now();

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (mode !== "waiting" || !inviteCode) return;

    const uniqueId = `couple-wait-${inviteCode}-${Date.now()}`;
    const channel = supabase
      .channel(uniqueId)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "couples",
          filter: `invite_code=eq.${inviteCode}`,
        },
        async () => {
          await refreshCouple();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mode, inviteCode]);

  const handleGenerate = async () => {
    if (isCodeValid) {
      setMode("waiting");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const code = generateCode();
      const newExpiresAt = new Date(
        Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000,
      ).toISOString();

      const { error: dbError } = await supabase.from("couples").insert({
        user_1_id: user!.id,
        invite_code: code,
        expires_at: newExpiresAt,
      });

      if (dbError) throw dbError;

      setInviteCode(code);
      setExpiresAt(newExpiresAt);
      setMode("waiting");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al generar código";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterCode = async (code: string) => {
    setLoading(true);

    try {
      const now = new Date().toISOString();
      const { data, error: fetchError } = await supabase
        .from("couples")
        .select("*")
        .eq("invite_code", code)
        .is("user_2_id", null)
        .gt("expires_at", now)
        .maybeSingle();

      if (fetchError || !data) {
        throw new Error("Código no válido, expiró o ya fue usado");
      }

      if (data.user_1_id === user!.id) {
        throw new Error("No puedes vincularte con tu propio código");
      }

      const { error: updateError } = await supabase
        .from("couples")
        .update({ user_2_id: user!.id })
        .eq("id", data.id);

      if (updateError) throw updateError;

      await refreshCouple();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al vincular";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToChoose = () => {
    setMode("choose");
    setError("");
  };

  const handleGenerateNew = async () => {
    setInviteCode("");
    setExpiresAt(null);
    await handleGenerate();
  };

  return (
    <GradientBackground>
      {mode === "choose" && (
        <ChooseMode
          onGenerate={handleGenerate}
          onEnterCode={() => {
            setError("");
            setMode("enter");
          }}
          onSignOut={signOut}
          loading={loading}
          error={error}
        />
      )}

      {mode === "waiting" && (
        <WaitingMode
          inviteCode={inviteCode}
          expiresAt={expiresAt!}
          onBack={handleBackToChoose}
          onGenerateNew={handleGenerateNew}
        />
      )}

      {mode === "enter" && (
        <EnterMode
          onBack={handleBackToChoose}
          onSubmit={handleEnterCode}
          loading={loading}
        />
      )}
    </GradientBackground>
  );
}
