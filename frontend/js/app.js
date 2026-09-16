/* 
   BENGKEL BANG PAEL — app.js
   File ini isinya SEMUA logika yang bicara ke "API" (masih mock/palsu
   pakai JSON Server, tapi request-nya beneran HTTP asli).

   Kenapa pakai async/await?
   
   Setiap request ke server itu makan WAKTU (walau di localhost cuma
   milidetik). JavaScript tidak mau "diam" nunggu — dia jalan terus ke
   baris berikutnya. `fetch()` mengembalikan sebuah Promise (janji bahwa
   suatu saat hasilnya akan datang). `await` artinya "tunggu janji itu
   selesai dulu, baru lanjut ke baris berikutnya" — tapi TANPA nge-freeze
   seluruh halaman (browser tetap bisa dipakai user selagi nunggu).
   `async` di depan function wajib ada supaya saya boleh pakai `await`
   di dalamnya. */

// Alamat dasar API. Nanti kalau backend Flask/Django sudah jadi,

const API_BASE = 'http://localhost:8000/api';

// STATE sederhana (disimpan di memori browser, bukan localStorage)

let categories = [];
let services = [];
let bookings = [];
let activeCategoryId = null;


// GAUGE HELPERS = indikator khas bengkel yang dipakai
// ulang di semua request (GET/POST/PATCH/DELETE)

const gaugeEl = document.getElementById('rpm-gauge');
const gaugeStatusText = document.getElementById('gauge-status-text');

// generate 12 garis tick di sekeliling gauge (dekorasi, sekali jalan saat load)
function drawGaugeTicks() {
  const group = document.getElementById('gauge-ticks');
  const total = 12;
  for (let i = 0; i < total; i++) {
    const angle = -220 + (i * (260 / (total - 1))); // sudut sebar jarum
    const rad = (angle * Math.PI) / 180;
    const x1 = 120 + 88 * Math.cos(rad);
    const y1 = 120 + 88 * Math.sin(rad);
    const x2 = 120 + 78 * Math.cos(rad);
    const y2 = 120 + 78 * Math.sin(rad);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('class', 'gauge-tick');
    group.appendChild(line);
  }
}
drawGaugeTicks();

// dipanggil SEBELUM request dikirim: jarum "redline sweep" + teks berubah
function gaugeLoading(label) {
  gaugeEl.classList.remove('gauge--success', 'gauge--error');
  gaugeEl.classList.add('gauge--loading');
  gaugeStatusText.textContent = label; // contoh: "GET…", "POST…"
}

// dipanggil SETELAH request selesai (sukses)
function gaugeSuccess(label) {
  gaugeEl.classList.remove('gauge--loading', 'gauge--error');
  gaugeEl.classList.add('gauge--success');
  gaugeStatusText.textContent = label;
  setTimeout(resetGauge, 1200);
}

// dipanggil kalau request gagal
function gaugeError(label) {
  gaugeEl.classList.remove('gauge--loading', 'gauge--success');
  gaugeEl.classList.add('gauge--error');
  gaugeStatusText.textContent = label;
  setTimeout(resetGauge, 1600);
}

function resetGauge() {
  gaugeEl.classList.remove('gauge--loading', 'gauge--success', 'gauge--error');
  gaugeStatusText.textContent = 'SIAP';
}


// TOAST HELPER — notifikasi kecil di bawah layar
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// 1) GET — mengambil data kategori & layanan
async function loadCategories() {
  gaugeLoading('GET…');
  try {
    // fetch() default method-nya GET, jadi tidak perlu ditulis eksplisit
    const res = await fetch(`${API_BASE}/categories/`);

    // fetch() TIDAK otomatis melempar error walau status 404/500 —
    // dari pada itu saya melakukan status HTTP harus dicek manual seperti ini:
    if (!res.ok) throw new Error(`Gagal ambil kategori (status ${res.status})`);

    categories = await res.json(); // .json() juga Promise, makanya di-await
    activeCategoryId = categories[0]?.id ?? null;

    renderCategoryTabs();
    gaugeSuccess('OK');
  } catch (err) {
    console.error(err);
    gaugeError('ERROR');
    showToast('Gagal memuat kategori layanan.', true);
  }
}

async function loadServices() {
  gaugeLoading('GET…');
  try {
    const res = await fetch(`${API_BASE}/services/`);
    if (!res.ok) throw new Error(`Gagal ambil layanan (status ${res.status})`);
    services = await res.json();
    renderServiceTickets();
    fillServiceSelect();
    gaugeSuccess('OK');
  } catch (err) {
    console.error(err);
    gaugeError('ERROR');
    showToast('Gagal memuat daftar layanan.', true);
  }
}

async function loadBookings() {
  gaugeLoading('GET…');
  try {
    const res = await fetch(`${API_BASE}/bookings/`);
    if (!res.ok) throw new Error(`Gagal ambil booking (status ${res.status})`);
    bookings = await res.json();
    renderBookingTickets();
    gaugeSuccess('OK');
  } catch (err) {
    console.error(err);
    gaugeError('ERROR');
    showToast('Gagal memuat riwayat servis.', true);
  }
}

// 2) POST — mengirim booking baru (bikin tiket baru)
async function createBooking(formData) {
  const form = document.getElementById('booking-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.classList.add('sending');

  gaugeLoading('POST…');
  try {
    const res = await fetch(`${API_BASE}/bookings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // wajib, biar server tahu body-nya JSON
      body: JSON.stringify(formData), // kirim data form ke server
    });

    if (!res.ok) throw new Error(`Gagal kirim booking (status ${res.status})`);

    const newBooking = await res.json(); // server balas data yang baru dibuat (lengkap dengan id)
    bookings.push(newBooking);

    renderBookingTickets(newBooking.id); // render ulang + tandai tiket baru buat animasi stempel
    form.reset();
    showToast('Booking berhasil dikirim! Tiket baru sudah tercetak.');
    gaugeSuccess('SENT');

    // scroll otomatis ke riwayat agar menurut saya biar user lihat tiketnya "keluar"
    document.getElementById('riwayat').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    console.error(err);
    gaugeError('ERROR');
    showToast('Gagal mengirim booking. Coba lagi.', true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('sending');
  }
}

// 3) PATCH — mengubah status booking (PATCH = update sebagian data saja,
//    beda dengan PUT yang biasanya mengganti SELURUH data)
async function updateBookingStatus(id, newStatus) {
  gaugeLoading('PATCH…');
  try {
    const res = await fetch(`${API_BASE}/bookings/${id}/update_status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }), // cuma kirim field yang berubah
    });

    if (!res.ok) throw new Error(`Gagal ubah status (status ${res.status})`);

    const updated = await res.json();
    bookings = bookings.map((b) => (b.id === updated.id ? updated : b));
    renderBookingTickets();
    showToast(`Status tiket #${id} diubah jadi "${newStatus}".`);
    gaugeSuccess('UPDATED');
  } catch (err) {
    console.error(err);
    gaugeError('ERROR');
    showToast('Gagal mengubah status tiket.', true);
  }
}

// 4) DELETE — menghapus booking (menarik tiket dari papan)
async function deleteBooking(id, ticketEl) {
  gaugeLoading('DELETE…');
  try {
    // mainkan animasi "robek" DULU biar terasa responsif ke user,
    // baru tunggu hasil request-nya
    ticketEl.classList.add('tearing');

    const res = await fetch(`${API_BASE}/bookings/${id}/`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Gagal hapus booking (status ${res.status})`);

    setTimeout(() => {
      bookings = bookings.filter((b) => b.id !== id);
      renderBookingTickets();
    }, 380); // nunggu animasi tearing selesai dulu sebelum re-render

    showToast(`Tiket #${id} dihapus dari papan.`);
    gaugeSuccess('DELETED');
  } catch (err) {
    console.error(err);
    ticketEl.classList.remove('tearing');
    gaugeError('ERROR');
    showToast('Gagal menghapus tiket.', true);
  }
}

// RENDER FUNCTIONS — murni urusan tampilan, tidak ada fetch() di sini
function renderCategoryTabs() {
  const wrap = document.getElementById('category-tabs');
  wrap.innerHTML = categories
    .map(
      (cat) => `
      <button class="tab-btn ${cat.id === activeCategoryId ? 'active' : ''}" data-id="${cat.id}">
        ${cat.name}
      </button>`
    )
    .join('');

  wrap.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategoryId = Number(btn.dataset.id);
      renderCategoryTabs();
      renderServiceTickets();
    });
  });
}

function formatRupiah(num) {
  return 'Rp' + Number(num).toLocaleString('id-ID');
}

function renderServiceTickets() {
  const board = document.getElementById('services-board');
  const filtered = services.filter((s) => s.category_id === activeCategoryId);

  board.innerHTML = filtered
    .map(
      (s, i) => `
    <article class="ticket" style="animation-delay:${i * 0.05}s">
      <p class="ticket-number">WO-${String(s.id).padStart(4, '0')}</p>
      <h3 class="ticket-name">${s.name}</h3>
      <p class="ticket-meta">⏱ Estimasi: ${s.estimated_duration}</p>
      <p class="ticket-price">${formatRupiah(s.price)}</p>
    </article>`
    )
    .join('');
}

function fillServiceSelect() {
  const select = document.getElementById('service-select');
  select.innerHTML = services
    .map((s) => `<option value="${s.id}">${s.name} — ${formatRupiah(s.price)}</option>`)
    .join('');
}

const statusLabel = {
  pending: 'Pending',
  diproses: 'Diproses',
  selesai: 'Selesai',
  batal: 'Batal',
};

function renderBookingTickets(highlightId = null) {
  const board = document.getElementById('bookings-board');

  board.innerHTML = bookings
    .slice()
    .reverse() // yang terbaru tampil paling atas
    .map((b) => {
      const service = services.find((s) => s.id === Number(b.service_id));
      return `
      <article class="ticket" data-id="${b.id}">
        ${b.id === highlightId ? '<span class="stamp">Diterima</span>' : ''}
        <p class="ticket-number">TIKET #${String(b.id).padStart(4, '0')} — ${new Date(b.booking_date).toLocaleString('id-ID')}</p>
        <h3 class="ticket-name">${b.customer_name}</h3>
        <p class="ticket-meta">${b.car_model} · ${b.car_plate}</p>
        <p class="ticket-meta">${service ? service.name : 'Layanan tidak ditemukan'}</p>
        <span class="ticket-badge badge-${b.status}">${statusLabel[b.status] || b.status}</span>

        <div class="ticket-actions">
          <select class="status-select">
            ${Object.entries(statusLabel)
              .map(([val, label]) => `<option value="${val}" ${val === b.status ? 'selected' : ''}>${label}</option>`)
              .join('')}
          </select>
          <button class="btn-delete" type="button">Hapus</button>
        </div>
      </article>`;
    })
    .join('');

  // pasang event listener SETELAH elemen dirender ke DOM
  board.querySelectorAll('.ticket').forEach((ticketEl) => {
    const id = Number(ticketEl.dataset.id);

    ticketEl.querySelector('.status-select').addEventListener('change', (e) => {
      updateBookingStatus(id, e.target.value); // -> PATCH
    });

    ticketEl.querySelector('.btn-delete').addEventListener('click', () => {
      deleteBooking(id, ticketEl); // -> DELETE
    });
  });
}

// EVENT: submit form booking -> POST
document.getElementById('booking-form').addEventListener('submit', (e) => {
  e.preventDefault(); // mencegah browser reload halaman (perilaku default form)

  const form = e.target;
  const data = {
    customer_name: form.customer_name.value.trim(),
    phone: form.phone.value.trim(),
    car_model: form.car_model.value.trim(),
    car_plate: form.car_plate.value.trim(),
    service: Number(form.service_id.value),
  };

  createBooking(data);
});

// INISIALISASI — urutan penting: kategori & layanan dulu baru booking,
// karena renderBookingTickets() butuh data `services` buat cari nama layanan
(async function init() {
  await loadCategories();
  await loadServices();
  await loadBookings();
})();