import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Submit", matchExact: true },
  { to: "/dashboard", label: "Dashboard", matchExact: false },
  { to: "/wall", label: "Public Wall", matchExact: false },
  { to: "/widget", label: "Widget", matchExact: false },
];

export default function MainLayout() {
  const location = useLocation();

  const isActive = (to: string, exact: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_1px_2px_rgba(15,23,42,0.12),0_0_0_1px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.2)] group-hover:shadow-[0_2px_8px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] transition-shadow duration-200">
                T
              </div>
              <span className="text-[15.5px] font-semibold text-slate-900 tracking-tight">
                Testimonial
              </span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-slate-100/60 ring-1 ring-inset ring-slate-200/60">
              {links.map((link) => {
                const active = isActive(link.to, link.matchExact);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`relative px-3.5 py-1.5 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-200 ${
                      active
                        ? "text-slate-900 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            <nav className="sm:hidden flex items-center gap-1 p-1 rounded-xl bg-slate-100/60 ring-1 ring-inset ring-slate-200/60">
              {links.map((link) => {
                const active = isActive(link.to, link.matchExact);
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`px-2.5 py-1 rounded-lg text-[11.5px] font-semibold tracking-tight transition-all duration-200 ${
                      active
                        ? "text-slate-900 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12.5px] text-slate-500">
            © {new Date().getFullYear()} Testimonial Platform · SDE take-home assignment
          </p>
          <p className="text-[11.5px] text-slate-400">
            React · Vite · Tailwind · Express · MongoDB Atlas
          </p>
        </div>
      </footer>
    </div>
  );
}
