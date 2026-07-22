import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { tmdb } from "../../lib/tmdb";

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (score: number, comment: string | null) => Promise<void>;
  title: string;
  posterPath: string | null;
  existingScore?: number | null;
  existingComment?: string | null;
  saving?: boolean;
}

export function RatingModal({
  visible,
  onClose,
  onSave,
  title,
  posterPath,
  existingScore,
  existingComment,
  saving,
}: RatingModalProps) {
  const [score, setScore] = useState<number>(existingScore ?? 0);
  const [comment, setComment] = useState(existingComment ?? "");

  const handleSave = async () => {
    if (score < 1 || score > 10) return;
    await onSave(score, comment.trim() || null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <TouchableOpacity onPress={onClose} disabled={saving}>
              <Text className="text-gray-500 text-lg">Cancelar</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Calificar</Text>
            <View className="w-16" />
          </View>

          <ScrollView className="flex-1 px-5 pt-6">
            <View className="flex-row items-center mb-8">
              {posterPath ? (
                <Image
                  source={{ uri: tmdb.getPosterUrl(posterPath, "w200") }}
                  className="w-16 h-24 rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-24 rounded-lg bg-gray-200 items-center justify-center">
                  <MaterialCommunityIcons name="filmstrip" size={28} color="#9CA3AF" />
                </View>
              )}
              <Text className="text-xl font-bold text-gray-900 ml-4 flex-1" numberOfLines={2}>
                {title}
              </Text>
            </View>

            <Text className="text-base font-semibold text-gray-700 mb-4 text-center">
              Tu puntuación
            </Text>

            <View className="flex-row justify-center gap-1.5 mb-8 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <TouchableOpacity
                  key={n}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    score === n
                      ? "bg-yellow-400"
                      : "bg-gray-100"
                  }`}
                  onPress={() => setScore(n)}
                  disabled={saving}
                >
                  <Text
                    className={`text-base font-bold ${
                      score === n ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {score > 0 && (
              <View className="items-center mb-6">
                <Text className="text-6xl font-bold text-yellow-500">{score}</Text>
                <Text className="text-gray-400 mt-1">/ 10</Text>
              </View>
            )}

            <Text className="text-base font-semibold text-gray-700 mb-2">
              Comentario (opcional)
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base min-h-[100px]"
              placeholder="¿Qué te pareció?"
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              multiline
              textAlignVertical="top"
              editable={!saving}
            />
          </ScrollView>

          <View className="px-5 pb-5 pt-3 border-t border-gray-100">
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${
                score > 0 && !saving ? "bg-blue-500 active:bg-blue-600" : "bg-gray-300"
              }`}
              onPress={handleSave}
              disabled={score === 0 || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {existingScore ? "Guardar cambios" : "Guardar calificación"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
