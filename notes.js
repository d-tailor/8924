const createButton = document.querySelector('#new-note-button');
const dialog = document.querySelector('#note-dialog');
const form = document.querySelector('#note-form');
const textInput = document.querySelector('#note-text');
const cancelButton = document.querySelector('#cancel-note');
const canvas = document.querySelector('#notes-canvas');

const noteColors = ['#ffd9a8', '#fff0a8', '#d9edc2', '#cde8f2', '#e3d5ff', '#ffcfd4'];
let colorIndex = Math.floor(Math.random() * noteColors.length);
let topLayer = 1;

createButton.addEventListener('click', () => {
  form.reset();
  dialog.showModal();
  textInput.focus();
});

cancelButton.addEventListener('click', () => dialog.close());

dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = textInput.value.trim();
  if (!text) return;

  const card = document.createElement('article');
  card.className = 'note-card';
  card.tabIndex = 0;
  card.setAttribute('aria-label', `Note: ${text}`);
  card.textContent = text;
  card.style.backgroundColor = noteColors[colorIndex];
  colorIndex = (colorIndex + 1 + Math.floor(Math.random() * (noteColors.length - 1))) % noteColors.length;
  card.style.zIndex = String(topLayer++);
  canvas.append(card);
  placeCard(card);
  enableDragging(card);
  dialog.close();
});

function placeCard(card) {
  const maxX = Math.max(0, canvas.clientWidth - card.offsetWidth);
  const maxY = Math.max(0, canvas.clientHeight - card.offsetHeight);
  card.style.left = `${Math.random() * maxX}px`;
  card.style.top = `${Math.random() * maxY}px`;
}

function enableDragging(card) {
  let drag = null;

  card.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    const bounds = card.getBoundingClientRect();
    const canvasBounds = canvas.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      canvasBounds,
    };
    card.style.zIndex = String(topLayer++);
    card.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  card.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const maxX = Math.max(0, canvas.clientWidth - card.offsetWidth);
    const maxY = Math.max(0, canvas.clientHeight - card.offsetHeight);
    const x = event.clientX - drag.canvasBounds.left - drag.offsetX;
    const y = event.clientY - drag.canvasBounds.top - drag.offsetY;
    card.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
    card.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
  });

  const finishDrag = (event) => {
    if (drag?.pointerId === event.pointerId) drag = null;
  };
  card.addEventListener('pointerup', finishDrag);
  card.addEventListener('pointercancel', finishDrag);

  card.addEventListener('keydown', (event) => {
    const directions = {
      ArrowUp: [0, -12],
      ArrowDown: [0, 12],
      ArrowLeft: [-12, 0],
      ArrowRight: [12, 0],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const maxX = Math.max(0, canvas.clientWidth - card.offsetWidth);
    const maxY = Math.max(0, canvas.clientHeight - card.offsetHeight);
    card.style.left = `${Math.max(0, Math.min(maxX, card.offsetLeft + direction[0]))}px`;
    card.style.top = `${Math.max(0, Math.min(maxY, card.offsetTop + direction[1]))}px`;
  });
}
