import React from 'react';
import { View, Text, ScrollView } from 'react-native';

// Components
import Header from '../components/Header';
import TransactionsList from '../components/TransactionsList';
import SummaryCard from '../components/SummaryCard';
import useTransactionsTotals from '../hooks/useTransactionsTotals';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const DashboardScreen = () => {
  const { totals, loading } = useTransactionsTotals();
  const renderValue = (value) => currencyFormatter.format(value || 0);

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <Header />

        {/* Stats Card - Group 288874 */}
        <View className="mx-6 mt-6">
          {/* Group 288704: The Card */}
          <View className="bg-[#FCFCFC] rounded-[18px] p-4 flex-row items-center justify-between shadow-sm border border-[#EFF0F6]">
            {/* Income Section */}
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-[#4CAF50] mr-2" />
                <Text className="text-[#093030] text-xs font-regular">Receita</Text>
              </View>
              <Text className="text-[#4CAF50] text-xl font-bold">
                {loading ? '---' : renderValue(totals.income)}
              </Text>
            </View>

            {/* Divider Line 2 */}
            <View className="w-[1px] h-[40px] bg-[#070707] mx-4" />

            {/* Expense Section */}
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-[#FF5252] mr-2" />
                <Text className="text-[#093030] text-xs font-regular">Despesas</Text>
              </View>
              <Text className="text-[#FF5252] text-xl font-bold">
                {loading ? '---' : renderValue(totals.expense)}
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Card - Group 289221 */}
        <View className="mx-6 mt-6">
          <SummaryCard totals={totals} loading={loading} />
        </View>

        {/* Transactions Section - Group 289222 */}
        <View className="mx-6 mt-6 mb-24">
          <TransactionsList limit={3} />
        </View>
      </ScrollView>

    </View>
  );
};

export default DashboardScreen;
