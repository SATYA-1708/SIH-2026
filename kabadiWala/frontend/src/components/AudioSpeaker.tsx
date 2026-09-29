import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeaking } from '../services/speech';
import { useI18n } from '../services/i18n';

interface AudioSpeakerProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const AudioSpeaker: React.FC<AudioSpeakerProps> = ({
  text,
  className = '',
  size = 'md',
  label
}) => {
  const { language, t } = useI18n();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(text, language, () => {
        setIsPlaying(false);
      });
    }
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonPaddings = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-2.5 py-1.5 text-sm gap-1.5',
    lg: 'px-3.5 py-2 text-base gap-2',
  };

  return (
    <button
      onClick={handleToggle}
      type="button"
      title={isPlaying ? 'Stop speaking' : 'Listen to audio explanation'}
      className={`inline-flex items-center justify-center font-bold rounded-xl transition-all shadow-sm active:scale-95 ${
        isPlaying
          ? 'bg-amber-500 text-white animate-pulse'
          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
      } ${buttonPaddings[size]} ${className}`}
    >
      {isPlaying ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      {label && <span>{isPlaying ? 'सुन रहे हैं...' : label}</span>}
      {!label && size !== 'sm' && (
        <span className="text-xs">{isPlaying ? 'Stop' : t('listen_audio')}</span>
      )}
    </button>
  );
};
