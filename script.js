/* ==============================================================
   INTERACTIVE SCRIPT ENGINE: GATEFOLD, AUDIO, TIMER & RSVP
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const weddingCard = document.getElementById('weddingCard');
  const fastenerAssembly = document.getElementById('fastenerAssembly');
  const centerKnotWrapper = document.getElementById('centerKnotWrapper');
  const audioToggleBtn = document.getElementById('audioToggle');
  const audioIcon = document.getElementById('audioIcon');
  const weddingAudio = document.getElementById('weddingAudio');
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpSuccessMsg = document.getElementById('rsvpSuccessMsg');
  const contactCardBtn = document.getElementById('downloadContactCard');

  let isCardOpened = false;

  // 1. GATEFOLD REVEAL INTERACTION (TAP TO UNTIE & OPEN)
  if (centerKnotWrapper) {
    centerKnotWrapper.addEventListener('click', triggerOpeningSequence);
  }

  function triggerOpeningSequence() {
    if (isCardOpened) return;
    isCardOpened = true;

    // Disassemble Mauli Thread & Bow
    fastenerAssembly.classList.add('disassembled');

    // Swing Flaps Open after short untie delay (250ms)
    setTimeout(() => {
      weddingCard.classList.add('opened');
      initiateAudioPlayback();
    }, 280);
  }

  // 2. AUDIO SYNTHESIS / FALLBACK ENGINE
  let audioContext = null;
  let isPlayingAudio = false;

  audioToggleBtn.addEventListener('click', () => {
    if (!isPlayingAudio) {
      initiateAudioPlayback();
    } else {
      pauseAudioPlayback();
    }
  });

  function initiateAudioPlayback() {
    // Attempt HTML5 Audio element first
    weddingAudio.play().then(() => {
      isPlayingAudio = true;
      audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
    }).catch(() => {
      // If no file present in Assets/sound/, start Web Audio API Drone
      startVedicSynthesizer();
      isPlayingAudio = true;
      audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
    });
  }

  function pauseAudioPlayback() {
    weddingAudio.pause();
    if (audioContext) {
      audioContext.suspend();
    }
    isPlayingAudio = false;
    audioIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
  }

  // Pure Web Audio Tanpura/Shehnai Drone Generator
  function startVedicSynthesizer() {
    if (audioContext) {
      audioContext.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();

    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.06, audioContext.currentTime);
    masterGain.connect(audioContext.destination);

    // Auspicious frequencies in Indian Classical Music (Sa - Pa - Sa octave)
    const droneFreqs = [146.83, 220.00, 293.66, 440.00];

    droneFreqs.forEach((freq, idx) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);

      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
    });
  }

  // 3. LIVE MUHURAT COUNTDOWN TIMER (26th January 2027, 10:00 AM IST)
  const weddingMuhuratTime = new Date('2027-01-26T10:00:00+05:30').getTime();

  function updateCountdown() {
    const currentTime = new Date().getTime();
    const distance = weddingMuhuratTime - currentTime;

    if (distance < 0) {
      document.getElementById('daysVal').innerText = "00";
      document.getElementById('hoursVal').innerText = "00";
      document.getElementById('minutesVal').innerText = "00";
      document.getElementById('secondsVal').innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('daysVal').innerText = days < 10 ? `0${days}` : days;
    document.getElementById('hoursVal').innerText = hours < 10 ? `0${hours}` : hours;
    document.getElementById('minutesVal').innerText = minutes < 10 ? `0${minutes}` : minutes;
    document.getElementById('secondsVal').innerText = seconds < 10 ? `0${seconds}` : seconds;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 4. RSVP FORM SUBMISSION
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      rsvpSuccessMsg.style.display = 'flex';
      rsvpForm.reset();
      setTimeout(() => {
        rsvpSuccessMsg.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  }

  // 5. DOWNLOAD VCF CONTACT CARD (.vcf)
  if (contactCardBtn) {
    contactCardBtn.addEventListener('click', () => {
      const vcfContent = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Prakash;Jatin;;;",
        "FN:Shradha & Jatin Wedding Helpdesk",
        "ORG:Tiwari & Prakash Family",
        "TITLE:Wedding Host / Logistics",
        "ADR;TYPE=WORK:;;DLS Divine River Resort and Spa, Mohan Chatti;Rishikesh;Uttarakhand;249304;India",
        "NOTE:Shradha weds Jatin (25-26 Jan 2027) Wedding Desk",
        "END:VCARD"
      ].join("\r\n");

      const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const tempLink = document.createElement("a");
      tempLink.href = url;
      tempLink.setAttribute("download", "Shradha_Jatin_Wedding_Desk.vcf");
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
    });
  }
});

// 6. GLOBAL FUNCTION: DOWNLOAD .ICS CALENDAR APPOINTMENT
function downloadIcs(title, startTimeIso, endTimeIso, description) {
  const formatDateToIcs = (isoStr) => {
    return new Date(isoStr).toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shradha and Jatin Vivah//IN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "LOCATION:DLS Divine River Resort & Spa, Mohan Chatti, Rishikesh, Uttarakhand",
    `DTSTART:${formatDateToIcs(startTimeIso)}`,
    `DTEND:${formatDateToIcs(endTimeIso)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const tempLink = document.createElement("a");
  tempLink.href = url;
  tempLink.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}
