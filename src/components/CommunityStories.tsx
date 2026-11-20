import React, { useState } from 'react';
import { COMMUNITY_STORIES } from '../data/communityStoriesData';
import { CommunityStory, ServiceProvider } from '../types';
import { Heart, Plus, Shield, MessageCircle, AlertTriangle } from 'lucide-react';

export const CommunityStories: React.FC = () => {
  const [stories, setStories] = useState<CommunityStory[]>(() => {
    const saved = localStorage.getItem('vowa_community_stories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return COMMUNITY_STORIES;
  });

  const [huggedMap, setHuggedMap] = useState<Record<string, boolean>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // New Story Form State
  const [nickname, setNickname] = useState('');
  const [city, setCity] = useState('');
  const [serviceProvider, setServiceProvider] = useState<ServiceProvider>('Gojek');
  const [category, setCategory] = useState<'Waspada Modus' | 'Kisah Solidaritas' | 'Tips Bertindak' | 'Pemulihan Diri'>('Waspada Modus');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [takeaway, setTakeaway] = useState('');

  const handleHug = (id: string) => {
    if (huggedMap[id]) return;

    setStories((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          return { ...s, supportHugs: s.supportHugs + 1 };
        }
        return s;
      });
      localStorage.setItem('vowa_community_stories', JSON.stringify(updated));
      return updated;
    });

    setHuggedMap((prev) => ({ ...prev, [id]: true }));
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) return;

    const newStoryItem: CommunityStory = {
      id: 'story-' + Date.now(),
      authorNickname: nickname.trim() || 'Teman_Anonim',
      city: city.trim() || 'Indonesia',
      timeAgo: 'Baru saja',
      serviceProvider,
      category,
      title,
      story,
      takeaway: takeaway || 'Saling jaga dan prioritaskan keselamatan diri.',
      supportHugs: 1,
    };

    const updated = [newStoryItem, ...stories];
    setStories(updated);
    localStorage.setItem('vowa_community_stories', JSON.stringify(updated));

    // Reset & close
    setNickname('');
    setCity('');
    setTitle('');
    setStory('');
    setTakeaway('');
    setIsShareModalOpen(false);
  };

  return (
    <section id="komunitas" className="py-12 sm:py-16 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-rose-800 tracking-wide uppercase mb-1">
              Ruang Solidaritas & Validasi
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Lingkaran Suara Penumpang
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-xl">
              Pengalaman nyata, peringatan modus operandi, dan dukungan tanpa menghakimi. Suara Anda berharga untuk melindungi sesama penumpang.
            </p>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="py-2.5 px-4 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Bagikan Cerita / Waspada</span>
          </button>
        </div>

        {/* Visual Editorial Spotlight */}
        <div className="mb-10 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 rounded-2xl overflow-hidden h-52 bg-stone-100 border border-stone-200">
            <img
              src="/src/assets/images/vowa_community_support_1792417462278.jpg"
              alt="Komunitas lingkaran dukungan sebaya di Indonesia"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="md:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <Shield className="w-4 h-4 text-rose-700" />
              <span>Etika Ruang Aman VOWA</span>
              <span aria-hidden="true">·</span>
              <span>Zero Victim Blaming</span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 leading-snug">
              "Pelecehan adalah 100% kesalahan pelaku, tidak pernah karena pakaian, jam pulang, atau pilihan transportasimu."
            </h3>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              Semua cerita disaring secara anonim. Jika Anda merasakan ketidaknyamanan emosional saat membaca cerita tertentu, Anda dapat mengambil jeda dan mengakses fitur pernapasan di Asisten VOWA.
            </p>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((item) => {
            const hasHugged = Boolean(huggedMap[item.id]);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-stone-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Clean unboxed metadata with dot separators */}
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800">{item.authorNickname}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.city}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-rose-700 font-semibold">{item.serviceProvider}</span>
                    </div>
                    <span>{item.timeAgo}</span>
                  </div>

                  <span className="text-[11px] font-semibold text-rose-800">
                    {item.category}
                  </span>

                  <h3 className="text-base font-bold text-stone-900 mt-1 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-stone-600 mt-3 leading-relaxed whitespace-pre-wrap">
                    {item.story}
                  </p>

                  <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs text-stone-800">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block mb-0.5">
                      Pesan untuk Rekan Penumpang:
                    </span>
                    <p className="italic">{item.takeaway}</p>
                  </div>
                </div>

                {/* Bottom interactive hug counter */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">
                    {item.supportHugs} orang memberi peluk dukungan
                  </span>

                  <button
                    onClick={() => handleHug(item.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      hasHugged
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        hasHugged ? 'fill-rose-700 text-rose-700' : 'text-stone-500'
                      }`}
                    />
                    <span>{hasHugged ? 'Sudah Dipeluk' : 'Kirim Peluk Dukungan'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Modal Dialog */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Bagikan Pengalaman / Waspada</h3>
                <p className="text-xs text-stone-500">Kisah Anda akan diterbitkan secara anonim</p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-2 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStory} className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Nama Samaran (Nickname)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Contoh: Bunga_Jaksel"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Kota Domisili
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Surabaya"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Aplikasi Terkait
                  </label>
                  <select
                    value={serviceProvider}
                    onChange={(e) => setServiceProvider(e.target.value as ServiceProvider)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  >
                    <option value="Gojek">Gojek</option>
                    <option value="Grab">Grab</option>
                    <option value="Maxim">Maxim</option>
                    <option value="inDrive">inDrive</option>
                    <option value="Taksi / Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    Kategori Cerita
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none"
                  >
                    <option value="Waspada Modus">Waspada Modus</option>
                    <option value="Kisah Solidaritas">Kisah Solidaritas</option>
                    <option value="Tips Bertindak">Tips Bertindak</option>
                    <option value="Pemulihan Diri">Pemulihan Diri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Judul Cerita / Peringatan
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ringkasan singkat apa yang terjadi..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Uraian Pengalaman
                </label>
                <textarea
                  required
                  rows={4}
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Ceritakan kejadiannya secara objektif..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Pesan atau Solusi untuk Teman Lain
                </label>
                <input
                  type="text"
                  value={takeaway}
                  onChange={(e) => setTakeaway(e.target.value)}
                  placeholder="Tips atau kata penyemangat..."
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="py-2 px-4 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Terbitkan di Lingkaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
