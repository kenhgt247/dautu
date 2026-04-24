import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type TransactionType = 'BUY' | 'SELL';
export type AssetType = 'GOLD' | 'SILVER' | 'SILVER_KG';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  asset: AssetType;
  amount: number;
  pricePerUnit: number;
  total: number;
}

export interface Portfolio {
  gold: number;
  goldAvgCost: number;
  silver: number;
  silverAvgCost: number;
  silverKg: number;
  silverKgAvgCost: number;
}

interface PortfolioContextType {
  portfolio: Portfolio;
  transactions: Transaction[];
  buyAsset: (asset: AssetType, amount: number, pricePerUnit: number, date?: string) => boolean;
  sellAsset: (asset: AssetType, amount: number, pricePerUnit: number, date?: string) => boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const getAssetKey = (asset: AssetType): keyof Portfolio => {
  if (asset === 'SILVER_KG') return 'silverKg';
  return asset.toLowerCase() as keyof Portfolio;
};

const defaultPortfolio: Portfolio = {
  gold: 0, goldAvgCost: 0,
  silver: 0, silverAvgCost: 0,
  silverKg: 0, silverKgAvgCost: 0
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.cccd || 'guest';

  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const saved = localStorage.getItem(`portfolio_${userId}`);
    return saved ? { ...defaultPortfolio, ...JSON.parse(saved) } : defaultPortfolio;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`transactions_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Reload data when user changes
  useEffect(() => {
    const savedPortfolio = localStorage.getItem(`portfolio_${userId}`);
    setPortfolio(savedPortfolio ? { ...defaultPortfolio, ...JSON.parse(savedPortfolio) } : defaultPortfolio);

    const savedTransactions = localStorage.getItem(`transactions_${userId}`);
    setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(`portfolio_${userId}`, JSON.stringify(portfolio));
  }, [portfolio, userId]);

  useEffect(() => {
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
  }, [transactions, userId]);

  const buyAsset = (asset: AssetType, amount: number, pricePerUnit: number, date?: string) => {
    const totalCost = amount * pricePerUnit;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      date: date || new Date().toISOString(),
      type: 'BUY',
      asset,
      amount,
      pricePerUnit,
      total: totalCost
    };

    setPortfolio(prev => {
      const assetKey = getAssetKey(asset);
      const avgCostKey = `${assetKey}AvgCost` as keyof Portfolio;
      const currentAmount = prev[assetKey] as number;
      const currentAvgCost = prev[avgCostKey] as number;
      
      const newAmount = currentAmount + amount;
      const newAvgCost = newAmount > 0 ? ((currentAmount * currentAvgCost) + totalCost) / newAmount : 0;

      return {
        ...prev,
        [assetKey]: newAmount,
        [avgCostKey]: newAvgCost
      };
    });
    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  const sellAsset = (asset: AssetType, amount: number, pricePerUnit: number, date?: string) => {
    const currentAssetAmount = portfolio[getAssetKey(asset)] as number;
    if (currentAssetAmount < amount) {
      const assetName = asset === 'GOLD' ? 'Vàng' : asset === 'SILVER_KG' ? 'Bạc (Kg)' : 'Bạc';
      throw new Error(`Bạn không có đủ ${assetName} để bán.`);
    }

    const totalRevenue = amount * pricePerUnit;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      date: date || new Date().toISOString(),
      type: 'SELL',
      asset,
      amount,
      pricePerUnit,
      total: totalRevenue
    };

    setPortfolio(prev => {
      const assetKey = getAssetKey(asset);
      const avgCostKey = `${assetKey}AvgCost` as keyof Portfolio;
      const newAmount = (prev[assetKey] as number) - amount;
      const newAvgCost = newAmount > 0 ? prev[avgCostKey] as number : 0;

      return {
        ...prev,
        [assetKey]: newAmount,
        [avgCostKey]: newAvgCost
      };
    });
    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  return (
    <PortfolioContext.Provider value={{ portfolio, transactions, buyAsset, sellAsset }}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
