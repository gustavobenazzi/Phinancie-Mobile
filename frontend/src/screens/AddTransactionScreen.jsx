import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import ArrowLeftIcon from '../../assets/Vector-1.svg'; 
import PlusIcon from '../../assets/Plus.svg';

// Import available icons
import CarIcon from '../../assets/Car.svg';
import FoodIcon from '../../assets/Food.svg';
import SalaryIcon from '../../assets/Salary.svg';
import HomeIcon from '../../assets/Home.svg';
import MoreIcon from '../../assets/More.svg';

const AVAILABLE_ICONS = [
  { name: 'Car', component: CarIcon },
  { name: 'Food', component: FoodIcon },
  { name: 'Salary', component: SalaryIcon },
  { name: 'Home', component: HomeIcon },
  { name: 'More', component: MoreIcon },
];

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('EXPENSE');
  const [loading, setLoading] = useState(false);

  // Category Modal State
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('More'); // Default icon
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
    const now = new Date();
    setDate(now.toLocaleDateString('pt-BR'));
    setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar categorias', error);
    }
  };

  const handleSave = async () => {
    if (!amount || !categoryId || !date || !time) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      // Parse date and time
      const [day, month, year] = date.split('/');
      const [hour, minute] = time.split(':');
      const transactionDate = new Date(year, month - 1, day, hour, minute);

      await api.post('/transactions', {
        amount: parseFloat(amount.replace(',', '.')),
        type,
        categoryId,
        establishment,
        date: transactionDate.toISOString(),
        description: establishment 
      });

      Alert.alert('Sucesso', 'Transação registrada com sucesso');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar a transação');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, {
          name: newCategoryName,
          type: editingCategory.type,
          icon: selectedIcon
        });
        setEditingCategory(null);
      } else {
        await api.post('/categories', {
          name: newCategoryName,
          type: type,
          icon: selectedIcon,
        });
      }
      setNewCategoryName('');
      setSelectedIcon('More');
      fetchCategories();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', editingCategory ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria');
    }
  };

  const handleEditCategory = (category) => {
    setNewCategoryName(category.name);
    setSelectedIcon(category.icon || 'More');
    setEditingCategory(category);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Erro ao excluir categoria');
    }
  };

  const renderIcon = (iconName, size = 24, color = "#000") => {
    const IconComponent = AVAILABLE_ICONS.find(i => i.name === iconName)?.component || MoreIcon;
    return <IconComponent width={size} height={size} color={color} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeftIcon width={24} height={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-4">Adicionar Transação</Text>
      </View>

      <ScrollView className="p-6">
        <Text className="text-gray-600 mb-2">Valor</Text>
        <TextInput
          className="bg-white p-4 rounded-xl mb-4 text-xl font-bold text-gray-800"
          placeholder="R$ 0,00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text className="text-gray-600 mb-2">Tipo</Text>
        <View className="flex-row mb-4">
          <TouchableOpacity 
            className={`flex-1 p-3 rounded-l-xl items-center ${type === 'EXPENSE' ? 'bg-red-500' : 'bg-gray-200'}`}
            onPress={() => setType('EXPENSE')}
          >
            <Text className={`${type === 'EXPENSE' ? 'text-white' : 'text-gray-600'} font-medium`}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 p-3 rounded-r-xl items-center ${type === 'INCOME' ? 'bg-green-500' : 'bg-gray-200'}`}
            onPress={() => setType('INCOME')}
          >
            <Text className={`${type === 'INCOME' ? 'text-white' : 'text-gray-600'} font-medium`}>Receita</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-600 mb-2">Categoria</Text>
        <TouchableOpacity 
          className="bg-white p-4 rounded-xl mb-4 flex-row justify-between items-center"
          onPress={() => setCategoryModalVisible(true)}
        >
          <View className="flex-row items-center">
             {categoryId && (
               <View className="mr-2">
                 {renderIcon(categories.find(c => c.id === categoryId)?.icon, 20, "#00D09E")}
               </View>
             )}
             <Text className={categoryId ? "text-gray-800" : "text-gray-400"}>
              {categoryId ? categories.find(c => c.id === categoryId)?.name : "Selecione uma categoria"}
            </Text>
          </View>
          <PlusIcon width={20} height={20} color="#A3A3A3" />
        </TouchableOpacity>

        <View className="flex-row space-x-4 mb-4">
          <View className="flex-1">
            <Text className="text-gray-600 mb-2">Data</Text>
            <TextInput
              className="bg-white p-4 rounded-xl"
              placeholder="DD/MM/AAAA"
              value={date}
              onChangeText={setDate}
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-600 mb-2">Hora</Text>
            <TextInput
              className="bg-white p-4 rounded-xl"
              placeholder="HH:MM"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <Text className="text-gray-600 mb-2">Estabelecimento (Opcional)</Text>
        <TextInput
          className="bg-white p-4 rounded-xl mb-8"
          placeholder="Nome do local"
          value={establishment}
          onChangeText={setEstablishment}
        />

        <TouchableOpacity 
          className="bg-[#00D09E] p-4 rounded-xl items-center shadow-sm"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <Text className="text-white font-bold text-lg">Salvando...</Text>
          ) : (
            <Text className="text-white font-bold text-lg">Salvar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={isCategoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setCategoryModalVisible(false);
          setEditingCategory(null);
          setNewCategoryName('');
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold">Categorias</Text>
              <TouchableOpacity onPress={() => {
                setCategoryModalVisible(false);
                setEditingCategory(null);
                setNewCategoryName('');
              }}>
                <Text className="text-blue-500">Fechar</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Nome da Categoria</Text>
              <TextInput
                className="bg-gray-100 p-3 rounded-xl mb-3"
                placeholder={editingCategory ? "Editar categoria" : "Nova categoria"}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              
              <Text className="text-gray-600 mb-2">Ícone</Text>
              <View className="flex-row flex-wrap mb-3">
                {AVAILABLE_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    className={`p-2 mr-2 mb-2 rounded-full ${selectedIcon === icon.name ? 'bg-[#00D09E]' : 'bg-gray-100'}`}
                    onPress={() => setSelectedIcon(icon.name)}
                  >
                    <icon.component width={24} height={24} color={selectedIcon === icon.name ? '#FFF' : '#A3A3A3'} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                className="bg-[#00D09E] p-3 rounded-xl items-center"
                onPress={handleAddCategory}
              >
                <Text className="text-white font-bold">{editingCategory ? "Salvar Alterações" : "Adicionar Categoria"}</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                  <TouchableOpacity 
                    className="flex-1 flex-row items-center"
                    onPress={() => {
                      setCategoryId(item.id);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <View className="mr-3 bg-gray-100 p-2 rounded-full">
                      {renderIcon(item.icon, 20, "#00D09E")}
                    </View>
                    <Text className="text-lg text-gray-800">{item.name}</Text>
                  </TouchableOpacity>
                  <View className="flex-row">
                    <TouchableOpacity onPress={() => handleEditCategory(item)} className="mr-4">
                      <Text className="text-blue-500">Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
                      <Text className="text-red-500">Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}