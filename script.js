const photoElement = document.querySelector("#currentPhoto");
const emptyState = document.querySelector("#emptyState");
const photoIndex = document.querySelector("#photoIndex");
const photoTotal = document.querySelector("#photoTotal");
const quoteText = document.querySelector("#quoteText");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const photoUpload = document.querySelector("#photoUpload");
const clearButton = document.querySelector("#clearButton");
const historyStrip = document.querySelector("#historyStrip");

const dbName = "regalo-mama";
const storeName = "photos";
const photoExtensions = [
  "jpg",
  "jpeg",
  "jpe",
  "png",
  "webp",
  "gif",
  "bmp",
  "avif",
  "svg",
  "tif",
  "tiff",
  "heic",
  "heif",
];
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
let db;

const supportedImageFile = (file) =>
  file.type.startsWith("image/") ||
  /\.(jpg|jpeg|jpe|png|webp|gif|bmp|avif|svg|tif|tiff|heic|heif)$/i.test(file.name);

const testImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(src);
    image.onerror = () => resolve(null);
    image.src = src;
  });

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transaction(mode = "readonly") {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function getSavedPhotos() {
  return new Promise((resolve, reject) => {
    const request = transaction().getAll();
    request.onsuccess = () => {
      const savedPhotos = request.result
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((item) => ({
          id: item.id,
          name: item.name,
          src: URL.createObjectURL(item.file),
          saved: true,
        }));

      resolve(savedPhotos);
    };
    request.onerror = () => reject(request.error);
  });
}

function savePhoto(file) {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").add({
      name: file.name,
      type: file.type,
      file,
      createdAt: Date.now(),
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deletePhoto(id) {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearSavedPhotos() {
  return new Promise((resolve, reject) => {
    const request = transaction("readwrite").clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function findFolderPhotos() {
  const candidates = [];

  for (let index = 1; index <= maxPhotosToCheck; index += 1) {
    for (const extension of photoExtensions) {
      candidates.push(`./assets/photos/foto-${index}.${extension}`);
    }
  }

  const results = await Promise.all(candidates.map(testImage));
  return results
    .filter(Boolean)
    .sort((a, b) => {
      const numberA = Number(a.match(/foto-(\d+)/)?.[1] ?? 0);
      const numberB = Number(b.match(/foto-(\d+)/)?.[1] ?? 0);
      return numberA - numberB;
    })
    .map((src, index) => ({
      id: `folder-${index}`,
      name: src.split("/").at(-1),
      src,
      saved: false,
    }));
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

function renderHistory() {
  historyStrip.innerHTML = "";
  const savedPhotos = photos.filter((photo) => photo.saved);

  if (!savedPhotos.length) {
    historyStrip.innerHTML =
      '<p class="history-empty">Aun no hay fotos guardadas en el historial.</p>';
    return;
  }

  savedPhotos.forEach((photo) => {
    const item = document.createElement("button");
    item.className = "history-item";
    item.type = "button";
    item.setAttribute("aria-label", `Ver ${photo.name}`);

    const thumbnail = document.createElement("img");
    thumbnail.src = photo.src;
    thumbnail.alt = "";

    const name = document.createElement("span");
    name.textContent = photo.name;

    item.append(thumbnail, name);
    item.addEventListener("click", () => {
      const index = photos.findIndex((entry) => entry.id === photo.id);
      if (index >= 0) {
        showPhoto(index);
        restartAutoplay();
      }
    });

    const removeButton = document.createElement("button");
    removeButton.className = "remove-photo";
    removeButton.type = "button";
    removeButton.textContent = "x";
    removeButton.setAttribute("aria-label", `Borrar ${photo.name}`);
    removeButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await deletePhoto(photo.id);
      await loadPhotos();
    });

    const wrapper = document.createElement("div");
    wrapper.className = "history-wrapper";
    wrapper.append(item, removeButton);
    historyStrip.append(wrapper);
  });
}

function updateEmptyState() {
  emptyState.hidden = photos.length > 0;
  photoElement.hidden = photos.length === 0;
  clearButton.disabled = !photos.some((photo) => photo.saved);
}

function showPhoto(nextIndex) {
  if (!photos.length) {
    updateCounter();
    updateEmptyState();
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
    photoElement.src = photos[current].src;
    updateCounter();
    updateEmptyState();
    setQuote(current);
  }, 260);
}

function restartAutoplay() {
  window.clearInterval(timerId);

  if (photos.length > 1) {
    timerId = window.setInterval(() => showPhoto(current + 1), 5200);
  }
}

async function loadPhotos() {
  const [savedPhotos, folderPhotos] = await Promise.all([
    getSavedPhotos(),
    findFolderPhotos(),
  ]);

  photos = [...savedPhotos, ...folderPhotos];
  current = Math.min(current, Math.max(photos.length - 1, 0));
  renderHistory();
  showPhoto(current);
  restartAutoplay();
}

prevButton.addEventListener("click", () => {
  showPhoto(current - 1);
  restartAutoplay();
});

nextButton.addEventListener("click", () => {
  showPhoto(current + 1);
  restartAutoplay();
});

photoUpload.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files).filter(supportedImageFile);

  for (const file of files) {
    await savePhoto(file);
  }

  photoUpload.value = "";
  current = 0;
  await loadPhotos();
});

clearButton.addEventListener("click", async () => {
  await clearSavedPhotos();
  current = 0;
  await loadPhotos();
});

quoteText.style.transition = "opacity 180ms ease";

openDatabase()
  .then((database) => {
    db = database;
    return loadPhotos();
  })
  .catch(() => {
    emptyState.innerHTML =
      "<span>No se pudo abrir el historial</span><strong>Usa la carpeta assets/photos</strong>";
    updateEmptyState();
  });
