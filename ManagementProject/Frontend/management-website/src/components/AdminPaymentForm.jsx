export default function AdminPaymentForm({
  loading,
  tenants,
  leases,
  form,
  onChange,
  onSubmit,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Record Payment
      </h2>
      {loading ? (
        <p className="text-sm text-slate-500">Loading leases…</p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Tenant */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Tenant
            </label>
            <select
              name="user_id"
              value={form.user_id}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            >
              <option value="">Select tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.email}
                </option>
              ))}
            </select>
          </div>

          {/* Lease */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Lease
            </label>
            <select
              name="lease_id"
              value={form.lease_id}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            >
              <option value="">Select lease</option>
              {leases
                .filter((l) => !form.user_id || l.user_id === form.user_id)
                .map((l) => (
                  <option key={l.lease_id} value={l.lease_id}>
                    {l.address} — ${l.rent_amount}
                  </option>
                ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Amount (USD)
              </label>
              <input
                type="number"
                step={0.01}
                name="amount"
                value={form.amount}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                placeholder="1200"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Payment Date
              </label>
              <input
                type="date"
                name="payment_date"
                value={form.payment_date}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />
            </div>
          </div>

          {/* Method & Status */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Method
              </label>
              <select
                name="method"
                value={form.method}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                <option>Card</option>
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Check</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex justify-center items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            Save Payment
          </button>
        </form>
      )}
    </div>
  );
}