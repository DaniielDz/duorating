import { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Logo } from "../../components/ui/logo";
import { Button } from "../../components/ui/button";
import { GradientBackground } from "../../components/ui/gradient-background";

const { width } = Dimensions.get("window");

const TOTAL_SLIDES = 5;

interface SlideConfig {
  icon: string;
  gradient: [string, string];
  title: string;
  description: string;
}

const SLIDES: SlideConfig[] = [
  {
    icon: "star-half",
    gradient: ["#4F46E5", "#6366F1"],
    title: "Califica en pareja",
    description:
      "Cada uno asigna su nota del 1 al 10 a cada película o serie. La app calcula su compatibilidad y revela qué tan alineados están sus gustos.",
  },
  {
    icon: "list-outline",
    gradient: ["#4F46E5", "#6366F1"],
    title: "Lista compartida",
    description:
      "Armen juntos una lista de pendientes. Marquen como vistas cuando las terminen y tengan siempre algo nuevo para ver.",
  },
  {
    icon: "search-outline",
    gradient: ["#4F46E5", "#6366F1"],
    title: "Descubran juntos",
    description:
      "Exploren millones de títulos desde TMDB. Filtren por género, busquen por nombre y encuentren su próxima película favorita.",
  },
  {
    icon: "people-outline",
    gradient: ["#4F46E5", "#6366F1"],
    title: "Vinculación en pareja",
    description:
      "Uno genera un código de invitación, el otro lo ingresa y quedan vinculados al instante. Todo sincronizado, sin complicaciones.",
  },
];

const SUMMARY_FEATURES = [
  { icon: "star" as const, label: "Puntúa del 1 al 10", color: "#FCD34D" },
  { icon: "list" as const, label: "Lista de pendientes", color: "#FFFFFF" },
  { icon: "link" as const, label: "Vinculación al instante", color: "#FFFFFF" },
];

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isLastSlide = currentIndex === TOTAL_SLIDES - 1;

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      setCurrentIndex(index);
    },
    []
  );

  const handleNext = () => {
    if (isLastSlide) return;
    scrollRef.current?.scrollTo({
      x: (currentIndex + 1) * width,
      animated: true,
    });
  };

  return (
    <GradientBackground>
      <View className="flex-1 pt-16 pb-12">
        {!isLastSlide && (
          <TouchableOpacity
            className="items-end px-6"
            onPress={() =>
              scrollRef.current?.scrollTo({
                x: (TOTAL_SLIDES - 1) * width,
                animated: true,
              })
            }
            activeOpacity={0.7}
          >
            <Text className="text-muted-foreground text-sm font-medium">
              Omitir
            </Text>
          </TouchableOpacity>
        )}

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          className="flex-1"
          bounces={false}
        >
          {SLIDES.map((slide, index) => (
            <View key={index} style={{ width }} className="px-10 justify-center">
              <View className="items-center">
                <View className="w-48 h-48 items-center justify-center mb-10">
                  <View className="absolute w-44 h-44 rounded-full bg-accent/5" />
                  <View
                    className="absolute w-36 h-36 rounded-full border border-line/30"
                    style={{ transform: [{ translateY: -8 }] }}
                  />
                  <LinearGradient
                    colors={slide.gradient}
                    className="w-28 h-28 rounded-2xl items-center justify-center"
                  >
                    <Ionicons name={slide.icon as any} size={40} color="#FFFFFF" />
                  </LinearGradient>
                </View>

                <Text className="text-2xl font-bold text-white text-center mb-3">
                  {slide.title}
                </Text>

                <Text className="text-muted-foreground text-center leading-6 px-2">
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}

          {/* Slide 5 */}
          <View style={{ width }} className="px-10 justify-center">
            <View className="items-center">
              <Logo size="lg" />

              <Text className="text-muted-foreground text-center mt-6 mb-10 leading-6">
                Descubre, califica y comparte el cine{"\n"}con tu persona favorita.
              </Text>

              <View className="flex-row flex-wrap justify-center gap-x-3 gap-y-3 mb-10">
                {SUMMARY_FEATURES.map((item, i) => (
                  <View
                    key={i}
                    className="flex-row items-center bg-dark-50 rounded-full border border-line px-4 py-2"
                  >
                    <View className="mr-2">
                      <Ionicons name={item.icon} size={16} color={item.color} />
                    </View>
                    <Text className="text-muted-foreground text-sm">
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="w-full gap-4">
                <Link href="/(auth)/register" asChild>
                  <Button title="Crear Cuenta" variant="primary" />
                </Link>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity className="items-center" activeOpacity={0.7}>
                    <Text className="text-muted-foreground text-sm">
                      ¿Ya tienes cuenta?{" "}
                      <Text className="text-accent font-semibold">
                        Inicia sesión
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="px-8">
          <View className="flex-row justify-center gap-2 mb-6">
            {Array.from({ length: TOTAL_SLIDES }).map((_, index) => {
              const active = index === currentIndex;
              return (
                <View
                  key={index}
                  className={`rounded-full h-2 ${
                    active ? "bg-accent w-6" : "bg-line w-2"
                  }`}
                />
              );
            })}
          </View>

          {!isLastSlide && (
            <Button title="Siguiente" onPress={handleNext} variant="primary" />
          )}
        </View>
      </View>
    </GradientBackground>
  );
}
