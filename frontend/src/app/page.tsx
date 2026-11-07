"use client";

import { useState, useEffect } from "react";
import { 
  getSubscriptions, 
  createSubscription, 
  updateSubscription,
  deleteSubscription, 
  toggleSubscription, 
  Subscription 
} from "@/services/api";
import { 
  RefreshCw, 
  Trash2, 
  PlusCircle, 
  CreditCard, 
  DollarSign, 
  Pencil, 
  X, 
  Search,
  PieChart
} from "lucide-react";

// Helper to calculate days remaining
const getDaysRemaining = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDate = new Date(dateString);
  nextDate.setHours(0, 0, 0, 0);

  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form input state matching backend schema
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [category, setCategory] = useState("Entertainment");

  // Track the ID of the subscription currently being edited
  const [editingId, setEditingId] = useState<number | null>(null);

  // Search and Category Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = Array.from(
    new Set(
      subscriptions
        .map((sub) => sub.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  ).sort((a, b) => a.localeCompare(b));

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.title
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      sub.category?.trim().toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptions();
      setSubscriptions(data);
      setError(null);
    } catch {
      setError("Failed to load subscriptions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  // Populate form with existing subscription data for editing
  const startEditing = (sub: Subscription) => {
    setEditingId(sub.id);
    setTitle(sub.title);
    setPrice(sub.price.toString());
    setBillingCycle(sub.billing_cycle);
    setNextPaymentDate(sub.next_payment_date ? sub.next_payment_date.split("T")[0] : "");
    setCategory(sub.category || "Entertainment");
  };

  // Reset form fields back to default state
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setPrice("");
    setBillingCycle("monthly");
    setNextPaymentDate("");
    setCategory("Entertainment");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !nextPaymentDate) return;

    const payload = {
      title,
      price: parseFloat(price),
      billing_cycle: billingCycle,
      next_payment_date: new Date(nextPaymentDate).toISOString(),
      category,
      is_active: true,
    };

    try {
      setError(null);
      if (editingId !== null) {
        await updateSubscription(editingId, payload);
      } else {
        await createSubscription(payload);
      }

      resetForm();
      await fetchSubs();
    } catch {
      setError("Failed to save the subscription. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSubscription(id);
      if (editingId === id) {
        resetForm();
      }
      await fetchSubs();
    } catch {
      setError("Failed to delete subscription.");
    }
  };

  // Calculate total estimated monthly cost (active only)
  const totalMonthlyCost = subscriptions.reduce((acc, sub) => {
    if (!sub.is_active) return acc;
    const monthlyRate = sub.billing_cycle.toLowerCase() === "yearly" ? sub.price / 12 : sub.price;
    return acc + monthlyRate;
  }, 0);

  // Group active monthly expenses by category
  const categoryBreakdown = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    if (!sub.is_active) return acc;
    const cat = sub.category?.trim() || "General";
    const monthlyRate = sub.billing_cycle.toLowerCase() === "yearly" ? sub.price / 12 : sub.price;
    acc[cat] = (acc[cat] || 0) + monthlyRate;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);

  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-block px-3 py-1 mb-2 text-xs font-medium text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 rounded-full">
              Subscription manager
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Dange</span>
            </h1>
            <p className="text-slate-400 mt-1">
              Track recurring expenses, upcoming payments, and subscription costs from one simple dashboard.
            </p>
          </div>
          <button
            onClick={fetchSubs}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/50 text-rose-300 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-sm font-medium">Estimated monthly cost (active)</span>
              <DollarSign className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold tracking-tight">
              ${totalMonthlyCost.toFixed(2)}
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-sm font-medium">Active subscriptions</span>
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {subscriptions.filter((s) => s.is_active).length}
              <span className="text-slate-500 text-base font-normal ml-2">/ {subscriptions.length} total</span>
            </div>
          </div>
        </div>

        {/* Category Expense Breakdown */}
        {sortedCategories.length > 0 && (
          <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold">Spending by category</h2>
              </div>
              <span className="text-xs text-slate-400">Monthly normalized</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {sortedCategories.map(([catName, amount]) => {
                const percentage = totalMonthlyCost > 0 ? (amount / totalMonthlyCost) * 100 : 0;
                return (
                  <div key={catName} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-200 truncate">{catName}</span>
                      <span className="font-semibold text-cyan-400">${amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage.toFixed(0)}%` }}
                      />
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      {percentage.toFixed(1)}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Subscription Form (Create & Edit) */}
          <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-6 h-fit">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingId !== null ? "Edit subscription" : "Add subscription"}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {editingId !== null ? "Modify recurring payment details." : "Enter recurring payment details."}
                </p>
              </div>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service name</label>
                <input
                  type="text"
                  placeholder="Netflix, Spotify..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="9.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Billing cycle</label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Next payment date</label>
                <input
                  type="date"
                  value={nextPaymentDate}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Entertainment, Work..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
              >
                {editingId !== null ? (
                  <>
                    <Pencil className="w-4 h-4" />
                    Save changes
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Add subscription
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Subscriptions List */}
          <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Your subscriptions</h2>
                <p className="text-xs text-slate-400 mt-1">Review and manage your recurring payments.</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedCategory === ""
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === cat
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search subscriptions by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {filteredSubscriptions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                {subscriptions.length === 0
                  ? "No active subscriptions found. Add your first one using the form."
                  : "No subscriptions match your search or filter criteria."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-base">{sub.title}</span>
                        {sub.category && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 rounded-full">
                            {sub.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>${sub.price.toFixed(2)} / {sub.billing_cycle}</span>
                        {(() => {
                          const days = getDaysRemaining(sub.next_payment_date);
                          const isOverdue = days < 0;
                          const isToday = days === 0;
                          return (
                            <span className={`px-2 py-0.5 rounded-full font-medium ${isOverdue ? "bg-rose-950/50 text-rose-400 border border-rose-900/50" : isToday ? "bg-amber-950/50 text-amber-400 border border-amber-900/50" : "bg-slate-800 text-slate-400"}`}>
                              {isOverdue ? "Overdue" : isToday ? "Due today" : `${days} days left`}
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Action buttons container */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(sub)}
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-700 transition"
                        title="Edit subscription"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={async () => {
                          await toggleSubscription(sub.id);
                          await fetchSubs();
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          sub.is_active 
                            ? "bg-emerald-950/30 border-emerald-800 text-emerald-400 hover:bg-emerald-950/50" 
                            : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {sub.is_active ? "Active" : "Paused"}
                      </button>

                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-transparent hover:border-rose-900/50 transition"
                        title="Delete subscription"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
