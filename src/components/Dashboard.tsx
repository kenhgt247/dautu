import React, { useState, useEffect } from 'react';
import { usePortfolio, AssetType } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Coins, Wallet, History, ArrowRightLeft, Eye, EyeOff, LogOut, ShieldCheck } from 'lucide-react';

interface PriceData {
  buy: number;
  sell: number;
  unit: string;
}

interface Prices {
  gold: PriceData;
  silver: PriceData;
  silverKg: PriceData;
  timestamp: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export default function Dashboard() {
  const { portfolio, transactions, buyAsset, sellAsset } = usePortfolio();
  const { user, logout } = useAuth();
  const [prices, setPrices] = useState<Prices | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [tradeAsset, setTradeAsset] = useState<AssetType>('GOLD');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  
  const [showAssets, setShowAssets] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [tradeDate, setTradeDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [isManualDate, setIsManualDate] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isManualDate) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setTradeDate(now.toISOString().slice(0, 16));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isManualDate]);

  useEffect(() => {
    if (prices) {
      const priceKey = tradeAsset === 'SILVER_KG' ? 'silverKg' : tradeAsset.toLowerCase() as keyof Prices;
      // If user BUYS, they pay the shop's SELL price.
      // If user SELLS, they receive the shop's BUY price.
      const currentPrice = tradeType === 'BUY' 
        ? (prices[priceKey] as PriceData).sell 
        : (prices[priceKey] as PriceData).buy;
      setCustomPrice(currentPrice.toString());
    }
  }, [tradeAsset, tradeType, prices]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/prices');
        const data = await res.json();
        setPrices(data);
      } catch (error) {
        console.error("Failed to fetch prices", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prices) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ.");
      return;
    }

    const numPrice = parseFloat(customPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      alert("Vui lòng nhập đơn giá hợp lệ.");
      return;
    }

    if (tradeType === 'BUY') {
      buyAsset(tradeAsset, numAmount, numPrice, new Date(tradeDate).toISOString());
    } else {
      sellAsset(tradeAsset, numAmount, numPrice, new Date(tradeDate).toISOString());
    }
    
    setAmount('');
    setIsManualDate(false);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setTradeDate(now.toISOString().slice(0, 16));
  };

  if (loading || !prices) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <div className="animate-pulse text-gold-500 font-serif text-2xl tracking-widest uppercase">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  // To evaluate portfolio value, we use the shop's BUY price (liquidation value)
  const currentAssetValue = 
    (portfolio.gold * prices.gold.buy) + 
    (portfolio.silver * prices.silver.buy) + 
    (portfolio.silverKg * prices.silverKg.buy);

  const totalAssetsValue = currentAssetValue;

  const totalInvested = 
    (portfolio.gold * portfolio.goldAvgCost) + 
    (portfolio.silver * portfolio.silverAvgCost) + 
    (portfolio.silverKg * portfolio.silverKgAvgCost);

  const totalPnl = currentAssetValue - totalInvested;
  const pnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const renderAsset = (label: string, amount: number, avgCost: number, currentPrice: number, colorClass: string) => {
    const invested = amount * avgCost;
    const current = amount * currentPrice;
    const pnl = current - invested;
    const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
    
    return (
      <div className="px-4 py-2">
        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">{label}</p>
        <p className={`font-mono text-2xl ${colorClass} mb-3`}>{showAssets ? amount.toLocaleString('vi-VN') : '***'}</p>
        
        {amount > 0 && showAssets && (
          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Giá vốn TB:</span>
              <span className="font-mono text-white/80">{formatCurrency(avgCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Vốn đầu tư:</span>
              <span className="font-mono text-white/80">{formatCurrency(invested)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/40">Giá trị HT:</span>
              <span className="font-mono text-white">{formatCurrency(current)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1 mt-1 border-t border-white/5">
              <span className="text-white/40">Lãi/Lỗ:</span>
              <span className={`font-mono font-medium ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-ink text-white p-6 md:p-12 max-w-7xl mx-auto">
      {/* Top Bar - User Info */}
      <div className="flex justify-end items-center gap-4 mb-8">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm">
          <ShieldCheck size={16} className="text-gold-500" />
          <span className="text-white/80 font-medium">{user?.fullName}</span>
          <span className="text-white/20">|</span>
          <span className="text-white/40 font-mono text-xs">
            {user?.cccd ? `*${user.cccd.slice(-4)}` : ''}
          </span>
        </div>
        <button 
          onClick={logout} 
          className="bg-white/5 border border-white/10 p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Đăng xuất"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Header */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-gold-500 mb-2">
            Đầu Tư
          </h1>
          <p className="text-white/60 uppercase tracking-[0.2em] text-sm">
            Nền tảng giao dịch Vàng & Bạc trực tuyến
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <p className="text-white/40 text-xs uppercase tracking-wider">Tổng tài sản ước tính</p>
            <button 
              onClick={() => setShowAssets(!showAssets)} 
              className="text-white/40 hover:text-white transition-colors"
              title={showAssets ? "Ẩn tài sản" : "Hiện tài sản"}
            >
              {showAssets ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="font-serif text-3xl md:text-4xl text-white mb-2">
            {showAssets ? formatCurrency(totalAssetsValue) : '******'}
          </p>
          {totalInvested > 0 && showAssets && (
            <div className="flex flex-col items-end gap-2 mt-3">
              <p className="text-white/60 text-sm">
                Tổng vốn đầu tư: <span className="font-mono text-white">{formatCurrency(totalInvested)}</span>
              </p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono ${totalPnl >= 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {totalPnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {totalPnl >= 0 ? 'Lãi: +' : 'Lỗ: '}{formatCurrency(totalPnl)} ({totalPnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Market & Portfolio */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Market Prices */}
          <section>
            <h2 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4 flex items-center gap-2">
              <TrendingUp size={14} /> Tỷ giá thị trường
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gold Card */}
              <div className="bg-surface border border-gold-500/20 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-xl text-gold-500">Vàng 9999</h3>
                    <p className="text-[10px] text-white/40 mt-1">{prices.gold.unit}</p>
                  </div>
                  <Coins className="text-gold-500/50" size={20} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Mua</p>
                    <p className="font-mono text-sm">{formatCurrency(prices.gold.buy)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Bán</p>
                    <p className="font-mono text-sm">{formatCurrency(prices.gold.sell)}</p>
                  </div>
                </div>
              </div>

              {/* Silver Card */}
              <div className="bg-surface border border-silver-500/20 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-silver-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-xl text-silver-400">Bạc Ta</h3>
                    <p className="text-[10px] text-white/40 mt-1">{prices.silver.unit}</p>
                  </div>
                  <Coins className="text-silver-500/50" size={20} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Mua</p>
                    <p className="font-mono text-sm">{formatCurrency(prices.silver.buy)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Bán</p>
                    <p className="font-mono text-sm">{formatCurrency(prices.silver.sell)}</p>
                  </div>
                </div>
              </div>

              {/* Silver Kg Card */}
              <div className="bg-surface border border-silver-400/30 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-silver-400/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-xl text-silver-300">Bạc Thỏi</h3>
                    <p className="text-[10px] text-white/40 mt-1">{prices.silverKg.unit}</p>
                  </div>
                  <Coins className="text-silver-400/50" size={20} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Mua</p>
                    <p className="font-mono text-sm">{formatCurrency(prices.silverKg.buy)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40">Bán</p>
                    <p className="font-mono text-sm">{formatCurrency(prices.silverKg.sell)}</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Portfolio */}
          <section>
            <h2 className="text-xs uppercase tracking-[0.15em] text-white/50 mb-4 flex items-center gap-2">
              <Wallet size={14} /> Tài sản tích trữ
            </h2>
            <div className="bg-paper border border-white/5 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
                {renderAsset('Vàng (Chỉ)', portfolio.gold, portfolio.goldAvgCost, prices.gold.buy, 'text-gold-400')}
                {renderAsset('Bạc (Chỉ)', portfolio.silver, portfolio.silverAvgCost, prices.silver.buy, 'text-silver-400')}
                {renderAsset('Bạc (Kg)', portfolio.silverKg, portfolio.silverKgAvgCost, prices.silverKg.buy, 'text-silver-300')}
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Trading & History */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Trading Form */}
          <section>
            <div className="bg-surface border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 via-silver-400 to-gold-500 opacity-50"></div>
              
              <h2 className="font-serif text-3xl mb-8">Ghi nhận đầu tư</h2>
              
              <form onSubmit={handleTrade} className="space-y-6">
                {/* Asset Selection */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-ink rounded-full border border-white/10">
                  <button
                    type="button"
                    onClick={() => setTradeAsset('GOLD')}
                    className={`py-2 px-2 rounded-full text-xs font-medium transition-colors ${
                      tradeAsset === 'GOLD' ? 'bg-surface text-gold-400 shadow-lg border border-gold-500/20' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Vàng (Chỉ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeAsset('SILVER')}
                    className={`py-2 px-2 rounded-full text-xs font-medium transition-colors ${
                      tradeAsset === 'SILVER' ? 'bg-surface text-silver-400 shadow-lg border border-silver-500/20' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Bạc (Chỉ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeAsset('SILVER_KG')}
                    className={`py-2 px-2 rounded-full text-xs font-medium transition-colors ${
                      tradeAsset === 'SILVER_KG' ? 'bg-surface text-silver-300 shadow-lg border border-silver-400/30' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    Bạc (Kg)
                  </button>
                </div>

                {/* Action Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTradeType('BUY')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                      tradeType === 'BUY' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-transparent border-white/5 text-white/40 hover:border-white/10'
                    }`}
                  >
                    Mua vào
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType('SELL')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                      tradeType === 'SELL' 
                        ? 'bg-white/10 border-white/20 text-white' 
                        : 'bg-transparent border-white/5 text-white/40 hover:border-white/10'
                    }`}
                  >
                    Bán ra
                  </button>
                </div>

                {/* Amount Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                      Số lượng ({tradeAsset === 'SILVER_KG' ? 'Kg' : 'Chỉ'})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-ink border border-white/10 rounded-xl py-4 px-5 text-xl font-mono focus:outline-none focus:border-gold-500/50 transition-colors"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                      Đơn giá (VNĐ)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-full bg-ink border border-white/10 rounded-xl py-4 px-5 text-xl font-mono focus:outline-none focus:border-gold-500/50 transition-colors"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Date Input */}
                <div>
                  <label className="flex justify-between items-center text-xs uppercase tracking-wider text-white/50 mb-2">
                    <span>Ngày giao dịch</span>
                    {isManualDate && (
                      <button 
                        type="button" 
                        onClick={() => setIsManualDate(false)}
                        className="text-gold-500 hover:text-gold-400 text-[10px] normal-case tracking-normal"
                      >
                        Về hiện tại
                      </button>
                    )}
                  </label>
                  <input
                    type="datetime-local"
                    value={tradeDate}
                    onChange={(e) => {
                      setTradeDate(e.target.value);
                      setIsManualDate(true);
                    }}
                    className="w-full bg-ink border border-white/10 rounded-xl py-4 px-5 text-sm font-mono focus:outline-none focus:border-gold-500/50 transition-colors text-white"
                    required
                  />
                </div>

                {/* Summary */}
                <div className="bg-ink/50 rounded-xl p-4 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60">Tổng giá trị</span>
                    <span className={`font-mono text-lg ${tradeType === 'BUY' ? 'text-red-400' : 'text-green-400'}`}>
                      {tradeType === 'BUY' ? '-' : '+'}{formatCurrency((parseFloat(amount) || 0) * (parseFloat(customPrice) || 0))}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl font-medium tracking-wide uppercase text-sm transition-all ${
                    tradeAsset === 'GOLD' 
                      ? 'bg-gold-600 hover:bg-gold-500 text-ink' 
                      : 'bg-silver-400 hover:bg-silver-300 text-ink'
                  }`}
                >
                  Xác nhận {tradeType === 'BUY' ? 'Mua' : 'Bán'}
                </button>
              </form>
            </div>
          </section>

        </div>
      </div>

      {/* Transaction History - Full Width Bottom */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-white/50 flex items-center gap-2">
            <History size={14} /> Lịch sử giao dịch
          </h2>
          <button 
            onClick={() => setShowHistory(!showHistory)} 
            className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-xs"
          >
            {showHistory ? <><EyeOff size={14} /> Ẩn</> : <><Eye size={14} /> Hiện</>}
          </button>
        </div>
        
        {showHistory && (
          <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-white/30 font-serif italic">
                Chưa có giao dịch nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40 bg-ink/50">
                      <th className="p-4 font-normal">Thời gian</th>
                      <th className="p-4 font-normal">Loại</th>
                      <th className="p-4 font-normal">Tài sản</th>
                      <th className="p-4 font-normal text-right">Số lượng</th>
                      <th className="p-4 font-normal text-right">Đơn giá</th>
                      <th className="p-4 font-normal text-right">Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 text-sm text-white/60">
                          {new Date(tx.date).toLocaleString('vi-VN')}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-wider border ${
                            tx.type === 'BUY' 
                              ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                              : 'bg-green-500/10 border-green-500/20 text-green-400'
                          }`}>
                            {tx.type === 'BUY' ? 'Mua' : 'Bán'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-serif ${tx.asset === 'GOLD' ? 'text-gold-400' : 'text-silver-400'}`}>
                            {tx.asset === 'GOLD' ? 'Vàng' : tx.asset === 'SILVER_KG' ? 'Bạc (Kg)' : 'Bạc'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-sm">
                          {tx.amount.toLocaleString('vi-VN')}
                        </td>
                        <td className="p-4 text-right font-mono text-sm text-white/60">
                          {formatCurrency(tx.pricePerUnit)}
                        </td>
                        <td className={`p-4 text-right font-mono text-sm ${
                          tx.type === 'BUY' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {tx.type === 'BUY' ? '-' : '+'}{formatCurrency(tx.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
