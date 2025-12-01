import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TransactionsList from '../components/TransactionsList';
import BottomTabBar from '../components/BottomTabBar';
import Header from '../components/Header';
import PlusIcon from '../../assets/Plus.svg';

export default function TransactionsScreen() {
  const navigation = useNavigation();
  const [isFabOpen, setIsFabOpen] = useState(false);

  const toggleFab = () => {
    setIsFabOpen(!isFabOpen);
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <Header />
        <View className="mx-6 mt-6">
          <TransactionsList />
        </View>
      </ScrollView>

      {isFabOpen && (
        <View className="absolute bottom-40 right-6 items-end z-50">
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
        className="absolute bottom-24 right-6 bg-[#00D09E] w-14 h-14 rounded-full items-center justify-center shadow-lg z-50"
        onPress={toggleFab}
        activeOpacity={0.8}
      >
        <View style={{ transform: [{ rotate: isFabOpen ? '45deg' : '0deg' }] }}>
          <PlusIcon width={24} height={24} />
        </View>
      </TouchableOpacity>

      <BottomTabBar />
    </View>
  );
}
