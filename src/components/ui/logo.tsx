import { View, Text, Image } from "react-native";

interface LogoProps {
  size?: "sm" | "lg";
}

export function Logo({ size = "lg" }: LogoProps) {
  const iconSize = size === "lg" ? 56 : 40;
  const titleSize = size === "lg" ? "text-4xl" : "text-2xl";
  const subtitleSize = size === "lg" ? "text-base" : "text-sm";

  return (
    <View className="items-center">
      <Image
        source={require("../../../assets/icon.png")}
        className="mb-4"
        style={{ width: iconSize, height: iconSize, borderRadius: 12 }}
        resizeMode="contain"
      />
      <Text
        className={`${titleSize} font-bold text-white tracking-tight`}
      >
        DuoRating
      </Text>
      <Text className={`${subtitleSize} text-muted-foreground mt-1`}>
        Califica películas con tu pareja
      </Text>
    </View>
  );
}
