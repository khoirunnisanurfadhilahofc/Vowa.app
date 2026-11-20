export type ChatMode = 'companion' | 'fast' | 'maps' | 'search' | 'chronology';

export interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

export interface MapsGroundingSource {
  title: string;
  uri: string;
  snippets?: string[];
}

export interface WebGroundingSource {
  title: string;
  uri: string;
}

export interface GeminiChatRequest {
  message: string;
  history: ChatHistoryTurn[];
  mode: ChatMode;
  userLocation?: { lat: number; lng: number } | null;
  tripContext?: any;
}

export interface GeminiChatResponse {
  text: string;
  modelUsed?: string;
  mapsSources?: MapsGroundingSource[];
  webSources?: WebGroundingSource[];
  error?: string;
}

export interface SafeHavensResponse {
  text: string;
  mapsSources: MapsGroundingSource[];
  error?: string;
}

export interface GeminiGuidanceRequest {
  prompt: string;
  mode?: 'chronology' | 'legal' | 'grounding' | 'general';
  incidentData?: any;
}

export interface GeminiGuidanceResponse {
  text: string;
  webSources?: WebGroundingSource[];
  error?: string;
}

export async function sendGeminiChat(req: GeminiChatRequest): Promise<GeminiChatResponse> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Layanan AI merespons dengan status ${res.status}`);
  }

  return {
    text: data.text || 'Tidak ada tanggapan yang dihasilkan.',
    modelUsed: data.modelUsed,
    mapsSources: data.mapsSources || [],
    webSources: data.webSources || [],
  };
}

export async function findSafeHavens(
  lat: number,
  lng: number,
  category: 'police' | 'hospital' | 'public'
): Promise<SafeHavensResponse> {
  const res = await fetch('/api/gemini/safe-havens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lat, lng, category }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Gagal mencari lokasi aman (${res.status})`);
  }

  return {
    text: data.text || '',
    mapsSources: data.mapsSources || [],
  };
}

export async function getSafetyGuidance(
  req: GeminiGuidanceRequest
): Promise<GeminiGuidanceResponse> {
  try {
    const res = await fetch('/api/gemini/guidance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.text || 'Tidak ada tanggapan yang dihasilkan.',
      webSources: data.webSources || [],
    };
  } catch (err: any) {
    console.warn('API error, providing supportive offline response:', err);

    if (req.mode === 'grounding') {
      return {
        text: `Napas pelan-pelan bersama VOWA:\n\n1. Tarik napas lembut lewat hidung selama 4 hitungan...\n2. Tahan sejenak selama 4 hitungan...\n3. Hembuskan perlahan lewat mulut selama 4 hitungan.\n\nSekarang perhatikan sekelilingmu: Sebutkan 5 benda yang kamu lihat di luar kaca, 4 benda yang bisa kamu sentuh, 3 suara yang terdengar, 2 aroma, dan 1 hal positif tentang dirimu. Kamu berada di ruang aman sekarang.`,
      };
    } else if (req.mode === 'legal') {
      return {
        text: `Berdasarkan UU No. 12 Tahun 2022 (UU TPKS):\n\n1. Anda berhak atas perlindungan identitas penuh (Pasal 66 & 70).\n2. Pelecehan verbal/non-fisik (Pasal 5) dan fisik (Pasal 6) merupakan tindak pidana murni dengan ancaman sanksi pidana.\n3. Hak pemulihan medis, visum gratis, dan pendampingan psikologis dijamin oleh negara.\n4. Segera simpan tangkapan layar perjalanan, plat nomor, dan hubungi SAPA 129 (WA: 08111-129-129) atau LBH APIK (WA: 0813-8882-2669).`,
      };
    } else if (req.mode === 'chronology') {
      return {
        text: `Draft Panduan Kronologi:\n\n• Waktu & Layanan: Cantumkan jam pesanan, nama aplikasi, nama pengemudi, dan no. plat.\n• Lokasi: Titik penjemputan awal, rute yang dilalui, titik insiden terjadi.\n• Uraian Kejadian: Deskripsikan secara objektif perkataan atau tindakan pengemudi tanpa menyalahkan diri sendiri.\n• Tindakan Korban: Tindakan yang Anda lakukan (misal: menegur, meminta turun, menghubungi kerabat).\n• Lampiran: Tangkapan layar pesanan, foto identitas driver, rekaman percakapan jika ada.`,
      };
    }

    return {
      text: 'Kami di sini mendengarkanmu. Ceritakan apa yang kamu rasakan atau alami, dan kami akan membantu mengarahkan langkah aman yang tepat untukmu.',
    };
  }
}
