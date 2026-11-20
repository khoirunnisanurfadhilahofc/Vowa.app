import React, { useState } from 'react';
import { SAFETY_CHECKLISTS, FIVE_D_METHODS, UU_TPKS_PROTECTIONS } from '../data/safetyGuidesData';
import { Check, ShieldCheck, Scale, AlertOctagon, HelpCircle, BookOpen } from 'lucide-react';

export const SafetyToolkit: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checklist' | '5d' | 'law'>('checklist');
  const [checklistPhase, setChecklistPhase] = useState<'sebelum' | 'perjalanan' | 'tujuan'>('sebelum');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredChecklist = SAFETY_CHECKLISTS.filter((item) => item.phase === checklistPhase);

  return (
    <section id="panduan" className="py-12 sm:py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <div className="text-xs font-semibold text-rose-800 tracking-wide uppercase mb-1">
            Panduan Mandiri & Edukasi Taktis
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Safety Toolkit & Hak Penumpang
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Langkah preventif sebelum dan saat berkendara, metode intervensi 5D bagi saksi, serta perlindungan hukum korban berdasarkan UU TPKS No. 12 Tahun 2022.
          </p>
        </div>

        {/* Primary Segmented Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Checklist Perjalanan
          </button>
          <button
            onClick={() => setActiveTab('5d')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === '5d'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Metode 5D Saksi
          </button>
          <button
            onClick={() => setActiveTab('law')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'law'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Payung Hukum UU TPKS
          </button>
        </div>

        {/* TAB 1: CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              {/* Phase sub-filter */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setChecklistPhase('sebelum')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer ${
                    checklistPhase === 'sebelum'
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 border border-transparent'
                  }`}
                >
                  1. Sebelum Naik Kendaraan
                </button>
                <button
                  onClick={() => setChecklistPhase('perjalanan')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer ${
                    checklistPhase === 'perjalanan'
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 border border-transparent'
                  }`}
                >
                  2. Di Dalam Kendaraan
                </button>
                <button
                  onClick={() => setChecklistPhase('tujuan')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer ${
                    checklistPhase === 'tujuan'
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 border border-transparent'
                  }`}
                >
                  3. Menjelang Titik Tujuan
                </button>
              </div>

              {filteredChecklist.map((item) => {
                const isChecked = Boolean(checkedItems[item.id]);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-stone-900">{item.title}</h4>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="mt-2.5 p-2.5 bg-stone-50 rounded-xl text-[11px] text-stone-700 font-medium border border-stone-200/60">
                          <span className="font-semibold text-rose-800">Saran Tindakan:</span> {item.recommendedAction}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Checklist Side Editorial Card */}
            <div className="lg:col-span-4 bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-4">
              <div className="w-full h-44 rounded-2xl overflow-hidden border border-stone-200 relative bg-stone-100">
                <img
                  src="/src/assets/images/vowa_report_guide_1792417462698.jpg"
                  alt="Panduan privasi dan dokumentasi laporan"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Dokumentasi Mandiri</span>
              </div>

              <h4 className="text-sm font-bold text-stone-900 leading-snug">
                Simpan Tangkapan Layar Pesanan Sebelum Perjalanan Selesai
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Beberapa aplikasi ride-hailing menyembunyikan plat nomor atau nomor ponsel driver setelah status perjalanan selesai. Ambil screenshot resi saat perjalanan sedang berlangsung.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: METODE 5D BYSTANDER */}
        {activeTab === '5d' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 max-w-2xl mb-4">
              Jika Anda sesama penumpang di kendaraan bersama, saksi di titik jemput, atau pengguna jalan lain yang melihat tindakan pelecehan, gunakan 5 cara aman ini tanpa membahayakan keselamatan diri:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FIVE_D_METHODS.map((item, idx) => (
                <div
                  key={item.key}
                  className="bg-white rounded-3xl p-5 border border-stone-200 hover:border-stone-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                      <span className="font-mono font-bold text-rose-700">0{idx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-stone-800">{item.shortTag}</span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900 leading-snug">
                      {item.name}
                    </h4>

                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {item.concept}
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-800">
                    <span className="text-[10px] text-stone-400 block mb-1 uppercase font-semibold tracking-wider">
                      Contoh Kalimat Praktis
                    </span>
                    <p className="italic font-medium">{item.exampleScript}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: HAK UU TPKS */}
        {activeTab === 'law' && (
          <div className="space-y-5">
            <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-xs text-rose-950">
              <span className="font-bold">Konteks Hukum Indonesia:</span> Sejak disahkannya Undang-Undang No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual (UU TPKS), pelecehan verbal, isyarat cabul non-fisik, dan kontak fisik tanpa persetujuan di dalam moda transportasi publik diakui sebagai kejahatan pidana yang dapat langsung dilaporkan tanpa membutuhkan mediasi damai yang merugikan korban.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {UU_TPKS_PROTECTIONS.map((law) => (
                <div
                  key={law.article}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-rose-700 mb-1">
                      {law.article}
                    </div>
                    <h3 className="text-base font-bold text-stone-900 mb-2">
                      {law.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {law.explanation}
                    </p>

                    <div className="my-3 py-2 px-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs font-semibold text-stone-800">
                      Sanksi: {law.penalty}
                    </div>

                    <div className="space-y-1.5 mt-3">
                      <span className="text-[11px] font-bold text-stone-700 block">Hak Korban yang Dijamin:</span>
                      {law.victimRights.map((vr, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-stone-600">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{vr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
