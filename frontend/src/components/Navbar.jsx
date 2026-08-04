import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LanguageSelector from "@/components/LanguageSelector";
import { Compass, LogOut } from "lucide-react";

const ROLE_LINKS = {
  student: [
    { to: "/dashboard", label: "Dashboard", id: "nav-dashboard" },
    { to: "/assessment", label: "Assessment", id: "nav-assessment" },
    { to: "/vocational", label: "Vocational", id: "nav-vocational" },
  ],
  parent: [{ to: "/parent", label: "My Children", id: "nav-parent" }],
  counselor: [
    { to: "/counselor", label: "School Overview", id: "nav-counselor" },
    { to: "/counselor/students", label: "Students", id: "nav-counselor-students" },
    { to: "/counselor/class-report", label: "Class Report", id: "nav-counselor-class-report" },
    { to: "/counselor/bulk", label: "Bulk Upload", id: "nav-counselor-bulk" },
  ],
  principal: [
    { to: "/principal", label: "School Dashboard", id: "nav-principal" },
    { to: "/principal/students", label: "Students", id: "nav-principal-students" },
    { to: "/principal/class-report", label: "Class Report", id: "nav-principal-class-report" },
    { to: "/principal/bulk", label: "Bulk Upload", id: "nav-principal-bulk" },
  ],
  admin: [
    { to: "/admin", label: "Admin", id: "nav-admin" },
    { to: "/admin/questions", label: "Questions", id: "nav-admin-questions" },
    { to: "/admin/results", label: "Results", id: "nav-admin-results" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/"); };
  const links = user ? ROLE_LINKS[user.role] || [] : [];

  return (
    <header data-testid="app-navbar" className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b-2 border-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-[#FEF08A] border-2 border-[#0A0A0A] rounded-xl flex items-center justify-center rotate-[-4deg] group-hover:rotate-0 transition-transform">
            <Compass strokeWidth={2.5} size={20} />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">Pathfinder<span className="text-blue-600">.AI</span></span>
          <span className="hidden md:inline label-mono ml-2 bg-[#E9D5FF] px-2 py-0.5 border-2 border-[#0A0A0A] rounded-full">NEP 2020</span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          {links.map((l) => (
            <Link key={l.id} to={l.to} data-testid={l.id} className="hidden md:inline text-sm font-medium hover:underline underline-offset-4">{l.label}</Link>
          ))}
          <LanguageSelector />
          {user ? (
            <button onClick={handleLogout} data-testid="logout-btn" className="btn-brutal bg-white px-4 py-2 text-sm flex items-center gap-1.5">
              <LogOut size={16} strokeWidth={2.5} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login" className="text-sm font-medium hover:underline underline-offset-4">Login</Link>
              <Link to="/register" data-testid="nav-register" className="btn-brutal bg-blue-600 text-white px-4 py-2 text-sm">Get Started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
