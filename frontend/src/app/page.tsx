"use client";

import { useState, useEffect } from "react";
import { 
  getSubscriptions, 
  createSubscription, 
  deleteSubscription, 
  toggleSubscription, 
  Subscription 
} from "@/services/api";
import { RefreshCw, Trash2, PlusCircle, CreditCard, DollarSign } from "lucide-react";

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state matching backend schema
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextPaymentDate, setNextPaymentDate] = useState("");
  const [category, setCategory] = useState("Entertainment");

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const data = await getSubscriptions();
      setSubscriptions(data);
      setError(null);
    } catch (err: any) {
      setError("Failed to load subscriptions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !nextPaymentDate) return;

    try {
      setError(null);
      await createSubscription({
        title,
        price: parseFloat(price),
        billing_cycle: billingCycle,
        next_payment_date: new Date(nextPaymentDate).toISOString(),
        category,
        is_active: true,
      });

      // Reset form fields
      setTitle("");
      setPrice("");
      setNextPaymentDate("");
      setCategory("Entertainment");

      // Refresh list
      await fetchSubs();
    } catch (err: any) {
      setError("The subscription could not be created. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSubscription(id);
      await fetchSubs();
    } catch (err) {
      setError("Failed to delete subscription.");
    }
  };

  // Calculate total estimated monthly cost
  const totalMonthlyCost = subscriptions.reduce((acc, sub) => {
    if (sub.billing_cycle.toLowerCase() === "yearly") {
      return acc + sub.price / 12;
    }
    return acc + sub.price;
  }, 0);

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
              <span className="text-sm font-medium">Estimated monthly cost</span>
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
              {subscriptions.length}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Subscription Form */}
          <div className="lg:col-span-1 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-6 h-fit">
            <div>
              <h2 className="text-xl font-semibold">Add subscription</h2>
              <p className="text-xs text-slate-400 mt-1">Enter the recurring payment details.</p>
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
                <PlusCircle className="w-4 h-4" />
                Add subscription
              </button>
            </form>
          </div>

          {/* Subscriptions List */}
          <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Your subscriptions</h2>
              <p className="text-xs text-slate-400 mt-1">Review and manage your recurring payments.</p>
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                No active subscriptions found. Add your first one using the form.
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
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
                      <div className="text-xs text-slate-400">
                        ${sub.price.toFixed(2)} / {sub.billing_cycle} {sub.next_payment_date ? `• Next: ${new Date(sub.next_payment_date).toLocaleDateString()}` : ""}
                      </div>
                    </div>

                    {/* Action buttons container */}
                    <div className="flex items-center gap-2">
                      {/* Toggle status button */}
                      <button
                        onClick={async () => {
                          await toggleSubscription(sub.id);
                          await fetchSubs(); // Refresh data to update UI
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          sub.is_active 
                            ? "bg-emerald-950/30 border-emerald-800 text-emerald-400 hover:bg-emerald-950/50" 
                            : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {sub.is_active ? "Active" : "Paused"}
                      </button>

                      {/* Delete button */}
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