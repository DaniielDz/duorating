import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`bg-gray-200 rounded-xl ${className}`}
      style={{ opacity }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-8 pb-6">
        <Skeleton className="w-48 h-8 mb-2" />
        <Skeleton className="w-36 h-4" />
      </View>
      <View className="px-5 flex-row gap-3 mb-6">
        <Skeleton className="flex-1 h-24" />
        <Skeleton className="flex-1 h-24" />
      </View>
      <View className="mx-5 mb-6">
        <Skeleton className="h-32" />
      </View>
      <View className="px-5">
        <Skeleton className="w-36 h-5 mb-3" />
        <Skeleton className="h-20 mb-2" />
        <Skeleton className="h-20" />
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="p-4">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-row mb-3">
          <Skeleton className="w-20 h-28 rounded-xl" />
          <View className="flex-1 ml-3">
            <Skeleton className="w-3/4 h-4 mb-2" />
            <Skeleton className="w-1/2 h-3 mb-1" />
            <Skeleton className="w-2/3 h-3" />
          </View>
        </View>
      ))}
    </View>
  );
}
