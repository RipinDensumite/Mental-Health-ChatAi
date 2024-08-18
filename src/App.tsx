import { useState, useEffect } from "react";

function App() {
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    window.speechSynthesis.cancel();
    setIsPaused(false);

    if (!userInput) {
      alert("Please insert your input");
      return;
    }

    setIsLoading(true);
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPEN_ROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-3.5-turbo",
        "messages": [
          {
            "role": "system",
            "content": "You are a very intelligent psychiatrist AI and only answer questions regarding mental health and provide the best advice."
          },
          { "role": "user", "content": userInput },
        ],
      })
    })
      .then(response => response.json())
      .then(data => {
        const content = data.choices[0]?.message?.content;
        setMsg(content);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert("Error fetching data");
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (msg) {
      const synth = window.speechSynthesis;
      const u = new SpeechSynthesisUtterance(msg);
      const voices = synth.getVoices();

      // Find the Natasha voice
      const natashaVoice = voices.find(
        (voice) => voice.name.includes("Natasha") && voice.lang === "en-AU"
      );


      if (natashaVoice) {
        u.voice = natashaVoice;
      } else {
        u.voice = voices[0]; // Fallback to the first available voice
      }
      u.pitch = pitch;
      u.rate = rate;
      u.volume = volume;

      setUtterance(u);
      setVoice(voices[0]);

      synth.speak(u);
    }
  }, [msg, pitch, rate, volume]);

  const handlePlay = () => {
    if (utterance) {
      const synth = window.speechSynthesis;

      if (isPaused) {
        synth.resume();
      } else {
        utterance.voice = voice;
        utterance.pitch = pitch;
        utterance.rate = rate;
        utterance.volume = volume;
        synth.speak(utterance);
      }

      setIsPaused(false);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPaused(false);
  };

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voices = window.speechSynthesis.getVoices();
    setVoice(voices.find(v => v.name === event.target.value) || null);
  };

  const handlePitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPitch(parseFloat(event.target.value));
  };

  const handleRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRate(parseFloat(event.target.value));
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  return (
    <section className="flex flex-col space-y-5 items-center justify-center min-h-screen">
      {(!msg || isLoading) && <h1>Nothing generated yet</h1>}
      {isLoading ? <h1>Loading</h1> : <h1 className="px-20">{msg}</h1>}
      <form onSubmit={onSubmit} className="flex flex-col items-center space-y-3">
        <div>
          <label htmlFor="userInput" className="block text-sm text-gray-500 dark:text-gray-300">User input</label>
          <input
            onChange={(e) => setUserInput(e.target.value)}
            type="text"
            placeholder="Insert your input"
            className="block mt-2 w-full placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300" />
        </div>
        <button type="submit" className="px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80">
          Submit
        </button>
        <button onClick={handleStop}>Stop talking</button>
      </form>
      {/* 
      {msg && (
        <div>
          <label>
            Voice:
            <select value={voice?.name} onChange={handleVoiceChange}>
              {window.speechSynthesis.getVoices().map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </label>

          <br />

          <label>
            Pitch:
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={handlePitchChange}
            />
          </label>

          <br />

          <label>
            Speed:
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={handleRateChange}
            />
          </label>

          <br />

          <label>
            Volume:
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
          </label>

          <br />

          <button onClick={handlePlay}>{isPaused ? "Resume" : "Play"}</button>
          <button onClick={handlePause}>Pause</button>
          <button onClick={handleStop}>Stop</button>
        </div>
      )} */}
    </section>
  );
}

export default App;
