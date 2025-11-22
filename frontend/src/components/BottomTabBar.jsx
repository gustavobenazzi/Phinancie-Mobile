import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import HomeIcon from '../../assets/Home.svg';
import SearchIcon from '../../assets/Search.svg';
import TaskSquareIcon from '../../assets/task-square.svg';
import SettingIcon from '../../assets/setting-2.svg';

const BottomTabBar = () => {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex-row justify-around items-center pb-8 pt-4 rounded-t-[32px] shadow-lg">
      <TouchableOpacity className="items-center">
        <HomeIcon width={24} height={24} color="#00D09E" />
      </TouchableOpacity>
      <TouchableOpacity className="items-center">
        <SearchIcon width={24} height={24} color="#A3A3A3" />
      </TouchableOpacity>
      <TouchableOpacity className="items-center">
        <TaskSquareIcon width={24} height={24} color="#A3A3A3" />
      </TouchableOpacity>
      <TouchableOpacity className="items-center">
        <SettingIcon width={24} height={24} color="#A3A3A3" />
      </TouchableOpacity>
    </View>
  );
};

export default BottomTabBar;
