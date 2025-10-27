const playBeep = () => {
  try {
    const aCtx = new AudioContext();
    const osc = aCtx.createOscillator();
    const g = aCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    osc.connect(g);
    g.connect(aCtx.destination);
    g.gain.value = 0.0001;
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.2, aCtx.currentTime + 0.02);
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(0.0001, aCtx.currentTime + 0.12);
      osc.stop(aCtx.currentTime + 0.14);
    }, 400);
  } catch {
    console.log("beep"); // as fallback
  }
};

export default playBeep;
