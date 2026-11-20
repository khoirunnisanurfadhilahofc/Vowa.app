import React from 'react';
import { Sparkles, FileText, PhoneCall, Lock, Search, Users, WifiOff } from 'lucide-react';
import { VowaLogo } from './VowaLogo';

interface HeroSectionProps {
  onOpenReportModal: () => void;
  onOpenFakeCall: () => void;
  onOpenSos: () => void;
  onOpenAi: () => void;
  onOpenVault: () => void;
  onOpenPlateLookup?: () => void;
  onOpenGuardianSync?: () => void;
  savedReportsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenReportModal,
  onOpenFakeCall,
  onOpenSos,
  onOpenAi,
  onOpenVault,
  onOpenPlateLookup,
  onOpenGuardianSync,
  savedReportsCount,
}) => {
  return (
    <section className="pt-6 sm:pt-10 pb-12 sm:pb-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2-column split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Narrative & Action Points */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Unboxed inline kicker with authentic logo mark */}
            <div className="flex items-center gap-2 text-xs text-purple-900 font-semibold tracking-wide uppercase mb-3">
              <VowaLogo variant="icon" size="sm" />
              <span>Ruang Aman Resmi VOWA</span>
              <span aria-hidden="true">·</span>
              <span>Your Voice, Your Safety</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.15] text-balance">
              Your Voice, Your Safety. Ruang Aman Penumpang Ride-Hailing.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
              VOWA hadir untuk memberikan perlindungan kepada pengguna ride hailing dari ancaman maupun tindakan pelecehan.
            </p>

            {/* Quick interactive CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const elem = document.getElementById('tracker');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-3 px-6 text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Pantau Perjalanan (Live)</span>
              </button>

              {onOpenPlateLookup && (
                <button
                  onClick={onOpenPlateLookup}
                  className="py-3 px-5 text-sm font-semibold text-purple-950 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-2 border border-purple-200 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-purple-700" />
                  <span>Cek Plat Driver</span>
                </button>
              )}

              {onOpenGuardianSync && (
                <button
                  onClick={onOpenGuardianSync}
                  className="py-3 px-4 text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5 border border-stone-200 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-stone-600" />
                  <span>Sync HP Wali</span>
                </button>
              )}

              <button
                onClick={onOpenAi}
                className="py-3 px-5 text-sm font-bold text-indigo-950 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-2 border border-indigo-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-700" />
                <span>Tanya Asisten AI</span>
              </button>

              <button
                onClick={onOpenReportModal}
                className="py-3 px-4 text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5 border border-stone-200 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-stone-600" />
                <span>Lapor Pelecehan</span>
              </button>

              <button
                onClick={onOpenFakeCall}
                className="py-3 px-3.5 text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5 border border-stone-200 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-stone-600" />
                <span>Panggilan</span>
              </button>
            </div>

            {/* Brankas shortcut & security notice */}
            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Privasi Anda nomor satu: data tersimpan lokal & terlindungi.</span>
              </div>
              <button
                onClick={onOpenVault}
                className="font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 cursor-pointer"
              >
                Brankas Laporan ({savedReportsCount}) &rarr;
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative flex items-center">
            <div className="w-full h-full min-h-[320px] sm:min-h-[420px] rounded-3xl overflow-hidden shadow-lg border border-stone-200 relative bg-stone-100">
              <img
                src="/src/assets/images/vowa_hero_safety_1792417461327.jpg"
                alt="Penumpang perempuan duduk tenang dan waspada di dalam taksi online malam hari"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover lg:h-full"
                onError={(e) => {
                  // Fallback container if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-rose-300">
                  Perjalanan Bebas Cemas
                </span>
                <p className="text-sm font-medium mt-1 leading-snug">
                  "Setiap penumpang berhak atas perjalanan yang aman, bermartabat, dan bebas dari segala bentuk pelecehan."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI / Trust Strip below Hero Split */}
        <div className="mt-12 pt-8 border-t border-stone-100 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70">
            <div className="text-2xl font-black text-stone-900 tracking-tight font-mono">24/7</div>
            <div className="text-xs font-bold text-stone-800 mt-1">Siaga Hotline Terhubung</div>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
              Akses cepat ke SAPA 129, Polisi 110, dan Safety Center Aplikator.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70">
            <div className="text-2xl font-black text-rose-700 tracking-tight font-mono">100%</div>
            <div className="text-xs font-bold text-stone-800 mt-1">Bebas Victim-Blaming</div>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
              Fokus pada keselamatan dan pemulihan, bukan menghakimi korban.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70">
            <div className="text-2xl font-black text-stone-900 tracking-tight font-mono">UU TPKS</div>
            <div className="text-xs font-bold text-stone-800 mt-1">Payung Hukum No. 12/2022</div>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
              Advokasi hak visum gratis, restitusi, dan kerahasiaan identitas saksi.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70">
            <div className="text-2xl font-black text-stone-900 tracking-tight font-mono">1-Klik</div>
            <div className="text-xs font-bold text-stone-800 mt-1">Mode Penyamaran Cepat</div>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
              Ubah seketika tampilan aplikasi menjadi kalkulator untuk privasi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
