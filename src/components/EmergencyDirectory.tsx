import React, { useState } from 'react';
import { DIRECTORY_DATA } from '../data/directoryData';
import { Phone, MessageSquare, ExternalLink, Search, Clock, MapPin } from 'lucide-react';

export const EmergencyDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = [
    'Semua',
    'Resmi Pemerintah',
    'Bantuan Hukum (LBH)',
    'Konseling Psikologis',
    'Hotline Aplikator',
    'Polisi & Medis',
  ];

  const filteredData = DIRECTORY_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="direktori" className="py-12 sm:py-16 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-rose-800 tracking-wide uppercase mb-1">
              Pusat Tanggap Darurat & Layanan Pendampingan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Direktori Bantuan Terverifikasi
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-xl">
              Saluran resmi negara, lembaga bantuan hukum gratis (pro bono), dan psikolog trauma-informed yang siap mendampingi korban pelecehan.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari hotline, kota, atau layanan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-rose-600"
            />
          </div>
        </div>

        {/* Category Filter Tabs (functional segmented buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-3.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-700 text-white shadow-xs font-semibold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Helpline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.map((item) => {
            const cleanPhone = item.phone.replace(/[^0-9]/g, '');
            const cleanWa = item.whatsapp ? item.whatsapp.replace(/[^0-9]/g, '') : null;
            const intlWa = cleanWa && (cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-stone-200 hover:border-stone-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Clean unboxed metadata with dot separators */}
                  <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                    <span className="font-semibold text-rose-700">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.badgeText}</span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    {item.name}
                  </h3>

                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-stone-500 border-t border-stone-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{item.serviceHours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{item.area}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    <span>Telepon ({item.phone})</span>
                  </a>

                  {intlWa && (
                    <a
                      href={`https://wa.me/${intlWa}?text=Halo%20${encodeURIComponent(item.name)},%20saya%20membutuhkan%20informasi%20bantuan%20dan%20pendampingan%20terkait%20insiden%20pelecehan%20di%20transportasi.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      title="Kirim Pesan WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WA</span>
                    </a>
                  )}

                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 border border-stone-200 hover:border-stone-400 rounded-xl text-stone-600 hover:text-stone-900 transition-colors"
                      title="Buka Website Resmi"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredData.length === 0 && (
          <div className="py-12 text-center text-xs text-stone-500">
            Tidak ditemukan kontak yang sesuai kata kunci "{searchQuery}".
          </div>
        )}
      </div>
    </section>
  );
};
