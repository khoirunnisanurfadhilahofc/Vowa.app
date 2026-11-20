import React, { useState } from 'react';
import { Lock, Unlock, Copy, Trash2, Printer, Check, Shield, FileText, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { IncidentReport } from '../types';

interface ReportVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: IncidentReport[];
  onDeleteReport: (id: string) => void;
}

export const ReportVaultModal: React.FC<ReportVaultModalProps> = ({
  isOpen,
  onClose,
  reports,
  onDeleteReport,
}) => {
  const [pin, setPin] = useState<string>(() => localStorage.getItem('vowa_vault_pin') || '');
  const [enteredPin, setEnteredPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => !localStorage.getItem('vowa_vault_pin'));
  const [pinError, setPinError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === pin) {
      setIsUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSetNewPin = (newPin: string) => {
    if (newPin.length === 4) {
      localStorage.setItem('vowa_vault_pin', newPin);
      setPin(newPin);
      setIsUnlocked(true);
    }
  };

  const handleRemovePin = () => {
    localStorage.removeItem('vowa_vault_pin');
    setPin('');
    setIsUnlocked(true);
  };

  const generateOfficialReportText = (rep: IncidentReport) => {
    return `=== DOKUMEN LAPORAN RESMI INSIDEN TRANSPORTASI (VOWA) ===
Nomor Laporan: ${rep.id}
Waktu Kejadian: ${rep.incidentDate} pukul ${rep.incidentTime} WIB
Layanan: ${rep.serviceProvider} (${rep.vehicleType})
Nomor Plat Kendaraan: ${rep.licensePlate}
Nama Pengemudi: ${rep.driverName}
Rute Perjalanan: ${rep.pickupLocation} menuju ${rep.destinationLocation}
Bentuk Kejadian: ${rep.incidentCategories.join(', ')}
Status Identitas: ${rep.isAnonymous ? 'Anonim (Dilindungi UU TPKS)' : `${rep.reporterName} (${rep.reporterContact})`}

KRONOLOGI PERISTIWA:
${rep.chronologySummary || rep.description}

Catatan Tambahan:
Laporan ini didokumentasikan melalui platform VOWA untuk keperluan penyelidikan resmi customer safety aplikator dan pendampingan bantuan hukum UU No. 12 Tahun 2022.
==========================================================`;
  };

  const handleCopy = (rep: IncidentReport) => {
    const text = generateOfficialReportText(rep);
    navigator.clipboard.writeText(text);
    setCopiedId(rep.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = (rep: IncidentReport) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Insiden - ${rep.id}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1c1917; line-height: 1.6; }
            h1 { font-size: 20px; border-bottom: 2px solid #e11d48; padding-bottom: 8px; }
            .meta { margin: 20px 0; background: #fafaf9; border: 1px solid #e7e5e4; padding: 16px; border-radius: 8px; }
            .meta p { margin: 4px 0; font-size: 14px; }
            .kronologi { white-space: pre-wrap; font-size: 14px; background: #fff; padding: 16px; border: 1px solid #e7e5e4; border-radius: 8px; }
            .footer { margin-top: 40px; font-size: 12px; color: #78716c; border-top: 1px solid #e7e5e4; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>VOWA — Berkas Laporan Insiden Penumpang</h1>
          <div class="meta">
            <p><strong>ID Laporan:</strong> ${rep.id}</p>
            <p><strong>Waktu & Tanggal:</strong> ${rep.incidentDate} (${rep.incidentTime} WIB)</p>
            <p><strong>Aplikasi / Layanan:</strong> ${rep.serviceProvider} - ${rep.vehicleType}</p>
            <p><strong>No. Plat:</strong> ${rep.licensePlate}</p>
            <p><strong>Pengemudi:</strong> ${rep.driverName}</p>
            <p><strong>Rute:</strong> ${rep.pickupLocation} &rarr; ${rep.destinationLocation}</p>
            <p><strong>Kategori:</strong> ${rep.incidentCategories.join(', ')}</p>
            <p><strong>Privasi:</strong> ${rep.isAnonymous ? 'Anonim (Dilindungi UU TPKS)' : rep.reporterName}</p>
          </div>
          <h3>Kronologi Kejadian:</h3>
          <div class="kronologi">${rep.chronologySummary || rep.description}</div>
          <div class="footer">
            Dokumen ini diarsipkan secara mandiri oleh korban di platform perlindungan VOWA (Your Voice, Your Safety).
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
              <Shield className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Brankas Laporan Tersimpan</h2>
              <p className="text-xs text-stone-500">Arsip aman mandiri di memori peramban Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* PIN Lock Screen if locked */}
        {!isUnlocked ? (
          <form onSubmit={handleUnlock} className="py-10 text-center max-w-sm mx-auto space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Masukkan 4-Digit PIN Brankas</h3>
            <p className="text-xs text-stone-500">
              Brankas ini dilindungi PIN pribadi agar laporan rahasia Anda tidak dapat dibaca orang lain yang memegang ponsel.
            </p>

            <input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError(false);
              }}
              placeholder="••••"
              className="w-36 text-center text-2xl tracking-widest font-mono py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-600"
              autoFocus
            />

            {pinError && (
              <p className="text-xs text-rose-600 font-medium">PIN salah. Silakan coba kembali.</p>
            )}

            <div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer"
              >
                Buka Brankas
              </button>
            </div>
          </form>
        ) : (
          <div className="py-4 space-y-6">
            {/* PIN Settings banner */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>
                  {pin ? 'Kunci PIN aktif (4-digit)' : 'Kunci PIN belum diaktifkan'}
                </span>
              </div>
              {pin ? (
                <button
                  onClick={handleRemovePin}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-800 cursor-pointer"
                >
                  Nonaktifkan PIN
                </button>
              ) : (
                <button
                  onClick={() => {
                    const p = prompt('Buat 4-digit PIN baru untuk brankas ini:');
                    if (p && p.length === 4) handleSetNewPin(p);
                  }}
                  className="text-[11px] font-semibold text-rose-700 hover:text-rose-800 cursor-pointer"
                >
                  Pasang PIN Baru
                </button>
              )}
            </div>

            {/* List of reports */}
            {reports.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <FileText className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-sm font-semibold text-stone-700">Belum Ada Laporan Tersimpan</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Semua insiden yang Anda laporkan lewat formulir akan tersimpan dengan aman di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((rep) => {
                  const isExpanded = expandedId === rep.id;
                  return (
                    <div
                      key={rep.id}
                      className="border border-stone-200 rounded-2xl p-4 bg-white hover:border-stone-300 transition-all shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                            <span>{rep.incidentDate}</span>
                            <span aria-hidden="true">·</span>
                            <span>{rep.incidentTime} WIB</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-rose-700">{rep.serviceProvider}</span>
                          </div>
                          <h4 className="text-sm font-bold text-stone-900">
                            {rep.licensePlate} · Driver: {rep.driverName}
                          </h4>
                          <p className="text-xs text-stone-600 mt-1">
                            {rep.pickupLocation} &rarr; {rep.destinationLocation}
                          </p>
                          <div className="mt-2 text-[11px] text-stone-500">
                            Kategori: {rep.incidentCategories.join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleCopy(rep)}
                            title="Salin Teks Resmi"
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedId === rep.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handlePrint(rep)}
                            title="Cetak Berkas"
                            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Yakin ingin menghapus dokumen laporan ini dari brankas?')) {
                                onDeleteReport(rep.id);
                              }
                            }}
                            title="Hapus"
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable full narrative */}
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : rep.id)}
                          className="flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-800 cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              Tutup Rincian Kronologi <ChevronUp className="w-3.5 h-3.5" />
                            </>
                          ) : (
                            <>
                              Lihat Rincian Kronologi Lengkap <ChevronDown className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 p-3 bg-stone-50 rounded-xl text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans border border-stone-200/70">
                            {rep.chronologySummary || rep.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
