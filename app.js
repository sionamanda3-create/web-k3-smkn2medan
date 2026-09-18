// ============================================================
// MEDIA PEMBELAJARAN K3 — SMK NEGERI 2 MEDAN
// File: js/app.js
// ============================================================
// CATATAN:
// - `supabaseClient` didefinisikan di masing-masing file HTML
//   (index.html, dashboard-guru.html, dashboard-siswa.html, dll).
// - File ini HANYA menyediakan helper functions.
// - JANGAN deklarasikan `supabaseClient` lagi di sini agar tidak
//   terjadi error "Identifier 'supabaseClient' has already been declared".
// ============================================================

// ============================================================
// CEK APAKAH SUPABASE CLIENT SIAP
// ============================================================
function ensureSupabaseClient() {
  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    console.error('❌ supabaseClient belum didefinisikan. Pastikan HTML sudah membuatnya.');
    return false;
  }
  return true;
}

// ============================================================
// HELPER: GET CURRENT USER (Supabase Auth)
// ============================================================
async function getCurrentUser() {
  if (!ensureSupabaseClient()) return null;
  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user || null;
  } catch (err) {
    console.error('Gagal getCurrentUser:', err);
    return null;
  }
}

// ============================================================
// HELPER: GET CURRENT PROFILE (tabel `profiles`)
// ============================================================
async function getCurrentProfile() {
  if (!ensureSupabaseClient()) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn('Profile tidak ditemukan:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Gagal getCurrentProfile:', err);
    return null;
  }
}

// ============================================================
// HELPER: GET CURRENT SISWA (dari localStorage)
// ============================================================
function getCurrentSiswa() {
  try {
    const session = localStorage.getItem('siswa_session');
    return session ? JSON.parse(session) : null;
  } catch (e) {
    return null;
  }
}

// ============================================================
// HELPER: REQUIRE AUTH (redirect kalau belum login)
// ============================================================
async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    console.warn('⚠️ Belum login, redirect ke index.html');
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

// ============================================================
// HELPER: LOGOUT (Supabase Auth + localStorage)
// ============================================================
async function handleLogout() {
  if (!confirm('Yakin ingin keluar?')) return;

  try {
    if (ensureSupabaseClient()) {
      await supabaseClient.auth.signOut();
    }
  } catch (err) {
    console.warn('Error signOut:', err);
  }

  localStorage.removeItem('siswa_session');
  window.location.href = 'index.html';
}

// ============================================================
// HELPER: TOAST NOTIFICATION
// ============================================================
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');

  if (!toast || !msg) {
    // Fallback kalau elemen toast tidak ada
    console.log(`[${type.toUpperCase()}] ${message}`);
    return;
  }

  const icon = toast.querySelector('i');
  toast.className = 'toast ' + type;
  msg.textContent = message;

  const icons = {
    error:   'fa-circle-exclamation',
    success: 'fa-circle-check',
    info:    'fa-circle-info',
    warning: 'fa-triangle-exclamation'
  };

  if (icon) icon.className = 'fas ' + (icons[type] || icons.info);

  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ============================================================
// HELPER: FORMAT TANGGAL (Bahasa Indonesia)
// ============================================================
function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch (e) {
    return '-';
  }
}

function formatTanggalSingkat(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return '-';
  }
}

// ============================================================
// HELPER: GENERATE PASSWORD SISWA (kalau pakai sistem lama)
// ============================================================
function generateStudentPassword(nama, kelas) {
  const namaBersih = (nama || '').toLowerCase().replace(/\s+/g, '');
  const kelasBersih = (kelas || '').replace(/\s+/g, '').toUpperCase();
  return `k3-${namaBersih}-${kelasBersih}`;
}

// ============================================================
// HELPER: EXTRACT YOUTUBE ID
// ============================================================
function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/
  ];
  for (const p of patterns) {
    const match = url.match(p);
    if (match && match[1]) return match[1];
  }
  return null;
}

function getYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

function getYouTubeEmbed(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : '';
}

// ============================================================
// HELPER: GET PREDIKAT NILAI
// ============================================================
function getPredikat(nilai) {
  if (nilai === null || nilai === undefined || isNaN(nilai)) {
    return { label: '—', class: 'empty' };
  }
  if (nilai >= 90) return { label: 'A', class: 'a' };
  if (nilai >= 80) return { label: 'B', class: 'b' };
  if (nilai >= 70) return { label: 'C', class: 'c' };
  return { label: 'D', class: 'd' };
}

function getScoreClass(nilai) {
  if (nilai === null || nilai === undefined || isNaN(nilai)) return 'empty';
  if (nilai >= 90) return 'excellent';
  if (nilai >= 80) return 'good';
  if (nilai >= 70) return 'average';
  return 'poor';
}

// ============================================================
// ROUTER OTOMATIS (dipanggil kalau halaman punya data-page)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (!page) return;

  console.log('📄 app.js — Halaman terdeteksi:', page);

  // Router hanya untuk memicu fungsi init khusus per halaman.
  // Sebagian besar logika ada di masing-masing HTML.
  switch (page) {
    case 'login':
      console.log('   → Login page (logic di index.html)');
      break;

    case 'dashboard-siswa':
      console.log('   → Dashboard Siswa (logic di dashboard-siswa.html)');
      break;

    case 'dashboard-guru':
      console.log('   → Dashboard Guru (logic di dashboard-guru.html)');
      break;

    case 'materi':
      console.log('   → Materi (logic di materi.html)');
      break;

    case 'video':
      console.log('   → Video (logic di video.html)');
      break;

    case 'kuis':
      console.log('   → Kuis (logic di kuis.html)');
      break;

    case 'latihan':
      console.log('   → Latihan (logic di latihan.html)');
      break;

    case 'nilai':
      console.log('   → Nilai (logic di nilai.html)');
      break;

    case 'tujuan':
      console.log('   → Tujuan (logic di tujuan.html)');
      break;

    default:
      console.warn('   → Halaman tidak dikenal:', page);
  }
});

// ============================================================
// EXPOSE KE GLOBAL (agar bisa diakses dari HTML)
// ============================================================
window.getCurrentUser = getCurrentUser;
window.getCurrentProfile = getCurrentProfile;
window.getCurrentSiswa = getCurrentSiswa;
window.requireAuth = requireAuth;
window.handleLogout = handleLogout;
window.showToast = showToast;
window.formatTanggal = formatTanggal;
window.formatTanggalSingkat = formatTanggalSingkat;
window.generateStudentPassword = generateStudentPassword;
window.extractYouTubeId = extractYouTubeId;
window.getYouTubeThumbnail = getYouTubeThumbnail;
window.getYouTubeEmbed = getYouTubeEmbed;
window.getPredikat = getPredikat;
window.getScoreClass = getScoreClass;

console.log('✅ js/app.js loaded — Helper functions ready');
