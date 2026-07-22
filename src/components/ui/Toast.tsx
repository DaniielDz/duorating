import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ToastType = "success" | "error" | "info";

interface ToastConfig {
  message: string;
  type: ToastType;
  id: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const bgColors: Record<ToastType, string> = {
  success: "bg-green-600",
  error: "bg-red-500",
  info: "bg-blue-500",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setToast({ message, type, id: Date.now() });

      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast(null);
      });
    },
    [opacity],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          key={toast.id}
          className={`absolute top-14 left-4 right-4 ${bgColors[toast.type]} rounded-2xl px-5 py-4 shadow-lg flex-row items-center z-50`}
          style={{ opacity }}
        >
          <View className="mr-3">
            {toast.type === "success" && <Ionicons name="checkmark-circle" size={22} color="#fff" />}
            {toast.type === "error" && <Ionicons name="close-circle" size={22} color="#fff" />}
            {toast.type === "info" && <Ionicons name="information-circle" size={22} color="#fff" />}
          </View>
          <Text className="text-white text-base font-medium flex-1">
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
}
