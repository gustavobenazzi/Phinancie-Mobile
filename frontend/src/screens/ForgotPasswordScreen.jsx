import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-2xl font-bold mb-5 text-gray-800">Recuperar senha</Text>
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-600">Tela de recuperação (em construção)</Text>
      </View>
      <TouchableOpacity
        className="p-4 rounded-lg items-center bg-blue-600 mb-4"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white text-base font-bold">Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
