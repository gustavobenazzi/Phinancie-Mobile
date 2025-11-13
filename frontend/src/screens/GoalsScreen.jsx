import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import api from '../services/api';

export default function GoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data.data);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  const renderGoal = ({ item }) => {
    const endDate = new Date(item.endDate);
    const isExpired = endDate < new Date();

    return (
      <View style={styles.goalItem}>
        <View style={styles.goalInfo}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.value}>R$ {item.value.toFixed(2)}</Text>
          <Text style={[styles.date, isExpired && styles.expired]}>
            Vence em: {endDate.toLocaleDateString('pt-BR')}
          </Text>
        </View>
        {isExpired && <Text style={styles.expiredText}>Expirada</Text>}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Metas Financeiras</Text>
      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma meta encontrada</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  goalItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expired: {
    color: '#dc3545',
  },
  expiredText: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});
