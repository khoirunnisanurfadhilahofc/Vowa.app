import React, { useState } from 'react';
import { Shield, Sparkles, Upload, FileText, CheckCircle2, AlertCircle, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { IncidentReport, ServiceProvider, VehicleType } from '../types';
import { getSafetyGuidance } from '../services/geminiService';

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReport: (report: IncidentReport) => void;
  initialData?: Partial<IncidentReport>;
}

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  isOpen,
  onClose,
  onSaveReport,
  initialData,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form State
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider>(initialData?.serviceProvider || 'Gojek');
  const [vehicleType, setVehicleType] = useState<VehicleType>(initialData?.vehicleType || 'Mobil (Car)');
  const [licensePlate, setLicensePlate] = useState(initialData?.licensePlate || '');
  const [driverName, setDriverName] = useState(initialData?.driverName || '');
  const [pickupLocation, setPickupLocation] = useState(initialData?.pickupLocation || '');
  const [destinationLocation, setDestinationLocation] = useState(initialData?.destinationLocation || '');
  const [incidentDate, setIncidentDate] = useState(initialData?.incidentDate || new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState(initialData?.incidentTime || new Date().toTimeString().slice(0, 5));

  const [incidentCategories, setIncidentCategories] = useState<string[]>(initialData?.incidentCategories || []);
  const [description, setDescription] = useState(initialData?.description || '');
  const [chronologySummary, setChronologySummary] = useState(initialData?.chronologySummary || '');

  const [evidenceItems, setEvidenceItems] = useState<{ id: string; name: string; type: 'image' | 'audio' | 'document'; url?: string }[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');

  // Sync initialData when modal opens
  React.useEffect(() => {
    if (initialData && isOpen) {
      if (initialData.serviceProvider) setServiceProvider(initialData.serviceProvider);
      if (initialData.vehicleType) setVehicleType(initialData.vehicleType);
      if (initialData.licensePlate) setLicensePlate(initialData.licensePlate);
      if (initialData.driverName) setDriverName(initialData.driverName);
      if (initialData.pickupLocation) setPickupLocation(initialData.pickupLocation);
      if (initialData.destinationLocation) setDestinationLocation(initialData.destinationLocation);
      if (initialData.incidentDate) setIncidentDate(initialData.incidentDate);
      if (initialData.incidentTime) setIncidentTime(initialData.incidentTime);
      if (initialData.description) setDescription(initialData.description);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    if (incidentCategories.includes(cat)) {
      setIncidentCategories(incidentCategories.filter((c) => c !== cat));
    } else {
      setIncidentCategories([...incidentCategories, cat]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        const item = {
          id: 'ev-' + Date.now() + '-' + i,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'document',
          url: reader.result as string,
        } as const;
        setEvidenceItems((prev) => [...prev, item]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiChronology = async () => {
    if (!description.trim()) {
      alert('Tuliskan poin-poin cerita atau ingatan kejadian terlebih dahulu agar asisten AI dapat membantu merangkainya.');
      return;
    }
    setIsAiLoading(true);
    const result = await getSafetyGuidance({
      prompt: description,
      mode: 'chronology',
      incidentData: {
        layanan: serviceProvider,
        kendaraan: vehicleType,
        noPlat: licensePlate || 'Tidak tercatat',
        pengemudi: driverName || 'Tidak tercatat',
        rute: `${pickupLocation} -> ${destinationLocation}`,
        tanggal: `${incidentDate} ${incidentTime}`,
        kategori: incidentCategories,
      },
    });

    setChronologySummary(result.text);
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReport: IncidentReport = {
      id: 'rep-' + Date.now(),
      createdAt: new Date().toISOString(),
      incidentDate,
      incidentTime,
      serviceProvider,
      vehicleType,
      licensePlate: licensePlate || 'Tidak tercatat',
      driverName: driverName || 'Tidak tercatat',
      pickupLocation: pickupLocation || 'Tidak disebutkan',
      destinationLocation: destinationLocation || 'Tidak disebutkan',
      incidentCategories: incidentCategories.length > 0 ? incidentCategories : ['Pelecehan / Ketidaknyamanan Lain'],
      description,
      chronologySummary: chronologySummary || description,
      evidenceItems,
      isAnonymous,
      reporterName: isAnonymous ? 'Anonim' : reporterName,
      reporterContact: isAnonymous ? '' : reporterContact,
      status: 'Tersimpan Aman',
    };

    onSaveReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-700 tracking-wide">
                Langkah {step} dari 4
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500">Ruang Pelaporan Terpandu</span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 mt-1">
              Lapor Pengalaman Pelecehan
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Progress indicator */}
        <div className="grid grid-cols-4 gap-2 my-5">
          {['1. Perjalanan', '2. Jenis Kejadian', '3. Kronologi & AI', '4. Bukti & Privasi'].map((label, idx) => (
            <div key={label} className="text-left">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  idx + 1 <= step ? 'bg-rose-600' : 'bg-stone-200'
                }`}
              />
              <span className="text-[10px] text-stone-500 mt-1 block truncate font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Perjalanan */}
          {step === 1 && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Aplikasi Ride-Hailing
                  </label>
                  <select
                    value={serviceProvider}
                    onChange={(e) => setServiceProvider(e.target.value as ServiceProvider)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500 text-stone-800"
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
                    Tipe Kendaraan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Mobil (Car)', 'Motor (Bike)'] as VehicleType[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setVehicleType(v)}
                        className={`py-2 px-3 text-xs rounded-xl border text-center font-medium transition-colors cursor-pointer ${
                          vehicleType === v
                            ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
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
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Nomor Plat Kendaraan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                    placeholder="Contoh: B 1842 KFG"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Nama Mitra Driver (Opsional)
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Sesuai aplikasi pesanan"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Titik Penjemputan
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="Contoh: Stasiun Sudirman"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Titik Tujuan
                  </label>
                  <input
                    type="text"
                    value={destinationLocation}
                    onChange={(e) => setDestinationLocation(e.target.value)}
                    placeholder="Contoh: Mall Gandaria City"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Tanggal Kejadian
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                    Perkiraan Jam (WIB)
                  </label>
                  <input
                    type="time"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Klasifikasi Bentuk Pelecehan */}
          {step === 2 && (
            <div className="space-y-4 py-2">
              <p className="text-xs text-stone-600 mb-2">
                Pilih satu atau beberapa bentuk tindakan yang Anda alami atau saksikan. Ini membantu pengelompokan bukti hukum:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'Pelecehan Verbal',
                    title: 'Pelecehan Verbal / Catcalling',
                    desc: 'Komentar bernuansa seksual mengenai tubuh/pakaian, godaan tidak pantas, menanyakan privasi seksual, atau ajakan intim berulang kali.',
                  },
                  {
                    id: 'Pelecehan Non-Fisik',
                    title: 'Pelecehan Seksual Non-Fisik (Pasal 5 UU TPKS)',
                    desc: 'Tatapan melecehkan berulang lewat kaca spion, gestur tubuh cabul, memperlihatkan konten pornografi dari ponsel, atau masturbasi saat menyetir.',
                  },
                  {
                    id: 'Pelecehan Fisik',
                    title: 'Pelecehan Seksual Fisik (Pasal 6 UU TPKS)',
                    desc: 'Menyentuh paha/tangan/tubuh tanpa izin, meraba saat memberi kembalian/helm, memeluk paksa, atau kontak fisik intimidatif.',
                  },
                  {
                    id: 'Penyalahgunaan Data Kontak',
                    title: 'Penyalahgunaan Kontak Setelah Perjalanan',
                    desc: 'Menghubungi nomor WhatsApp pribadi untuk menggoda, mengirim pesan tidak senonoh, atau mengintai akun media sosial penumpang.',
                  },
                  {
                    id: 'Penyimpangan Rute & Intimidasi',
                    title: 'Penyimpangan Rute Ekstrem & Penahanan',
                    desc: 'Mengunci pintu mobil (child lock), menolak berhenti saat diminta, atau sengaja membelokkan mobil ke tempat sepi tanpa persetujuan.',
                  },
                ].map((item) => {
                  const selected = incidentCategories.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCategory(item.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selected
                          ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                          : 'border-stone-200 bg-stone-50/60 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                            selected ? 'bg-rose-600 border-rose-600 text-white' : 'border-stone-300 bg-white'
                          }`}
                        >
                          {selected && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-900">{item.title}</div>
                          <div className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">{item.desc}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Kronologi & AI Assistance */}
          {step === 3 && (
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Catatan atau Cerita Kejadian Anda
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  Tuliskan saja semampunya tanpa khawatir urutan atau tata bahasa. Anda dapat menggunakan tombol AI di bawah untuk merapikannya.
                </p>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan apa yang terjadi: perkataan driver, lokasi ketika peristiwa terjadi, bagaimana perasaan dan respon Anda..."
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              {/* AI Chronology Generator Trigger */}
              <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-700" />
                    <span className="text-xs font-bold text-rose-950">
                      Asisten Kronologi VOWA (Didukung Gemini)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAiChronology}
                    disabled={isAiLoading}
                    className="py-1.5 px-3 text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                  >
                    {isAiLoading ? 'Menyusun Kronologi...' : 'Bantu Rapikan Draft'}
                  </button>
                </div>
                <p className="text-[11px] text-rose-800/80 mt-1.5">
                  AI akan merangkai cerita mentah Anda menjadi draft laporan kronologis yang objektif, runut waktu, dan siap diserahkan ke tim investigasi aplikator atau penegak hukum.
                </p>

                {chronologySummary && (
                  <div className="mt-3 pt-3 border-t border-rose-200/60">
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Hasil Draft Kronologis yang Telah Disusun:
                    </label>
                    <textarea
                      rows={6}
                      value={chronologySummary}
                      onChange={(e) => setChronologySummary(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500 font-sans leading-relaxed text-stone-800"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Bukti & Privasi */}
          {step === 4 && (
            <div className="space-y-5 py-2">
              {/* Evidence Upload */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Unggah Bukti Pendukung (Screenshot Aplikasi, Foto Plat, Bukti Chat)
                </label>
                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center hover:border-stone-300 transition-colors bg-stone-50">
                  <Upload className="w-7 h-7 mx-auto text-stone-400 mb-1.5" />
                  <p className="text-xs text-stone-700 font-medium">
                    Klik untuk memilih berkas dari ponsel / komputer Anda
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Mendukung JPG, PNG, PDF, atau rekaman suara
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,audio/*,.pdf"
                    onChange={handleFileUpload}
                    className="mt-2 text-xs text-stone-500 cursor-pointer"
                  />
                </div>

                {evidenceItems.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[11px] font-semibold text-stone-700">Berkas Terlampir ({evidenceItems.length}):</span>
                    {evidenceItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-stone-100 rounded-lg text-xs text-stone-700">
                        <span className="truncate max-w-[280px]">📎 {item.name}</span>
                        <button
                          type="button"
                          onClick={() => setEvidenceItems(evidenceItems.filter((_, i) => i !== idx))}
                          className="text-stone-400 hover:text-rose-600 text-[11px] cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Anonymity & Privacy Toggle */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-rose-700" />
                    <div>
                      <div className="text-xs font-bold text-stone-900">Mode Pelaporan Anonim</div>
                      <div className="text-[11px] text-stone-500">Identitas nama asli Anda disembunyikan</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 accent-rose-700 rounded cursor-pointer"
                  />
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200/80">
                    <input
                      type="text"
                      placeholder="Nama Lengkap Pelapor"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="No. WhatsApp / Email"
                      value={reporterContact}
                      onChange={(e) => setReporterContact(e.target.value)}
                      className="px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Security Promise */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
                <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Laporan Anda disimpan secara terlindungi di peramban pribadi Anda. Anda dapat mengunduh dokumen laporan resmi atau meneruskannya ke hotline bantuan kapan pun Anda siap.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 mt-4 border-t border-stone-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="py-2.5 px-4 text-xs font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="py-2.5 px-5 text-xs font-semibold text-white bg-rose-700 rounded-xl hover:bg-rose-800 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                Lanjutkan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="py-3 px-6 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simpan & Kunci di Brankas Aman
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
