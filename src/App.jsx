import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart3, 
  AlertCircle, 
  RefreshCw,
  Zap,
  Shield,
  Rocket,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const CryptoTradingDashboard = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [timeframe, setTimeframe] = useState('1H');
  const [portfolioData, setPortfolioData] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [orderType, setOrderType] = useState('market');
  const [orderAmount, setOrderAmount] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  // Enhanced crypto assets with more data points
  const assets = useMemo(() => ({
    BTC: { 
      name: 'Bitcoin', 
      price: 43250.50, 
      change24h: 2.45, 
      volume: '28.5B', 
      marketCap: '845B',
      color: '#F7931A'
    },
    ETH: { 
      name: 'Ethereum', 
      price: 2280.75, 
      change24h: -1.23, 
      volume: '15.2B', 
      marketCap: '274B',
      color: '#627EEA'
    },
    SOL: { 
      name: 'Solana', 
      price: 98.32, 
      change24h: 5.67, 
      volume: '2.8B', 
      marketCap: '42B',
      color: '#00FFA3'
    },
    AVAX: { 
      name: 'Avalanche', 
      price: 36.45, 
      change24h: -2.89, 
      volume: '845M', 
      marketCap: '13.4B',
      color: '#E84142'
    }
  }), []);

  // Generate realistic price history with trends
  const generatePriceHistory = useCallback((basePrice, volatility = 0.02) => {
    const points = timeframe === '1H' ? 60 : timeframe === '24H' ? 24 : 7;
    const data = [];
    let price = basePrice;
    let trend = 0;
    
    for (let i = 0; i < points; i++) {
      // Add some trend persistence
      if (i % 10 === 0) trend = (Math.random() - 0.5) * 0.5;
      
      const change = (Math.random() - 0.5 + trend) * volatility * price;
      price += change;
      data.push({
        time: i,
        price: parseFloat(price.toFixed(2)),
        volume: Math.random() * 1000000
      });
    }
    return data;
  }, [timeframe]);

  // Enhanced portfolio data generation
  const generatePortfolioData = useCallback(() => {
    const data = [];
    let value = 100000;
    for (let i = 0; i < 30; i++) {
      // More realistic market movements
      value += (Math.random() - 0.48) * value * 0.02;
      data.push({
        day: i,
        value: parseFloat(value.toFixed(2)),
        pnl: value - 100000
      });
    }
    return data;
  }, []);

  // Mock positions data
  const positions = useMemo(() => [
    { asset: 'BTC', amount: 0.5, entry: 42100, current: 43250, pnl: 575 },
    { asset: 'ETH', amount: 3.2, entry: 2350, current: 2280, pnl: -224 },
    { asset: 'SOL', amount: 25, entry: 95, current: 98.32, pnl: 83 },
    { asset: 'AVAX', amount: 50, entry: 38, current: 36.45, pnl: -77.5 }
  ], []);

  useEffect(() => {
    setPortfolioData(generatePortfolioData());
  }, [generatePortfolioData]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setPriceHistory(generatePriceHistory(assets[selectedAsset].price));
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedAsset, timeframe, assets, generatePriceHistory]);

  // Enhanced portfolio metrics
  const portfolioMetrics = useMemo(() => {
    if (portfolioData.length === 0) return { totalValue: 0, pnl: 0, pnlPercent: 0 };
    const latest = portfolioData[portfolioData.length - 1];
    const initial = 100000;
    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    
    return {
      totalValue: latest.value,
      pnl: totalPnL,
      pnlPercent: ((latest.value - initial) / initial * 100).toFixed(2),
      dailyChange: ((portfolioData[portfolioData.length - 1]?.value - portfolioData[portfolioData.length - 2]?.value) || 0)
    };
  }, [portfolioData, positions]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPriceHistory(generatePriceHistory(assets[selectedAsset].price));
      setIsLoading(false);
      setAlerts(prev => [...prev.slice(-2), { 
        id: Date.now(), 
        msg: `Market data refreshed • ${selectedAsset}`, 
        time: new Date().toLocaleTimeString(),
        type: 'info'
      }]);
    }, 600);
  };

  const handlePlaceOrder = () => {
    if (!orderAmount) return;
    
    const newAlert = {
      id: Date.now(),
      msg: `${orderType.toUpperCase()} order placed • ${orderAmount} ${selectedAsset}`,
      time: new Date().toLocaleTimeString(),
      type: 'success'
    };
    
    setAlerts(prev => [...prev.slice(-2), newAlert]);
    setOrderAmount('');
  };

  const currentAsset = assets[selectedAsset];
  const isPositive = currentAsset.change24h > 0;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300">{`Time: ${label}`}</p>
          <p className="text-cyan-400 font-semibold">
            {`Price: $${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200'
    } text-slate-900 p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
              <h1 className="relative text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
                VELOCITY
              </h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-full">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-sm text-cyan-400 font-semibold">LIVE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition-all"
            >
              <Sparkles size={18} />
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all disabled:opacity-50 font-semibold shadow-lg"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </header>

        {/* Enhanced Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <DollarSign size={18} />
              Portfolio Value
            </div>
            <div className="text-3xl font-bold text-white">
              ${portfolioMetrics.totalValue.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <Activity size={18} />
              24h P&L
            </div>
            <div className={`text-3xl font-bold ${
              portfolioMetrics.pnl >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              ${Math.abs(portfolioMetrics.pnl).toLocaleString()}
              <span className="text-sm ml-2">({portfolioMetrics.pnlPercent}%)</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <BarChart3 size={18} />
              Active Positions
            </div>
            <div className="text-3xl font-bold text-white">{positions.length}</div>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 text-slate-300 text-sm mb-2">
              <Shield size={18} />
              Risk Score
            </div>
            <div className="text-3xl font-bold text-amber-400">72/100</div>
          </div>
        </div>

        {/* Main Trading Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Enhanced Price Chart */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{currentAsset.name}</h2>
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-white/10">
                    <Rocket size={14} />
                    {selectedAsset}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-white">
                    ${currentAsset.price.toLocaleString()}
                  </span>
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    isPositive 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(currentAsset.change24h)}%
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                {['1H', '24H', '7D'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timeframe === tf 
                        ? 'bg-cyan-500 text-white shadow-lg' 
                        : 'text-slate-300 hover:bg-slate-700/50'
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
                      <stop offset="5%" stopColor={currentAsset.color} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={currentAsset.color} stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={currentAsset.color} 
                    strokeWidth={3}
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Enhanced Side Panel */}
          <div className="space-y-6">
            {/* Trading Widget */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Trade</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {['market', 'limit'].map(type => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        orderType === type 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Amount</label>
                  <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={!orderAmount}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all shadow-lg"
                >
                  Place Order
                </button>
              </div>
            </div>

            {/* Enhanced Asset List */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Markets</h3>
              <div className="space-y-2">
                {Object.entries(assets).map(([symbol, data]) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedAsset(symbol)}
                    className={`w-full p-3 rounded-xl text-left transition-all group ${
                      selectedAsset === symbol 
                        ? 'bg-cyan-500/20 border-2 border-cyan-500' 
                        : 'bg-slate-700/30 hover:bg-slate-700/50 border-2 border-transparent hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: data.color }}
                        >
                          {symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{symbol}</div>
                          <div className="text-xs text-slate-400">{data.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">${data.price.toLocaleString()}</div>
                        <div className={`text-xs ${
                          data.change24h > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {data.change24h > 0 ? '+' : ''}{data.change24h}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Performance */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white mb-4">Portfolio Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={portfolioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={false}
                  strokeLinecap="round"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Positions & Alerts */}
          <div className="space-y-6">
            {/* Positions */}
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Active Positions</h3>
              <div className="space-y-3">
                {positions.map((position, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-white">{position.asset}</div>
                      <div className="text-sm text-slate-400">{position.amount}</div>
                    </div>
                    <div className={`font-semibold ${
                      position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${position.pnl.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Alerts */}
            {alerts.length > 0 && (
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={20} className="text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
                </div>
                <div className="space-y-2">
                  {alerts.slice(-3).reverse().map(alert => (
                    <div key={alert.id} className="flex justify-between items-center text-sm p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-200">{alert.msg}</span>
                      <span className="text-slate-400 text-xs">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoTradingDashboard;