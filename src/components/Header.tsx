import React from 'react';
import { EyeOff, AlertTriangle, PhoneCall, Search, Users } from 'lucide-react';
import { VowaLogo } from './VowaLogo';

interface HeaderProps {
  onOpenDecoy: () => void;
  onOpenSos: () => void;
  onOpenFakeCall: () => void;
  onOpenPlateLookup?: () => void;
  onOpenGuardianSync?: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDecoy,
  onOpenSos,
  onOpenFakeCall,
  onOpenPlateLookup,
  onOpenGuardianSync,
  onNavigate,
  activeSection,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Official VOWA Brand Wordmark with uploaded logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('hero');
          }}
          className="whitespace-nowrap shrink-0 flex items-center hover:opacity-90 transition-opacity"
          title="VOWA — Your Voice, Your Safety"
        >
          <VowaLogo variant="horizontal" size="md" />
        </a>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('lapor')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'lapor' ? 'text-rose-700 font-semibold' : ''
            }`}
          >
            Lapor Pelecehan
          </button>
          <button
            onClick={() => onNavigate('tracker')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'tracker' ? 'text-rose-700 font-semibold' : ''
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pantau Perjalanan</span>
          </button>
          <button
            onClick={() => onNavigate('direktori')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'direktori' ? 'text-rose-700 font-semibold' : ''
            }`}
          >
            Direktori Bantuan
          </button>
          <button
            onClick={() => onNavigate('panduan')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'panduan' ? 'text-rose-700 font-semibold' : ''
            }`}
          >
            Panduan Mandiri
          </button>
          <button
            onClick={() => onNavigate('komunitas')}
            className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSection === 'komunitas' ? 'text-rose-700 font-semibold' : ''
            }`}
          >
            Lingkaran Suara
          </button>
        </nav>

        {/* Zone 3: 1 primary action (or emergency disguise cluster) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenPlateLookup && (
            <button
              onClick={onOpenPlateLookup}
              title="Cek & Verifikasi Plat Nomor Driver"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-purple-700" />
              <span>Cek Plat Driver</span>
            </button>
          )}

          <button
            onClick={onOpenFakeCall}
            title="Panggilan Tiruan"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
            <span>Panggilan Tiruan</span>
          </button>

          <button
            onClick={onOpenSos}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>

          {/* Quick Exit / Decoy Calculator Trigger */}
          <button
            onClick={onOpenDecoy}
            title="Samarkan Layar Jadi Kalkulator (Quick Exit)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Samarkan Layar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
