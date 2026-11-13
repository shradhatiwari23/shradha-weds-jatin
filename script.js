/* ==============================================================
   INTERACTIVE SCRIPT ENGINE: GATEFOLD, AUDIO, TRACKING, RSVP & GALLERY
   ============================================================== */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxYTVtCgq5kRaxtBJidXTr6bVk6lojk8zrbq_yZD7IaJkC5tGWN3eomvDXbLWtcIB0/exec";

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

  // 0. PERSONALIZED INVITATION & OPEN TRACKING
  const urlParams = new URLSearchParams(window.location.search);
  const guestId = urlParams.get('id');
  const paramGreeting = urlParams.get('g');
  const paramName = urlParams.get('to');

  function displayPersonalizedGuest(greeting, name) {
    if (!name) return;
    const banner = document.getElementById('personalizedGuestBanner');
    const greetEl = document.getElementById('guestGreetingDisplay');
    const nameEl = document.getElementById('guestNameDisplay');
    const rsvpNameInput = document.getElementById('guestName');

    if (banner && greetEl && nameEl) {
      greetEl.textContent = greeting || 'Dear';
      nameEl.textContent = name;
      banner.style.display = 'inline-flex';
    }
    if (rsvpNameInput && !rsvpNameInput.value) {
      rsvpNameInput.value = name;
    }
  }

  // Immediately render from URL parameters for zero-latency display
  if (paramName) {
    displayPersonalizedGuest(paramGreeting, paramName);
  }

  // Record open count in Google Sheet & sync latest details
  if (guestId && SCRIPT_URL.startsWith("http")) {
    fetch(`${SCRIPT_URL}?action=open&id=${encodeURIComponent(guestId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok' && data.guest) {
          displayPersonalizedGuest(data.guest.greeting, data.guest.familyName);
          const phoneInput = document.getElementById('guestPhone');
          if (phoneInput && !phoneInput.value && data.guest.phones) {
            phoneInput.value = String(data.guest.phones).split(',')[0].trim();
          }
        }
      })
      .catch(() => {});
  }

  // 1. GATEFOLD REVEAL INTERACTION (TAP SEAL TO OPEN)
  if (centerKnotWrapper) {
    centerKnotWrapper.addEventListener('click', triggerOpeningSequence);
  }

  function triggerOpeningSequence() {
    if (isCardOpened) return;
    isCardOpened = true;

    if (fastenerAssembly) {
      fastenerAssembly.classList.add('disassembled');
    }

    requestAnimationFrame(() => {
      weddingCard.classList.add('opened');
      initiateAudioPlayback();
    });

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
        wasPlayingBeforeHide = false;
        pauseAudioPlayback();
      }
    });
  }

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

  // 4. RSVP FORM SUBMISSION HANDLER (SAVES TO GOOGLE SHEET)
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('rsvpSubmitBtn');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';

      const payload = {
        action: 'rsvp',
        guestId: guestId || 'Direct Link',
        name: document.getElementById('guestName').value.trim(),
        phone: document.getElementById('guestPhone').value.trim(),
        attendance: document.getElementById('guestAttendance').value,
        guests: document.getElementById('guestCount').value,
        wishes: document.getElementById('guestWishes').value.trim()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Saving Confirmation...</span>';
      }

      try {
        if (SCRIPT_URL.startsWith("http")) {
          await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        console.error('RSVP sync error:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        if (rsvpSuccessMsg) rsvpSuccessMsg.style.display = 'flex';
        rsvpForm.reset();
        setTimeout(() => {
          if (rsvpSuccessMsg) rsvpSuccessMsg.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
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
