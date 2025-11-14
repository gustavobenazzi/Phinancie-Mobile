import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-3xl font-bold text-center mb-2 text-gray-800">Dashboard</Text>
      <Text className="text-base text-center mb-10 text-gray-600">Bem-vindo ao Phinancie!</Text>

      <View className="flex-1 justify-center">
        <TouchableOpacity
          className="bg-white p-5 rounded-lg mb-4 shadow"
          onPress={() => navigation.navigate('Transactions')}
        >
          <Text className="text-lg text-center text-gray-800">Transações</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white p-5 rounded-lg mb-4 shadow"
          onPress={() => navigation.navigate('Categories')}
        >
          <Text className="text-lg text-center text-gray-800">Categorias</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white p-5 rounded-lg mb-4 shadow"
          onPress={() => navigation.navigate('Goals')}
        >
          <Text className="text-lg text-center text-gray-800">Metas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
