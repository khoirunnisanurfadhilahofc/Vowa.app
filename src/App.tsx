import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { EmergencyDirectory } from './components/EmergencyDirectory';
import { SafetyToolkit } from './components/SafetyToolkit';
import { CommunityStories } from './components/CommunityStories';
import { EmergencyContactsManager } from './components/EmergencyContactsManager';
import { Footer } from './components/Footer';
import { DecoyCalculator } from './components/DecoyCalculator';
import { FakeCallModal } from './components/FakeCallModal';
import { SosModal } from './components/SosModal';
import { ReportFormModal } from './components/ReportFormModal';
import { ReportVaultModal } from './components/ReportVaultModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { TripTracker } from './components/TripTracker';
import { PlateLookupModal } from './components/PlateLookupModal';
import { GuardianSyncModal } from './components/GuardianSyncModal';
import { OfflineEmergencyModal } from './components/OfflineEmergencyModal';
import { MapsProviderWrapper } from './components/MapsProviderWrapper';
import { IncidentReport, EmergencyContact, TripSession } from './types';
import {
  ShieldAlert,
  PhoneCall,
  EyeOff,
  FileText,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from 'lucide-react';

const INITIAL_SAMPLE_REPORTS: IncidentReport[] = [
  {
    id: 'rep-sample-01',
    createdAt: new Date().toISOString(),
    incidentDate: '2026-10-18',
    incidentTime: '21:30',
    serviceProvider: 'Gojek',
    vehicleType: 'Mobil (Car)',
    licensePlate: 'B 2481 PKX',
    driverName: 'R. Hidayat',
    pickupLocation: 'Stasiun Manggarai',
    destinationLocation: 'Tebet Timur Dalam',
    incidentCategories: ['Pelecehan Verbal', 'Pelecehan Non-Fisik'],
    description: 'Driver berulang kali menanyakan status pernikahan dan mengajak menginap di hotel sambil menatap lewat spion tengah.',
    chronologySummary: `=== KRONOLOGI KEJADIAN RESMI (VOWA) ===
1. Waktu: 18 Oktober 2026, Pukul 21:30 WIB
2. Layanan: GoCar (Mobil) - No. Plat: B 2481 PKX, Driver: R. Hidayat
3. Lokasi: Perjalanan dari Stasiun Manggarai menuju Tebet Timur Dalam
4. Peristiwa:
   - 21:35 WIB: Driver mulai menanyakan apakah pelapor tinggal sendiri atau sudah menikah. Pelapor merespon dengan singkat untuk membatasi obrolan.
   - 21:42 WIB: Driver mengeluarkan komentar bernada seksual terkait pakaian pelapor dan mengajak singgah ke hotel.
   - 21:45 WIB: Pelapor meminta driver fokus berkendara dan langsung mengabari keluarga melalui panggilan telepon loudspeaker.
   - 21:52 WIB: Pelapor turun di depan pos satpam perumahan.
5. Rekomendasi Bukti: Tangkapan layar pesanan Gojek terarsip, catatan saksi satpam pos perumahan.`,
    evidenceItems: [],
    isAnonymous: true,
    status: 'Tersimpan Aman',
  },
];

const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'ct-1',
    name: 'Ibu (Rumah)',
    relationship: 'Keluarga',
    phone: '081289102345',
  },
];

export default function App() {
  // Discreet Decoy Mode State
  const [isDecoyActive, setIsDecoyActive] = useState<boolean>(false);

  // Modals
  const [isFakeCallOpen, setIsFakeCallOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isPlateLookupOpen, setIsPlateLookupOpen] = useState(false);
  const [isGuardianSyncOpen, setIsGuardianSyncOpen] = useState(false);
  const [isOfflineSosOpen, setIsOfflineSosOpen] = useState(false);
  const [prefilledTripData, setPrefilledTripData] = useState<Partial<IncidentReport> | undefined>(undefined);

  // Google Maps Demo Key quota exceeded state
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data persistence
  const [reports, setReports] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem('vowa_incident_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_SAMPLE_REPORTS;
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('vowa_emergency_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_CONTACTS;
  });

  const [activeSection, setActiveSection] = useState('hero');

  // Listen for Google Maps Demo Key quota exceeded events
  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Keyboard shortcut: Press Escape to instantly activate disguise mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDecoyActive) {
        setIsDecoyActive(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDecoyActive]);

  const handleSaveReport = (report: IncidentReport) => {
    const updated = [report, ...reports];
    setReports(updated);
    localStorage.setItem('vowa_incident_reports', JSON.stringify(updated));
    showToast('Laporan berhasil didokumentasikan dan dikunci aman di Brankas.');
  };

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    localStorage.setItem('vowa_incident_reports', JSON.stringify(updated));
    showToast('Laporan telah dihapus dari brankas lokal.');
  };

  const handleSaveContacts = (contacts: EmergencyContact[]) => {
    setEmergencyContacts(contacts);
    localStorage.setItem('vowa_emergency_contacts', JSON.stringify(contacts));
    showToast('Daftar kontak darurat diperbarui.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (id === 'lapor') {
      setIsReportModalOpen(true);
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If Decoy Mode is activated, render the full Calculator disguise interface
  if (isDecoyActive) {
    return <DecoyCalculator onExitDecoy={() => setIsDecoyActive(false)} />;
  }

  return (
    <MapsProviderWrapper>
      <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-rose-100 selection:text-rose-950">
        {/* Google Maps Platform Demo Key Quota Banner */}
        {mapsQuotaExceeded && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-950 hover:text-amber-800"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 bg-stone-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xl border border-stone-800 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

      {/* Top Bar Navigation (3-Zone Contract) */}
      <Header
        onOpenDecoy={() => setIsDecoyActive(true)}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenFakeCall={() => setIsFakeCallOpen(true)}
        onOpenPlateLookup={() => setIsPlateLookupOpen(true)}
        onOpenGuardianSync={() => setIsGuardianSyncOpen(true)}
        onNavigate={scrollToSection}
        activeSection={activeSection}
      />

      {/* Main Content Sections */}
      <main className="flex-1 pb-20 sm:pb-12">
        {/* Hero Section with High-Fidelity Asset */}
        <HeroSection
          onOpenReportModal={() => {
            setPrefilledTripData(undefined);
            setIsReportModalOpen(true);
          }}
          onOpenFakeCall={() => setIsFakeCallOpen(true)}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenAi={() => setIsAiOpen(true)}
          onOpenVault={() => setIsVaultOpen(true)}
          onOpenPlateLookup={() => setIsPlateLookupOpen(true)}
          onOpenGuardianSync={() => setIsGuardianSyncOpen(true)}
          savedReportsCount={reports.length}
        />

        {/* Real-time SafeRide Trip Tracker & Monitoring */}
        <TripTracker
          onOpenSos={() => setIsSosOpen(true)}
          onOpenFakeCall={() => setIsFakeCallOpen(true)}
          onOpenDecoy={() => setIsDecoyActive(true)}
          onOpenPlateLookup={() => setIsPlateLookupOpen(true)}
          onOpenGuardianSync={() => setIsGuardianSyncOpen(true)}
          onOpenOfflineSos={() => setIsOfflineSosOpen(true)}
          onOpenAi={() => setIsAiOpen(true)}
          onOpenReportWithTrip={(tripData) => {
            setPrefilledTripData(tripData);
            setIsReportModalOpen(true);
          }}
          emergencyContacts={emergencyContacts}
        />

        {/* Emergency Contacts Quick Setup Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmergencyContactsManager
            contacts={emergencyContacts}
            onSaveContacts={handleSaveContacts}
          />
        </div>

        {/* Emergency Helplines Directory */}
        <EmergencyDirectory />

        {/* Safety Toolkit, 5D Bystander, and UU TPKS Legal Rights */}
        <SafetyToolkit />

        {/* Community Safe Space & Stories */}
        <CommunityStories />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenFakeCall={() => setIsFakeCallOpen(true)}
        onOpenDecoy={() => setIsDecoyActive(true)}
      />

      {/* Floating Bottom Quick Action Bar for Mobile Viewport (<15% height) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 flex items-center justify-around text-[10px] font-medium text-stone-600 shadow-lg">
        <button
          onClick={() => setIsSosOpen(true)}
          className="flex flex-col items-center gap-1 text-red-600 font-bold active:scale-95 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span>SOS</span>
        </button>

        <button
          onClick={() => {
            const elem = document.getElementById('tracker');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-1 text-emerald-700 font-semibold active:scale-95 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <span>Pantau</span>
        </button>

        <button
          onClick={() => setIsFakeCallOpen(true)}
          className="flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center">
            <PhoneCall className="w-4 h-4" />
          </div>
          <span>Panggilan</span>
        </button>

        <button
          onClick={() => {
            setPrefilledTripData(undefined);
            setIsReportModalOpen(true);
          }}
          className="flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-rose-700 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-rose-900 font-semibold">Lapor</span>
        </button>

        <button
          onClick={() => setIsAiOpen(true)}
          className="flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-indigo-900 font-semibold">Asisten</span>
        </button>

        <button
          onClick={() => setIsDecoyActive(true)}
          className="flex flex-col items-center gap-1 active:scale-95 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center">
            <EyeOff className="w-4 h-4" />
          </div>
          <span>Samarkan</span>
        </button>
      </div>

      {/* Floating Desktop Gemini Chatbot Launcher */}
      <button
        onClick={() => setIsAiOpen(true)}
        title="Buka Asisten Chatbot Gemini VOWA"
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl shadow-xl border border-stone-700 transition-all hover:scale-[1.02] cursor-pointer"
      >
        <div className="w-7 h-7 rounded-xl bg-rose-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold leading-tight">Asisten AI VOWA</div>
          <div className="text-[10px] text-stone-400">Gemini · Maps & Search</div>
        </div>
      </button>

      {/* Modals & Dialogs */}
      <FakeCallModal
        isOpen={isFakeCallOpen}
        onClose={() => setIsFakeCallOpen(false)}
      />

      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        emergencyContacts={emergencyContacts}
      />

      <ReportFormModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setPrefilledTripData(undefined);
        }}
        onSaveReport={handleSaveReport}
        initialData={prefilledTripData}
      />

      <ReportVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        reports={reports}
        onDeleteReport={handleDeleteReport}
      />

      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {/* Driver Identity & Plate Verification Modal */}
      <PlateLookupModal
        isOpen={isPlateLookupOpen}
        onClose={() => setIsPlateLookupOpen(false)}
        onSelectPlateForTrip={(driverItem) => {
          const currentTrip: TripSession = {
            id: 'trip-' + Date.now(),
            createdAt: new Date().toISOString(),
            startTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            serviceProvider: driverItem.serviceProvider,
            vehicleType: driverItem.vehicleType,
            licensePlate: driverItem.plateNumber,
            driverName: driverItem.driverName,
            pickupLocation: 'Lokasi Penjemputan Anda',
            destinationLocation: 'Titik Tujuan Anda',
            estimatedDurationMinutes: 25,
            status: 'active',
            checkInIntervalMinutes: 10,
            progressPercent: 15,
            currentSpeedKmh: 34,
            isDeviated: false,
            coords: { lat: -6.215, lng: 106.812 },
            destinationCoords: { lat: -6.244, lng: 106.784 },
            lastCheckInAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          };
          localStorage.setItem('vowa_active_trip', JSON.stringify(currentTrip));
          showToast(`Plat ${driverItem.plateNumber} (${driverItem.driverName}) diterapkan ke SafeRide Tracker.`);
          const elem = document.getElementById('tracker');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectPlateForReport={(driverItem) => {
          setPrefilledTripData({
            serviceProvider: driverItem.serviceProvider,
            vehicleType: driverItem.vehicleType,
            licensePlate: driverItem.plateNumber,
            driverName: driverItem.driverName,
          });
          setIsReportModalOpen(true);
          showToast(`Data driver ${driverItem.driverName} (${driverItem.plateNumber}) dimasukkan ke draf laporan.`);
        }}
      />

      {/* Guardian & Authority Live Sync Modal */}
      <GuardianSyncModal
        isOpen={isGuardianSyncOpen}
        onClose={() => setIsGuardianSyncOpen(false)}
        trip={(() => {
          const saved = localStorage.getItem('vowa_active_trip');
          if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
          }
          return null;
        })()}
        emergencyContacts={emergencyContacts}
      />

      {/* Offline Emergency Protocol (SMS & Satellite GPS) Modal */}
      <OfflineEmergencyModal
        isOpen={isOfflineSosOpen}
        onClose={() => setIsOfflineSosOpen(false)}
        trip={(() => {
          const saved = localStorage.getItem('vowa_active_trip');
          if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
          }
          return null;
        })()}
        emergencyContacts={emergencyContacts}
      />
      </div>
    </MapsProviderWrapper>
  );
}
