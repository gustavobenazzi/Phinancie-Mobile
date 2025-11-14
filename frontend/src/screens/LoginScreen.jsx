import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

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

      navigation.replace('Dashboard');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-5 bg-gray-100">
      <Text className="text-3xl font-bold text-center mb-2 text-gray-800">Phinancie</Text>
      <Text className="text-base text-center mb-10 text-gray-600">Controle suas finanças</Text>

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

      <TouchableOpacity
        className={`p-4 rounded-lg items-center ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-base font-bold">
          {loading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
