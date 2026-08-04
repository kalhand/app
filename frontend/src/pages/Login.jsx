import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiErrorDetail } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      const dest = user.role === "admin" ? "/admin"
        : user.role === "university" ? "/university"
        : user.role === "parent" ? "/parent"
        : user.role === "counselor" ? "/counselor"
        : user.role === "principal" ? "/principal"
        : "/dashboard";
      nav(dest);
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card-brutal p-8">
          <span className="label-mono">Welcome back</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight mt-2">Sign in to Pathfinder</h1>
          <p className="text-sm text-[#52525B] mt-2">Continue exploring your career path.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label-mono block mb-2">Email</label>
              <input
                data-testid="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="label-mono block mb-2">Password</label>
              <input
                data-testid="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#0A0A0A] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {err && <div data-testid="login-error" className="text-sm text-red-700 bg-red-100 border-2 border-red-700 rounded-lg px-3 py-2">{err}</div>}
            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="btn-brutal bg-blue-600 text-white w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="animate-spin" size={16} />} Sign in
            </button>
          </form>

          <p className="mt-6 text-sm text-center">
            New here? <Link to="/register" className="font-semibold underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
