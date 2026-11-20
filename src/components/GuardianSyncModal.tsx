import React, { useState } from 'react';
import { TripSession, EmergencyContact } from '../types';
import {
  Users,
  Smartphone,
  Shield,
  PhoneCall,
  Share2,
  Copy,
  Check,
  MapPin,
  Clock,
  BatteryCharging,
  Radio,
  AlertTriangle,
  Building2,
  Send,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface GuardianSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripSession | null;
  emergencyContacts: EmergencyContact[];
}

export const GuardianSyncModal: React.FC<GuardianSyncModalProps> = ({
  isOpen,
  onClose,
  trip,
  emergencyContacts,
}) => {
  // Mode: 'setup' (Korban setup tautan) vs 'parent_preview' (Simulasi tampilan di HP Orang Tua)
  const [activeView, setActiveView] = useState<'setup' | 'parent_preview'>('setup');
  const [authorityRelayEnabled, setAuthorityRelayEnabled] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [remoteCallTriggered, setRemoteCallTriggered] = useState(false);

  if (!isOpen) return null;

  const guardianCode = trip ? `VOWA-${trip.licensePlate.replace(/[^A-Z0-9]/g, '').slice(0, 4)}-99` : 'VOWA-LIVE-8821';
  const guardianLiveUrl = `${window.location.origin}/#guardian-monitor?code=${guardianCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(guardianLiveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const generateWhatsAppShare = (contactPhone?: string) => {
    const text = `Halo, saya mengaktifkan VOWA Guardian Sync untuk perjalanan ride-hailing saya:
Layanan: ${trip?.serviceProvider || 'Gojek'} (${trip?.vehicleType || 'Mobil'})
No. Plat: ${trip?.licensePlate || 'B 1942 SRA'}
Pengemudi: ${trip?.driverName || 'Mitra Driver'}
Pantau radar langsung & posisi saya di HP kamu lewat tautan aman ini:
${guardianLiveUrl}
(Jika status berubah tidak aman, kamu bisa langsung panggil polisi dari tautan tersebut).`;
    const clean = contactPhone ? contactPhone.replace(/[^0-9]/g, '') : '';
    const intl = clean.startsWith('0') ? '62' + clean.slice(1) : clean;
    return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-700 tracking-wide uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Live Sync Orang Tua & Pihak Berwenang
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500">Dual-Screen Safety Relay</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              Sambungkan Pelacak ke HP Orang Tua / Wali
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Orang tua atau wali dapat melihat posisi GPS, rute, dan kecepatan mobil anak mereka secara live tanpa harus mengunduh aplikasi terpisah.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl my-5 max-w-md">
          <button
            onClick={() => setActiveView('setup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeView === 'setup'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Bagikan Tautan ke Wali</span>
          </button>
          <button
            onClick={() => setActiveView('parent_preview')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeView === 'parent_preview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-purple-700" />
            <span>Simulasi Layar HP Orang Tua</span>
          </button>
        </div>

        {/* VIEW 1: SETUP & SHARE */}
        {activeView === 'setup' && (
          <div className="space-y-5">
            {/* Guardian Link Card */}
            <div className="p-5 bg-stone-50 rounded-3xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-700">
                <span className="font-semibold flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-700" />
                  Tautan Live Radar Khusus Orang Tua / Wali:
                </span>
                <span className="font-mono text-stone-500 text-[11px]">Kode Akses: {guardianCode}</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={guardianLiveUrl}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl font-mono text-stone-700 focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Tersalin' : 'Salin Tautan'}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed">
                Kirimkan tautan ini via WhatsApp atau SMS. Saat dibuka di ponsel orang tua, layar pemantau langsung aktif tanpa perlu login kata sandi yang rumit.
              </p>
            </div>

            {/* Direct Send to Emergency Contacts via WhatsApp */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-800 block">
                Kirimkan 1-Klik ke Kontak Keluarga Tersimpan:
              </span>
              {emergencyContacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {emergencyContacts.map((c) => (
                    <a
                      key={c.id}
                      href={generateWhatsAppShare(c.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-xs text-emerald-950 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div>
                          <div className="font-bold">{c.name}</div>
                          <div className="text-[10px] text-emerald-800">{c.relationship} · {c.phone}</div>
                        </div>
                      </div>
                      <span className="font-bold text-[11px] text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-300">
                        Kirim Radar
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <a
                  href={generateWhatsAppShare()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Buka WhatsApp & Pilih Kontak Orang Tua / Wali</span>
                </a>
              )}
            </div>

            {/* Authority Relay Integration (Pihak Berwenang) */}
            <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-800" />
                  <span className="text-xs font-bold text-purple-950">
                    Otomatisasi Relay ke Pihak Berwenang (Polres / SAPA 129)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={authorityRelayEnabled}
                  onChange={(e) => setAuthorityRelayEnabled(e.target.checked)}
                  className="w-4 h-4 accent-purple-800 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-purple-900/80 leading-relaxed">
                Saat diaktifkan: Apabila tombol SOS darurat terpicu atau rute menyimpang melebihi batas toleransi, VOWA secara otomatis menyiagakan data GPS, plat nomor, dan nomor kontak wali ke pusat respons terdekat (Polri 110 & SAPA KemenPPPA).
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: PARENT / GUARDIAN PHONE SCREEN SIMULATION */}
        {activeView === 'parent_preview' && (
          <div className="space-y-4">
            <div className="p-3 bg-stone-100 rounded-2xl text-xs text-stone-600 flex items-center justify-between">
              <span>Preview: Tampilan yang muncul di layar smartphone orang tua/wali</span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                LIVE CONNECTED
              </span>
            </div>

            {/* Simulated Phone Frame */}
            <div className="max-w-md mx-auto bg-stone-900 text-white rounded-3xl p-5 border-4 border-stone-800 shadow-xl space-y-4">
              {/* Phone Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-[11px] text-stone-400">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Shield className="w-3.5 h-3.5 text-purple-400" /> VOWA Guardian Radar
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <BatteryCharging className="w-3.5 h-3.5" /> Baterai HP Anak: 74%
                </span>
              </div>

              {/* Status Banner */}
              <div className="p-3 bg-stone-800 rounded-2xl border border-stone-700 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">Perjalanan Sedang Berlangsung</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-stone-300 text-[11px]">
                  Anak Anda sedang berada di <strong>{trip?.serviceProvider || 'Gojek'} ({trip?.vehicleType || 'Mobil'})</strong>
                </p>
                <div className="mt-2 pt-2 border-t border-stone-700/80 flex items-center justify-between text-[10px] text-stone-400">
                  <span>Driver: <strong>{trip?.driverName || 'Pak Hendra'}</strong></span>
                  <span className="font-mono text-purple-300">Plat: {trip?.licensePlate || 'B 1942 SRA'}</span>
                </div>
              </div>

              {/* Mini Radar Map */}
              <div className="relative h-40 bg-stone-950 rounded-2xl border border-stone-800 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full border border-stone-700 rounded-full scale-150 animate-ping" />
                </div>
                <div className="text-center z-10">
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center mx-auto mb-1 animate-pulse">
                    <MapPin className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-[11px] font-bold text-white block">Posisi Terkini Anak</span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {trip ? `${trip.coords.lat.toFixed(4)}, ${trip.coords.lng.toFixed(4)}` : '-6.2150, 106.8120'}
                  </span>
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[10px] text-stone-400 bg-stone-900/80 px-2.5 py-1 rounded-lg">
                  <span>Kecepatan: {trip?.currentSpeedKmh || 34} km/jam</span>
                  <span>Estimasi Tiba: ~12 Menit</span>
                </div>
              </div>

              {/* Action Buttons for Parents on their phone */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-semibold text-stone-300 block">
                  Aksi Jarak Jauh dari HP Orang Tua:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="tel:081289102345"
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Telepon Anak</span>
                  </a>

                  <button
                    onClick={() => {
                      setRemoteCallTriggered(true);
                      setTimeout(() => setRemoteCallTriggered(false), 4000);
                    }}
                    className="p-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Picu Fake Call</span>
                  </button>

                  <a
                    href="tel:110"
                    className="col-span-2 p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Hubungi Polisi Terdekat dari Posisi Anak</span>
                  </a>
                </div>

                {remoteCallTriggered && (
                  <div className="p-2 bg-emerald-900/60 border border-emerald-600/70 rounded-xl text-[11px] text-emerald-200 text-center animate-fade-in">
                    ✓ Sinyal Panggilan Tiruan telah terkirim ke HP Anak!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Koneksi enkripsi point-to-point tanpa pelacakan riwayat pihak ketiga</span>
          <button
            onClick={onClose}
            className="py-2 px-4 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
