/**
 * Text-to-speech audio helper using Web Speech API
 * Supports Hindi, Marathi, and English pronunciation
 */

export function speakText(text: string, language: 'en' | 'hi' | 'mr' = 'hi', onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    if (onEnd) onEnd();
    return;
  }

  // Cancel any active utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set appropriate language code
  if (language === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (language === 'mr') {
    utterance.lang = 'mr-IN'; // Fallback voices often interpret Hindi/Indian accent cleanly
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.rate = 0.92; // Slightly slower for clarity
  utterance.pitch = 1.0;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
