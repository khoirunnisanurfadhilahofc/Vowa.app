import React, { useState } from 'react';
import { EyeOff, ArrowLeft, Shield } from 'lucide-react';

interface DecoyCalculatorProps {
  onExitDecoy: () => void;
}

export const DecoyCalculator: React.FC<DecoyCalculatorProps> = ({ onExitDecoy }) => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNum = (n: string) => {
    if (newNumber || display === '0') {
      setDisplay(n);
      setNewNumber(false);
    } else {
      if (display.length < 10) {
        setDisplay(display + n);
      }
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(current);
    } else if (operation) {
      const result = calculate(prevVal, current, operation);
      setPrevVal(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? Math.round((a / b) * 100000) / 100000 : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prevVal !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(prevVal, current, operation);
      setDisplay(String(result));
      setPrevVal(null);
      setOperation(null);
      setNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleToggleSign = () => {
    const current = parseFloat(display);
    setDisplay(String(-current));
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-stone-900 rounded-3xl border border-stone-800 p-6 shadow-2xl flex flex-col">
        {/* Subtle top indicator */}
        <div className="flex items-center justify-between text-stone-500 text-xs mb-4 px-1">
          <span className="font-mono">Kalkulator Sistem</span>
          <span className="text-[11px] text-stone-600">Mode Samaran Aktif</span>
        </div>

        {/* Display screen */}
        <div className="h-28 flex items-end justify-end px-3 py-2 bg-stone-950 rounded-2xl mb-6 border border-stone-800/80">
          <span className="font-mono text-4xl text-stone-100 tracking-tight overflow-x-auto whitespace-nowrap">
            {display}
          </span>
        </div>

        {/* Calculator keypad */}
        <div className="grid grid-cols-4 gap-3 text-lg font-medium">
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-stone-800 text-rose-400 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            AC
          </button>
          <button
            onClick={handleToggleSign}
            className="h-14 rounded-2xl bg-stone-800 text-stone-300 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            ±
          </button>
          <button
            onClick={handlePercent}
            className="h-14 rounded-2xl bg-stone-800 text-stone-300 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleOp('÷')}
            className="h-14 rounded-2xl bg-rose-900/40 border border-rose-800/50 text-rose-200 hover:bg-rose-900/60 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            ÷
          </button>

          <button
            onClick={() => handleNum('7')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            7
          </button>
          <button
            onClick={() => handleNum('8')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            8
          </button>
          <button
            onClick={() => handleNum('9')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            9
          </button>
          <button
            onClick={() => handleOp('×')}
            className="h-14 rounded-2xl bg-rose-900/40 border border-rose-800/50 text-rose-200 hover:bg-rose-900/60 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            ×
          </button>

          <button
            onClick={() => handleNum('4')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            4
          </button>
          <button
            onClick={() => handleNum('5')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            5
          </button>
          <button
            onClick={() => handleNum('6')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            6
          </button>
          <button
            onClick={() => handleOp('-')}
            className="h-14 rounded-2xl bg-rose-900/40 border border-rose-800/50 text-rose-200 hover:bg-rose-900/60 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            -
          </button>

          <button
            onClick={() => handleNum('1')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            1
          </button>
          <button
            onClick={() => handleNum('2')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            2
          </button>
          <button
            onClick={() => handleNum('3')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            3
          </button>
          <button
            onClick={() => handleOp('+')}
            className="h-14 rounded-2xl bg-rose-900/40 border border-rose-800/50 text-rose-200 hover:bg-rose-900/60 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            +
          </button>

          <button
            onClick={() => handleNum('0')}
            className="col-span-2 h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-start pl-7 cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => handleNum('.')}
            className="h-14 rounded-2xl bg-stone-800 text-stone-100 hover:bg-stone-700 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="h-14 rounded-2xl bg-rose-600 text-white hover:bg-rose-500 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
          >
            =
          </button>
        </div>

        {/* Discreet exit trigger at the bottom */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-stone-500" />
            Privasi Aman
          </span>
          <button
            onClick={onExitDecoy}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition-colors py-1.5 px-3 rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke VOWA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
