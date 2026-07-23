import { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

interface WaitingModeProps {
  inviteCode: string;
  expiresAt: string;
  onBack: () => void;
  onGenerateNew: () => void;
}

function formatCode(code: string): string {
  if (code.length <= 3) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

function formatTimeLeft(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function WaitingMode({
  inviteCode,
  expiresAt,
  onBack,
  onGenerateNew,
}: WaitingModeProps) {
  const [copied, setCopied] = useState(false);
  const [expired, setExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const expiryMs = new Date(expiresAt).getTime();

    const tick = () => {
      const remaining = expiryMs - Date.now();
      if (remaining <= 0) {
        setExpired(true);
        setTimeLeft(0);
        return;
      }
      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    const dots = [dot1Anim, dot2Anim, dot3Anim];
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((a) => a.start());

    return () => {
      animations.forEach((a) => a.stop());
    };
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [inviteCode]);

  if (expired) {
    return (
      <View className="flex-1 justify-center px-6 pb-12">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-2xl bg-red-500/10 items-center justify-center mb-6">
            <Ionicons name="time-outline" size={40} color="#EF4444" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">
            Código expirado
          </Text>
          <Text className="text-muted-foreground text-center max-w-xs leading-5">
            El código de 10 minutos ya no es válido. Generá uno nuevo.
          </Text>
        </View>

        <TouchableOpacity
          onPress={onGenerateNew}
          className="bg-accent rounded-2xl py-4 flex-row items-center justify-center"
          activeOpacity={0.85}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text className="text-white font-bold text-base ml-2">
            Generar nuevo código
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onBack}
          className="mt-6 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-muted-foreground text-sm">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLowTime = timeLeft < 60000;

  return (
    <View className="flex-1 justify-center px-6 pb-12">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-2xl bg-accent/10 items-center justify-center mb-6">
          <Ionicons name="people-outline" size={40} color="#4F46E5" />
        </View>
        <Text className="text-2xl font-bold text-white mb-2">
          Comparte este código
        </Text>
        <Text className="text-muted-foreground text-center max-w-xs leading-5">
          Pásale este código a tu pareja para que se vincule contigo
        </Text>
      </View>

      <View className="bg-surface-elevated border border-line/30 rounded-2xl p-6 items-center mb-6">
        <Text className="text-5xl font-bold text-white tracking-[6px] mb-4">
          {formatCode(inviteCode)}
        </Text>

        <TouchableOpacity
          onPress={handleCopy}
          className={`flex-row items-center rounded-xl px-4 py-2.5 ${
            copied ? "bg-green-500/20" : "bg-accent/10"
          }`}
          activeOpacity={0.7}
        >
          <Ionicons
            name={copied ? "checkmark-circle" : "copy-outline"}
            size={16}
            color={copied ? "#22C55E" : "#4F46E5"}
          />
          <Text
            className={`text-sm font-semibold ml-2 ${
              copied ? "text-green-400" : "text-accent"
            }`}
          >
            {copied ? "Copiado" : "Copiar código"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mb-8">
        <Animated.View
          className="w-12 h-12 rounded-full bg-accent/20 items-center justify-center mb-4"
          style={{ opacity: pulseAnim }}
        >
          <View className="w-5 h-5 rounded-full bg-accent" />
        </Animated.View>

        <View className="flex-row items-center">
          <Text className="text-muted-foreground text-base">
            Esperando a tu pareja
          </Text>
          <View className="flex-row ml-1">
            {[dot1Anim, dot2Anim, dot3Anim].map((dot, i) => (
              <Animated.View
                key={i}
                className="w-1 h-1 rounded-full bg-muted-foreground mx-0.5"
                style={{ opacity: dot }}
              />
            ))}
          </View>
        </View>
      </View>

      <View
        className={`flex-row items-center justify-center gap-1.5 mb-4 ${
          isLowTime ? "bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2" : ""
        }`}
      >
        <Ionicons
          name="time-outline"
          size={14}
          color={isLowTime ? "#EF4444" : "#6B7280"}
        />
        <Text
          className={`text-sm ${isLowTime ? "text-red-400 font-semibold" : "text-muted-foreground"}`}
        >
          {formatTimeLeft(timeLeft)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onBack}
        className="items-center"
        activeOpacity={0.7}
      >
        <Text className="text-muted-foreground text-sm">Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
