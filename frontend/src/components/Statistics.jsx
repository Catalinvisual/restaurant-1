import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { API_URL } from '../apiConfig';

const COLORS = ['#0088FE', '#00C49F'];
const EUR = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' });
const INT = new Intl.NumberFormat('en-GB');

const toKey = (d) => {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const addDays = (d, n) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + n);
  return dt;
};

const formatDayLabel = (d) => {
  const dt = new Date(d);
  const wd = dt.toLocaleDateString('en-GB', { weekday: 'short' });
  return `${wd.replace('.', '')} ${dt.getDate()}`;
};

export default function Statistics({ refreshKey = 0 }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);
  const [categoryPeriod, setCategoryPeriod] = useState(7);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const location = useLocation();

  const buildDailySeries = (rawDaily = [], periodDays = 7) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = addDays(today, -(periodDays - 1));
    const byDate = new Map();
    for (const r of rawDaily) {
      const key = toKey(r.date ?? r.day ?? r.dayCode ?? r.d);
      byDate.set(key, Number(r.sales) || 0);
    }
    return Array.from({ length: periodDays }, (_, i) => {
      const d = addDays(start, i);
      return { date: toKey(d), label: formatDayLabel(d), sales: byDate.get(toKey(d)) || 0 };
    });
  };

  const buildWeeklyFallback = (weekly = []) => {
    const map = new Map(weekly.map((d) => [d.day, Number(d.sales) || 0]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, idx) => {
      const d = addDays(today, idx - 6);
      const wd = d.toLocaleDateString('en-GB', { weekday: 'short' });
      return {
        date: toKey(d),
        label: formatDayLabel(d),
        sales: map.get(wd.charAt(0).toUpperCase() + wd.slice(1).replace('.', '')) ?? 0
      };
    });
  };

  const loadStatistics = useCallback((days) => {
    setLoading(true);
    fetch(`${API_URL}/api/statistics?days=${days}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        let baseSeries;
        if (Array.isArray(data.salesByDate) && data.salesByDate.length) {
          baseSeries = buildDailySeries(data.salesByDate, days);
        } else if (Array.isArray(data.salesByDay) && data.salesByDay.length) {
          baseSeries = buildWeeklyFallback(data.salesByDay);
        } else {
          baseSeries = buildDailySeries([], days);
        }
        const maxReal = baseSeries.reduce((m, s) => Math.max(m, s.sales || 0), 0);
        const halfHeight = maxReal > 0 ? maxReal / 2 : 0.5;
        const series = baseSeries.map(s => ({
          ...s,
          salesVisual: s.sales === 0 ? halfHeight : s.sales
        }));
        setStats({ ...data, series, _maxReal: maxReal });
      })
      .catch(err => {
        console.error('❌ Error loading statistics:', err);
        setStats({ series: buildDailySeries([], days), _maxReal: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  const loadCategoryDistribution = useCallback((days) => {
    setLoadingCategories(true);
    fetch(`${API_URL}/api/statistics?categoryDays=${days}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setCategoryData(Array.isArray(data.categoryDistribution) ? data.categoryDistribution : []))
      .catch(err => {
        console.error('❌ Error loading category distribution:', err);
        setCategoryData([]);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    loadStatistics(period);
  }, [loadStatistics, period, refreshKey, location.pathname]);

  useEffect(() => {
    loadCategoryDistribution(categoryPeriod);
  }, [loadCategoryDistribution, categoryPeriod, refreshKey, location.pathname]);

  if (loading) return <p>Loading statistics...</p>;

  const series = Array.isArray(stats.series) ? stats.series : [];
  const maxReal = stats._maxReal ?? 0;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 576;

  // Dynamic step based on number of days
  const step = isMobile
    ? (series.length > 20 ? 4 : series.length > 12 ? 2 : 1)
    : (series.length > 20 ? 2 : 1);

  // Function to shorten labels
  const shortenLabel = (val) => {
    if (series.length > 20) {
      const parts = String(val).split(' ');
      return parts.length >= 2 ? `${parts[0]} ${parts[1].charAt(0)}` : val;
    }
    if (!isMobile) return val;
    const parts = String(val).split(' ');
    const numIdx = parts.findIndex((p) => /^\d+$/.test(p));
    if (numIdx >= 0) {
      const day = parts[numIdx];
      const month = parts[numIdx + 1] || '';
      return month ? `${day} ${month}` : day;
    }
    return val;
  };

  const CustomTick = ({ x, y, payload, index }) => {
    const show = step === 1 || index % step === 0;
    if (!show) return null;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          dy={isMobile ? 18 : 12}
          textAnchor="end"
          transform={`rotate(${isMobile ? -65 : -5})`}
          style={{ fontSize: isMobile ? 10 : 12, fill: 'var(--text-color, #666)' }}
        >
          {shortenLabel(payload.value)}
        </text>
      </g>
    );
  };

  const innerWidth = isMobile
    ? Math.max(series.length * (series.length > 20 ? 28 : 24), 500)
    : (series.length > 20 ? series.length * 20 : '100%');

  const barCells = series.map((entry, index) => {
    const hasSales = entry.sales > 0;
    return <Cell key={`cell-${entry.date}-${index}`} fill={hasSales ? '#0088FE' : '#ff4d4f'} />;
  });


return (
  <section className="statistics-section">
    <header className="statistics-header">
      <i className="fas fa-chart-bar"></i>
      <h2>Statistics</h2>
    </header>

    <div className="kpi-cards">
      <div className="kpi-card"><h3>Total Orders</h3><p>{INT.format(stats.totalOrders ?? 0)}</p></div>
      <div className="kpi-card"><h3>Revenue (€)</h3><p>{EUR.format(stats.totalRevenue ?? 0)}</p></div>
      <div className="kpi-card"><h3>Products Sold</h3><p>{INT.format(stats.productsSold ?? 0)}</p></div>
      <div className="kpi-card"><h3>Active Clients</h3><p>{INT.format(stats.activeClients ?? 0)}</p></div>
    </div>

    <div className="chart-area">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h4>Sales by Day</h4>
        <div className="period-selector" style={{ display: 'flex', gap: 8 }}>
          {[1, 7, 30].map((val) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={period === val ? 'active' : ''}
              style={{
                padding: '4px 8px',
                background: period === val ? '#8884d8' : '#f0f0f0',
                color: period === val ? '#fff' : '#000',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {val} {val === 1 ? 'day' : 'days'}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile-optimized chart */}
      <div style={{ overflowX: isMobile ? 'auto' : 'visible' }}>
        <div style={{ width: innerWidth, height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={series}
              margin={{ top: 20, right: 20, left: 10, bottom: isMobile ? 60 : 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" interval={0} minTickGap={8} tick={<CustomTick />} />
              <YAxis
                domain={[0, Math.max(1, maxReal)]}
                tickFormatter={(value) => EUR.format(Number(value) || 0)}
                width={80}
              />
              <Tooltip
                formatter={(_, __, ctx) =>
                  EUR.format(Number(ctx?.payload?.sales) || 0)
                }
              />
              <Bar
                dataKey="salesVisual"
                barSize={isMobile ? 14 : 28}
                animationDuration={700}
              >
                {barCells}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Category Distribution */}
    <div style={{ width: 300, marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h4>Category Distribution</h4>
        <div className="category-period-selector" style={{ display: 'flex', gap: 8 }}>
          {[1, 7, 30].map((val) => (
            <button
              key={val}
              onClick={() => setCategoryPeriod(val)}
              className={categoryPeriod === val ? 'active' : ''}
              style={{
                padding: '4px 8px',
                background: categoryPeriod === val ? '#8884d8' : '#f0f0f0',
                color: categoryPeriod === val ? '#fff' : '#000',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {val} {val === 1 ? 'day' : 'days'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: 300, height: 300 }}>
        {loadingCategories ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span>Loading distribution...</span>
          </div>
        ) : categoryData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span>No sales in this period.</span>
          </div>
        ) : (
          <PieChart width={340} height={320}>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={0}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                fontSize: 12,
                maxWidth: 140,
                whiteSpace: 'normal',
                lineHeight: '16px'
              }}
            />
          </PieChart>
        )}
      </div>
    </div>
  </section>
);

}
