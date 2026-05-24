import React, { useState, useEffect } from 'react';

import BalanceCard from '../components/finance/BalanceCard';
import BudgetOverview from '../components/finance/BudgetOverview';
import CategorySpending from '../components/finance/CategorySpending';
import CashFlowChart from '../components/finance/CashFlowChart';
import RecentTransactions from '../components/finance/RecentTransactions';

const CATEGORY_COLORS = [
  'bg-aura-purple', 'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-pink-500', 'bg-yellow-500', 'bg-red-500',
];

// Transform backend bundle data into the shape each component expects
function transformFinanceData(bundle, subscriptions = [], filterName = 'Current Month') {
  const kpisRaw = bundle.kpis || {};

  const income = kpisRaw.total_income || 0;
  const spent  = kpisRaw.total_spent  || 0;
  const net    = income - spent;

  // Main card should show the expenses for the selected filter, with net shown below
  const kpis = {
    main_label: `${filterName} Expenses`,
    main_amount: spent,
    total_balance: net,
    balance_growth: 0,
    monthly_income: income,
    income_growth: 0,
    monthly_expenses: spent,
    expenses_growth: 0,
    income_label: 'Income',
    expenses_label: filterName + ' Expenses',
  };

  // CategorySpending needs: [{name, percentage, color}]
  const rawBreakdown = bundle.category_breakdown || [];
  const total = rawBreakdown.reduce((sum, c) => sum + (c.value || 0), 0) || 1;
  const category_breakdown = rawBreakdown.map((cat, i) => ({
    name: cat.name,
    percentage: Math.round((cat.value / total) * 100),
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  // BudgetOverview needs: [{name, spent, limit, color, status}]
  // We have subscriptions from backend: [{name, amount, next_billing}]
  // Re-map them as budget rows with a fixed "limit" relative to amount
  const budgets = subscriptions.map((sub, i) => ({
    name: sub.name,
    spent: sub.amount,
    limit: sub.amount * 1.2, // show as near-limit for visual interest
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    status: 'Recurring',
  }));

  // CashFlowChart needs: [{month, income, expense}]
  // Backend chart_data gives: [{date, spent}]  — no income per day in DB
  const chart_data = (bundle.chart_data || []).map((item) => ({
    month: item.date,   // e.g. "May 3"
    income: income / Math.max((bundle.chart_data || []).length, 1), // distribute evenly
    expense: item.spent || 0,
  }));

  // RecentTransactions needs: [{description, category, date, amount, color}]
  // Backend transactions give: [{merchant, category, date, amount, transaction_type}]
  const transactions = (bundle.transactions || []).map((tx) => {
    const isCredit = tx.transaction_type === 'credit';
    return {
      description: tx.merchant || tx.category || 'Transaction',
      category: tx.category || 'Other',
      date: tx.date || '',
      amount: isCredit ? tx.amount : -(tx.amount),
      color: isCredit
        ? 'bg-emerald-100 text-emerald-600'
        : 'bg-orange-100 text-orange-600',
    };
  });

  return { kpis, category_breakdown, budgets, chart_data, transactions };
}

export default function FinanceDashboard() {
  const [dataBundle, setDataBundle] = useState(null);
  const [filter, setFilter] = useState('Today');
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);

  const formatLastSynced = (value) => {
    if (!value) return 'Not synced yet';
    return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  useEffect(() => {
    const cached = localStorage.getItem('finance_data_' + filter);
    const saved = localStorage.getItem('finance_last_synced');
    if (saved) setLastSynced(saved);
    if (cached) {
      try {
        setDataBundle(JSON.parse(cached));
        setIsLoading(false);
      } catch (_) {}
    }

    const fetchFinance = async () => {
      const { hasVisitedAll, markVisited } = await import('../utils/sessionCache');
      if (hasVisitedAll() && localStorage.getItem('finance_data_' + filter)) {
        markVisited('finance');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(`/api/finance/data?filter=${encodeURIComponent(filter)}`);
        const json = await res.json();
        if (!json.error) {
          setDataBundle(json);
          const now = new Date().toISOString();
          localStorage.setItem('finance_data_' + filter, JSON.stringify(json));
          localStorage.setItem('finance_last_synced', now);
          setLastSynced(now);
          markVisited('finance');
        }
      } catch (e) {
        console.error('[FinanceDashboard] fetch failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinance();
  }, [filter]);

  if (isLoading || !dataBundle) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin mb-2"></div>
          <p className="text-gray-400">Loading Finance Data...</p>
        </div>
      </div>
    );
  }

  let rawBundle = {};
  let subscriptions = dataBundle.subscriptions || [];
  if (dataBundle.is_bundled) {
    rawBundle = dataBundle.bundles[filter] || dataBundle.bundles['Current Month'] || {};
  } else {
    rawBundle = dataBundle;
  }
  const transformed = transformFinanceData(rawBundle, subscriptions, filter);
  const data = transformed;

  return (
    <div className="min-h-screen w-full">
      <div className="mb-4 mt-14 flex justify-between items-start">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold mb-1">Finance Overview</h1>
          <p className="text-gray-500 text-sm">All your finances, budgets, and cash flow - clearly in one place.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={async () => {
                setIsLoading(true);
                try {
                  const res = await fetch(`/api/finance/data?filter=${encodeURIComponent(filter)}`);
                  const json = await res.json();
                  if (!json.error) {
                    setDataBundle(json);
                    const now = new Date().toISOString();
                    localStorage.setItem('finance_data_' + filter, JSON.stringify(json));
                    localStorage.setItem('finance_last_synced', now);
                    setLastSynced(now);
                  }
                } catch (e) {
                  console.error('[FinanceDashboard] sync failed:', e);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-aura-purple to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </button>
            <p className="text-xs text-gray-400">Last synced {formatLastSynced(lastSynced)}</p>
          </div>

          <div className="w-full mt-2">
            <div className="flex justify-end">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['Today','This Week', 'Current Month', 'Last Month'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top Row */}
        <div className="lg:col-span-5">
          <BalanceCard kpis={data.kpis} />
        </div>
        <div className="lg:col-span-4">
          <BudgetOverview budgets={data.budgets} />
        </div>
        <div className="lg:col-span-3">
          <CategorySpending categories={data.category_breakdown} />
        </div>

        {/* Bottom Row */}
        <div className="lg:col-span-7">
          <CashFlowChart chartData={data.chart_data} />
        </div>
        <div className="lg:col-span-5">
          <RecentTransactions transactions={data.transactions} />
        </div>
      </div>
    </div>
  );
}