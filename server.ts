import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ChatMode = 'companion' | 'fast' | 'maps' | 'search' | 'chronology';

interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

interface MapsGroundingSource {
  title: string;
  uri: string;
  snippets?: string[];
}

interface WebGroundingSource {
  title: string;
  uri: string;
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSystemInstruction(mode: ChatMode, tripContext?: any): string {
  const baseInstruction = `Kamu adalah Asisten Pendamping VOWA (Your Voice, Your Safety), ruang aman digital bagi penumpang ride-hailing di Indonesia yang mengalami atau mewaspadai pelecehan (verbal, non-fisik, fisik) maupun ancaman keselamatan perjalanan.
Prinsip mutlak:
1. Trauma-informed & bebas victim-blaming (tidak pernah menyalahkan pakaian, jam pulang, atau pilihan penumpang).
2. Tenang, hangat, empatik, terstruktur, dan langsung membantu keselamatan.
3. Gunakan Bahasa Indonesia yang jelas, ramah, dan menenangkan.
4. Selalu sertakan pengingat saluran darurat resmi (Polisi 110, SAPA 129 KemenPPPA via WA 08111-129-129) jika situasi terdengar mengancam nyawa atau mendesak.`;

  let roleSpecific = '';
  switch (mode) {
    case 'fast':
      roleSpecific = `\nPeran Khusus (Mode Cepat / Stabilisasi Darurat):
Berikan respons sangat singkat, taktis, dalam poin-poin bernomor yang mudah dibaca cepat saat berada dalam situasi panik atau kendaraan berjalan. Pandu teknik pernapasan 4-4-4 / grounding 5-4-3-2-1 atau langkah melarikan diri yang aman.`;
      break;
    case 'maps':
      roleSpecific = `\nPeran Khusus (Navigator Tempat Aman via Google Maps):
Gunakan data Google Maps yang akurat untuk merekomendasikan titik aman terdekat dari lokasi pengguna saat ini (misalnya Kantor Polisi/Polsek/Polres, Rumah Sakit/IGD 24 jam, minimarket terang 24 jam, SPBU, atau stasiun/halte ramai). Sertakan nama tempat, estimasi jarak/arah bila tersedia, dan anjuran praktis agar pengguna bisa meminta driver turun di titik terang & ramai tersebut.`;
      break;
    case 'search':
      roleSpecific = `\nPeran Khusus (Riset Hukum UU TPKS & Informasi Terkini via Google Search):
Gunakan penelusuran Google Search untuk memberikan informasi terkini dan akurat mengenai payung hukum UU No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual (UU TPKS), prosedur pengaduan resmi aplikator ride-hailing (Gojek, Grab, Maxim, inDrive), kontak lembaga bantuan hukum (LBH APIK, Komnas Perempuan, UPTD PPA), serta hak-hak korban (visum gratis, kerahasiaan identitas, restitusi).`;
      break;
    case 'chronology':
      roleSpecific = `\nPeran Khusus (Penyusun Kronologi Kejadian Resmi):
Bantu pengguna menyusun cerita yang masih berantakan menjadi draf "KRONOLOGI KEJADIAN RESMI (VOWA)" yang objektif, faktual, dan runut waktu:
1. Waktu & Tanggal
2. Platform & Identitas Kendaraan/Pengemudi
3. Rute Perjalanan (Jemput -> Tujuan)
4. Rangkaian Peristiwa Kronologis
5. Tindakan Penumpang & Saksi
6. Rekomendasi Bukti yang Harus Disimpan`;
      break;
    case 'companion':
    default:
      roleSpecific = `\nPeran Khusus (Pendamping Ruang Aman & Konsultasi Taktis):
Dengarkan pengguna dengan penuh empati, validasi perasaannya, dan tawarkan langkah keselamatan praktis atau edukasi hak korban sesuai konteks percakapan sebelumnya.`;
      break;
  }

  let tripNote = '';
  if (tripContext && typeof tripContext === 'object') {
    tripNote = `\n\nKonteks Perjalanan SafeRide Pengguna Saat Ini (gunakan hanya jika relevan dengan pertanyaan pengguna):
- Platform: ${tripContext.serviceProvider || '-'} (${tripContext.vehicleType || '-'})
- Plat Nomor: ${tripContext.licensePlate || '-'}
- Nama Driver: ${tripContext.driverName || '-'}
- Rute: ${tripContext.pickupLocation || '-'} -> ${tripContext.destinationLocation || '-'}
- Status Rute: ${tripContext.isDeviated ? 'PERINGATAN: Rute Terdeteksi Menyimpang' : 'Normal'}`;
  }

  return `${baseInstruction}${roleSpecific}${tripNote}`;
}

function extractGroundingMetadata(response: any): {
  mapsSources: MapsGroundingSource[];
  webSources: WebGroundingSource[];
} {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const mapsSources: MapsGroundingSource[] = [];
  const webSources: WebGroundingSource[] = [];
  const seenMapsUris = new Set<string>();
  const seenWebUris = new Set<string>();

  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      if (chunk?.maps?.uri && !seenMapsUris.has(chunk.maps.uri)) {
        seenMapsUris.add(chunk.maps.uri);
        const rawSnippets = chunk.maps.placeAnswerSources?.reviewSnippets;
        const snippets = Array.isArray(rawSnippets)
          ? rawSnippets
              .map((s: any) => s?.content || s?.text || s?.snippet || '')
              .filter((t: string) => Boolean(t && t.trim()))
          : undefined;
        mapsSources.push({
          title: chunk.maps.title || 'Lokasi Google Maps',
          uri: chunk.maps.uri,
          snippets: snippets && snippets.length > 0 ? snippets : undefined,
        });
      }
      if (chunk?.web?.uri && !seenWebUris.has(chunk.web.uri)) {
        seenWebUris.add(chunk.web.uri);
        webSources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
        });
      }
    }
  }

  return { mapsSources, webSources };
}

function mapGeminiError(error: any): { status: number; message: string } {
  const status = error?.status || error?.statusCode || 500;
  const rawMsg = String(error?.message || 'Unknown Gemini API error');

  if (status === 403 || rawMsg.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message: 'Akses Gemini API ditolak. Periksa kunci API pada panel Settings > Secrets.',
    };
  }
  if (status === 429 || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Kuota permintaan Gemini API sedang penuh sementara. Silakan coba beberapa saat lagi.',
    };
  }
  if (status === 400 || rawMsg.includes('API_KEY_INVALID')) {
    return {
      status: 400,
      message: 'Permintaan atau kunci API Gemini tidak valid. Periksa panel Settings > Secrets.',
    };
  }
  return {
    status: typeof status === 'number' && status >= 400 && status < 600 ? status : 500,
    message: `Terjadi kendala saat menghubungi layanan Gemini: ${rawMsg}`,
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasMapsKey: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY),
    });
  });

  // Expose Google Maps JS SDK key safely for client map initialization
  app.get('/api/maps/config', (_req, res) => {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    res.json({ apiKey });
  });

  // Multi-turn Gemini Chatbot with System Instruction, Conversation History, Maps Grounding & Search Grounding
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        message,
        history = [],
        mode = 'companion',
        userLocation,
        tripContext,
      }: {
        message: string;
        history?: ChatHistoryTurn[];
        mode?: ChatMode;
        userLocation?: { lat: number; lng: number } | null;
        tripContext?: any;
      } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Kunci API Gemini belum dikonfigurasi pada Secrets.',
        });
      }

      const systemInstruction = buildSystemInstruction(mode, tripContext);
      const formattedHistory = Array.isArray(history)
        ? history
            .filter((h) => h && (h.role === 'user' || h.role === 'model') && typeof h.text === 'string' && h.text.trim())
            .slice(-20)
            .map((h) => ({
              role: h.role,
              parts: [{ text: h.text }],
            }))
        : [];

      let model = 'gemini-4-hydrogen';
      const config: any = {
        systemInstruction,
      };

      if (mode === 'fast') {
        model = 'gemini-3.1-flash-lite';
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
      } else if (mode === 'maps') {
        model = 'gemini-4-hydrogen';
        config.tools = [{ googleMaps: {} }];
        if (
          userLocation &&
          typeof userLocation.lat === 'number' &&
          typeof userLocation.lng === 'number'
        ) {
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.lat,
                longitude: userLocation.lng,
              },
            },
          };
        }
      } else if (mode === 'search') {
        model = 'gemini-4-hydrogen';
        config.tools = [{ googleSearch: {} }];
      } else if (mode === 'chronology') {
        model = 'gemini-4-hydrogen';
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      } else {
        model = 'gemini-4-hydrogen';
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.MEDIUM };
      }

      const chat = ai.chats.create({
        model,
        history: formattedHistory,
        config,
      });

      const response = await chat.sendMessage({
        message: message.trim(),
      });

      const responseText =
        response.text ||
        'Maaf, asisten tidak menghasilkan jawaban teks. Silakan ulangi pertanyaanmu.';
      const { mapsSources, webSources } = extractGroundingMetadata(response);

      res.json({
        text: responseText,
        modelUsed: model,
        mapsSources,
        webSources,
      });
    } catch (error: any) {
      console.error('Gemini Chat API Error:', error);
      const mapped = mapGeminiError(error);
      res.status(mapped.status).json({
        error: mapped.message,
      });
    }
  });

  // Google Maps Grounding Safe Haven Finder for SafeRide Tracker
  app.post('/api/gemini/safe-havens', async (req, res) => {
    try {
      const {
        lat,
        lng,
        category = 'police',
      }: {
        lat: number;
        lng: number;
        category?: 'police' | 'hospital' | 'public';
      } = req.body;

      if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ error: 'Koordinat lokasi GPS diperlukan.' });
      }

      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Kunci API Gemini belum dikonfigurasi pada Secrets.',
        });
      }

      const queryMap: Record<string, string> = {
        police:
          'Temukan 4 kantor polisi (Polsek, Polres, atau Pos Polisi) terdekat dari koordinat saya saat ini yang dapat dituju untuk perlindungan darurat penumpang.',
        hospital:
          'Temukan 4 rumah sakit atau klinik UGD/IGD 24 jam terdekat dari koordinat saya saat ini untuk pertolongan medis atau visum.',
        public:
          'Temukan 4 titik umum yang ramai, terang, dan buka 24 jam (seperti minimarket besar, SPBU, atau stasiun/halte utama) terdekat dari lokasi saya untuk tempat turun yang aman.',
      };

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: queryMap[category] || queryMap.police,
        config: {
          systemInstruction:
            'Berikan daftar tempat aman terdekat secara singkat dan akurat dalam Bahasa Indonesia berdasarkan Google Maps. Sebutkan nama tempat, perkiraan arah/lokasi, dan tips singkat agar penumpang bisa aman menuju ke sana.',
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng,
              },
            },
          },
        },
      });

      const { mapsSources } = extractGroundingMetadata(response);
      res.json({
        text: response.text || '',
        mapsSources,
      });
    } catch (error: any) {
      console.error('Gemini Safe Havens Error:', error);
      const mapped = mapGeminiError(error);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  // Legacy / single-shot guidance & report chronology helper (used by ReportFormModal)
  app.post('/api/gemini/guidance', async (req, res) => {
    try {
      const { prompt, mode, incidentData } = req.body;

      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({
          error: 'Layanan AI belum dikonfigurasi. Kunci API Gemini tidak ditemukan.',
        });
      }

      const mappedMode: ChatMode =
        mode === 'chronology'
          ? 'chronology'
          : mode === 'legal'
          ? 'search'
          : mode === 'grounding'
          ? 'fast'
          : 'companion';

      const systemInstruction = buildSystemInstruction(mappedMode);

      let userContent = prompt || '';
      if (incidentData) {
        userContent += `\n\nDetail Insiden:\n${JSON.stringify(incidentData, null, 2)}`;
      }

      const response = await ai.models.generateContent({
        model: mappedMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen',
        contents: userContent || 'Halo VOWA, saya butuh bantuan panduan keselamatan.',
        config: {
          systemInstruction,
          ...(mappedMode === 'search' ? { tools: [{ googleSearch: {} }] } : {}),
        },
      });

      const { webSources } = extractGroundingMetadata(response);
      const responseText =
        response.text ||
        'Maaf, tidak dapat memproses jawaban saat ini. Silakan gunakan panduan darurat yang tersedia.';
      res.json({ text: responseText, webSources });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      const mapped = mapGeminiError(error);
      res.status(mapped.status).json({
        error: mapped.message,
      });
    }
  });

  // Attach Vite middleware in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VOWA server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
