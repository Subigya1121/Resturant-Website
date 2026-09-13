/* ==========================================================
   NAV: sticky background on scroll + mobile drawer
========================================================== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 24);
});

const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobileDrawer');
hamburger.addEventListener('click', () => {
  mobileDrawer.classList.toggle('open');
});
mobileDrawer.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => mobileDrawer.classList.remove('open'))
);

/* ==========================================================
   MENU TABS
========================================================== */
const tabs = document.querySelectorAll('#menuTabs .tab');
const categories = document.querySelectorAll('#menuList .menu-category');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    const selected = tab.dataset.cat;
    categories.forEach((cat) => {
      cat.style.display = selected === 'All' || cat.dataset.cat === selected ? '' : 'none';
    });
  });
});

/* ==========================================================
   RESERVATION FORM
========================================================== */
const reservationForm = document.getElementById('reservationForm');
const reservationConfirm = document.getElementById('reservationConfirm');
const reservationError = document.getElementById('reservationError');
const resSubmit = document.getElementById('resSubmit');

function clearErrors(ids) {
  ids.forEach((id) => {
    const el = document.getElementById('err-' + id);
    if (el) el.textContent = '';
  });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

document.getElementById('resDate').min = todayStr();

reservationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  reservationError.style.display = 'none';

  const name = document.getElementById('resName').value.trim();
  const email = document.getElementById('resEmail').value.trim();
  const phone = document.getElementById('resPhone').value.trim();
  const date = document.getElementById('resDate').value;
  const time = document.getElementById('resTime').value;
  const guests = Number(document.getElementById('resGuests').value);
  const note = document.getElementById('resNote').value.trim();

  const fieldIds = ['resName', 'resEmail', 'resPhone', 'resDate', 'resTime', 'resGuests'];
  clearErrors(fieldIds);

  let hasError = false;
  const setErr = (id, msg) => {
    document.getElementById('err-' + id).textContent = msg;
    hasError = true;
  };

  if (!name) setErr('resName', 'Enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErr('resEmail', 'Enter a valid email address.');
  if (!/^[0-9+\-()\s]{7,}$/.test(phone)) setErr('resPhone', 'Enter a valid phone number.');
  if (!date) setErr('resDate', 'Choose a date.');
  else if (date < todayStr()) setErr('resDate', 'Choose a date from today onward.');
  if (!time) setErr('resTime', 'Choose a time.');
  if (!guests || guests < 1 || guests > 20) setErr('resGuests', 'Guests must be between 1 and 20.');

  if (hasError) return;

  resSubmit.disabled = true;
  resSubmit.textContent = 'Confirming…';

  const code = 'DBL-' + Math.random().toString(36).slice(2, 7).toUpperCase();

  supabaseClient
    .from('reservations')
    .insert({
      customer_name: name,
      email: email,
      phone: phone,
      reservation_date: date,
      reservation_time: time,
      guest_count: guests,
      special_request: note || null,
      confirmation_code: code,
    })
    .then(({ error }) => {
      resSubmit.disabled = false;
      resSubmit.textContent = 'Reserve a table';

      if (error) {
        console.error(error);
        reservationError.textContent =
          "Something went wrong while confirming your reservation. Please try again or call us directly.";
        reservationError.style.display = 'block';
        return;
      }

      document.getElementById('confirmEmailLine').textContent = `A confirmation has been sent to ${email}.`;
      document.getElementById('confirmDetails').innerHTML = `
        <div><span>Date</span><span>${date}</span></div>
        <div><span>Time</span><span>${time}</span></div>
        <div><span>Guests</span><span>${guests}</span></div>
        <div><span>Reference</span><span>${code}</span></div>
      `;

      reservationForm.style.display = 'none';
      reservationConfirm.style.display = 'block';
    });
});

document.getElementById('resAgain').addEventListener('click', () => {
  reservationForm.reset();
  document.getElementById('resDate').min = todayStr();
  reservationForm.style.display = 'block';
  reservationConfirm.style.display = 'none';
});

/* ==========================================================
   CONTACT FORM
========================================================== */
const contactForm = document.getElementById('contactForm');
const contactConfirm = document.getElementById('contactConfirm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('cName').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const message = document.getElementById('cMessage').value.trim();

  clearErrors(['cName', 'cEmail', 'cMessage']);
  let hasError = false;
  const setErr = (id, msg) => {
    document.getElementById('err-' + id).textContent = msg;
    hasError = true;
  };

  if (!name) setErr('cName', 'Enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErr('cEmail', 'Enter a valid email address.');
  if (!message) setErr('cMessage', 'Enter a message.');

  if (hasError) return;

  const btn = contactForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  supabaseClient
    .from('contact_messages')
    .insert({
      name: name,
      email: email,
      phone: document.getElementById('cPhone').value.trim() || null,
      message: message,
    })
    .then(({ error }) => {
      btn.disabled = false;
      btn.textContent = 'Send message';

      if (error) {
        console.error(error);
        alert("We couldn't send your message. Please try again.");
        return;
      }

      contactForm.style.display = 'none';
      contactConfirm.style.display = 'block';
    });
});

/* ==========================================================
   GALLERY LIGHTBOX
========================================================== */
const galleryImgs = Array.from(document.querySelectorAll('#galleryGrid img'));
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
let currentIndex = 0;

function openLightbox(i) {
  currentIndex = i;
  updateLightboxImage();
  lightbox.classList.add('open');
}
function updateLightboxImage() {
  const img = galleryImgs[currentIndex];
  lbImage.src = img.src;
  lbImage.alt = img.alt;
}
function closeLightbox() {
  lightbox.classList.remove('open');
}

galleryImgs.forEach((img, i) => {
  img.addEventListener('click', () => openLightbox(i));
});

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length;
  updateLightboxImage();
});
document.getElementById('lbNext').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % galleryImgs.length;
  updateLightboxImage();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') document.getElementById('lbNext').click();
  if (e.key === 'ArrowLeft') document.getElementById('lbPrev').click();
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
