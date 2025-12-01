import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

const aggregateTotals = (transactions = []) =>
  transactions.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === 'INCOME') {
        acc.income += amount;
      } else if (transaction.type === 'EXPENSE') {
        acc.expense += Math.abs(amount);
      }
      return acc;
    },
    { income: 0, expense: 0 },
  );

const useTransactionsTotals = ({ autoFetch = true } = {}) => {
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [loading, setLoading] = useState(autoFetch);

  const fetchTotals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions');
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setTotals(aggregateTotals(list));
    } catch (error) {
      console.log('Erro ao carregar totais das transações', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTotals();
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchTotals]);

  return { totals, loading, refreshTotals: fetchTotals };
};

export default useTransactionsTotals;
export { aggregateTotals };
