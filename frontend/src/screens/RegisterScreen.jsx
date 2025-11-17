import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FormScreen from '../components/FormScreen';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !cpf || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não conferem');
      return;
    }
    setLoading(true);
    try {
      // Backend ainda não possui rota de cadastro
      Alert.alert('Info', 'Registro em construção. Redirecionando para login.');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormScreen title="Phinancie" subtitle="Crie sua conta">

      <TextInput
        className="bg-white p-4 rounded-lg mb-4 border border-gray-300"
        placeholder="Nome"
        value={name}
        onChangeText={setName}
      />

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
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
      />

      <TextInput
        className="bg-white p-4 rounded-lg mb-4 border border-gray-300"
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        className="bg-white p-4 rounded-lg mb-4 border border-gray-300"
        placeholder="Confirme sua senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className={`p-4 rounded-lg items-center ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-base font-bold">{loading ? 'Registrando...' : 'Registrar'}</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Já tem uma conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text className="text-blue-600 font-semibold">Faça login</Text>
        </TouchableOpacity>
      </View>
    </FormScreen>
  );
}
