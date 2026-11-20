import React, { useState } from 'react';
import {
  DRIVER_REGISTRY_DATA,
  lookupDriverByPlate,
  searchDriverRegistry,
} from '../data/driverRegistryData';
import { DriverRegistryItem } from '../types';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Car,
  Bike,
  UserCheck,
  CheckCircle2,
  FileWarning,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

interface PlateLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlateForTrip?: (driver: DriverRegistryItem) => void;
  onSelectPlateForReport?: (driver: DriverRegistryItem) => void;
}

export const PlateLookupModal: React.FC<PlateLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectPlateForTrip,
  onSelectPlateForReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<DriverRegistryItem | null>(() => DRIVER_REGISTRY_DATA[0]);

  if (!isOpen) return null;

  const searchResults = searchDriverRegistry(searchQuery);

  const handleSelectDriver = (driver: DriverRegistryItem) => {
    setSelectedDriver(driver);
  };

  const handleApplyToTrip = () => {
    if (selectedDriver && onSelectPlateForTrip) {
      onSelectPlateForTrip(selectedDriver);
      onClose();
    }
  };

  const handleApplyToReport = () => {
    if (selectedDriver && onSelectPlateForReport) {
      onSelectPlateForReport(selectedDriver);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-700 tracking-wide uppercase">
                Verifikasi Cerdas Plat Kendaraan
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500">Database Mitra Terdaftar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
              Cek Identitas Pengemudi & Plat Nomor
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ketahui nama driver resmi, model & warna kendaraan fisik, serta riwayat catatan keamanan sebelum Anda naik ke kendaraan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Search input bar */}
        <div className="my-4 relative shrink-0">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik nomor plat (contoh: B 1942 SRA, D 1842, B 2714) atau nama driver..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-rose-600 font-mono"
            autoFocus
          />
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[11px] text-stone-500 shrink-0">
          <span className="font-semibold">Plat Contoh Terverifikasi:</span>
          {['B 1942 SRA', 'B 2714 WXQ', 'B 2481 PKX', 'D 1842 KFG', 'L 4567 JK'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setSearchQuery(p);
                const match = lookupDriverByPlate(p);
                if (match) setSelectedDriver(match);
              }}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 font-mono transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Main 2-column view: List + Detail Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 overflow-y-auto pr-1">
          {/* Left Column: Search Results List */}
          <div className="md:col-span-5 space-y-2 overflow-y-auto max-h-[380px]">
            {searchResults.length === 0 ? (
              <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                <p className="font-semibold text-stone-700">Plat tidak ditemukan di basis data instan.</p>
                <p className="mt-1 text-[11px]">
                  Anda tetap dapat memasukkan plat ini ke formulir SafeRide Tracker untuk dipantau secara langsung oleh VOWA.
                </p>
              </div>
            ) : (
              searchResults.map((d) => {
                const isSelected = selectedDriver?.plateNumber === d.plateNumber;
                return (
                  <div
                    key={d.plateNumber}
                    onClick={() => handleSelectDriver(d)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900 tracking-wider">
                        {d.plateNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          d.safetyStatus === 'Terverifikasi Aman'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {d.safetyStatus === 'Terverifikasi Aman' ? 'Aman' : 'Perhatian'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-stone-800 mt-1">
                      {d.driverName}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {d.serviceProvider} · {d.vehicleModel}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Driver Full Dossier & Actions */}
          <div className="md:col-span-7 bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col justify-between">
            {selectedDriver ? (
              <div className="space-y-4">
                {/* Header card */}
                <div className="flex items-start justify-between pb-3 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-stone-900 px-2 py-0.5 bg-white border border-stone-300 rounded-lg">
                        {selectedDriver.plateNumber}
                      </span>
                      <span className="text-xs font-semibold text-rose-700">
                        {selectedDriver.serviceProvider}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mt-1.5 flex items-center gap-1.5">
                      {selectedDriver.driverName}
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </h3>
                    <p className="text-xs text-stone-500">
                      Wilayah Pendaftaran: {selectedDriver.registeredCity}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-purple-900">
                      {selectedDriver.safetyScore}%
                    </div>
                    <span className="text-[10px] text-stone-500 block uppercase font-semibold">
                      Skor Keamanan
                    </span>
                  </div>
                </div>

                {/* Vehicle Physical Characteristics (Critical for safety before entering!) */}
                <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="font-semibold flex items-center gap-1.5">
                      {selectedDriver.vehicleType === 'Mobil (Car)' ? (
                        <Car className="w-4 h-4 text-purple-700" />
                      ) : (
                        <Bike className="w-4 h-4 text-purple-700" />
                      )}
                      Model Kendaraan Fisik:
                    </span>
                    <span className="font-medium text-stone-900">{selectedDriver.vehicleModel}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="text-stone-500">Warna Terdaftar:</span>
                    <span className="font-semibold text-stone-900">{selectedDriver.vehicleColor}</span>
                  </div>
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl mt-1 border border-amber-200/60">
                    ⚠️ <strong>Tips Keamanan:</strong> Jangan masuk jika warna atau jenis mobil berbeda dari data di atas, meskipun pengemudi beralasan mobil sewaan/milik saudara.
                  </div>
                </div>

                {/* Safety Status & Certification Note */}
                <div className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    {selectedDriver.safetyStatus === 'Terverifikasi Aman' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-bold text-stone-900">
                      Status: {selectedDriver.safetyStatus}
                    </span>
                  </div>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    {selectedDriver.certificationNote}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                    <span>Laporan Masuk: {selectedDriver.reportedIncidentsCount} kali</span>
                    <span>Pembaruan: {selectedDriver.lastUpdated}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-stone-500">
                Pilih atau cari nomor plat dari daftar di sebelah kiri untuk melihat rincian driver.
              </div>
            )}

            {/* Bottom Actions */}
            {selectedDriver && (
              <div className="mt-5 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-end gap-2">
                {onSelectPlateForReport && (
                  <button
                    type="button"
                    onClick={handleApplyToReport}
                    className="py-2 px-3 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileWarning className="w-3.5 h-3.5 text-rose-600" />
                    <span>Laporkan Plat Ini</span>
                  </button>
                )}

                {onSelectPlateForTrip && (
                  <button
                    type="button"
                    onClick={handleApplyToTrip}
                    className="py-2 px-4 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Gunakan Plat Ini di Monitoring</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
