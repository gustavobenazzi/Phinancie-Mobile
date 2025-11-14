import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import api from '../services/api';

export default function GoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data.data);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  const renderGoal = ({ item }) => {
    const endDate = new Date(item.endDate);
    const isExpired = endDate < new Date();

    return (
      <View className="bg-white p-4 rounded-lg mb-2 flex-row justify-between items-center shadow-sm">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-800">{item.title}</Text>
          <Text className="text-sm text-green-600 mt-0.5">R$ {item.value.toFixed(2)}</Text>
          <Text className={`text-xs mt-0.5 ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>Vence em: {endDate.toLocaleDateString('pt-BR')}</Text>
        </View>
        {isExpired && <Text className="text-xs text-red-600 font-bold">Expirada</Text>}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-5 bg-gray-100">
      <Text className="text-2xl font-bold mb-5 text-gray-800">Metas Financeiras</Text>
      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center text-base text-gray-500 mt-12">Nenhuma meta encontrada</Text>
        }
      />
    </View>
  );
}
