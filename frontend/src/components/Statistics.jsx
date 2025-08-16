import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { API_URL } from '../apiConfig';

const COLORS = ['#0088FE', '#00C49F'];
const EUR = new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'EUR' });
const INT = new Intl.NumberFormat('ro-RO');

// Helpers
const toKey = (d) => {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addDays = (d, n) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + n);
  return dt;
};

const formatDayLabel = (d) => {
  const dt = new Date(d);
  const wd = dt.toLocaleDateString('ro-RO', { weekday: 'short' });
  const day = dt.getDate();
  return `${wd.replace('.', '')} ${day}`;
};

export default function Statistics({ refreshKey = 0 }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);

  const [categoryPeriod, setCategoryPeriod] = useState(7);
  const [categoryData, setCategoryData] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const location = useLocation();
  const todayStr = new Date().toISOString().slice(0, 10);

  const buildDailySeries = (rawDaily = [], periodDays = 7) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = addDays(today, -(periodDays - 1));

    const byDate = new Map();
    for (const r of rawDaily) {
      const rawKey = r.date ?? r.day ?? r.dayCode ?? r.d;
      const key = toKey(rawKey);
      const val = Number(r.sales) || 0;
      byDate.set(key, val);
    }

    const series = [];
    for (let i = 0; i < periodDays; i++) {
      const d = addDays(start, i);
      const key = toKey(d);
      const sales = Number.parseFloat(byDate.get(key)) || 0;
      series.push({
        date: key,
        label: formatDayLabel(d),
        sales
      });
    }
    return series;
  };

  const buildWeeklyFallback = (weekly = []) => {
    const map = new Map(weekly.map((d) => [d.day, Number(d.sales) || 0]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const series = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const wd = d.toLocaleDateString('ro-RO', { weekday: 'short' });
      const wdCap = wd.charAt(0).toUpperCase() + wd.slice(1);
      const wdNorm = wdCap.replace('.', '');
      const sales = map.get(wdNorm) ?? 0;
      series.push({
        date: toKey(d),
        label: formatDayLabel(d),
        sales
      });
    }
    return series;
  };

  const loadStatistics = useCallback((days) => {
    setLoading(true);
    fetch(`${API_URL}/statistics?days=${days}`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        let baseSeries;
        if (Array.isArray(data.salesByDate) && data.salesByDate.length) {
          baseSeries = buildDailySeries(data.salesByDate, days);
        } else if (Array.isArray(data.salesByDay) && data.salesByDay.length) {
          baseSeries = buildWeeklyFallback(data.salesByDay);
        } else {
          baseSeries = buildDailySeries([], days);
        }

        const maxReal = baseSeries.reduce((m, s) => Math.max(m, Number(s.sales) || 0), 0);
        const halfHeight = maxReal > 0 ? maxReal / 2 : 0.5;
        const series = baseSeries.map(s => ({
          ...s,
          salesVisual: Number(s.sales) === 0 ? halfHeight : s.sales
        }));

        setStats({ ...data, series, _maxReal: maxReal });
      })
      .catch((err) => {
        console.error('❌ Eroare la preluare statistici:', err);
        const baseSeries = buildDailySeries([], days);
        setStats({ series: baseSeries, _maxReal: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  const loadCategoryDistribution = useCallback((days) => {
    setLoadingCategories(true);
    fetch(`${API_URL}/statistics?categoryDays=${days}`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        const arr = Array.isArray(data.categoryDistribution) ? data.categoryDistribution : [];
        setCategoryData(arr);
      })
      .catch((err) => {
        console.error('❌ Eroare la distribuție categorii:', err);
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

  if (loading) return <p>Se încarcă datele statistice...</p>;

  const series = Array.isArray(stats.series) ? stats.series : [];
  const maxReal = Number(stats._maxReal ?? 0);

  const barCells = series.map((entry, index) => {
    const sales = Number(entry.sales);
    const hasSales = !isNaN(sales) && sales > 0;
    return (
      <Cell
        key={`cell-${entry.date}-${index}`}
        fill={hasSales ? '#0088FE' : '#ff4d4f'}
      />
    );
  });

  return (
    <section className="statistics-section">
      <header className="statistics-header">
        <i className="fas fa-chart-bar"></i>
        <h2>Statistici</h2>
      </header>

      <div className="kpi-cards">
        <div className="kpi-card"><h3>Total Comenzi</h3><p>{INT.format(Number(stats.totalOrders ?? 0))}</p></div>
        <div className="kpi-card"><h3>Venituri (€)</h3><p>{EUR.format(Number(stats.totalRevenue ?? 0))}</p></div>
        <div className="kpi-card"><h3>Produse Vândute</h3><p>{INT.format(Number(stats.productsSold ?? 0))}</p></div>
        <div className="kpi-card"><h3>Clienți Activi</h3><p>{INT.format(Number(stats.activeClients ?? 0))}</p></div>
      </div>

      <div className="chart-area">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4>Vânzări pe Zile</h4>
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
                {val} {val === 1 ? 'zi' : 'zile'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" interval={0} tickMargin={8} />
              <YAxis
                domain={[0, Math.max(1, maxReal)]}
                tickFormatter={(value) => EUR.format(Number(value) || 0)}
                width={80}
              />
              <Tooltip
                formatter={(_, __, ctx) => EUR.format(Number(ctx?.payload?.sales) || 0)}
              />
              <Bar dataKey="salesVisual" barSize={28} animationDuration={700}>
                {barCells}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart distribuție categorii + selector independent */}
        <div style={{ width: 300, marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4>Distribuție Categorii</h4>
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
                  {val} {val === 1 ? 'zi' : 'zile'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: 300, height: 300 }}>
            {loadingCategories ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <span>Se încarcă distribuția...</span>
              </div>
            ) : categoryData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <span>Nu există vânzări în această perioadă.</span>
              </div>
            ) : (
              <PieChart width={300} height={300}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
