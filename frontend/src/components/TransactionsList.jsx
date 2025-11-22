import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import SalaryIcon from '../../assets/Salary.svg';
import FoodIcon from '../../assets/Food.svg';

const TransactionsList = () => {
  const [filter, setFilter] = useState('Mensal');

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
        {/* Item 1: Salário */}
        <View className="flex-row items-center">
          {/* Icon */}
          <View className="w-[58px] h-[53px] bg-[#34C759] rounded-[22px] items-center justify-center mr-4">
              <SalaryIcon width={26} height={24} color="#F1FFF3" />
          </View>
          
          {/* Divider Line */}
          <View className="w-[1px] h-[35px] bg-[#00D09E] mr-4" />

          {/* Details */}
          <View className="flex-1 flex-row justify-between items-center">
            <View>
              <Text className="text-[#052224] font-medium text-[15px]">Salário</Text>
              <Text className="text-[#052224] font-semibold text-[12px]">09:15 - 07/04</Text>
            </View>
            <View>
              <Text className="text-[#052224] font-medium text-[15px]">Valor</Text>
              <Text className="text-[#4CAF50] font-medium text-[15px]">R$4.000,00</Text>
            </View>
          </View>
        </View>

        {/* Item 2: Mercado */}
        <View className="flex-row items-center">
          {/* Icon */}
          <View className="w-[58px] h-[53px] bg-[#FF3B30] rounded-[22px] items-center justify-center mr-4">
              <FoodIcon width={18} height={28} color="#F1FFF3" />
          </View>

          {/* Divider Line */}
          <View className="w-[1px] h-[35px] bg-[#00D09E] mr-4" />

          {/* Details */}
          <View className="flex-1 flex-row justify-between items-center">
            <View>
              <Text className="text-[#052224] font-medium text-[15px]">Mercado</Text>
              <Text className="text-[#052224] font-semibold text-[12px]">17:00 - 31/04</Text>
            </View>
            <View>
              <Text className="text-[#052224] font-medium text-[15px]">Valor</Text>
              <Text className="text-[#FF5252] font-medium text-[15px]">-R$100,00</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TransactionsList;
