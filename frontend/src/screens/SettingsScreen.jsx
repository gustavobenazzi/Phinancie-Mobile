import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const SectionTitle = ({ children }) => (
  <Text className="text-xs uppercase tracking-wide text-gray-500 mb-3">{children}</Text>
);

const SettingCard = ({ title, description, onPress, loading, destructive }) => (
  <TouchableOpacity
    className={`w-full bg-white rounded-2xl p-4 mb-3 border ${destructive ? 'border-red-200' : 'border-gray-100'}`}
    activeOpacity={0.85}
    onPress={onPress}
    disabled={loading}
  >
    <View className="flex-row justify-between items-center">
      <View className="flex-1 pr-4">
        <Text className={`text-[15px] font-semibold ${destructive ? 'text-red-600' : 'text-gray-900'}`}>{title}</Text>
        {description ? <Text className="text-xs text-gray-500 mt-1">{description}</Text> : null}
      </View>
      {loading ? <ActivityIndicator color={destructive ? '#DC2626' : '#00D09E'} /> : null}
    </View>
  </TouchableOpacity>
);

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [loadingAction, setLoadingAction] = useState(null);

  const runAction = async (key, fn, successMessage) => {
    setLoadingAction(key);
    try {
      await fn();
      if (successMessage) {
        Alert.alert('Tudo certo', successMessage);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível concluir a ação.');
    } finally {
      setLoadingAction(null);
    }
  };

  const confirmAndExecute = (title, message, key, fn, successMessage) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim, confirmar',
        style: 'destructive',
        onPress: () => runAction(key, fn, successMessage),
      },
    ]);
  };

  const handleClearTransactions = () => {
    confirmAndExecute(
      'Limpar transações',
      'Essa ação apagará todas as transações da sua conta. Deseja continuar?',
      'transactions',
      () => api.delete('/transactions'),
      'Todas as transações foram removidas.',
    );
  };

  const handleClearCategories = () => {
    confirmAndExecute(
      'Limpar categorias',
      'Essa ação apagará todas as categorias criadas e suas transações vinculadas. Deseja continuar?',
      'categories',
      () => api.delete('/categories'),
      'Todas as categorias foram removidas.',
    );
  };

  const handleLogout = () => {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () =>
          runAction('logout', async () => {
            await AsyncStorage.multiRemove(['authToken', 'user']);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
        <Text className="text-2xl font-semibold text-gray-900 mb-6">Configurações</Text>

        <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm">
          <SectionTitle>Gerenciar dados</SectionTitle>
          <SettingCard
            title="Limpar todas transações"
            description="Remove definitivamente todas as transações desta conta."
            onPress={handleClearTransactions}
            loading={loadingAction === 'transactions'}
          />
          <SettingCard
            title="Limpar todas categorias"
            description="Inclui a exclusão de categorias e eventuais transações ligadas."
            onPress={handleClearCategories}
            loading={loadingAction === 'categories'}
          />
        </View>

        <View className="bg-white rounded-3xl p-5 shadow-sm">
          <SectionTitle>Conta</SectionTitle>
          <SettingCard
            title="Deslogar"
            description="Encerra a sessão atual."
            onPress={handleLogout}
            loading={loadingAction === 'logout'}
            destructive
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
