
const weddingDate = new Date(
  "2027-01-26T10:00:00+05:30"
).getTime();

const countdown = document.getElementById("countdown");

function updateCountdown() {
  const now = Date.now();
  const distance = weddingDate - now;

  if (distance <= 0) {
    countdown.textContent = "The wedding day is here! ❤️";
    return;
  }

  const days = Math.floor(distance / 86400000);
  const hours = Math.floor(
    (distance % 86400000) / 3600000
  );
  const minutes = Math.floor(
    (distance % 3600000) / 60000
  );
  const seconds = Math.floor(
    (distance % 60000) / 1000
  );

  const units = [
    ["Days", days],
    ["Hours", hours],
    ["Minutes", minutes],
    ["Seconds", seconds]
  ];

  countdown.replaceChildren();

  units.forEach(([label, value]) => {
    const box = document.createElement("div");
    box.className = "time-box";

    const number = document.createElement("strong");
    number.textContent = String(value).padStart(2, "0");

    const caption = document.createElement("span");
    caption.textContent = label;

    box.append(number, caption);
    countdown.append(box);
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);