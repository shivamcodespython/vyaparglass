'use client';

import React, { useState } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { Lock, ShieldCheck, KeyRound, ArrowRight, Store } from 'lucide-react';

export function LockScreen() {
  const { isLocked, unlockApp, storeProfile } = useVyapar();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleDigitClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (inputPin: string) => {
    const success = unlockApp(inputPin);
    if (!success) {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl p-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Store Brand Pill */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-sky-400/20 border border-white/20 p-3 shadow-glass flex items-center justify-center mb-4">
          <Store className="w-8 h-8 text-indigo-400" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          {storeProfile?.storeName || 'VyaparGlass'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 justify-center">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Device Protected • Enter Store Owner PIN</span>
        </p>

        {/* PIN Indicators */}
        <div className={`flex items-center gap-4 my-8 ${error ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? error
                      ? 'bg-rose-500 scale-125'
                      : 'bg-indigo-400 scale-125 shadow-lg shadow-indigo-500/50'
                    : 'bg-white/20 border border-white/30'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-400 mb-4 animate-fade-in">
            Incorrect PIN. Try again (Default: {storeProfile?.appPin || '1234'})
          </p>
        )}

        {/* Liquid Keypad */}
        <div className="grid grid-cols-3 gap-3 w-64 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="w-18 h-16 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-xl font-semibold text-white backdrop-blur-md border border-white/10 transition-all flex items-center justify-center shadow-subtle"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="w-18 h-16 rounded-2xl bg-white/5 hover:bg-white/15 text-xs font-semibold text-slate-400 backdrop-blur-md border border-white/10 transition-all flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="w-18 h-16 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-xl font-semibold text-white backdrop-blur-md border border-white/10 transition-all flex items-center justify-center shadow-subtle"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="w-18 h-16 rounded-2xl bg-white/5 hover:bg-white/15 text-xs font-semibold text-slate-400 backdrop-blur-md border border-white/10 transition-all flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {/* Security Privacy Notice */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 max-w-xs leading-relaxed">
          <span className="text-slate-300 font-medium">Local-First Privacy:</span> Financial ledger and customer records are protected on this device.
        </div>
      </div>
    </div>
  );
}
