import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Heart,
  RefreshCw,
  MapPin,
  Globe,
  Zap,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Crosshair,
  AlertCircle,
} from 'lucide-react';
import {
  sendGeminiChat,
  ChatMode,
  ChatHistoryTurn,
  MapsGroundingSource,
  WebGroundingSource,
} from '../services/geminiService';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: ChatMode;
  modelUsed?: string;
  mapsSources?: MapsGroundingSource[];
  webSources?: WebGroundingSource[];
  isError?: boolean;
}

const ROLE_MODES: {
  id: ChatMode;
  label: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'companion',
    label: 'Pendamping',
    badge: 'Empati & Taktis',
    description: 'Ruang aman curhat & langkah perlindungan saat perjalanan',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    id: 'maps',
    label: 'Tempat Aman',
    badge: 'Google Maps',
    description: 'Cari Polsek, RS/IGD, dan halte ramai terdekat via Google Maps',
    icon: <MapPin className="w-3.5 h-3.5" />,
  },
  {
    id: 'search',
    label: 'Hukum & Info',
    badge: 'Google Search',
    description: 'Riset UU TPKS, kanal pengaduan aplikator & kebijakan terbaru',
    icon: <Globe className="w-3.5 h-3.5" />,
  },
  {
    id: 'fast',
    label: 'Aksi Cepat',
    badge: 'Flash-Lite',
    description: 'Panduan napas grounding & instruksi darurat super cepat',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  {
    id: 'chronology',
    label: 'Kronologi',
    badge: 'Draf Laporan',
    description: 'Rapikan catatan kejadian menjadi kronologi laporan terstruktur',
    icon: <FileText className="w-3.5 h-3.5" />,
  },
];

const QUICK_PROMPTS_BY_MODE: Record<ChatMode, { label: string; prompt: string }[]> = {
  companion: [
    {
      label: '🚨 Driver Mencurigakan',
      prompt:
        'Saya sedang di dalam mobil ride-hailing dan pengemudinya bertindak mencurigakan serta bertanya hal tidak pantas. Apa langkah taktis yang aman untuk saya lakukan sekarang?',
    },
    {
      label: '💬 Butuh Teman Bicara',
      prompt:
        'Saya baru saja mengalami pelecehan verbal di ojek online dan tangan saya masih gemetar. Saya merasa bingung dan takut.',
    },
  ],
  maps: [
    {
      label: '🚓 Polsek Terdekat',
      prompt:
        'Tolong carikan kantor polisi (Polsek/Polres) atau pos pengamanan terdekat dari lokasi saya saat ini.',
    },
    {
      label: '🏥 RS / IGD 24 Jam',
      prompt:
        'Di mana rumah sakit atau klinik UGD 24 jam terdekat dari lokasi saya saat ini?',
    },
    {
      label: '🏪 Tempat Ramai 24 Jam',
      prompt:
        'Carikan minimarket 24 jam, SPBU terang, atau stasiun/halte ramai terdekat agar saya bisa minta turun di sana.',
    },
  ],
  search: [
    {
      label: '⚖️ Pasal UU TPKS',
      prompt:
        'Jelaskan pasal-pasal terbaru UU No. 12 Tahun 2022 (UU TPKS) terkait pelecehan seksual non-fisik dan fisik serta hak visum gratis bagi korban.',
    },
    {
      label: '📱 Cara Lapor ke Aplikator',
      prompt:
        'Bagaimana prosedur resmi terkini melaporkan pelanggaran keselamatan pengemudi ke Gojek, Grab, Maxim, atau inDrive di Indonesia?',
    },
  ],
  fast: [
    {
      label: '🌬️ Grounding 5-4-3-2-1',
      prompt:
        'Saya panik dan sesak napas sekarang. Pandu saya grounding cepat dalam poin singkat.',
    },
    {
      label: '⚡ Checklist Turun Aman',
      prompt:
        'Berikan 4 langkah tercepat yang harus saya lakukan saat ini juga untuk turun dari kendaraan dengan aman.',
    },
  ],
  chronology: [
    {
      label: '📋 Format Kronologi Polisi',
      prompt:
        'Buatkan template kronologi kejadian pelecehan ride-hailing yang siap saya lengkapi untuk dilaporkan ke pihak berwajib dan aplikator.',
    },
    {
      label: '🧾 Bukti Wajib Disimpan',
      prompt:
        'Apa saja bukti digital dan fisik paling kuat yang harus saya kumpulkan hari ini sebelum terhapus dari aplikasi?',
    },
  ],
};

const createWelcomeMessage = (): ChatMessage => ({
  id: 'm-welcome',
  sender: 'assistant',
  text: 'Halo, saya Asisten Pendamping VOWA. Di sini adalah ruang aman yang rahasia dan tanpa penghakiman.\n\nKamu dapat memilih peran saya di atas: mencari tempat aman terdekat via **Google Maps**, riset hak hukum UU TPKS via **Google Search**, menenangkan diri cepat, atau merapikan kronologi laporan. Apa yang bisa saya bantu sekarang?',
  timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  mode: 'companion',
});

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [activeMode, setActiveMode] = useState<ChatMode>('companion');
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'ready' | 'fallback'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const detectLocation = () => {
    if (!('geolocation' in navigator)) {
      setUserLocation({ lat: -6.2088, lng: 106.8456 });
      setGpsStatus('fallback');
      return;
    }
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGpsStatus('ready');
      },
      () => {
        // Check active trip coordinates if saved, otherwise default Jakarta center
        try {
          const savedTrip = localStorage.getItem('vowa_active_trip');
          if (savedTrip) {
            const parsed = JSON.parse(savedTrip);
            if (parsed?.coords?.lat && parsed?.coords?.lng) {
              setUserLocation(parsed.coords);
              setGpsStatus('fallback');
              return;
            }
          }
        } catch {
          // ignore
        }
        setUserLocation({ lat: -6.2088, lng: 106.8456 });
        setGpsStatus('fallback');
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  // Auto-detect GPS when opening modal or switching to Google Maps mode
  useEffect(() => {
    if (isOpen && gpsStatus === 'idle') {
      detectLocation();
    }
  }, [isOpen, gpsStatus]);

  if (!isOpen) return null;

  const currentRoleInfo = ROLE_MODES.find((r) => r.id === activeMode) || ROLE_MODES[0];
  const quickPrompts = QUICK_PROMPTS_BY_MODE[activeMode];

  const handleResetChat = () => {
    setMessages([createWelcomeMessage()]);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string, overrideMode?: ChatMode) => {
    const modeToUse = overrideMode || activeMode;
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      mode: modeToUse,
    };

    // Build multi-turn conversation history excluding error/welcome turns
    const historyPayload: ChatHistoryTurn[] = messages
      .filter((m) => m.id !== 'm-welcome' && !m.isError)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    let activeTripContext: any = null;
    try {
      const rawTrip = localStorage.getItem('vowa_active_trip');
      if (rawTrip) activeTripContext = JSON.parse(rawTrip);
    } catch {
      // ignore
    }

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setLoading(true);

    try {
      const res = await sendGeminiChat({
        message: textToSend,
        history: historyPayload,
        mode: modeToUse,
        userLocation: userLocation || activeTripContext?.coords || null,
        tripContext: activeTripContext,
      });

      const assistantMsg: ChatMessage = {
        id: 'a-' + Date.now(),
        sender: 'assistant',
        text: res.text,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        mode: modeToUse,
        modelUsed: res.modelUsed,
        mapsSources: res.mapsSources,
        webSources: res.webSources,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text:
            e?.message ||
            'Maaf, terjadi kendala saat menghubungi Gemini AI. Untuk keadaan darurat segera hubungi SAPA 129 (WA: 08111-129-129) atau Polisi 110.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl h-[680px] max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 flex-wrap">
                Asisten AI VOWA
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Multi-Turn Gemini
                </span>
              </h3>
              <p className="text-xs text-stone-500">{currentRoleInfo.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              title="Mulai Percakapan Baru"
              className="text-stone-400 hover:text-stone-700 p-2 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-2 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Role / System Instruction Switcher */}
        <div className="px-3 py-2.5 bg-white border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {ROLE_MODES.map((role) => {
            const isSelected = activeMode === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveMode(role.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                }`}
              >
                {role.icon}
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* GPS Status Strip when Google Maps Grounding is selected */}
        {activeMode === 'maps' && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-900">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                {gpsStatus === 'ready' && userLocation
                  ? `GPS Terkunci (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
                  : gpsStatus === 'locating'
                  ? 'Mengambil titik GPS perangkat...'
                  : userLocation
                  ? `Lokasi Referensi (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
                  : 'Menyiapkan koordinat lokasi...'}
              </span>
            </div>
            <button
              type="button"
              onClick={detectLocation}
              className="font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <Crosshair className="w-3 h-3" />
              <span>Perbarui GPS</span>
            </button>
          </div>
        )}

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-rose-700 text-white rounded-br-none shadow-xs'
                    : m.isError
                    ? 'bg-red-50 text-red-900 rounded-bl-none border border-red-200'
                    : 'bg-white text-stone-900 rounded-bl-none border border-stone-200 shadow-xs'
                }`}
              >
                {m.isError && (
                  <div className="flex items-center gap-1.5 text-red-700 font-bold mb-1 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>Kendala Koneksi Layanan AI</span>
                  </div>
                )}

                <div>{m.text}</div>

                {/* Google Maps Grounding Links & Place Cards */}
                {m.mapsSources && m.mapsSources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-2">
                    <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Titik Lokasi Terverifikasi Google Maps:</span>
                    </div>
                    <div className="space-y-1.5">
                      {m.mapsSources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2.5 bg-emerald-50/80 hover:bg-emerald-100/80 rounded-xl border border-emerald-200 text-xs transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 font-bold text-emerald-950">
                            <span>{src.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          </div>
                          {src.snippets && src.snippets[0] && (
                            <p className="text-[11px] text-emerald-900/80 mt-1 italic">
                              "{src.snippets[0]}"
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Search Grounding Citations */}
                {m.webSources && m.webSources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-1.5">
                    <div className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Sumber Terverifikasi Google Search:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.webSources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-[11px] font-medium transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy button on assistant responses */}
                {m.sender === 'assistant' && !m.isError && m.id !== 'm-welcome' && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1 px-1">
                <span>{m.timestamp}</span>
                {m.modelUsed && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{m.modelUsed}</span>
                  </>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-stone-600 py-2 bg-white px-3.5 py-2.5 rounded-2xl border border-stone-200 w-fit shadow-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
              <span>
                {activeMode === 'maps'
                  ? 'Memeriksa lokasi terdekat via Google Maps...'
                  : activeMode === 'search'
                  ? 'Mencari referensi terkini via Google Search...'
                  : 'VOWA sedang menyusun tanggapan...'}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt buttons tailored to active role */}
        <div className="p-2.5 bg-stone-50 border-t border-stone-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(qp.prompt)}
              className="py-1.5 px-3 bg-white border border-stone-200 rounded-xl text-stone-700 hover:border-rose-300 hover:text-rose-900 whitespace-nowrap shrink-0 transition-colors cursor-pointer font-medium"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 sm:p-4 border-t border-stone-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeMode === 'maps'
                  ? 'Tanya Polsek, RS, atau titik aman terdekat...'
                  : activeMode === 'search'
                  ? 'Tanya pasal UU TPKS atau kebijakan aplikator...'
                  : 'Ketik pesan atau ceritakan situasimu...'
              }
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="h-10 px-4 bg-rose-700 text-white rounded-xl hover:bg-rose-800 disabled:opacity-50 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-stone-500 mt-2 px-1">
            <span>Peran aktif: {currentRoleInfo.label} ({currentRoleInfo.badge})</span>
            <span className="flex items-center gap-1 text-rose-800">
              <Heart className="w-3 h-3 fill-rose-600 text-rose-600" /> Kamu tidak sendiri
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
