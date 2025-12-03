import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CarIcon from '../../assets/Car.svg';
import FoodIcon from '../../assets/Food.svg';
import SalaryIcon from '../../assets/Salary.svg';
import HomeIcon from '../../assets/Home.svg';
import MoreIcon from '../../assets/More.svg';
import api from '../services/api';

const PERIOD_FILTERS = ['Todos', 'Diário', 'Semanal', 'Mensal'];
const ORDER_FILTERS = [
  { key: 'date-desc', label: 'Data' },
  { key: 'value-desc', label: 'Maior valor' },
  { key: 'value-asc', label: 'Menor valor' },
];

const TransactionsList = ({ limit }) => {
  const [periodFilter, setPeriodFilter] = useState('Todos');
  const [orderFilter, setOrderFilter] = useState('date-desc');
  const [categoryFilter, setCategoryFilter] = useState({ key: 'all', label: 'Todas' });
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar transações', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias', error);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions])
  );

  const categoriesOptions = useMemo(() => {
    const base = [{ key: 'all', label: 'Todas' }];
    const userCategories = categories.map((category) => ({
      key: category.id,
      label: category.name || 'Sem Categoria',
    }));

    const hasUncategorized = transactions.some((tx) => !tx.category);
    const uncategorizedOption = hasUncategorized
      ? [{ key: 'uncategorized', label: 'Sem categoria' }]
      : [];

    return [...base, ...userCategories, ...uncategorizedOption];
  }, [categories, transactions]);

  const matchesPeriod = useCallback(
    (transaction) => {
      const date = new Date(transaction.date || transaction.createdAt);
      const now = new Date();

      if (periodFilter === 'Diário') {
        return (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      if (periodFilter === 'Semanal') {
        const diff = Math.abs(now - date);
        const diffDays = diff / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }

      if (periodFilter === 'Todos') {
        return true;
      }

      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    },
    [periodFilter],
  );

  const sortedTransactions = useMemo(() => {
    const filtered = transactions
      .filter(matchesPeriod)
      .filter((tx) => {
        if (categoryFilter.key === 'all') return true;
        if (categoryFilter.key === 'uncategorized') return !tx.category;
        return tx.category?.id === categoryFilter.key;
      });

    const result = [...filtered];
    result.sort((a, b) => {
      const amountA = Number(a.amount) || 0;
      const amountB = Number(b.amount) || 0;
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();

      if (orderFilter === 'value-desc') {
        return amountB - amountA;
      }

      if (orderFilter === 'value-asc') {
        return amountA - amountB;
      }

      return dateB - dateA;
    });

    return result;
  }, [transactions, matchesPeriod, categoryFilter, orderFilter]);

  const displayedTransactions = limit ? sortedTransactions.slice(0, limit) : sortedTransactions;

  const ICON_MAP = {
    Car: CarIcon,
    Food: FoodIcon,
    Salary: SalaryIcon,
    Home: HomeIcon,
    More: MoreIcon,
  };

  const renderIcon = (category) => {
    const iconKey = category?.icon;
    const IconComponent = (iconKey && ICON_MAP[iconKey]) || ICON_MAP[category?.name] || FoodIcon;
    return <IconComponent width={24} height={24} color="#F1FFF3" />;
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
        {PERIOD_FILTERS.map((option) => (
          <TouchableOpacity
            key={option}
            className={`flex-1 h-[31px] justify-center items-center rounded-[10px] ${
              periodFilter === option ? 'bg-[#00D09E] h-[50px] rounded-[19px]' : ''
            }`}
            onPress={() => setPeriodFilter(option)}
          >
            <Text className="text-[#052224] font-regular text-[15px]">{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12, gap: 12 }}
      >
        <TouchableOpacity
          className="px-4 py-2 rounded-2xl border border-[#00D09E] bg-white"
          onPress={() => setCategoryModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text className="text-[#052224] font-semibold text-[13px]">
            Categoria: {categoryFilter.label}
          </Text>
        </TouchableOpacity>

        {ORDER_FILTERS.map((option) => (
          <TouchableOpacity
            key={option.key}
            className={`px-4 py-2 rounded-2xl border ${
              orderFilter === option.key ? 'bg-[#00D09E] border-[#00D09E]' : 'border-gray-200 bg-white'
            }`}
            onPress={() => setOrderFilter(option.key)}
            activeOpacity={0.85}
          >
            <Text
              className={`text-[13px] font-semibold ${orderFilter === option.key ? 'text-white' : 'text-[#052224]'}`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
                  {renderIcon(item.category)}
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

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View className="flex-1 bg-black/40 justify-center p-6">
          <View className="bg-white rounded-3xl p-5">
            <Text className="text-lg font-semibold text-[#052224] mb-4">Filtrar por categoria</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {categoriesLoading ? (
                <ActivityIndicator size="small" color="#00D09E" className="py-4" />
              ) : (
                categoriesOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    className={`py-3 px-3 rounded-2xl mb-2 border ${
                      categoryFilter.key === option.key ? 'border-[#00D09E] bg-[#E6F9F3]' : 'border-gray-200'
                    }`}
                    onPress={() => {
                      setCategoryFilter(option);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Text className="text-[#052224] font-medium">{option.label}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              className="mt-4 py-3 rounded-2xl bg-[#00D09E]"
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text className="text-center text-white font-semibold">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionsList;
