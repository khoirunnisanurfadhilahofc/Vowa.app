import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, Send, PhoneCall, Volume2, VolumeX, ShieldAlert, Check } from 'lucide-react';
import { EmergencyContact } from '../types';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyContacts: EmergencyContact[];
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose, emergencyContacts }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [driverInfo, setDriverInfo] = useState({ plate: '', name: '', app: 'Gojek' });
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);

  // Retrieve current location
  useEffect(() => {
    if (!isOpen) {
      stopSiren();
      return;
    }

    if ('geolocation' in navigator) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGeoLoading(false);
        },
        () => {
          // Fallback approximate Jakarta center coordinates
          setCoords({ lat: -6.2088, lng: 106.8456 });
          setGeoLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, [isOpen]);

  const mapsUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : 'https://maps.google.com';

  const generateSosMessage = () => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let msg = `⚠️ PERINGATAN DARURAT VOWA:\nSaya merasa terancam/tidak aman di perjalanan ride-hailing (${driverInfo.app}).\n`;
    if (driverInfo.plate) msg += `No. Kendaraan: ${driverInfo.plate}\n`;
    if (driverInfo.name) msg += `Pengemudi: ${driverInfo.name}\n`;
    msg += `Waktu: ${timeStr} WIB\n`;
    msg += `Lokasi Terkini Saya: ${mapsUrl}\n`;
    msg += `Tolong hubungi saya segera atau hubungi pihak berwajib jika saya tidak membalas dalam 5 menit!`;
    return encodeURIComponent(msg);
  };

  const startSiren = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';

      // Pitch sweep
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1000, now + 0.4);
      osc.frequency.linearRampToValueAtTime(600, now + 0.8);

      gain.gain.setValueAtTime(0.3, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      sirenOscRef.current = osc;
      setIsSirenPlaying(true);
    } catch (e) {
      console.warn('Siren audio error:', e);
    }
  };

  const stopSiren = () => {
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      sirenOscRef.current = null;
    }
    setIsSirenPlaying(false);
  };

  const toggleSiren = () => {
    if (isSirenPlaying) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(mapsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Tombol Bantuan Darurat (SOS)</h2>
              <p className="text-xs text-stone-500">Kirim sinyal bahaya & lokasi presisi ke kerabat atau aparat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live Location Card */}
        <div className="my-5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-700 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              Titik Koordinat GPS Anda
            </span>
            <button
              onClick={handleCopyLocation}
              className="text-[11px] font-medium text-rose-700 hover:text-rose-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : null}
              {copiedLink ? 'Tersalin' : 'Salin Tautan'}
            </button>
          </div>

          <div className="font-mono text-xs text-stone-800 bg-white p-2.5 rounded-xl border border-stone-200/80 break-all">
            {geoLoading ? (
              <span className="text-stone-400 italic">Mendeteksi titik satelit GPS...</span>
            ) : coords ? (
              `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
            ) : (
              'Lokasi GPS tidak diizinkan di peramban'
            )}
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Tautan Google Maps otomatis disertakan dalam setiap pesan darurat WhatsApp.
          </p>
        </div>

        {/* Quick Driver Identifier (Optional) */}
        <div className="mb-5 space-y-3">
          <div className="text-xs font-semibold text-stone-800">
            Identitas Perjalanan Cepat (Opsional)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="No. Plat (B 1234 XYZ)"
              value={driverInfo.plate}
              onChange={(e) => setDriverInfo({ ...driverInfo, plate: e.target.value.toUpperCase() })}
              className="col-span-2 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500 font-mono"
            />
            <select
              value={driverInfo.app}
              onChange={(e) => setDriverInfo({ ...driverInfo, app: e.target.value })}
              className="px-2 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500 text-stone-700 font-medium"
            >
              <option value="Gojek">Gojek</option>
              <option value="Grab">Grab</option>
              <option value="Maxim">Maxim</option>
              <option value="inDrive">inDrive</option>
              <option value="Taksi Lain">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Primary 1-Click WhatsApp SOS */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-stone-800">
            Kirim Teks Peringatan ke Kontak Terpercaya
          </div>

          {emergencyContacts.length > 0 ? (
            <div className="space-y-2">
              {emergencyContacts.map((contact) => {
                const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
                const intlPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                const waUrl = `https://wa.me/${intlPhone}?text=${generateSosMessage()}`;

                return (
                  <a
                    key={contact.id}
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow-sm active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Send className="w-4 h-4 shrink-0" />
                      <div className="text-left">
                        <div className="text-xs font-bold leading-tight">{contact.name}</div>
                        <div className="text-[11px] text-emerald-100">{contact.relationship} · {contact.phone}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-800/40 px-2.5 py-1 rounded-lg">
                      Kirim WA
                    </span>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-center">
              <p className="text-xs text-stone-600 mb-2">
                Belum ada kontak darurat tersimpan di perangkat ini.
              </p>
              <a
                href={`https://wa.me/?text=${generateSosMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Send className="w-3.5 h-3.5" />
                Buka WhatsApp & Pilih Penerima Manual
              </a>
            </div>
          )}
        </div>

        {/* Direct Emergency Telephone Hotlines */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="text-xs font-semibold text-stone-800 mb-3">
            Panggil Layanan Siaga Resmi (Langsung Terhubung)
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="tel:110"
              className="flex items-center gap-2 p-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors text-left"
            >
              <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">Polisi 110</div>
                <div className="text-[10px] text-stone-400">Darurat Kejahatan</div>
              </div>
            </a>
            <a
              href="tel:129"
              className="flex items-center gap-2 p-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors text-left"
            >
              <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="text-xs font-bold">SAPA 129</div>
                <div className="text-[10px] text-stone-400">Kementerian PPPA</div>
              </div>
            </a>
            <a
              href="tel:02150849000"
              className="flex items-center gap-2 p-3 bg-stone-100 text-stone-800 rounded-xl hover:bg-stone-200 transition-colors text-left border border-stone-200/80"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold">Gojek Safety</div>
                <div className="text-[10px] text-stone-500">24 Jam SafeRide</div>
              </div>
            </a>
            <a
              href="tel:02150816600"
              className="flex items-center gap-2 p-3 bg-stone-100 text-stone-800 rounded-xl hover:bg-stone-200 transition-colors text-left border border-stone-200/80"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold">Grab Safety</div>
                <div className="text-[10px] text-stone-500">24 Jam Response</div>
              </div>
            </a>
          </div>
        </div>

        {/* Siren Alarm Trigger */}
        <div className="mt-5 pt-3 flex items-center justify-between">
          <button
            onClick={toggleSiren}
            className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isSirenPlaying
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {isSirenPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isSirenPlaying ? 'Hentikan Bunyi Sirine' : 'Uji Bunyi Sirine Bahaya'}
          </button>

          <button
            onClick={onClose}
            className="py-2 px-4 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
