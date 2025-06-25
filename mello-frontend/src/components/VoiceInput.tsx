import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

type Props = {
  onTranscript: (text: string) => void;
};

const VoiceInput = forwardRef(({ onTranscript }: Props, ref) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimeout = useRef<NodeJS.Timeout | null>(null);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition není podporován.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "cs-CZ";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("🗣️ Rozpoznáno:", transcript);
      onTranscript(transcript);
    };

    recognition.onerror = (e: any) => {
      console.warn("🎤 Chyba rozpoznání:", e);
    };

    recognition.onend = () => {
      console.log("⏹️ Rozpoznávání ukončeno");
      setListening(false);
    };

    recognition.onspeechstart = () => {
      if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
    };

    recognition.onspeechend = () => {
      silenceTimeout.current = setTimeout(() => {
        console.log("🤫 Uživatel 3s nic neřekl – ukončuji poslech.");
        recognition.stop();
      }, 3000); // 3 sekundy bez řeči
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    console.log("🎤 Poslouchám...");
  };

  // vystavujeme metodu startListening pro ChatWindow
  useImperativeHandle(ref, () => ({
    startListening,
  }));

  return (
    <button
      onClick={() => startListening()}
      className={`p-4 rounded-full ${
        listening ? "bg-red-500" : "bg-blue-600"
      } text-white shadow-lg transition`}
      title="Mluv"
    >
      🎤
    </button>
  );
});

export default VoiceInput;
