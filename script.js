const photoElement = document.querySelector("#currentPhoto");
const emptyState = document.querySelector("#emptyState");
const photoIndex = document.querySelector("#photoIndex");
const photoTotal = document.querySelector("#photoTotal");
const quoteText = document.querySelector("#quoteText");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");

const photoExtensions = ["jpg", "jpeg", "png", "webp"];
const maxPhotosToCheck = 40;

const quotes = [
  "Mama, tu amor es la primera luz que aprendi a reconocer.",
  "En cada abrazo tuyo siempre encontre calma, valor y esperanza.",
  "Gracias por ensenarme que el amor tambien se cuida en los detalles pequenos.",
  "Todo lo bueno que soy lleva un poquito de tu paciencia y tu ternura.",
  "Hoy celebro tu vida, tu fuerza y esa forma tan bonita que tienes de hacer hogar.",
];

let photos = [];
let current = 0;
let timerId;

const testImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(null);
    image.src = src;
  });

async function findPhotos() {
  const candidates = [];

  for (let index = 1; index <= maxPhotosToCheck; index += 1) {
    for (const extension of photoExtensions) {
      candidates.push(`./assets/photos/foto-${index}.${extension}`);
    }
  }

  const results = await Promise.all(candidates.map(testImage));
  return results.filter(Boolean).sort((a, b) => {
    const numberA = Number(a.match(/foto-(\d+)/)?.[1] ?? 0);
    const numberB = Number(b.match(/foto-(\d+)/)?.[1] ?? 0);
    return numberA - numberB;
  });
}

function setQuote(index) {
  quoteText.style.opacity = "0";
  window.setTimeout(() => {
    quoteText.textContent = quotes[index % quotes.length];
    quoteText.style.opacity = "1";
  }, 180);
}

function updateCounter() {
  photoIndex.textContent = photos.length ? String(current + 1) : "0";
  photoTotal.textContent = String(photos.length);
}

function showPhoto(nextIndex) {
  if (!photos.length) {
    updateCounter();
    return;
  }

  current = (nextIndex + photos.length) % photos.length;
  photoElement.classList.remove("is-visible");
  photoElement.classList.add("is-leaving");

  window.setTimeout(() => {
    photoElement.onload = () => {
      photoElement.classList.remove("is-leaving");
      photoElement.classList.add("is-visible");
    };
    photoElement.src = photos[current];
    updateCounter();
    setQuote(current);
  }, 260);
}

function restartAutoplay() {
  window.clearInterval(timerId);
  timerId = window.setInterval(() => showPhoto(current + 1), 5200);
}

prevButton.addEventListener("click", () => {
  showPhoto(current - 1);
  restartAutoplay();
});

nextButton.addEventListener("click", () => {
  showPhoto(current + 1);
  restartAutoplay();
});

quoteText.style.transition = "opacity 180ms ease";

findPhotos().then((foundPhotos) => {
  photos = foundPhotos;
  emptyState.hidden = photos.length > 0;
  photoElement.hidden = photos.length === 0;
  showPhoto(0);

  if (photos.length > 1) {
    restartAutoplay();
  }
});
