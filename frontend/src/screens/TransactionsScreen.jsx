import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TransactionsList from '../components/TransactionsList';
import SummaryCard from '../components/SummaryCard';
import Header from '../components/Header';
import PlusIcon from '../../assets/Plus.svg';

export default function TransactionsScreen() {
  const navigation = useNavigation();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const { bottom: insetBottom } = useSafeAreaInsets();
  const FAB_BOTTOM = Math.max(tabBarHeight + insetBottom - 56, 32); // keep FAB just above tab bar
  const ACTIONS_BOTTOM = FAB_BOTTOM + 56;

  const toggleFab = () => {
    setIsFabOpen(!isFabOpen);
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <Header />
        <View className="mx-6 mt-6">
          <SummaryCard />
        </View>
        <View className="mx-6 mt-6">
          <TransactionsList />
        </View>
      </ScrollView>

      {isFabOpen && (
        <View className="absolute right-6 items-end z-50" style={{ bottom: ACTIONS_BOTTOM }}>
          <TouchableOpacity 
            className="bg-white p-3 rounded-xl shadow-lg mb-3 flex-row items-center"
            onPress={() => {
              navigation.navigate('AddTransaction');
              setIsFabOpen(false);
            }}
          >
            <Text className="font-medium text-gray-700">Adicionar gastos manualmente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white p-3 rounded-xl shadow-lg mb-3 flex-row items-center"
            onPress={() => {
              console.log('Exportar extrato bancário');
              setIsFabOpen(false);
            }}
          >
            <Text className="font-medium text-gray-700">Exportar extrato bancário</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        className="absolute right-6 bg-[#00D09E] w-14 h-14 rounded-full items-center justify-center shadow-lg z-50"
        style={{ bottom: FAB_BOTTOM }}
        onPress={toggleFab}
        activeOpacity={0.8}
      >
        <View style={{ transform: [{ rotate: isFabOpen ? '45deg' : '0deg' }] }}>
          <PlusIcon width={24} height={24} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
