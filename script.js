// 7. POLAROID MOMENTS GALLERY CAROUSEL CONTROLLER
  const polaroidTrack = document.getElementById('polaroidTrack');
  const galleryPrevBtn = document.getElementById('galleryPrevBtn');
  const galleryNextBtn = document.getElementById('galleryNextBtn');
  const galleryCounter = document.getElementById('galleryCounter');
  const polaroidCards = document.querySelectorAll('.polaroid-card');

  if (polaroidTrack && galleryPrevBtn && galleryNextBtn) {
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

    // Update active index when user swipes manually on mobile/touch screens
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

    // Initialize counter
    updateCounterDisplay(0);
  }
