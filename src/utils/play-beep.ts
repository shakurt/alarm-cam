const BEEP_FREQUENCY = 880; // Hz (A5 note)
const BEEP_DURATION = 400; // milliseconds

const playBeep = () => {
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Configure oscillator
    oscillator.type = "sine";
    oscillator.frequency.value = BEEP_FREQUENCY;

    // Connect audio nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Fade in quickly to avoid click
    gainNode.gain.value = 0.0001;
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.2,
      audioContext.currentTime + 0.02
    );

    // Fade out and stop
    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.12
      );
      oscillator.stop(audioContext.currentTime + 0.14);
    }, BEEP_DURATION);
  } catch {
    console.log("beep"); // Fallback when AudioContext not available
  }
};

export default playBeep;
