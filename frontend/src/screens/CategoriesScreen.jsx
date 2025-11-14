import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import api from '../services/api';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-2 flex-row items-center shadow-sm">
      <Text className="text-2xl mr-4">{item.icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">{item.name}</Text>
        <Text className={`text-sm mt-0.5 ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{item.type === 'INCOME' ? 'Receita' : 'Despesa'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-2xl font-bold mb-5 text-gray-800">Categorias</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center text-base text-gray-500 mt-12">Nenhuma categoria encontrada</Text>
        }
      />
    </View>
  );
}
