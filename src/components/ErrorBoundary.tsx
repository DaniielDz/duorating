import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-8">
          <Ionicons name="alert-circle" size={64} color="#EF4444" style={{ marginBottom: 24 }} />
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </Text>
          <Text className="text-gray-500 text-center leading-6 mb-8">
            Ocurrió un error inesperado. Por favor, intenta de nuevo.
          </Text>
          {this.state.error && (
            <Text className="text-xs text-gray-400 mb-6 text-center max-w-xs" numberOfLines={2}>
              {this.state.error.message}
            </Text>
          )}
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 px-10 active:bg-blue-600"
            onPress={this.handleRetry}
          >
            <Text className="text-white font-semibold text-base">Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
