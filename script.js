/* ==============================================================
   SACRED UNION INVITATION ENGINE
   Unties Moli cord, opens state-map flaps, and begins ambient sound
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const sealButton = document.getElementById('sealButton');
  const fastenerAssembly = document.getElementById('fastenerAssembly');
  const weddingCard = document.getElementById('weddingCard');
  const audioToggleBtn = document.getElementById('audioToggle');
  const audioIcon = document.getElementById('audioIcon');

  let isOpened = false;
  let audioContext = null;
  let isPlayingAudio = false;

  // 1. Untie & Open Interaction Trigger
  if (sealButton) {
    sealButton.addEventListener('click', openInvitationSequence);
    sealButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openInvitationSequence();
      }
    });
  }

  function openInvitationSequence() {
    if (isOpened) return;
    isOpened = true;

    // Step A: Disassemble the Wax Seal and Untie Moli Threads
    fastenerAssembly.classList.add('disassembled');

    // Step B: Swing the Bihar & Bengal Gatefold Flaps Open
    setTimeout(() => {
      weddingCard.classList.add('opened');
      startTanpuraShehnaiSynthesizer();
    }, 300);
  }

  // 2. Audio Toggle (Procedural Vedic Tanpura Synthesizer)
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (!isPlayingAudio) {
        startTanpuraShehnaiSynthesizer();
      } else {
        pauseSynthesizer();
      }
    });
  }

  function startTanpuraShehnaiSynthesizer() {
    if (audioContext) {
      audioContext.resume();
      isPlayingAudio = true;
      audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();

      const masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0.05, audioContext.currentTime);
      masterGain.connect(audioContext.destination);

      // Sacred Tanpura Harmonic Frequencies (Sa - Pa - Sa tuning: D3, A3, D4)
      const ragaDroneFreqs = [146.83, 220.0, 293.66];

      ragaDroneFreqs.forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = idx === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
      });

      isPlayingAudio = true;
      audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
    } catch (e) {
      console.warn("Web Audio not supported or blocked by user gesture:", e);
    }
  }

  function pauseSynthesizer() {
    if (audioContext) {
      audioContext.suspend();
    }
    isPlayingAudio = false;
    audioIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
  }
});
