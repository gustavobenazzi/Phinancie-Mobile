import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import HomeIcon from '../../assets/Home.svg';
import SearchIcon from '../../assets/Search.svg';
import TaskSquareIcon from '../../assets/task-square.svg';
import SettingIcon from '../../assets/setting-2.svg';

const BottomTabBar = ({ state, navigation }) => {
  const currentRoute = state?.routes?.[state.index]?.name;

  const getIconColor = (screenName) => (currentRoute === screenName ? '#00D09E' : '#A3A3A3');

  const handleNavigate = (screenName) => {
    if (screenName && currentRoute !== screenName) {
      navigation.navigate(screenName);
    }
  };

  return (
    <View className="bg-white border-t border-gray-100 rounded-t-[32px] shadow-lg h-[96px] px-6 justify-center">
      <View className="flex-row w-full justify-evenly items-center">
        <TouchableOpacity className="items-center p-3" onPress={() => handleNavigate('Dashboard')}>
          <HomeIcon width={28} height={28} color={getIconColor('Dashboard')} />
        </TouchableOpacity>
        <TouchableOpacity className="items-center p-3">
          <SearchIcon width={28} height={28} color="#A3A3A3" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center p-3" onPress={() => handleNavigate('Transactions')}>
          <TaskSquareIcon width={28} height={28} color={getIconColor('Transactions')} />
        </TouchableOpacity>
        <TouchableOpacity className="items-center p-3">
          <SettingIcon width={28} height={28} color="#A3A3A3" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomTabBar;
