
(() => {
  "use strict";

  // ---------------------------------------
  // 1. ENTER INVITATION BUTTON
  // ---------------------------------------

  const enterButton = document.getElementById("enter-button");
  const invitation = document.getElementById("invitation");

  if (enterButton && invitation) {
    enterButton.addEventListener("click", () => {
      invitation.hidden = false;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      invitation.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  }

  // ---------------------------------------
  // 2. WEDDING COUNTDOWN
  // 26 January 2027, 10:00 AM IST
  // ---------------------------------------

  const weddingDate = new Date(
    "2027-01-26T10:00:00+05:30"
  ).getTime();

  const daysElement = document.getElementById("days");
  const hoursElement = document.getElementById("hours");
  const minutesElement = document.getElementById("minutes");
  const secondsElement = document.getElementById("seconds");
  const countdownNote = document.getElementById("countdown-note");

  function updateCountdown() {
    const remaining = weddingDate - Date.now();

    if (remaining <= 0) {
      daysElement.textContent = "00";
      hoursElement.textContent = "00";
      minutesElement.textContent = "00";
      secondsElement.textContent = "00";

      if (countdownNote) {
        countdownNote.textContent =
          "Today is the day. Let the celebrations begin!";
      }

      return;
    }

    const days = Math.floor(
      remaining / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
      (remaining / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
      (remaining / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
      (remaining / 1000) % 60
    );

    daysElement.textContent = String(days).padStart(2, "0");
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();

  window.setInterval(updateCountdown, 1000);

  // ---------------------------------------
  // 3. SCROLL REVEAL ANIMATIONS
  // ---------------------------------------

  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12
      }
    );

    revealItems.forEach((item) => {
      observer.observe(item);
    });
  } else {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });
  }

  // ---------------------------------------
  // 4. VIDEO FALLBACK
  // ---------------------------------------

  const heroVideo = document.querySelector(".hero-video");

  if (heroVideo) {
    heroVideo.addEventListener("error", () => {
      heroVideo.style.display = "none";
    });
  }
})();
