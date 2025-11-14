import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import api from '../services/api';

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data.data);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-2 flex-row justify-between items-center shadow-sm">
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">{item.category.name}</Text>
        <Text className="text-sm text-gray-600 mt-0.5">{item.description || 'Sem descrição'}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
      </View>
      <Text className={`text-base font-bold ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{item.type === 'INCOME' ? '+' : '-'}R$ {Math.abs(item.amount).toFixed(2)}</Text>
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
      <Text className="text-2xl font-bold mb-5 text-gray-800">Transações</Text>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text className="text-center text-base text-gray-500 mt-12">Nenhuma transação encontrada</Text>
        }
      />
    </View>
  );
}
