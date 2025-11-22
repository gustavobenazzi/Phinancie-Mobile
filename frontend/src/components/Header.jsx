import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MoreIcon from '../../assets/More.svg';

const Header = () => {
  return (
    <SafeAreaView edges={['top']} className="bg-[#FBFBFB]">
      <View className="h-[56px] flex-row justify-between items-center px-4 border-b border-[#D4D4D4]">
        <TouchableOpacity>
          <MoreIcon width={24} height={24} />
        </TouchableOpacity>
        
        <Text className="text-[20px] font-semibold text-black">
          Phinanciê
        </Text>

        {/* Profile Image Placeholder */}
        <View className="w-[20px] h-[20px] bg-gray-300 rounded-full" />
      </View>
    </SafeAreaView>
  );
};

export default Header;
