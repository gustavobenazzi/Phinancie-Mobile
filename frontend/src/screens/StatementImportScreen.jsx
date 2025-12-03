import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const DEFAULT_INCOME_ICON = 'Salary';
const DEFAULT_EXPENSE_ICON = 'More';
const DEFAULT_INCOME_CATEGORY = 'Receitas importadas';
const DEFAULT_EXPENSE_CATEGORY = 'Despesas importadas';
const FILE_KINDS = {
  OFX: 'ofx',
};

const FORMAT_INFO = {
  [FILE_KINDS.OFX]: {
    label: 'OFX/QFX',
    mime: 'application/x-ofx',
    extensions: ['ofx', 'qfx'],
  },
};

const detectFileKindFromMeta = (extension = '', mimeType = '') => {
  const normalizedExt = extension.toLowerCase();
  const normalizedMime = mimeType.toLowerCase();

  if (
    FORMAT_INFO[FILE_KINDS.OFX].extensions.includes(normalizedExt) ||
    normalizedMime.includes('ofx') ||
    normalizedMime.includes('qfx') ||
    normalizedMime.includes('sgml') ||
    normalizedMime === 'application/xml' ||
    normalizedMime === 'text/xml'
  ) {
    return FILE_KINDS.OFX;
  }

  return null;
};

const StatementImportScreen = () => {
  const navigation = useNavigation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [categories, setCategories] = useState([]);
  const categoriesMapRef = useRef({});
  const [saving, setSaving] = useState(false);
  const [analysisTimestamp, setAnalysisTimestamp] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      const data = response.data?.data || [];
      setCategories(data);
      const map = {};
      data.forEach((category) => {
        if (category.name) {
          map[category.name.trim().toLowerCase()] = category.id;
        }
      });
      categoriesMapRef.current = map;
    } catch (error) {
      console.error('Erro ao carregar categorias', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const normalizeSelectedFile = (asset) => {
    const extension = asset.name?.split('.').pop()?.toLowerCase();
    const mimeType = asset.mimeType || asset.type || '';
    const uri = asset.fileCopyUri || asset.uri;

    if (!uri) {
      Alert.alert('Arquivo indisponível', 'Não foi possível acessar o arquivo selecionado.');
      return null;
    }

    const kind = detectFileKindFromMeta(extension, mimeType);

    if (!kind) {
      Alert.alert('Formato não suportado', 'Envie um arquivo OFX ou QFX (até 5MB).');
      return null;
    }

    const info = FORMAT_INFO[kind];

    return {
      uri,
      name: asset.name || asset.fileName || `extrato-${Date.now()}.${info.extensions[0]}`,
      type: info.mime,
      kind,
      label: info.label,
    };
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (typeof result?.canceled === 'boolean' && result.canceled) {
        return;
      }

      const asset = result.assets?.[0] || result;
      if (!asset?.uri) return;

      const normalized = normalizeSelectedFile(asset);
      if (!normalized) return;

      setSelectedFile(normalized);
      setParsedTransactions([]);
      setSelectedMap({});
      setAnalysisTimestamp(null);
    } catch (error) {
      console.error('Erro ao selecionar arquivo', error);
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleAnalyzeStatement = async () => {
    if (!selectedFile) {
      Alert.alert('Selecione um extrato', 'Escolha um arquivo OFX antes de enviar.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name || `extrato-${Date.now()}.ofx`,
        type: selectedFile.type || FORMAT_INFO[selectedFile.kind]?.mime || 'application/x-ofx',
      });

      const response = await api.post('/statements/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const normalized = Array.isArray(response.data?.data) ? response.data.data : [];

      if (!normalized.length) {
        Alert.alert('Sem dados', 'Não encontramos transações no arquivo enviado.');
        return;
      }

      const selection = {};
      normalized.forEach((tx) => {
        selection[tx.localId] = true;
      });

      setParsedTransactions(normalized);
      setSelectedMap(selection);
      setAnalysisTimestamp(new Date().toISOString());
    } catch (error) {
      console.error('Erro ao enviar extrato', error);
      Alert.alert('Erro', error.response?.data?.error || error.message || 'Não foi possível analisar o extrato.');
    } finally {
      setUploading(false);
    }
  };

  const toggleTransactionSelection = (id) => {
    setSelectedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const selectedTransactions = parsedTransactions.filter((tx) => selectedMap[tx.localId]);

  const ensureCategory = useCallback(
    async (name, type) => {
      const fallback = type === 'INCOME' ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY;
      const finalName = name?.trim() || fallback;
      const key = finalName.toLowerCase();

      if (categoriesMapRef.current[key]) {
        return categoriesMapRef.current[key];
      }

      try {
        const response = await api.post('/categories', {
          name: finalName,
          type,
          icon: type === 'INCOME' ? DEFAULT_INCOME_ICON : DEFAULT_EXPENSE_ICON,
        });
        const category = response.data?.data;
        if (category?.id) {
          categoriesMapRef.current[key] = category.id;
          setCategories((prev) => [...prev, category]);
          return category.id;
        }
      } catch (error) {
        if (error.response?.status === 409) {
          await loadCategories();
          return categoriesMapRef.current[key];
        }
        throw error;
      }

      throw new Error('Não foi possível criar a categoria automaticamente.');
    },
    [loadCategories],
  );

  const handleSaveTransactions = async () => {
    if (!selectedTransactions.length) {
      Alert.alert('Selecione transações', 'Marque ao menos uma transação para salvar.');
      return;
    }

    try {
      setSaving(true);
      for (const tx of selectedTransactions) {
        const categoryId = await ensureCategory(tx.categoryName, tx.type);
        await api.post('/transactions', {
          amount: tx.amount,
          type: tx.type,
          categoryId,
          description: tx.description,
          establishment: tx.establishment,
          date: tx.date,
        });
      }

      Alert.alert('Sucesso', `${selectedTransactions.length} transações importadas.`);
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar transações', error);
      Alert.alert('Erro', 'Não foi possível salvar as transações importadas.');
    } finally {
      setSaving(false);
    }
  };

  const renderTransactionItem = (item) => {
    const isSelected = !!selectedMap[item.localId];
    return (
      <TouchableOpacity
        key={item.localId}
        className={`mb-3 p-4 rounded-2xl border ${isSelected ? 'border-[#00D09E] bg-white' : 'border-gray-200 bg-white/60'}`}
        onPress={() => toggleTransactionSelection(item.localId)}
        activeOpacity={0.85}
      >
        <View className="flex-row mb-2" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
          <View className="flex-1 flex-row items-center pr-3">
            <View className={`w-5 h-5 rounded-full mr-2 ${isSelected ? 'bg-[#00D09E]' : 'bg-gray-300'}`} />
            <Text className="text-gray-800 font-semibold" style={{ flexShrink: 1 }}>
              {item.description}
            </Text>
          </View>
          <Text
            className={`font-semibold text-right ${item.type === 'INCOME' ? 'text-[#4CAF50]' : 'text-[#FF5252]'}`}
            style={{ flexShrink: 0, maxWidth: 130 }}
          >
            {item.type === 'EXPENSE' ? '-' : ''}R${Math.abs(item.amount).toFixed(2)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-500">{new Date(item.date).toLocaleString('pt-BR')}</Text>
          <Text className="text-xs text-gray-500">{item.categoryName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2" activeOpacity={0.8}>
          <Text className="text-base font-semibold text-gray-800">{'< Voltar'}</Text>
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold">Importar extrato bancário</Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="text-gray-800 text-base mb-1">Automatize o lançamento das transações</Text>
        <Text className="text-gray-500 mb-4">
          Envie um extrato em formato OFX, deixe o aplicativo identificar os lançamentos e confirme o que deseja salvar.
        </Text>

        <View className="bg-white rounded-3xl p-4 mb-4 shadow-sm">
          <Text className="text-gray-700 font-semibold mb-3">1. Envie o extrato</Text>
          <TouchableOpacity
            className="bg-[#00D09E] rounded-2xl py-3 items-center"
            onPress={handleSelectFile}
          >
            <Text className="text-white font-semibold">Selecionar arquivo OFX</Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-500 mt-2">Aceitamos arquivos OFX ou QFX com até 5MB.</Text>

          {selectedFile && (
            <View className="mt-4 flex-row items-center">
              <View className="w-16 h-16 rounded-xl mr-3 bg-gray-100 items-center justify-center">
                <Text className="text-gray-700 font-semibold">{selectedFile.label}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-medium">{selectedFile.name || 'extrato.ofx'}</Text>
                <Text className="text-gray-500 text-xs">Arquivo pronto para análise</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            className={`mt-4 rounded-2xl py-3 items-center ${selectedFile ? 'bg-black' : 'bg-gray-300'}`}
            onPress={handleAnalyzeStatement}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white font-semibold">Enviar para análise</Text>
            )}
          </TouchableOpacity>
          {analysisTimestamp && (
            <Text className="text-xs text-gray-500 mt-2">
              Última análise: {new Date(analysisTimestamp).toLocaleString('pt-BR')}
            </Text>
          )}
        </View>

        {parsedTransactions.length > 0 && (
          <View className="bg-white rounded-3xl p-4 shadow-sm">
            <Text className="text-gray-800 font-semibold mb-1">2. Selecione o que importar</Text>
            <Text className="text-gray-500 mb-4 text-sm">
              Marque apenas as transações que deseja salvar. Categorias inexistentes serão criadas automaticamente.
            </Text>

            {parsedTransactions.map((item) => renderTransactionItem(item))}

            <TouchableOpacity
              className={`mt-4 rounded-2xl py-3 items-center ${selectedTransactions.length ? 'bg-[#00D09E]' : 'bg-gray-300'}`}
              onPress={handleSaveTransactions}
              disabled={!selectedTransactions.length || saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white font-semibold">
                  Salvar {selectedTransactions.length || ''} transações
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
};

export default StatementImportScreen;
