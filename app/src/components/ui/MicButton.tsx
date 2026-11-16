import React from 'react';
import { Mic, Square } from 'lucide-react';

export interface MicButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isListening,
  onClick,
  disabled = false,
  label = 'Tap to Speak',
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Pulse rings while listening */}
        {isListening && (
          <>
            <span className="absolute w-28 h-28 rounded-full bg-saffron-500/20 animate-pulse-ring pointer-events-none" />
            <span
              className="absolute w-24 h-24 rounded-full bg-saffron-500/30 animate-pulse pointer-events-none"
              style={{ animationDuration: '1.2s' }}
            />
          </>
        )}

        {/* 96px Mic button */}
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={isListening ? 'Stop recording' : 'Start speaking'}
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-saffron-500/30 disabled:opacity-50 disabled:pointer-events-none ${
            isListening
              ? 'bg-danger text-white hover:bg-danger/90'
              : 'bg-saffron-500 text-white hover:bg-saffron-500/90'
          }`}
        >
          {isListening ? (
            <Square size={36} className="fill-current" />
          ) : (
            <Mic size={44} className="stroke-[2.2]" />
          )}
        </button>
      </div>

      {label && (
        <span className="mt-3 text-sm font-semibold tracking-wide text-ink text-center">
          {label}
        </span>
      )}
    </div>
  );
};

