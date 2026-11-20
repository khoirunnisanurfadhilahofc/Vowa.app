import React from 'react';
import { Lock } from 'lucide-react';
import { VowaLogo } from './VowaLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenSos: () => void;
  onOpenFakeCall: () => void;
  onOpenDecoy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSos,
  onOpenFakeCall,
  onOpenDecoy,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-800">
          {/* Brand & Purpose */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <VowaLogo variant="icon" size="md" />
              <div>
                <span className="text-xl font-black text-white tracking-tight">VOWA</span>
                <span className="text-[10px] text-purple-300 block font-semibold -mt-1 tracking-wider uppercase">
                  Your Voice, Your Safety
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Your Voice, Your Safety. Ruang aman digital penumpang ride-hailing di Indonesia untuk pelaporan insiden pelecehan, perlindungan darurat, dan pendampingan pemulihan berbasis UU TPKS No. 12 Tahun 2022.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privasi Lokal Aman Tanpa Pelacak</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigasi Utama</h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('lapor')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Formulir Lapor Pelecehan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('direktori')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Direktori Hotline Darurat
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('panduan')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Safety Checklist & UU TPKS
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('komunitas')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lingkaran Suara Penumpang
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Access */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Saluran Siaga Nasional</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-stone-800/80 rounded-xl">
                <span className="text-stone-300">SAPA 129 (KemenPPPA):</span>
                <a href="tel:129" className="font-mono font-bold text-rose-400 hover:underline">
                  129 / 08111-129-129
                </a>
              </div>
              <div className="flex items-center justify-between p-2 bg-stone-800/80 rounded-xl">
                <span className="text-stone-300">Polisi Gawat Darurat:</span>
                <a href="tel:110" className="font-mono font-bold text-rose-400 hover:underline">
                  110
                </a>
              </div>
              <div className="flex items-center justify-between p-2 bg-stone-800/80 rounded-xl">
                <span className="text-stone-300">Yayasan Pulih (Trauma):</span>
                <a href="tel:08118436633" className="font-mono font-bold text-stone-200 hover:underline">
                  0811-8436-633
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Bottom Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} VOWA — Your Voice, Your Safety. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenDecoy}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Mode Penyamaran Layar
            </button>
            <button
              onClick={onOpenFakeCall}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Panggilan Tiruan
            </button>
            <button
              onClick={onOpenSos}
              className="text-rose-400 hover:text-rose-300 transition-colors font-semibold cursor-pointer"
            >
              Tombol Bahaya (SOS)
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
