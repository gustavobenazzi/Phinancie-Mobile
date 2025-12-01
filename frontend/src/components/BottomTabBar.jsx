import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import HomeIcon from '../../assets/Home.svg';
import SearchIcon from '../../assets/Search.svg';
import TaskSquareIcon from '../../assets/task-square.svg';
import SettingIcon from '../../assets/setting-2.svg';

const BottomTabBar = () => {
  const navigation = useNavigation();
  let routeName = '';
  
  try {
    // Try to get the current route name. 
    // Since BottomTabBar is used inside screens, useRoute might work if the component is a child of the screen.
    // However, if it's not directly under a navigator, it might be tricky.
    // But here it is used inside DashboardScreen and TransactionsScreen.
    const route = useRoute();
    routeName = route.name;
  } catch (e) {
    // Fallback or ignore if used outside navigation context (unlikely here)
  }

  const getIconColor = (screenName) => {
    return routeName === screenName ? "#00D09E" : "#A3A3A3";
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex-row justify-around items-center pb-8 pt-4 rounded-t-[32px] shadow-lg">
      <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Dashboard')}>
        <HomeIcon width={24} height={24} color={getIconColor('Dashboard')} />
      </TouchableOpacity>
      <TouchableOpacity className="items-center">
        <SearchIcon width={24} height={24} color="#A3A3A3" />
      </TouchableOpacity>
      <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Transactions')}>
        <TaskSquareIcon width={24} height={24} color={getIconColor('Transactions')} />
      </TouchableOpacity>
      <TouchableOpacity className="items-center">
        <SettingIcon width={24} height={24} color="#A3A3A3" />
      </TouchableOpacity>
    </View>
  );
};

export default BottomTabBar;
