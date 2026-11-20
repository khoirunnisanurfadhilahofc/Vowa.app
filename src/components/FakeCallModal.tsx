import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, Volume2, User, Clock, AlertCircle } from 'lucide-react';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ isOpen, onClose }) => {
  const [callerName, setCallerName] = useState('Papa');
  const [selectedDelay, setSelectedDelay] = useState<number>(0); // 0 = now
  const [countdown, setCountdown] = useState<number | null>(null);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<any>(null);

  // Synthesize realistic phone ring sound using Web Audio API
  const playRingTone = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 440; // Indonesian standard ring tone frequency
      osc2.frequency.value = 480;

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.6);
      osc2.stop(ctx.currentTime + 1.6);
    } catch (e) {
      console.warn('Web Audio playback failed or blocked:', e);
    }
  };

  // Play simulated speech when call connects
  const speakSimulatedCaller = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Halo? Kamu sudah sampai mana? Aku sudah di depan gerbang lobi, sama sekuriti juga sudah nungguin. Buruan ya, mobilnya langsung parkir depan saja.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startFakeCall = () => {
    if (selectedDelay === 0) {
      setCallState('ringing');
    } else {
      setCountdown(selectedDelay);
    }
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCountdown(null);
      setCallState('ringing');
    }
  }, [countdown]);

  useEffect(() => {
    if (callState === 'ringing') {
      playRingTone();
      ringIntervalRef.current = setInterval(playRingTone, 3200);
    } else {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
        ringIntervalRef.current = null;
      }
    }
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    };
  }, [callState]);

  useEffect(() => {
    let timer: any = null;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      speakSimulatedCaller();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState]);

  const handleAnswer = () => {
    setCallState('connected');
    setCallDuration(0);
  };

  const handleDecline = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('idle');
    setCallDuration(0);
    setCountdown(null);
    onClose();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Configuration state */}
      {callState === 'idle' && (
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-lg font-bold text-stone-900">Panggilan Tiruan (Fake Call)</h3>
              <p className="text-xs text-stone-500 mt-0.5">Membantu memberi kesan pihak ketiga sedang menunggu Anda</p>
            </div>
            <button
              onClick={handleDecline}
              className="text-stone-400 hover:text-stone-600 p-2 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Nama Kontak Pemanggil
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {['Papa', 'Ibu', 'Kak Dimas (Polisi)'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCallerName(name)}
                    className={`py-2 px-3 text-xs rounded-xl border text-center transition-colors cursor-pointer ${
                      callerName === name
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="Atau ketik nama kustom..."
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Waktu Panggilan Masuk
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Sekarang', val: 0 },
                  { label: '10 Detik', val: 10 },
                  { label: '30 Detik', val: 30 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelectedDelay(item.val)}
                    className={`py-2.5 px-3 text-xs rounded-xl border text-center transition-colors cursor-pointer ${
                      selectedDelay === item.val
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {countdown !== null && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
                <div className="text-xs text-amber-900">
                  Ponsel akan berdering dalam <strong>{countdown} detik</strong>. Letakkan ponsel di genggaman Anda.
                </div>
              </div>
            )}

            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs text-stone-600 space-y-1">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Tips Penggunaan di Kendaraan:
              </span>
              <p>
                Ketika panggilan berdering, angkat dengan santai dan katakan dengan lantang: <em>"Halo Pa, ini sudah dekat gerbang. Teman-teman sekuriti udah kumpul kan? Oke siap."</em>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleDecline}
              className="flex-1 py-3 px-4 text-xs font-semibold text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={startFakeCall}
              className="flex-1 py-3 px-4 text-xs font-semibold text-white bg-rose-700 rounded-xl hover:bg-rose-800 transition-colors shadow-sm cursor-pointer"
            >
              {selectedDelay === 0 ? 'Mulai Dering Sekarang' : `Pasang Timer (${selectedDelay}s)`}
            </button>
          </div>
        </div>
      )}

      {/* Realistic Ringing Screen */}
      {callState === 'ringing' && (
        <div className="w-full max-w-sm h-[580px] bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative border border-stone-800">
          <div className="text-center pt-8">
            <div className="w-24 h-24 mx-auto bg-stone-800 rounded-full flex items-center justify-center mb-4 border-2 border-stone-700 animate-pulse">
              <User className="w-12 h-12 text-stone-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{callerName}</h2>
            <p className="text-sm text-rose-400 font-medium mt-1 animate-pulse">Panggilan Masuk...</p>
            <p className="text-xs text-stone-500 mt-1">Ponsel Seluler</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-around pb-8 px-4">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleDecline}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs text-stone-400">Tolak</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleAnswer}
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white shadow-lg animate-bounce active:scale-95 transition-transform cursor-pointer"
              >
                <Phone className="w-7 h-7" />
              </button>
              <span className="text-xs text-stone-400">Terima</span>
            </div>
          </div>
        </div>
      )}

      {/* Realistic Connected In-Call Screen */}
      {callState === 'connected' && (
        <div className="w-full max-w-sm h-[580px] bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative border border-stone-800">
          <div className="text-center pt-8">
            <div className="w-20 h-20 mx-auto bg-stone-800 rounded-full flex items-center justify-center mb-3 border border-stone-700">
              <User className="w-10 h-10 text-stone-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{callerName}</h2>
            <p className="text-sm font-mono text-emerald-400 mt-1">{formatTime(callDuration)}</p>
            <div className="mt-4 p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60 text-left text-xs text-stone-300">
              <span className="text-[11px] text-stone-400 block mb-1">Skrip Bantuan Anda:</span>
              <p className="italic text-white">
                "Iya Pa, ini mobil udah mau sampai lobi. Papa tunggu di gerbang ya bareng Pak Sekuriti."
              </p>
            </div>
          </div>

          {/* In-Call controls */}
          <div className="space-y-6 pb-6">
            <div className="grid grid-cols-2 gap-4 px-6">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  isMuted ? 'bg-white text-stone-900' : 'bg-stone-800/90 text-stone-300'
                }`}
              >
                <Mic className="w-5 h-5" />
                <span className="text-[10px] font-medium">{isMuted ? 'Bungkam' : 'Mikrofon'}</span>
              </button>
              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={`py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  speakerOn ? 'bg-white text-stone-900' : 'bg-stone-800/90 text-stone-300'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span className="text-[10px] font-medium">{speakerOn ? 'Speaker Aktif' : 'Speaker'}</span>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleDecline}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform cursor-pointer"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
