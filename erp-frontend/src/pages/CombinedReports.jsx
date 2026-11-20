import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "../components/Sidebar"

const BRANCH1_URL = import.meta.env.VITE_API_URL || ""
const BRANCH2_URL = import.meta.env.VITE_BRANCH2_API_URL || ""

export default function CombinedReports() {
  const [data, setData] = useState({ b1: null, b2: null })
  const [loading, setLoading] = useState(true)
  const [lastFetched, setLastFetched] = useState(null)
  const branch2Ready = Boolean(BRANCH2_URL)

  async function fetchAll() {
    setLoading(true)
    const token = localStorage.getItem("token")
    const headers = { Authorization: `Bearer ${token}` }
    const [r1, r2] = await Promise.allSettled([
      axios.get(`${BRANCH1_URL}/dashboard/summary`, { headers }),
      branch2Ready
        ? axios.get(`${BRANCH2_URL}/dashboard/summary`, { headers })
        : Promise.reject(new Error("not configured")),
    ])
    setData({
      b1: r1.status === "fulfilled" ? r1.value.data : null,
      b2: r2.status === "fulfilled" ? r2.value.data : null,
    })
    setLastFetched(new Date().toLocaleTimeString())
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const fmt    = (n) => n?.toLocaleString("en-IN") ?? "—"
  const fmtRs  = (n) => n != null ? `₹${Math.round(n).toLocaleString("en-IN")}` : "—"

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="page-main">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Combined Reports</h2>
            <p className="text-sm text-slate-400 mt-1">Live comparison — Rama & CKC branches</p>
          </div>
          <div className="flex items-center gap-3">
            {lastFetched && <span className="text-xs text-slate-400">Updated: {lastFetched}</span>}
            <button onClick={fetchAll} disabled={loading} className="btn-primary">
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {!branch2Ready && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <p className="text-orange-700 font-semibold text-sm">CKC Branch not configured</p>
            <p className="text-orange-600 text-sm mt-1">
              Add <code className="bg-orange-100 px-1 rounded">VITE_BRANCH2_API_URL</code> to Vercel environment variables and redeploy.
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-slate-400">Fetching data from both branches…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Students",       b1: data.b1?.total_students, b2: data.b2?.total_students, fmt },
              { label: "Teachers",       b1: data.b1?.total_teachers, b2: data.b2?.total_teachers, fmt },
              { label: "Total Fees",     b1: data.b1?.total_fees,     b2: data.b2?.total_fees,     fmt: fmtRs },
              { label: "Fees Collected", b1: data.b1?.total_paid,     b2: data.b2?.total_paid,     fmt: fmtRs },
              { label: "Fees Pending",   b1: data.b1?.total_pending,  b2: data.b2?.total_pending,  fmt: fmtRs },
            ].map(({ label, b1, b2, fmt: f }) => (
              <div key={label} className="card p-5">
                <p className="text-xs text-slate-400 uppercase font-medium tracking-wide mb-3">{label}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xl font-bold text-blue-600">{b1 != null ? f(b1) : "—"}</p>
                    <p className="text-xs text-blue-500 mt-1">Rama</p>
                  </div>
                  <div className="border-x border-slate-100">
                    <p className="text-xl font-bold text-purple-600">{b2 != null ? f(b2) : "—"}</p>
                    <p className="text-xs text-purple-500 mt-1">CKC</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-600">
                      {b1 != null && b2 != null ? f(b1 + b2) : "—"}
                    </p>
                    <p className="text-xs text-green-500 mt-1">Total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
