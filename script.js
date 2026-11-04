/* ==============================================================
   INTERACTIVE SCRIPT ENGINE: GATEFOLD, AUDIO, TIMER, RSVP & GALLERY
   ============================================================== */

/* --------------------------------------------------------------
   CONFIG: paste your Google Apps Script Web App URL here.
   (See SETUP-GOOGLE-SHEET.md — it ends with "/exec")
   -------------------------------------------------------------- */
const RSVP_SCRIPT_URL = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

document.addEventListener('DOMContentLoaded', () => {
  const weddingCard = document.getElementById('weddingCard');
  const fastenerAssembly = document.getElementById('fastenerAssembly');
  const centerKnotWrapper = document.getElementById('centerKnotWrapper');
  const audioToggleBtn = document.getElementById('audioToggle');
  const audioIcon = document.getElementById('audioIcon');
  const weddingAudio = document.getElementById('weddingAudio');
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpSuccessMsg = document.getElementById('rsvpSuccessMsg');
  const rsvpErrorMsg = document.getElementById('rsvpErrorMsg');
  const contactCardBtn = document.getElementById('downloadContactCard');

  let isCardOpened = false;

  // 1. GATEFOLD REVEAL INTERACTION (TAP SEAL TO OPEN & UNLOCK SCROLL)
  if (centerKnotWrapper) {
    centerKnotWrapper.setAttribute('role', 'button');
    centerKnotWrapper.setAttribute('tabindex', '0');
    centerKnotWrapper.addEventListener('click', triggerOpeningSequence);
    centerKnotWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerOpeningSequence();
      }
    });
  }

  function triggerOpeningSequence() {
    if (isCardOpened) return;
    isCardOpened = true;

    // Start audio INSIDE the tap handler (browsers only allow it during a user gesture)
    initiateAudioPlayback();

    // Fade out the seal prompt
    if (fastenerAssembly) fastenerAssembly.classList.add('disassembled');

    // Open the flaps on the next frame so the transition always plays
    requestAnimationFrame(() => {
      weddingCard.classList.add('opened');
    });

    // After the 1.2s rotation: hide the flaps for good, then unlock scrolling.
    // Doing these two things AFTER the animation is what removes the white flash.
    setTimeout(() => {
      weddingCard.classList.add('flaps-gone');
      document.body.classList.add('scroll-enabled');
    }, 1300);
  }

  // 2. AUDIO SYNTHESIS / FALLBACK ENGINE
  let audioContext = null;
  let isPlayingAudio = false;

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (!isPlayingAudio) {
        initiateAudioPlayback();
      } else {
        pauseAudioPlayback();
      }
    });
  }

  function setAudioIcon(playing) {
    if (!audioIcon) return;
    audioIcon.classList.remove(playing ? 'fa-volume-xmark' : 'fa-volume-high');
    audioIcon.classList.add(playing ? 'fa-volume-high' : 'fa-volume-xmark');
  }

  function initiateAudioPlayback() {
    if (!weddingAudio) return;
    isPlayingAudio = true;
    setAudioIcon(true);

    let playPromise;
    try {
      playPromise = weddingAudio.play();
    } catch (err) {
      playPromise = Promise.reject(err);
    }

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Audio file missing/blocked -> Web Audio tanpura drone fallback
        try {
          startVedicSynthesizer();
        } catch (e) {
          isPlayingAudio = false;
          setAudioIcon(false);
        }
      });
    }
  }

  function pauseAudioPlayback() {
    if (weddingAudio) weddingAudio.pause();
    if (audioContext) audioContext.suspend();
    isPlayingAudio = false;
    setAudioIcon(false);
  }

  function startVedicSynthesizer() {
    if (audioContext) {
      audioContext.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = new AudioCtx();
    audioContext.resume();

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

  // 4. RSVP FORM -> GOOGLE SHEET
  if (rsvpForm) {
    const submitBtn = rsvpForm.querySelector('.rsvp-submit-btn');
    const submitLabel = submitBtn ? submitBtn.querySelector('span') : null;
    const originalLabel = submitLabel ? submitLabel.textContent : '';

    function showError(message) {
      if (rsvpSuccessMsg) rsvpSuccessMsg.style.display = 'none';
      if (rsvpErrorMsg) {
        const text = rsvpErrorMsg.querySelector('span');
        if (text && message) text.textContent = message;
        rsvpErrorMsg.style.display = 'flex';
      }
    }

    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (rsvpSuccessMsg) rsvpSuccessMsg.style.display = 'none';
      if (rsvpErrorMsg) rsvpErrorMsg.style.display = 'none';

      if (!RSVP_SCRIPT_URL || RSVP_SCRIPT_URL.indexOf('PASTE_YOUR') === 0) {
        console.warn('RSVP_SCRIPT_URL is not set in script.js');
        showError('RSVP is not connected yet. Please contact the family directly.');
        return;
      }

      const data = new URLSearchParams();
      data.append('name', document.getElementById('guestName').value.trim());
      data.append('phone', document.getElementById('guestPhone').value.trim());
      data.append('attendance', document.getElementById('guestAttendance').value);
      data.append('guests', document.getElementById('guestCount').value);
      data.append('wishes', document.getElementById('guestWishes').value.trim());
      const honeypot = document.getElementById('guestWebsite');
      data.append('website', honeypot ? honeypot.value : '');

      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Sending...';

      try {
        // no-cors: Apps Script doesn't send CORS headers; the request still
        // reaches the sheet, the response is just opaque to the browser.
        await fetch(RSVP_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: data
        });

        rsvpForm.reset();
        if (rsvpSuccessMsg) {
          rsvpSuccessMsg.style.display = 'flex';
          setTimeout(() => rsvpSuccessMsg.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
      } catch (err) {
        console.error('RSVP submit failed:', err);
        showError('Could not send your RSVP. Please check your connection and try again.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
      }
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
      URL.revokeObjectURL(url);
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
        scrollToIndex(0); // Loops back to first photo
      }
    });

    galleryPrevBtn.addEventListener('click', () => {
      if (activeIndex > 0) {
        scrollToIndex(activeIndex - 1);
      } else {
        scrollToIndex(totalPhotos - 1); // Loops to last photo
      }
    });

    // Update active index indicator on manual touch swipe/drag
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

    // Initial counter setup
    updateCounterDisplay(0);
  }
});

// 7. GLOBAL FUNCTION: DOWNLOAD .ICS CALENDAR APPOINTMENT
function downloadIcs(title, startTimeIso, endTimeIso, description) {
  const formatDateToIcs = (isoStr) => {
    // Event times are IST; add the offset if the string has no timezone
    const withZone = /(Z|[+-]\d\d:\d\d)$/.test(isoStr) ? isoStr : isoStr + '+05:30';
    return new Date(withZone).toISOString().replace(/-|:|\.\d\d\d/g, "");
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
  URL.revokeObjectURL(url);
}
