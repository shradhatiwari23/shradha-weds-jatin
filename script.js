/* ==============================================================
   INTERACTIVE SCRIPT ENGINE: GATEFOLD, AUDIO, TIMER, RSVP & GALLERY
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {
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

  // 1. GATEFOLD REVEAL INTERACTION (TAP SEAL TO OPEN)
  if (centerKnotWrapper) {
    centerKnotWrapper.addEventListener('click', triggerOpeningSequence);
  }

  function triggerOpeningSequence() {
    if (isCardOpened) return;
    isCardOpened = true;

    // Disassemble & fade royal seal prompt
    if (fastenerAssembly) {
      fastenerAssembly.classList.add('disassembled');
    }

    // Trigger flap opening on next animation frame
    requestAnimationFrame(() => {
      weddingCard.classList.add('opened');
      initiateAudioPlayback();
    });

    // Wait until the 1.2s 3D rotation completes before allowing page scroll to prevent white flash
    setTimeout(() => {
      document.body.classList.add('scroll-enabled');
    }, 1300);
  }

  // 2. AUDIO SYNTHESIS / FALLBACK ENGINE & VISIBILITY AUTO-PAUSE
  let audioContext = null;
  let isPlayingAudio = false;
  let wasPlayingBeforeHide = false;

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (!isPlayingAudio) {
        initiateAudioPlayback();
      } else {
        wasPlayingBeforeHide = false; // Ensure manual pause stays paused on tab/app switch
        pauseAudioPlayback();
      }
    });
  }

  // Pause when switching apps/tabs or locking screen; resume when returning
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (isPlayingAudio) {
        wasPlayingBeforeHide = true;
        pauseAudioPlayback();
      }
    } else {
      if (wasPlayingBeforeHide) {
        wasPlayingBeforeHide = false;
        initiateAudioPlayback();
      }
    }
  });

  // Extra safeguard for mobile Safari / iOS app switching & lock screen
  window.addEventListener('pagehide', () => {
    if (isPlayingAudio) {
      wasPlayingBeforeHide = true;
      pauseAudioPlayback();
    }
  });

  window.addEventListener('pageshow', () => {
    if (wasPlayingBeforeHide && !document.hidden) {
      wasPlayingBeforeHide = false;
      initiateAudioPlayback();
    }
  });

  function initiateAudioPlayback() {
    if (!weddingAudio) return;
    weddingAudio.play().then(() => {
      isPlayingAudio = true;
      if (audioIcon) audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
    }).catch(() => {
      startVedicSynthesizer();
      isPlayingAudio = true;
      if (audioIcon) audioIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
    });
  }

  function pauseAudioPlayback() {
    if (weddingAudio) weddingAudio.pause();
    if (audioContext && audioContext.state === 'running') {
      audioContext.suspend();
    }
    isPlayingAudio = false;
    if (audioIcon) audioIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
  }

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

    const daysEl = document.getElementById('daysVal');
    const hoursEl = document.getElementById('hoursVal');
    const minutesEl = document.getElementById('minutesVal');
    const secondsEl = document.getElementById('secondsVal');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    if (distance < 0) {
      daysEl.innerText = "00";
      hoursEl.innerText = "00";
      minutesEl.innerText = "00";
      secondsEl.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = days < 10 ? `0${days}` : days;
    hoursEl.innerText = hours < 10 ? `0${hours}` : hours;
    minutesEl.innerText = minutes < 10 ? `0${minutes}` : minutes;
    secondsEl.innerText = seconds < 10 ? `0${seconds}` : seconds;
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 4. RSVP FORM SUBMISSION HANDLER
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (rsvpSuccessMsg) rsvpSuccessMsg.style.display = 'flex';
      rsvpForm.reset();
      setTimeout(() => {
        if (rsvpSuccessMsg) rsvpSuccessMsg.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
  }

  // 5. DOWNLOAD VCF CONTACT CARD
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

  // 6. POLAROID MOMENTS GALLERY CAROUSEL CONTROLLER
  const polaroidTrack = document.getElementById('polaroidTrack');
  const galleryPrevBtn = document.getElementById('galleryPrevBtn');
  const galleryNextBtn = document.getElementById('galleryNextBtn');
  const galleryCounter = document.getElementById('galleryCounter');
  const polaroidCards = document.querySelectorAll('.polaroid-card');

  if (polaroidTrack && galleryPrevBtn && galleryNextBtn && polaroidCards.length > 0) {
    let activeIndex = 0;
    const totalPhotos = polaroidCards.length;

    function updateCounterDisplay(idx) {
      const formattedCurrent = String(idx + 1).padStart(2, '0');
      const formattedTotal = String(totalPhotos).padStart(2, '0');
      if (galleryCounter) {
        galleryCounter.textContent = `${formattedCurrent} / ${formattedTotal}`;
      }
    }

    function scrollToIndex(idx) {
      if (idx < 0) idx = 0;
      if (idx >= totalPhotos) idx = totalPhotos - 1;
      activeIndex = idx;

      const card = polaroidCards[activeIndex];
      const scrollLeftPos = card.offsetLeft - (polaroidTrack.clientWidth / 2) + (card.clientWidth / 2);

      polaroidTrack.scrollTo({
        left: scrollLeftPos,
        behavior: 'smooth'
      });
      updateCounterDisplay(activeIndex);
    }

    galleryNextBtn.addEventListener('click', () => {
      if (activeIndex < totalPhotos - 1) {
        scrollToIndex(activeIndex + 1);
      } else {
        scrollToIndex(0);
      }
    });

    galleryPrevBtn.addEventListener('click', () => {
      if (activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      } else {
        scrollToIndex(totalPhotos - 1);
      }
    });

    let scrollTimeout;
    polaroidTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const trackCenter = polaroidTrack.scrollLeft + (polaroidTrack.clientWidth / 2);
        let closestIndex = 0;
        let minDiff = Infinity;

        polaroidCards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + (card.clientWidth / 2);
          const diff = Math.abs(cardCenter - trackCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        });

        activeIndex = closestIndex;
        updateCounterDisplay(activeIndex);
      }, 100);
    });

    updateCounterDisplay(0);
  }
});

// 7. GLOBAL FUNCTION: DOWNLOAD .ICS CALENDAR APPOINTMENT
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
