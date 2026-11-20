import React, { useState, useEffect, useRef } from 'react';
import {
  TripSession,
  ServiceProvider,
  VehicleType,
  EmergencyContact,
  IncidentReport,
  DriverRegistryItem,
} from '../types';
import { lookupDriverByPlate } from '../data/driverRegistryData';
import { findSafeHavens, MapsGroundingSource } from '../services/geminiService';
import { SafeRideMap } from './SafeRideMap';
import { PlaceAutocompleteInput } from './PlaceAutocompleteInput';
import {
  Navigation,
  MapPin,
  Clock,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Share2,
  PhoneCall,
  EyeOff,
  Mic,
  MicOff,
  CheckCircle2,
  Plus,
  Compass,
  Radio,
  FileWarning,
  ExternalLink,
  Users,
  WifiOff,
  Search,
  Sparkles,
  Crosshair,
  Loader2,
  Shield,
} from 'lucide-react';

interface TripTrackerProps {
  onOpenSos: () => void;
  onOpenFakeCall: () => void;
  onOpenDecoy: () => void;
  onOpenReportWithTrip?: (tripData: Partial<IncidentReport>) => void;
  onOpenPlateLookup?: () => void;
  onOpenGuardianSync?: () => void;
  onOpenOfflineSos?: () => void;
  onOpenAi?: () => void;
  emergencyContacts: EmergencyContact[];
}

const SAMPLE_INITIAL_TRIP: TripSession = {
  id: 'trip-active-1',
  createdAt: new Date().toISOString(),
  startTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  serviceProvider: 'Gojek',
  vehicleType: 'Mobil (Car)',
  licensePlate: 'B 1942 SRA',
  driverName: 'Pak Hendra Kusuma',
  pickupLocation: 'Stasiun MRT Bundaran HI',
  destinationLocation: 'Mall Gandaria City, Jakarta Selatan',
  estimatedDurationMinutes: 25,
  status: 'active',
  checkInIntervalMinutes: 10,
  progressPercent: 42,
  currentSpeedKmh: 36,
  isDeviated: false,
  coords: { lat: -6.215, lng: 106.812 },
  destinationCoords: { lat: -6.244, lng: 106.784 },
  lastCheckInAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
};

export const TripTracker: React.FC<TripTrackerProps> = ({
  onOpenSos,
  onOpenFakeCall,
  onOpenDecoy,
  onOpenReportWithTrip,
  onOpenPlateLookup,
  onOpenGuardianSync,
  onOpenOfflineSos,
  onOpenAi,
  emergencyContacts,
}) => {
  // Current active trip state
  const [activeTrip, setActiveTrip] = useState<TripSession | null>(() => {
    const saved = localStorage.getItem('vowa_active_trip');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return SAMPLE_INITIAL_TRIP;
  });

  // Auto-detected driver when typing plate number
  const [detectedDriver, setDetectedDriver] = useState<DriverRegistryItem | null>(null);

  // Trip history
  const [tripHistory, setTripHistory] = useState<TripSession[]>(() => {
    const saved = localStorage.getItem('vowa_trip_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'hist-1',
        createdAt: '2026-10-25T19:30:00.000Z',
        startTime: '19:30',
        serviceProvider: 'Grab',
        vehicleType: 'Mobil (Car)',
        licensePlate: 'B 2714 WXQ',
        driverName: 'M. Syarif',
        pickupLocation: 'Kantor SCBD Sudirman',
        destinationLocation: 'Apartemen Kalibata City',
        estimatedDurationMinutes: 30,
        status: 'completed',
        checkInIntervalMinutes: 10,
        progressPercent: 100,
        currentSpeedKmh: 0,
        isDeviated: false,
        coords: { lat: -6.258, lng: 106.855 },
        destinationCoords: { lat: -6.258, lng: 106.855 },
      },
    ];
  });

  // Form states for creating a new trip
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [provider, setProvider] = useState<ServiceProvider>('Gojek');
  const [vehicle, setVehicle] = useState<VehicleType>('Mobil (Car)');
  const [plate, setPlate] = useState('');
  const [driver, setDriver] = useState('');
  const [pickup, setPickup] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [durationMins, setDurationMins] = useState(25);
  const [checkInFreq, setCheckInFreq] = useState(10);

  // Live Google Maps metrics & GPS sync
  const [routeMetrics, setRouteMetrics] = useState<{ distanceKm: number; durationMinutes: number } | null>(null);
  const [isSyncingGps, setIsSyncingGps] = useState(false);

  // Maps Grounding Safe Haven Finder state
  const [safeHavenCategory, setSafeHavenCategory] = useState<'police' | 'hospital' | 'public' | null>(null);
  const [safeHavenLoading, setSafeHavenLoading] = useState(false);
  const [safeHavenError, setSafeHavenError] = useState<string | null>(null);
  const [safeHavenResult, setSafeHavenResult] = useState<{
    text: string;
    mapsSources: MapsGroundingSource[];
  } | null>(null);

  // Live simulation states
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(480); // 8 mins simulated
  const [showCheckInPrompt, setShowCheckInPrompt] = useState(false);
  const [checkInCountdown, setCheckInCountdown] = useState(60);

  // Audio recording timer
  useEffect(() => {
    let interval: any = null;
    if (isRecordingAudio) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio]);

  // Elapsed trip timer
  useEffect(() => {
    if (!activeTrip || activeTrip.status !== 'active') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      // Advance progress slightly
      setActiveTrip((prev) => {
        if (!prev) return null;
        const newProgress = Math.min(98, prev.progressPercent + 0.1);
        const updated = { ...prev, progressPercent: newProgress };
        localStorage.setItem('vowa_active_trip', JSON.stringify(updated));
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [activeTrip]);

  // Periodic welfare check-in prompt
  useEffect(() => {
    if (!activeTrip || activeTrip.status !== 'active') return;
    const interval = setInterval(() => {
      setShowCheckInPrompt(true);
      setCheckInCountdown(60);
    }, 45000); // Trigger check-in demo every 45s for interactive testing

    return () => clearInterval(interval);
  }, [activeTrip]);

  // Check-in countdown timer
  useEffect(() => {
    if (!showCheckInPrompt) return;
    if (checkInCountdown > 0) {
      const timer = setTimeout(() => setCheckInCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown reached 0 without response
      onOpenSos();
      setShowCheckInPrompt(false);
    }
  }, [showCheckInPrompt, checkInCountdown, onOpenSos]);

  // Start new trip
  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim()) {
      alert('Mohon isi titik jemput dan titik tujuan perjalanan.');
      return;
    }

    const newTrip: TripSession = {
      id: 'trip-' + Date.now(),
      createdAt: new Date().toISOString(),
      startTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      serviceProvider: provider,
      vehicleType: vehicle,
      licensePlate: plate.trim() || 'B 1234 ABC',
      driverName: driver.trim() || 'Mitra Pengemudi',
      pickupLocation: pickup.trim(),
      destinationLocation: destination.trim(),
      estimatedDurationMinutes: durationMins,
      status: 'active',
      checkInIntervalMinutes: checkInFreq,
      progressPercent: 5,
      currentSpeedKmh: vehicle === 'Motor (Bike)' ? 38 : 32,
      isDeviated: false,
      coords: pickupCoords || { lat: -6.2088, lng: 106.8456 },
      destinationCoords: destCoords || { lat: -6.25, lng: 106.8 },
      lastCheckInAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveTrip(newTrip);
    localStorage.setItem('vowa_active_trip', JSON.stringify(newTrip));
    setElapsedSeconds(0);
    setRouteMetrics(null);
    setSafeHavenResult(null);
    setIsCreatingNew(false);
  };

  // Sync actual device geolocation
  const handleSyncRealGps = () => {
    if (!('geolocation' in navigator) || !activeTrip) return;
    setIsSyncingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const updated: TripSession = {
          ...activeTrip,
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
        };
        setActiveTrip(updated);
        localStorage.setItem('vowa_active_trip', JSON.stringify(updated));
        setIsSyncingGps(false);
      },
      () => {
        setIsSyncingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Find nearest Safe Havens using Gemini Maps Grounding
  const handleFindSafeHavens = async (category: 'police' | 'hospital' | 'public') => {
    if (!activeTrip) return;
    setSafeHavenCategory(category);
    setSafeHavenLoading(true);
    setSafeHavenError(null);
    try {
      const res = await findSafeHavens(activeTrip.coords.lat, activeTrip.coords.lng, category);
      setSafeHavenResult(res);
    } catch (err: any) {
      setSafeHavenError(err?.message || 'Gagal memuat tempat aman dari Google Maps.');
    } finally {
      setSafeHavenLoading(false);
    }
  };

  // Finish trip safely
  const handleFinishTrip = () => {
    if (!activeTrip) return;
    const completedTrip: TripSession = {
      ...activeTrip,
      status: 'completed',
      progressPercent: 100,
      currentSpeedKmh: 0,
    };

    const newHistory = [completedTrip, ...tripHistory];
    setTripHistory(newHistory);
    localStorage.setItem('vowa_trip_history', JSON.stringify(newHistory));
    localStorage.removeItem('vowa_active_trip');
    setActiveTrip(null);
    setShowCheckInPrompt(false);
  };

  // Toggle Route Deviation test
  const handleToggleDeviation = () => {
    if (!activeTrip) return;
    const isNowDeviated = !activeTrip.isDeviated;
    const updated: TripSession = {
      ...activeTrip,
      isDeviated: isNowDeviated,
      deviationMessage: isNowDeviated
        ? 'Perhatian: Kendaraan berbelok keluar dari rute navigasi utama menuju area yang tidak sesuai pesanan.'
        : undefined,
      currentSpeedKmh: isNowDeviated ? 12 : 36,
    };
    setActiveTrip(updated);
    localStorage.setItem('vowa_active_trip', JSON.stringify(updated));
  };

  // WhatsApp Share URL generator
  const getWhatsAppShareUrl = () => {
    if (!activeTrip) return '#';
    const mapsLink = `https://www.google.com/maps?q=${activeTrip.coords.lat},${activeTrip.coords.lng}`;
    const text = `📍 MONITORING PERJALANAN VOWA:
Saya sedang di perjalanan ${activeTrip.serviceProvider} (${activeTrip.vehicleType}).
No. Kendaraan: ${activeTrip.licensePlate}
Nama Pengemudi: ${activeTrip.driverName}
Rute: ${activeTrip.pickupLocation} ➡️ ${activeTrip.destinationLocation}
Pantau lokasi live GPS saya: ${mapsLink}
Status: ${activeTrip.isDeviated ? '⚠️ PERINGATAN: Rute menyimpang!' : 'Jalur Sesuai & Aman'}
Mohon tetap siaga ya!`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEscalateToReport = (trip: TripSession) => {
    if (onOpenReportWithTrip) {
      onOpenReportWithTrip({
        serviceProvider: trip.serviceProvider,
        vehicleType: trip.vehicleType,
        licensePlate: trip.licensePlate,
        driverName: trip.driverName,
        pickupLocation: trip.pickupLocation,
        destinationLocation: trip.destinationLocation,
        incidentDate: new Date(trip.createdAt).toISOString().split('T')[0],
        incidentTime: trip.startTime,
        description: trip.isDeviated
          ? `Terjadi penyimpangan rute yang mencurigakan saat monitoring VOWA aktif: ${trip.deviationMessage || ''}`
          : '',
      });
    }
  };

  return (
    <section id="tracker" className="py-12 sm:py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-rose-800 tracking-wide uppercase mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SafeRide Tracker & Live Monitoring</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Tracker & Pemantau Perjalanan Real-Time
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-2xl">
              Pantau rute kendaraan, deteksi anomali/penyimpangan jalur secara otomatis, aktifkan check-in keselamatan berkala, dan bagikan live lokasi ke kontak terpercaya.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!activeTrip && !isCreatingNew && (
              <button
                onClick={() => setIsCreatingNew(true)}
                className="py-2.5 px-4 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Pantau Perjalanan Baru</span>
              </button>
            )}

            {activeTrip && (
              <button
                onClick={handleFinishTrip}
                className="py-2.5 px-4 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Selesaikan Perjalanan (Tiba Aman)</span>
              </button>
            )}
          </div>
        </div>

        {/* Welfare Check-In Alert Banner (if triggered) */}
        {showCheckInPrompt && activeTrip && (
          <div className="mb-6 p-4 sm:p-5 bg-amber-500 text-stone-950 rounded-3xl shadow-lg border-2 border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-bounce-once">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-950 text-amber-400 flex items-center justify-center shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-950">
                  VOWA Safety Check-in: Apakah Anda Aman? ({checkInCountdown}s)
                </h4>
                <p className="text-xs text-stone-900 mt-0.5">
                  Perjalanan telah berlangsung {formatTimer(elapsedSeconds)}. Jika tidak ada respon dalam 60 detik, peringatan otomatis disiapkan ke kontak darurat.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setShowCheckInPrompt(false);
                  setActiveTrip((prev) =>
                    prev
                      ? {
                          ...prev,
                          lastCheckInAt: new Date().toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                        }
                      : null
                  );
                }}
                className="py-2.5 px-4 bg-stone-950 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
              >
                Ya, Saya Aman & Nyaman
              </button>
              <button
                onClick={onOpenSos}
                className="py-2.5 px-3.5 bg-red-700 text-white rounded-xl text-xs font-bold hover:bg-red-800 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Tidak Aman (SOS)
              </button>
            </div>
          </div>
        )}

        {/* ================= ACTIVE TRIP DASHBOARD ================= */}
        {activeTrip ? (
          <div className="space-y-6">
            {/* Top Status & Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>Durasi Terpantau</span>
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div className="text-2xl font-black text-stone-900 font-mono tracking-tight">
                  {formatTimer(elapsedSeconds)}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Estimasi Total: {activeTrip.estimatedDurationMinutes} Menit
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>Kecepatan Kendaraan</span>
                  <Gauge className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div className="text-2xl font-black text-stone-900 font-mono tracking-tight">
                  {activeTrip.currentSpeedKmh}{' '}
                  <span className="text-xs font-sans font-medium text-stone-500">km/jam</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  {activeTrip.currentSpeedKmh > 10 ? 'Sedang Melaju' : 'Berhenti / Macet'}
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>Status Navigasi</span>
                  <Compass className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div
                  className={`text-sm font-bold flex items-center gap-1.5 mt-1 ${
                    activeTrip.isDeviated ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {activeTrip.isDeviated ? (
                    <>
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Rute Menyimpang!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Sesuai Jalur Utama</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-stone-500 mt-1.5">
                  {activeTrip.isDeviated ? 'Penyimpangan terdeteksi' : 'GPS sinkron stabil'}
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>Pemeriksaan Terakhir</span>
                  <Radio className="w-3.5 h-3.5 text-stone-400" />
                </div>
                <div className="text-sm font-bold text-stone-900 font-mono mt-1">
                  {activeTrip.lastCheckInAt || activeTrip.startTime} WIB
                </div>
                <div className="text-[11px] text-stone-500 mt-1.5">
                  Frekuensi: Tiap {activeTrip.checkInIntervalMinutes} menit
                </div>
              </div>
            </div>

            {/* Main Interactive Map & Route Progression Container */}
            <div className="bg-stone-900 rounded-3xl p-6 text-white border border-stone-800 shadow-xl overflow-hidden relative">
              {/* Top Map Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="font-semibold text-rose-400">{activeTrip.serviceProvider}</span>
                    <span>·</span>
                    <span>{activeTrip.vehicleType}</span>
                    <span>·</span>
                    <span className="font-mono text-stone-200">{activeTrip.licensePlate}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Mitra Driver: {activeTrip.driverName}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onOpenGuardianSync && (
                    <button
                      onClick={onOpenGuardianSync}
                      title="Sambungkan live radar perjalanan ke HP orang tua / wali"
                      className="py-1.5 px-3 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-purple-300" />
                      <span>Sync HP Wali</span>
                    </button>
                  )}

                  {onOpenOfflineSos && (
                    <button
                      onClick={onOpenOfflineSos}
                      title="Protokol darurat SMS & GPS satelit tanpa kuota internet"
                      className="py-1.5 px-3 bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                      <span>Darurat Tanpa Sinyal</span>
                    </button>
                  )}

                  {onOpenPlateLookup && (
                    <button
                      onClick={onOpenPlateLookup}
                      title="Cek identitas pengemudi & riwayat keamanan plat nomor"
                      className="py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-rose-400" />
                      <span>Cek Plat Driver</span>
                    </button>
                  )}

                  <button
                    onClick={handleToggleDeviation}
                    title="Uji coba bagaimana sistem mendeteksi rute mencurigakan"
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTrip.isDeviated
                        ? 'bg-red-900/60 text-red-200 border border-red-700/60'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{activeTrip.isDeviated ? 'Kembalikan Jalur Normal' : 'Simulasi Rute Menyimpang'}</span>
                  </button>

                  <a
                    href={getWhatsAppShareUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan ke WA</span>
                  </a>
                </div>
              </div>

              {/* Route Waypoints Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 p-4 bg-stone-950/60 rounded-2xl border border-stone-800 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Titik Jemput</span>
                    <p className="font-medium text-stone-200">{activeTrip.pickupLocation}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Titik Tujuan</span>
                    <p className="font-medium text-stone-200">{activeTrip.destinationLocation}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-stone-800">
                  {routeMetrics && (
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                        Rute Google Maps
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {routeMetrics.distanceKm} km · ~{routeMetrics.durationMinutes} mnt
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSyncRealGps}
                    disabled={isSyncingGps}
                    className="py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {isSyncingGps ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    ) : (
                      <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>{isSyncingGps ? 'Sinkron...' : 'GPS Asli'}</span>
                  </button>
                </div>
              </div>

              {/* Interactive Google Maps SafeRide View */}
              <SafeRideMap
                trip={activeTrip}
                onRouteMetrics={setRouteMetrics}
                onOpenFakeCall={onOpenFakeCall}
              />

              {/* Progress bar towards destination */}
              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center gap-4 text-xs">
                <span className="text-stone-400 shrink-0">Progres Rute:</span>
                <div className="flex-1 bg-stone-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      activeTrip.isDeviated ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500'
                    }`}
                    style={{ width: `${activeTrip.progressPercent}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-stone-200 shrink-0">
                  {Math.round(activeTrip.progressPercent)}%
                </span>
              </div>

              {/* Nearby Safe Haven Finder (Google Maps Grounding via Gemini) */}
              <div className="mt-4 pt-4 border-t border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-100">
                        Cari Titik Aman Terdekat (Google Maps AI)
                      </span>
                      <span className="text-[11px] text-stone-400 block">
                        Temukan kantor polisi, UGD, atau tempat ramai 24 jam di sekitar lokasi Anda.
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleFindSafeHavens('police')}
                      disabled={safeHavenLoading}
                      className={`py-1.5 px-3 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                        safeHavenCategory === 'police'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                      }`}
                    >
                      🚓 Polsek Terdekat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFindSafeHavens('hospital')}
                      disabled={safeHavenLoading}
                      className={`py-1.5 px-3 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                        safeHavenCategory === 'hospital'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                      }`}
                    >
                      🏥 RS / IGD 24 Jam
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFindSafeHavens('public')}
                      disabled={safeHavenLoading}
                      className={`py-1.5 px-3 rounded-xl text-[11px] font-semibold border transition-colors cursor-pointer ${
                        safeHavenCategory === 'public'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                      }`}
                    >
                      🏪 Area Ramai 24 Jam
                    </button>
                    {onOpenAi && (
                      <button
                        type="button"
                        onClick={onOpenAi}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Chat Gemini</span>
                      </button>
                    )}
                  </div>
                </div>

                {safeHavenLoading && (
                  <div className="mt-3 p-3 bg-stone-950/70 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Memindai titik aman terdekat via Google Maps Grounding...</span>
                  </div>
                )}

                {safeHavenError && (
                  <div className="mt-3 p-3 bg-red-950/60 rounded-xl border border-red-800 text-xs text-red-200">
                    {safeHavenError}
                  </div>
                )}

                {!safeHavenLoading && safeHavenResult && (
                  <div className="mt-3 p-4 bg-stone-950/80 rounded-2xl border border-stone-800 space-y-3 text-xs">
                    {safeHavenResult.text && (
                      <p className="text-stone-200 leading-relaxed whitespace-pre-line">
                        {safeHavenResult.text}
                      </p>
                    )}
                    {safeHavenResult.mapsSources.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {safeHavenResult.mapsSources.map((place, idx) => (
                          <a
                            key={idx}
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-stone-900 hover:bg-stone-800 rounded-xl border border-stone-700/80 flex items-start justify-between gap-2 transition-colors group"
                          >
                            <div>
                              <div className="font-bold text-emerald-300 group-hover:underline">
                                {place.title}
                              </div>
                              {place.snippets && place.snippets[0] && (
                                <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                                  "{place.snippets[0]}"
                                </p>
                              )}
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tactical Safety Control Bar (During Active Monitoring) */}
            <div className="p-5 bg-stone-50 rounded-3xl border border-stone-200">
              <div className="text-xs font-bold text-stone-800 mb-3">
                Perlindungan Taktis Saat Berada di Kendaraan:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1: Fake Call */}
                <button
                  onClick={onOpenFakeCall}
                  className="p-3 bg-white hover:bg-stone-100 text-stone-800 rounded-2xl border border-stone-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <PhoneCall className="w-5 h-5 text-purple-700 mb-2" />
                  <div>
                    <span className="text-xs font-bold block">Panggilan Tiruan</span>
                    <span className="text-[10px] text-stone-500">Pura-pura ditelepon kerabat</span>
                  </div>
                </button>

                {/* 2: Decoy Calculator */}
                <button
                  onClick={onOpenDecoy}
                  className="p-3 bg-white hover:bg-stone-100 text-stone-800 rounded-2xl border border-stone-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <EyeOff className="w-5 h-5 text-stone-700 mb-2" />
                  <div>
                    <span className="text-xs font-bold block">Mode Penyamaran</span>
                    <span className="text-[10px] text-stone-500">Ubah layar jadi kalkulator</span>
                  </div>
                </button>

                {/* 3: Discreet Audio Record */}
                <button
                  onClick={() => setIsRecordingAudio(!isRecordingAudio)}
                  className={`p-3 rounded-2xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    isRecordingAudio
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {isRecordingAudio ? (
                      <Mic className="w-5 h-5 text-rose-600 animate-pulse" />
                    ) : (
                      <MicOff className="w-5 h-5 text-stone-500" />
                    )}
                    {isRecordingAudio && (
                      <span className="text-[10px] font-mono font-bold text-rose-600">
                        {formatTimer(recordingSeconds)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block">
                      {isRecordingAudio ? 'Merekam Suara...' : 'Rekam Suara Kabin'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {isRecordingAudio ? 'Ketuk untuk hentikan' : 'Simpan bukti percakapan'}
                    </span>
                  </div>
                </button>

                {/* 4: Guardian Live Sync */}
                {onOpenGuardianSync && (
                  <button
                    onClick={onOpenGuardianSync}
                    className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-950 rounded-2xl border border-purple-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
                  >
                    <Users className="w-5 h-5 text-purple-700 mb-2" />
                    <div>
                      <span className="text-xs font-bold block">Sync HP Orang Tua</span>
                      <span className="text-[10px] text-purple-800">Pantau live dari HP wali</span>
                    </div>
                  </button>
                )}

                {/* 5: Offline SOS Protocol */}
                {onOpenOfflineSos && (
                  <button
                    onClick={onOpenOfflineSos}
                    className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-2xl border border-amber-200 text-left transition-colors cursor-pointer flex flex-col justify-between"
                  >
                    <WifiOff className="w-5 h-5 text-amber-700 mb-2" />
                    <div>
                      <span className="text-xs font-bold block">SOS Tanpa Sinyal</span>
                      <span className="text-[10px] text-amber-800">SMS Satelit GPS offline</span>
                    </div>
                  </button>
                )}

                {/* 6: SOS Emergency */}
                <button
                  onClick={onOpenSos}
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-left transition-colors shadow-sm cursor-pointer flex flex-col justify-between"
                >
                  <AlertTriangle className="w-5 h-5 text-white mb-2" />
                  <div>
                    <span className="text-xs font-bold block">Tombol SOS Bahaya</span>
                    <span className="text-[10px] text-red-100">Kirim peringatan ke WA & Polisi</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= NO ACTIVE TRIP / CREATE TRIP ================= */
          <div className="space-y-6">
            {isCreatingNew ? (
              /* Create New Trip Form */
              <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200">
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">Mulai Pemantauan Perjalanan Baru</h3>
                    <p className="text-xs text-stone-500">
                      Masukkan rincian kendaraan dan rute agar VOWA dapat memantau rute dan waktu Anda secara real-time.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatingNew(false)}
                    className="text-stone-400 hover:text-stone-600 text-xs font-medium cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                <form onSubmit={handleStartTrip} className="py-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                        Aplikasi Ride-Hailing
                      </label>
                      <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value as ServiceProvider)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600 text-stone-800"
                      >
                        <option value="Gojek">Gojek</option>
                        <option value="Grab">Grab</option>
                        <option value="Maxim">Maxim</option>
                        <option value="inDrive">inDrive</option>
                        <option value="Taksi / Lainnya">Taksi / Layanan Lain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                        Jenis Armada
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Mobil (Car)', 'Motor (Bike)'] as VehicleType[]).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setVehicle(v)}
                            className={`py-2 px-3 text-xs rounded-xl border text-center transition-colors cursor-pointer ${
                              vehicle === v
                                ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                                : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-stone-800">
                          Nomor Plat Kendaraan
                        </label>
                        {onOpenPlateLookup && (
                          <button
                            type="button"
                            onClick={onOpenPlateLookup}
                            className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                          >
                            <Search className="w-3 h-3" />
                            <span>Cek Database Plat</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Contoh: B 1942 SRA"
                        value={plate}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setPlate(val);
                          const matched = lookupDriverByPlate(val);
                          setDetectedDriver(matched);
                        }}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600 font-mono font-bold"
                      />

                      {/* Real-time Driver Detection Notification */}
                      {detectedDriver && (
                        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start justify-between gap-2 animate-fade-in">
                          <div>
                            <div className="font-bold flex items-center gap-1 text-emerald-900">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Driver Terdaftar: {detectedDriver.driverName}</span>
                            </div>
                            <div className="text-[11px] text-emerald-800 mt-0.5">
                              {detectedDriver.serviceProvider} · {detectedDriver.vehicleModel} ({detectedDriver.vehicleColor})
                            </div>
                            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                              Skor Keamanan: {detectedDriver.safetyScore}% ({detectedDriver.safetyStatus})
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDriver(detectedDriver.driverName);
                              setProvider(detectedDriver.serviceProvider);
                              setVehicle(detectedDriver.vehicleType);
                            }}
                            className="py-1 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer shadow-xs"
                          >
                            Terapkan Otomatis
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                        Nama Pengemudi (Sesuai Aplikasi)
                      </label>
                      <input
                        type="text"
                        placeholder="Nama Mitra Driver"
                        value={driver}
                        onChange={(e) => setDriver(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Ketik plat di samping untuk mengisi nama driver otomatis jika sudah terdaftar.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                        Titik Penjemputan (Google Places Autocomplete)
                      </label>
                      <PlaceAutocompleteInput
                        required
                        placeholder="Ketik alamat / stasiun penjemputan..."
                        value={pickup}
                        onChange={setPickup}
                        onPlaceSelected={(place) => {
                          setPickup(place.address);
                          setPickupCoords({ lat: place.lat, lng: place.lng });
                        }}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                        Titik Tujuan (Google Places Autocomplete)
                      </label>
                      <PlaceAutocompleteInput
                        required
                        placeholder="Ketik alamat tujuan..."
                        value={destination}
                        onChange={setDestination}
                        onPlaceSelected={(place) => {
                          setDestination(place.address);
                          setDestCoords({ lat: place.lat, lng: place.lng });
                        }}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600"
                      />
                    </div>
                  </div>

                  {/* Preset Locations Shortcut */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-500">
                    <span className="font-semibold">Rute Cepat:</span>
                    {[
                      { from: 'Stasiun MRT', to: 'Rumah' },
                      { from: 'Kantor', to: 'Kost' },
                      { from: 'Mall Kelapa Gading', to: 'Stasiun LRT' },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPickup(p.from);
                          setDestination(p.to);
                        }}
                        className="px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-stone-700 hover:border-rose-300 hover:text-rose-900 cursor-pointer"
                      >
                        {p.from} &rarr; {p.to}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                        Perkiraan Durasi Perjalanan
                      </label>
                      <select
                        value={durationMins}
                        onChange={(e) => setDurationMins(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none"
                      >
                        <option value={15}>15 Menit</option>
                        <option value={25}>25 Menit (Standar Dalam Kota)</option>
                        <option value={40}>40 Menit (Antar Kota / Macet)</option>
                        <option value={60}>60 Menit (Luar Kota / Tol Jauh)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                        Frekuensi Check-In Keselamatan
                      </label>
                      <select
                        value={checkInFreq}
                        onChange={(e) => setCheckInFreq(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none"
                      >
                        <option value={5}>Setiap 5 Menit (Sangat Waspada / Malam Hari)</option>
                        <option value={10}>Setiap 10 Menit (Rekomendasi Standar)</option>
                        <option value={15}>Setiap 15 Menit</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="py-2.5 px-4 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 px-5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Mulai Pantau Sekarang</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Empty active state / CTA banner */
              <div className="p-8 bg-stone-50 rounded-3xl border border-stone-200 text-center max-w-2xl mx-auto space-y-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto">
                  <Navigation className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  Tidak Ada Perjalanan yang Sedang Dipantau
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-md mx-auto">
                  Sebelum naik ke ojek atau taksi online, aktifkan fitur pantau perjalanan VOWA agar rute Anda terlindungi secara mandiri dan kerabat dapat ikut memantau.
                </p>
                <div>
                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="py-3 px-6 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Mulai Pantau Perjalanan Baru</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= RIWAYAT MONITORING PERJALANAN ================= */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Riwayat Monitoring Perjalanan</h3>
              <p className="text-xs text-stone-500">
                Daftar perjalanan yang pernah Anda pantau. Dapat dialihkan langsung menjadi berkas laporan jika terjadi insiden.
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-600 font-mono">
              {tripHistory.length} Riwayat
            </span>
          </div>

          <div className="space-y-3">
            {tripHistory.map((trip) => (
              <div
                key={trip.id}
                className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                    <span className="font-semibold text-rose-700">{trip.serviceProvider}</span>
                    <span>·</span>
                    <span>{trip.vehicleType}</span>
                    <span>·</span>
                    <span className="font-mono text-stone-700">{trip.licensePlate}</span>
                    <span>·</span>
                    <span>{new Date(trip.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Driver: {trip.driverName}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {trip.pickupLocation} &rarr; {trip.destinationLocation}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selesai Aman
                  </span>

                  {onOpenReportWithTrip && (
                    <button
                      onClick={() => handleEscalateToReport(trip)}
                      className="py-1.5 px-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <FileWarning className="w-3.5 h-3.5 text-rose-600" />
                      <span>Alihkan ke Lapor Pelecehan</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
