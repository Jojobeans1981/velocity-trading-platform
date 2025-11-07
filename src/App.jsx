import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CryptoTradingDashboard = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [timeframe, setTimeframe] = useState('1H');
  const [portfolioData, setPortfolioData] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Mock crypto assets with realistic data
  const assets = useMemo(() => ({
    BTC: { name: 'Bitcoin', price: 43250.50, change24h: 2.45, volume: '28.5B', marketCap: '845B' },
    ETH: { name: 'Ethereum', price: 2280.75, change24h: -1.23, volume: '15.2B', marketCap: '274B' },
    SOL: { name: 'Solana', price: 98.32, change24h: 5.67, volume: '2.8B', marketCap: '42B' },
    AVAX: { name: 'Avalanche', price: 36.45, change24h: -2.89, volume: '845M', marketCap: '13.4B' }
  }), []);

  // Generate realistic price history
  const generatePriceHistory = (basePrice, volatility = 0.02) => {
    const points = timeframe === '1H' ? 60 : timeframe === '24H' ? 24 : 7;
    const data = [];
    let price = basePrice;
    
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * volatility * price;
      price += change;
      data.push({
        time: i,
        price: parseFloat(price.toFixed(2)),
        volume: Math.random() * 1000000
      });
    }
    return data;
  };

  // Generate portfolio performance data
  const generatePortfolioData = () => {
    const data = [];
    let value = 100000;
    for (let i = 0; i < 30; i++) {
      value += (Math.random() - 0.45) * 2000;
      data.push({
        day: i,
        value: parseFloat(value.toFixed(2)),
        pnl: value - 100000
      });
    }
    return data;
  };

  useEffect(() => {
    setPortfolioData(generatePortfolioData());
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setPriceHistory(generatePriceHistory(assets[selectedAsset].price));
      setIsLoading(false);
    }, 500);
  }, [selectedAsset, timeframe, assets]);

  // Calculate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (portfolioData.length === 0) return { totalValue: 0, pnl: 0, pnlPercent: 0 };
    const latest = portfolioData[portfolioData.length - 1];
    const initial = 100000;
    return {
      totalValue: latest.value,
      pnl: latest.pnl,
      pnlPercent: ((latest.value - initial) / initial * 100).toFixed(2)
    };
  }, [portfolioData]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPriceHistory(generatePriceHistory(assets[selectedAsset].price));
      setIsLoading(false);
      setAlerts(prev => [...prev, { id: Date.now(), msg: 'Market data refreshed', time: new Date().toLocaleTimeString() }]);
    }, 500);
  };

  const currentAsset = assets[selectedAsset];
  const isPositive = currentAsset.change24h > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Trading Terminal
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time crypto market analysis</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <DollarSign size={16} />
              Portfolio Value
            </div>
            <div className="text-3xl font-bold">${portfolioMetrics.totalValue.toLocaleString()}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Activity size={16} />
              24h P&L
            </div>
            <div className={`text-3xl font-bold ${portfolioMetrics.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${Math.abs(portfolioMetrics.pnl).toLocaleString()}
              <span className="text-sm ml-2">({portfolioMetrics.pnlPercent}%)</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <BarChart3 size={16} />
              Active Positions
            </div>
            <div className="text-3xl font-bold">4</div>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Chart */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">{currentAsset.name}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold">${currentAsset.price.toLocaleString()}</span>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(currentAsset.change24h)}%
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {['1H', '24H', '7D'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeframe === tf 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Asset List & Orders */}
          <div className="space-y-6">
            {/* Asset Selector */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">Markets</h3>
              <div className="space-y-2">
                {Object.entries(assets).map(([symbol, data]) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedAsset(symbol)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedAsset === symbol 
                        ? 'bg-cyan-500/20 border-2 border-cyan-500' 
                        : 'bg-slate-700/50 hover:bg-slate-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{symbol}</div>
                        <div className="text-xs text-slate-400">{data.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${data.price.toLocaleString()}</div>
                        <div className={`text-xs ${data.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {data.change24h > 0 ? '+' : ''}{data.change24h}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-4">Market Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Volume 24h</span>
                  <span className="font-semibold">{currentAsset.volume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Market Cap</span>
                  <span className="font-semibold">{currentAsset.marketCap}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Performance Chart */}
        <div className="mt-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Portfolio Performance (30 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mt-6 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-cyan-400" />
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {alerts.slice(-3).reverse().map(alert => (
                <div key={alert.id} className="flex justify-between text-sm p-2 bg-slate-700/50 rounded">
                  <span>{alert.msg}</span>
                  <span className="text-slate-400">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoTradingDashboard;