import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Components
import Header from '../components/Header';
import BottomTabBar from '../components/BottomTabBar';
import TransactionsList from '../components/TransactionsList';

// Assets (Only those used in Dashboard specific cards)
import CarIcon from '../../assets/Car.svg';
import FoodIcon from '../../assets/Food.svg';
import SalaryIcon from '../../assets/Salary.svg';

const DashboardScreen = () => {
  const navigation = useNavigation();

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
                <Text className="text-[#093030] text-xs font-regular">Total recebido</Text>
              </View>
              <Text className="text-[#4CAF50] text-xl font-bold">$7,783.00</Text>
            </View>

            {/* Divider Line 2 */}
            <View className="w-[1px] h-[40px] bg-[#070707] mx-4" />

            {/* Expense Section */}
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View className="w-2 h-2 rounded-full bg-[#FF5252] mr-2" />
                <Text className="text-[#093030] text-xs font-regular">Total gasto</Text>
              </View>
              <Text className="text-[#FF5252] text-xl font-bold">-$1.187.40</Text>
            </View>
          </View>
        </View>

        {/* Summary Card - Group 289221 */}
        <View className="mx-6 mt-6">
          <View className="bg-black rounded-[31px] p-5 flex-row items-center h-[115px]">
            {/* Left Side: Dinheiro Guardado */}
            <View className="items-center justify-center pr-4" style={{ width: '30%' }}>
              <View className="w-14 h-14 rounded-full border-2 border-[#4CAF50] items-center justify-center mb-1">
                <CarIcon width={24} height={24} color="white" />
              </View>
              <Text className="text-white text-[10px] font-medium text-center">Dinheiro guardado</Text>
            </View>

            {/* Right Side: List */}
            <View className="flex-1 pl-4 justify-center h-full space-y-2">
              {/* Row 1: Ganhos */}
              <View className="flex-row items-center">
                <SalaryIcon width={20} height={20} color="white" className="mr-6" />
                <View className="ml-6">
                  <Text className="text-[#4CAF50] text-[10px]">Ganhos</Text>
                  <Text className="text-[#4CAF50] text-[15px] font-bold">$4.000.00</Text>
                </View>
              </View>

              {/* Divider */}
              <View className="h-[1px] bg-[#F1FFF3] opacity-20 w-full" />

              {/* Row 2: Gastos */} 
              <View className="flex-row items-center">
                <FoodIcon width={20} height={20} color="white" className="mr-6" />
                <View className="ml-6">
                  <Text className="text-[#FF5252] text-[10px] ">Gastos com comida</Text>
                  <Text className="text-[#FF5252] text-[15px] font-bold">-$100.00</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Transactions Section - Group 289222 */}
        <View className="mx-6 mt-6 mb-24">
          <TransactionsList limit={3} />
        </View>
      </ScrollView>

      {/* Bottom Tab Bar - Fixed */}
      <BottomTabBar />
    </View>
  );
};

export default DashboardScreen;
