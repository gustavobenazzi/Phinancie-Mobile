import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import FormScreen from '../components/FormScreen';
import CheckIcon from '../../assets/Check.svg';

const PRIMARY_GREEN = '#00D09E';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadSavedLogin = async () => {
      try {
        const shouldRemember = await AsyncStorage.getItem('rememberLogin');
        if (shouldRemember === 'true') {
          const savedEmail = await AsyncStorage.getItem('savedEmail');
          const savedPassword = await AsyncStorage.getItem('savedPassword');
          if (savedEmail) setEmail(savedEmail);
          if (savedPassword) setPassword(savedPassword);
          setRememberLogin(true);
        }
      } catch (error) {
        console.log('Não foi possível carregar o login salvo', error);
      }
    };

    loadSavedLogin();
  }, []);

  const persistRememberLogin = async (shouldRemember, currentEmail, currentPassword) => {
    try {
      if (shouldRemember) {
        await AsyncStorage.multiSet([
          ['rememberLogin', 'true'],
          ['savedEmail', currentEmail],
          ['savedPassword', currentPassword],
        ]);
      } else {
        await AsyncStorage.multiRemove(['rememberLogin', 'savedEmail', 'savedPassword']);
      }
    } catch (error) {
      console.log('Falha ao atualizar o estado de lembrar login', error);
    }
  };

  const handleToggleRemember = async () => {
    const nextValue = !rememberLogin;
    setRememberLogin(nextValue);
    await persistRememberLogin(nextValue, email, password);
  };

  useEffect(() => {
    if (!rememberLogin) return;

    const syncCredentials = async () => {
      try {
        await AsyncStorage.multiSet([
          ['savedEmail', email],
          ['savedPassword', password],
        ]);
      } catch (error) {
        console.log('Não foi possível sincronizar o login salvo', error);
      }
    };

    syncCredentials();
  }, [email, password, rememberLogin]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      await persistRememberLogin(rememberLogin, email, password);
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreen title="Phinancie" subtitle="Controle suas finanças">

      <TextInput
        className="bg-white p-4 rounded-lg mb-4 border border-gray-300"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        className="bg-white p-4 rounded-lg mb-4 border border-gray-300"
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity className="flex-row items-center" onPress={handleToggleRemember} activeOpacity={0.8}>
          <View
            className={`w-7 h-7 rounded border flex items-center justify-center ${rememberLogin ? 'border-[#00D09E] bg-white' : 'border-gray-400 bg-white'}`}
          >
            {rememberLogin ? <CheckIcon width={16} height={16} color={PRIMARY_GREEN} /> : null}
          </View>
          <Text className="ml-2 text-gray-700 font-medium">Lembrar login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text className="text-blue-600 font-semibold">Esqueceu a senha?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className={`p-4 rounded-lg items-center ${loading ? 'bg-gray-400' : 'bg-[#00D09E]'}`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-base font-bold">
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Não tem conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="text-blue-600 font-semibold">Registre-se</Text>
        </TouchableOpacity>
      </View>
    </FormScreen>
  );
}
