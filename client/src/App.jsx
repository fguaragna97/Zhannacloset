import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Closet } from './pages/Closet.jsx';
import { OutfitBuilder } from './pages/OutfitBuilder.jsx';
import { SavedOutfits } from './pages/SavedOutfits.jsx';
import { Settings } from './pages/Settings.jsx';

const NAV = [
  { to: '/', label: 'Closet',   short: 'Closet',   icon: HangerIcon, exact: true },
  { to: '/builder', label: 'Studio',  short: 'Studio',  icon: SparkleIcon },
  { to: '/saved',   label: 'Looks',   short: 'Looks',   icon: HeartIcon },
  { to: '/settings', label: 'Profile', short: 'You',    icon: UserIcon }
];

export default function App() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <DesktopNav />
      <main className="pt-[max(env(safe-area-inset-top),0.5rem)] md:pt-20">
        <Routes>
          <Route path="/" element={<Closet />} />
          <Route path="/builder" element={<OutfitBuilder />} />
          <Route path="/saved" element={<SavedOutfits />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <MobileNav />
    </div>
  );
}

function DesktopNav() {
  return (
    <nav className="hidden md:flex fixed top-0 inset-x-0 z-30 bg-bg/80 backdrop-blur border-b border-ink/5">
      <div className="max-w-7xl mx-auto w-full px-8 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-ink text-bg flex items-center justify-center">
            <HangerIcon size={16} />
          </div>
          <span className="font-display text-xl tracking-tight">My Closet</span>
        </NavLink>
        <div className="flex items-center gap-1">
          {NAV.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-ink' : 'text-ink/50 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {label}
                  <span className={`absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-ink transition-all ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-bg/95 backdrop-blur border-t border-ink/5 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {NAV.map(({ to, short, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors ${
                isActive ? 'text-ink' : 'text-ink/50'
              }`
            }
          >
            <Icon size={20} />
            <span>{short}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function HangerIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 8a2 2 0 110-4 2 2 0 012 2v1l8 5a2 2 0 011 1.7V15H1v-1.3A2 2 0 012 12l10-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function SparkleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function HeartIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function UserIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
