'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { Lock, Store, ArrowRight, RotateCcw, Delete, KeyRound } from 'lucide-react';

export function LockScreen() {
  const { isLocked, unlockApp, storeProfile } = useVyapar();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-reset state whenever the app is locked or reopened
  useEffect(() => {
    if (isLocked) {
      setPin('');
      setError(false);
      setErrorMessage('');
    }
  }, [isLocked]);

  const verifyPin = useCallback(
    (inputPin: string) => {
      if (!inputPin || inputPin.trim().length === 0) return;
      const success = unlockApp(inputPin);
      if (!success) {
        setError(true);
        setErrorMessage('Incorrect PIN. Please try again.');
        // Automatically clear password on failure so user never has to clear it manually
        setTimeout(() => {
          setPin('');
          setError(false);
          setErrorMessage('');
        }, 600);
      } else {
        setPin('');
        setError(false);
        setErrorMessage('');
      }
    },
    [unlockApp]
  );

  const handleDigitClick = (digit: string) => {
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      setErrorMessage('');
      // If 4 digits entered, automatically verify
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setError(false);
    setErrorMessage('');
  };

  const handleContinue = () => {
    if (pin.length > 0) {
      verifyPin(pin);
    }
  };

  // Keyboard navigation for desktop and laptop users
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitClick(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleContinue();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pin, verifyPin]);

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/85 backdrop-blur-2xl p-4 select-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Minimalist Store Brand Pill */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 p-3 shadow-glass flex items-center justify-center mb-3">
          <Store className="w-7 h-7 text-indigo-400" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          {storeProfile?.storeName || 'VyaparGlass'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 justify-center">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Device Protected • Enter PIN to continue</span>
        </p>

        {/* PIN Indicators */}
        <div className={`flex items-center gap-3.5 my-6 ${error ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? error
                      ? 'bg-rose-500 scale-125'
                      : 'bg-indigo-400 scale-125 shadow-lg shadow-indigo-500/50'
                    : 'bg-white/10 border border-white/20'
                }`}
              />
            );
          })}
        </div>

        {/* Error notification */}
        <div className="h-6 mb-2">
          {error && (
            <p className="text-xs font-medium text-rose-400 animate-fade-in">
              {errorMessage || `Incorrect PIN (Default: ${storeProfile?.appPin || '1234'})`}
            </p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-64 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="w-19 h-14 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] active:scale-95 text-lg font-semibold text-white backdrop-blur-md border border-white/10 transition-all flex items-center justify-center shadow-subtle"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="w-19 h-14 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-xs font-medium text-slate-400 backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="w-19 h-14 rounded-2xl bg-white/[0.07] hover:bg-white/[0.14] active:scale-95 text-lg font-semibold text-white backdrop-blur-md border border-white/10 transition-all flex items-center justify-center shadow-subtle"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="w-19 h-14 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-xs font-medium text-slate-400 backdrop-blur-md border border-white/10 transition-all flex items-center justify-center"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Continue / Enter Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={pin.length === 0}
          className={`w-64 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 mb-5 shadow-sm ${
            pin.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white shadow-indigo-600/30'
              : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          <span>Continue / Enter</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Minimalist Privacy Badge */}
        <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 max-w-xs flex items-center justify-center gap-2">
          <KeyRound className="w-3.5 h-3.5 text-slate-500" />
          <span>Default PIN: <strong className="text-slate-300">1234</strong> • Keyboard supported</span>
        </div>
      </div>
    </div>
  );
}
