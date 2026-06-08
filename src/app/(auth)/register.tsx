import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function RegisterScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-3xl font-bold mb-8">Crear Cuenta</Text>
      <TextInput
        className="w-full bg-gray-100 rounded-lg p-4 mb-4"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full bg-gray-100 rounded-lg p-4 mb-4"
        placeholder="Contraseña"
        secureTextEntry
      />
      <TextInput
        className="w-full bg-gray-100 rounded-lg p-4 mb-6"
        placeholder="Confirmar Contraseña"
        secureTextEntry
      />
      <TouchableOpacity className="w-full bg-blue-500 rounded-lg p-4">
        <Text className="text-white text-center font-semibold">
          Registrarse
        </Text>
      </TouchableOpacity>
    </View>
  );
}
