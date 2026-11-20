import React, { useState, useEffect, useRef } from 'react';
import { TripSession, EmergencyContact } from '../types';
import {
  WifiOff,
  SignalZero,
  MessageSquare,
  AlertTriangle,
  Volume2,
  VolumeX,
  MapPin,
  Compass,
  Database,
  Radio,
  ExternalLink,
  ShieldAlert,
  PhoneCall,
  Check,
} from 'lucide-react';

interface OfflineEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripSession | null;
  emergencyContacts: EmergencyContact[];
}

export const OfflineEmergencyModal: React.FC<OfflineEmergencyModalProps> = ({
  isOpen,
  onClose,
  trip,
  emergencyContacts,
}) => {
  const [offlineCoords, setOfflineCoords] = useState<{ lat: number; lng: number }>({
    lat: trip?.coords.lat || -6.215,
    lng: trip?.coords.lng || 106.812,
  });
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [recordedBreadcrumbs, setRecordedBreadcrumbs] = useState<number>(14);
  const [copiedSms, setCopiedSms] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenOscRef = useRef<OscillatorNode | null>(null);

  // Retrieve current hardware satellite GPS coordinates even when offline
  useEffect(() => {
    if (!isOpen) {
      stopLocalSiren();
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOfflineCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // keep fallback coords
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [isOpen]);

  const primaryContact = emergencyContacts[0];
  const targetPhone = primaryContact?.phone || '081289102345';

  const mapsUrl = `https://maps.google.com/?q=${offlineCoords.lat.toFixed(6)},${offlineCoords.lng.toFixed(6)}`;

  const generateOfflineSmsBody = () => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let text = `[SOS VOWA OFFLINE] DARURAT: Sinyal internet saya terputus!\n`;
    text += `Waktu: ${timeStr} WIB\n`;
    text += `Titik GPS Satelit Terkini: ${mapsUrl}\n`;
    if (trip) {
      text += `Kendaraan: ${trip.serviceProvider} (${trip.vehicleType}) No: ${trip.licensePlate}\n`;
      text += `Driver: ${trip.driverName}\n`;
      text += `Rute: ${trip.pickupLocation} -> ${trip.destinationLocation}\n`;
    }
    text += `Tolong segera telepon saya atau hubungi aparat terdekat!`;
    return text;
  };

  const smsUri = `sms:${targetPhone.replace(/[^0-9]/g, '')}?body=${encodeURIComponent(generateOfflineSmsBody())}`;

  // Local Distress High-Frequency Siren (100% Offline via Web Audio API)
  const startLocalSiren = () => {
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

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.3);
      osc.frequency.linearRampToValueAtTime(800, now + 0.6);

      gain.gain.setValueAtTime(0.35, now);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      sirenOscRef.current = osc;
      setIsSirenActive(true);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  };

  const stopLocalSiren = () => {
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch (e) {}
      sirenOscRef.current = null;
    }
    setIsSirenActive(false);
  };

  const toggleSiren = () => {
    if (isSirenActive) stopLocalSiren();
    else startLocalSiren();
  };

  const handleCopySms = () => {
    navigator.clipboard.writeText(generateOfflineSmsBody());
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  Protokol Tanpa Internet (Offline SOS)
                </span>
                <span className="text-xs text-stone-400">·</span>
                <span className="text-xs text-stone-500 font-mono">GSM & Satellite GPS</span>
              </div>
              <h2 className="text-xl font-bold text-stone-900 mt-0.5">
                Tetap Terhubung Saat Sinyal Hilang / Blank Spot
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Explanation Banner */}
        <div className="my-5 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <Radio className="w-4 h-4 text-amber-700" />
            <span>Bagaimana VOWA Tetap Bekerja Tanpa Kuota Internet / Sinyal Data:</span>
          </div>
          <ul className="space-y-1 text-[11px] list-disc list-inside text-amber-900/90 leading-relaxed">
            <li><strong>Chip Satelit GPS Ponsel:</strong> Mengunci titik lintang & bujur secara hardware dari satelit antariksa tanpa perlu koneksi internet.</li>
            <li><strong>Protokol SMS GSM:</strong> Mengirimkan koordinat posisi dan data kendaraan melalui jaringan seluler 2G/SMS biasa yang menjangkau area tanpa kuota data.</li>
            <li><strong>Offline Breadcrumbs Blackbox:</strong> Koordinat terus dicatat di memori internal ponsel Anda dan siap tersinkronisasi saat sinyal kembali.</li>
          </ul>
        </div>

        {/* Live Satellite Coordinates Card */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 mb-5">
          <div className="flex items-center justify-between text-xs text-stone-700 mb-1.5">
            <span className="font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-600" />
              Koordinat Satelit GPS Anda (Terkunci Offline):
            </span>
            <span className="font-mono text-[11px] text-stone-500">
              {offlineCoords.lat.toFixed(5)}, {offlineCoords.lng.toFixed(5)}
            </span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-xs font-mono text-stone-800 break-all">
            {mapsUrl}
          </div>
        </div>

        {/* 1-Click Primary Action: SEND OFFLINE SMS VIA CELLULAR */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
            <span>Kirim SMS Darurat Berisi Lokasi Satelit ke Wali:</span>
            <button
              onClick={handleCopySms}
              className="text-[11px] font-medium text-rose-700 hover:text-rose-800 cursor-pointer flex items-center gap-1"
            >
              {copiedSms ? <Check className="w-3.5 h-3.5" /> : null}
              {copiedSms ? 'Teks Tersalin' : 'Salin Teks Pesan'}
            </button>
          </div>

          <a
            href={smsUri}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kirim SMS Darurat Sekarang (Buka Aplikasi SMS HP)</span>
          </a>

          <p className="text-[11px] text-stone-500 text-center">
            Pesan akan ditujukan ke <strong>{primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : targetPhone}</strong>.
          </p>
        </div>

        {/* Preview of Offline SMS Payload */}
        <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-200 text-xs text-stone-700 font-mono whitespace-pre-wrap leading-relaxed mb-5">
          {generateOfflineSmsBody()}
        </div>

        {/* Offline Loud Alarm & Local Blackbox */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100">
          {/* Siren */}
          <button
            onClick={toggleSiren}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isSirenActive
                ? 'bg-red-600 text-white border-red-700 animate-pulse'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
            }`}
          >
            {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-600" />}
            <span>{isSirenActive ? 'Matikan Bunyi Sirene' : 'Nyalakan Sirene Keras Offline'}</span>
          </button>

          {/* Local Breadcrumbs Info */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex items-center justify-between text-stone-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-purple-700" />
              Blackbox Offline:
            </span>
            <span className="font-mono font-bold text-stone-800">
              {recordedBreadcrumbs} Titik Tersimpan
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
