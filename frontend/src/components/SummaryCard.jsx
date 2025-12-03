import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import SalaryIcon from '../../assets/Salary.svg';
import { useFocusEffect } from '@react-navigation/native';
import useTransactionsTotals from '../hooks/useTransactionsTotals';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const SummaryCard = ({ totals: externalTotals, loading: externalLoading }) => {
  const shouldSkipFetch = typeof externalTotals !== 'undefined';
  const { totals, loading, refreshTotals } = useTransactionsTotals({ autoFetch: !shouldSkipFetch });
  const data = shouldSkipFetch ? externalTotals || { income: 0, expense: 0 } : totals;
  const isLoading = shouldSkipFetch ? !!externalLoading : loading;

  useFocusEffect(
    useCallback(() => {
      if (!shouldSkipFetch) {
        refreshTotals();
      }
    }, [shouldSkipFetch, refreshTotals])
  );

  const renderValue = (value) => currencyFormatter.format(value || 0);

  return (
    <View className="bg-black rounded-[31px] p-5">
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View>
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center mr-4">
              <SalaryIcon width={28} height={28} color="#4CAF50" />
            </View>
            <View className="flex-1">
              <Text className="text-white opacity-80 text-xs font-medium">Receita</Text>
              <Text className="text-[#4CAF50] text-xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
                {renderValue(data.income)}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-white/10 my-4" />

          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center mr-4">
              <SalaryIcon width={28} height={28} color="#FF5252" />
            </View>
            <View className="flex-1">
              <Text className="text-white opacity-80 text-xs font-medium">Despesas</Text>
              <Text className="text-[#FF5252] text-xl font-bold" numberOfLines={1} adjustsFontSizeToFit>
                {renderValue(data.expense)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SummaryCard;
