import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import SalaryIcon from '../../assets/Salary.svg';
import FoodIcon from '../../assets/Food.svg';
import api from '../services/api';

const TransactionsList = ({ limit }) => {
  const [filter, setFilter] = useState('Mensal');
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
      console.error('Erro ao carregar transações', error);
    } finally {
      setLoading(false);
    }
  };

  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  const renderIcon = (categoryName) => {
    // Simple logic to choose icon based on category name or type
    // Ideally this should come from the backend or a more robust mapping
    if (categoryName?.toLowerCase().includes('salário') || categoryName?.toLowerCase().includes('ganhos')) {
      return <SalaryIcon width={26} height={24} color="#F1FFF3" />;
    }
    return <FoodIcon width={18} height={28} color="#F1FFF3" />;
  };

  const renderColor = (type) => {
    return type === 'INCOME' ? '#34C759' : '#FF3B30';
  };

  const renderAmountColor = (type) => {
    return type === 'INCOME' ? '#4CAF50' : '#FF5252';
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#00D09E" className="py-4" />;
  }

  return (
    <View className="bg-white rounded-[24px] shadow-sm p-0 overflow-hidden">
      {/* Switch */}
      <View className="bg-[#DFF7E2] flex-row justify-between items-center p-[6px] h-[76px]">
        <TouchableOpacity 
          className={`flex-1 h-[31px] justify-center items-center rounded-[10px] ${filter === 'Diário' ? 'bg-[#00D09E] h-[50px] rounded-[19px]' : ''}`}
          onPress={() => setFilter('Diário')}
        >
          <Text className="text-[#052224] font-regular text-[15px]">Diário</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 h-[31px] justify-center items-center rounded-[10px] ${filter === 'Semanal' ? 'bg-[#00D09E] h-[50px] rounded-[19px]' : ''}`}
          onPress={() => setFilter('Semanal')}
        >
          <Text className="text-[#052224] font-regular text-[15px]">Semanal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 h-[31px] justify-center items-center rounded-[10px] ${filter === 'Mensal' ? 'bg-[#00D09E] h-[50px] rounded-[19px]' : ''}`}
          onPress={() => setFilter('Mensal')}
        >
          <Text className="text-[#052224] font-regular text-[15px]">Mensal</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View className="p-6 space-y-6">
        {displayedTransactions.length === 0 ? (
          <Text className="text-center text-gray-500">Nenhuma transação encontrada.</Text>
        ) : (
          displayedTransactions.map((item) => (
            <View key={item.id} className="flex-row items-center">
              {/* Icon */}
              <View 
                className="w-[58px] h-[53px] rounded-[22px] items-center justify-center mr-4"
                style={{ backgroundColor: renderColor(item.type) }}
              >
                  {renderIcon(item.category?.name || item.description)}
              </View>
              
              {/* Divider Line */}
              <View className="w-[1px] h-[35px] bg-[#00D09E] mr-4" />

              {/* Details */}
              <View className="flex-1 flex-row justify-between items-center">
                <View>
                  <Text className="text-[#052224] font-medium text-[15px]">{item.category?.name || 'Sem Categoria'}</Text>
                  <Text className="text-[#052224] font-semibold text-[12px]">
                    {new Date(item.date || item.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View>
                  <Text className="text-[#052224] font-medium text-[15px]">Valor</Text>
                  <Text 
                    className="font-medium text-[15px]"
                    style={{ color: renderAmountColor(item.type) }}
                  >
                    {item.type === 'EXPENSE' ? '-' : ''}R${Math.abs(item.amount).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default TransactionsList;
