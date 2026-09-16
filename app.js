// ============================================================
// MEDIA PEMBELAJARAN K3 — SMK NEGERI 2 MEDAN
// File: js/app.js
// Semua logika JavaScript dalam satu file
// ============================================================

// ------------------------------------------------------------
// 1. KONFIGURASI SUPABASE
// ------------------------------------------------------------
const SUPABASE_URL = 'https://ddnhwcxfktcsyngupdex.supabase.co';
const SUPABASE_ANON_KEY = 'PASTE_PUBLISHABLE_KEY_LENGKAP_DI_SINI';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------------------------------------------
// 2. HELPER UMUM
// ------------------------------------------------------------
async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

async function getCurrentRole() {
  const profile = await getCurrentProfile();
  return profile?.role || null;
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

async function handleLogout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

// Toast notifikasi
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) {
    alert(message);
    return;
  }
  const icon = toast.querySelector('i');
  toast.className = 'toast ' + type;
  msg.textContent = message;

  const icons = {
    error:   'fa-circle-exclamation',
    success: 'fa-circle-check',
    info:    'fa-circle-info'
  };
  if (icon) icon.className = 'fas ' + (icons[type] || icons.info);

  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ------------------------------------------------------------
// 3. HALAMAN LOGIN
// ------------------------------------------------------------
function initLoginPage() {
  let selectedRole = 'siswa';

  // Tab peran
  document.querySelectorAll('.tab, .role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab, .role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
      const roleInput = document.getElementById('role');
      if (roleInput) roleInput.value = selectedRole;
    });
  });

  // Toggle password
  const togglePwd = document.getElementById('toggle-password');
  const pwdInput = document.getElementById('password');
  if (togglePwd && pwdInput) {
    togglePwd.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      const icon = togglePwd.querySelector('i');
      if (icon) icon.className = isPwd ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  }

  // Submit login
  const form = document.getElementById('login-form');
  if (!form) return;

  const btnLogin = document.getElementById('btn-login');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (btnLogin) {
      btnLogin.classList.add('loading');
      btnLogin.disabled = true;
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email, password
      });

      if (error) {
        showToast('Login gagal: ' + error.message, 'error');
        return;
      }

      // Verifikasi role
      const { data: profile, error: profileErr } = await supabaseClient
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profile) {
        showToast('Profil tidak ditemukan.', 'error');
        await supabaseClient.auth.signOut();
        return;
      }

      if (profile.role !== role) {
        showToast('Peran tidak sesuai! Akun ini terdaftar sebagai ' + profile.role, 'error');
        await supabaseClient.auth.signOut();
        return;
      }

      showToast('Login berhasil!', 'success');

      setTimeout(() => {
        window.location.href = profile.role === 'guru'
          ? 'dashboard-guru.html'
          : 'dashboard-siswa.html';
      }, 600);

    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      if (btnLogin) {
        btnLogin.classList.remove('loading');
        btnLogin.disabled = false;
      }
    }
  });
}

// ------------------------------------------------------------
// 4. DASHBOARD SISWA
// ------------------------------------------------------------
async function initDashboardSiswaPage() {
  const user = await requireAuth();
  if (!user) return;

  const profile = await getCurrentProfile();
  if (!profile) return;

  if (profile.role === 'guru') {
    window.location.href = 'dashboard-guru.html';
    return;
  }

  // Nama user di navbar & welcome
  const initial = (profile.full_name || 'S').charAt(0).toUpperCase();
  const avatarEl = document.getElementById('user-avatar');
  const nameEl = document.getElementById('user-name');
  const kelasEl = document.getElementById('user-kelas');
  const welcomeEl = document.getElementById('welcome-name');

  if (avatarEl) avatarEl.textContent = initial;
  if (nameEl) nameEl.textContent = profile.full_name || 'Siswa';
  if (kelasEl) kelasEl.textContent = profile.kelas || 'Teknik Pemesinan';
  if (welcomeEl) welcomeEl.textContent = (profile.full_name || 'Siswa').split(' ')[0];

  // Greeting berdasarkan jam
  const hour = new Date().getHours();
  let greeting = 'Selamat datang kembali,';
  if (hour < 11) greeting = 'Selamat pagi,';
  else if (hour < 15) greeting = 'Selamat siang,';
  else if (hour < 18) greeting = 'Selamat sore,';
  else greeting = 'Selamat malam,';
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) greetingEl.textContent = greeting;

  // Logout
  ['logout-btn', 'logout-btn-2'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handleLogout);
  });
}

// ------------------------------------------------------------
// 5. DASHBOARD GURU
// ------------------------------------------------------------
async function initDashboardGuruPage() {
  const user = await requireAuth();
  if (!user) return;

  const profile = await getCurrentProfile();
  if (!profile) return;

  if (profile.role !== 'guru') {
    window.location.href = 'dashboard-siswa.html';
    return;
  }

  // Nama guru
  const initial = (profile.full_name || 'G').charAt(0).toUpperCase();
  const avatarEl = document.getElementById('user-avatar');
  const nameEl = document.getElementById('user-name');
  const nipEl = document.getElementById('user-nip');
  const welcomeEl = document.getElementById('welcome-name');

  if (avatarEl) avatarEl.textContent = initial;
  if (nameEl) nameEl.textContent = profile.full_name || 'Guru';
  if (nipEl) nipEl.textContent = profile.nis_nip ? 'NIP: ' + profile.nis_nip : 'Pengajar K3';
  if (welcomeEl) welcomeEl.textContent = (profile.full_name || 'Guru').split(' ')[0];

  // Logout
  ['logout-btn', 'logout-btn-2'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handleLogout);
  });

  // Muat data siswa
  await loadDataSiswaGuru();
}

async function loadDataSiswaGuru() {
  const { data: siswaList, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('role', 'siswa')
    .order('full_name');

  if (error) {
    console.error(error);
    return;
  }

  const tbody = document.querySelector('#tabel-siswa tbody');
  if (!tbody) return;

  const render = (list) => {
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray-500);">Belum ada data siswa</td></tr>';
      return;
    }
    tbody.innerHTML = list.map(s => `
      <tr>
        <td>${s.full_name || '-'}</td>
        <td>${s.nis_nip || '-'}</td>
        <td>${s.kelas || '-'}</td>
        <td>${s.email || '-'}</td>
        <td>-</td>
      </tr>
    `).join('');
  };

  render(siswaList);

  const filterInput = document.getElementById('filter-siswa');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      render(siswaList.filter(s =>
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.kelas || '').toLowerCase().includes(q) ||
        (s.nis_nip || '').toLowerCase().includes(q)
      ));
    });
  }
}

// ------------------------------------------------------------
// 6. HALAMAN MATERI
// ------------------------------------------------------------
async function initMateriPage() {
  const user = await requireAuth();
  if (!user) return;

  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';

  // Tombol back
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html';
    });
  }

  if (isGuru) {
    const addBtn = document.getElementById('btn-add-materi');
    if (addBtn) addBtn.style.display = 'inline-flex';
  }

  await loadMateri(isGuru);
}

async function loadMateri(isGuru) {
  const { data, error } = await supabaseClient
    .from('materials')
    .select('*')
    .order('order_index');

  if (error) {
    console.error(error);
    showToast('Gagal memuat materi', 'error');
    return;
  }

  const container = document.getElementById('materi-list');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book-open"></i>
        <h3>Belum ada materi</h3>
        <p>Materi akan muncul di sini setelah ditambahkan.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(m => `
    <div class="materi-card">
      <h3>${m.title}</h3>
      <p>${m.content ? m.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : ''}</p>
      ${isGuru ? `
        <div class="card-actions">
          <button onclick="hapusMateri('${m.id}')">🗑️ Hapus</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

window.hapusMateri = async (id) => {
  if (!confirm('Yakin ingin menghapus materi ini?')) return;
  const { error } = await supabaseClient.from('materials').delete().eq('id', id);
  if (error) showToast('Gagal menghapus: ' + error.message, 'error');
  else {
    showToast('Materi dihapus', 'success');
    const profile = await getCurrentProfile();
    loadMateri(profile?.role === 'guru');
  }
};

// ------------------------------------------------------------
// 7. HALAMAN VIDEO
// ------------------------------------------------------------
async function initVideoPage() {
  const user = await requireAuth();
  if (!user) return;

  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html';
    });
  }

  if (isGuru) {
    const addBtn = document.getElementById('btn-add-video');
    if (addBtn) addBtn.style.display = 'inline-flex';
  }

  await loadVideo(isGuru);
}

async function loadVideo(isGuru) {
  const { data, error } = await supabaseClient
    .from('videos')
    .select('*')
    .order('order_index');

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById('video-list');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-video"></i>
        <h3>Belum ada video</h3>
        <p>Video pembelajaran akan muncul di sini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(v => `
    <div class="video-card">
      <div class="video-thumb">
        <iframe src="${v.video_url}" frameborder="0" allowfullscreen style="width:100%;height:100%;"></iframe>
      </div>
      <div class="video-body">
        <h4 class="video-title">${v.title}</h4>
        <p class="video-desc">${v.description || ''}</p>
        ${isGuru ? `
          <div class="card-actions">
            <button onclick="hapusVideo('${v.id}')">🗑️ Hapus</button>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

window.hapusVideo = async (id) => {
  if (!confirm('Yakin ingin menghapus video ini?')) return;
  const { error } = await supabaseClient.from('videos').delete().eq('id', id);
  if (error) showToast('Gagal: ' + error.message, 'error');
  else {
    showToast('Video dihapus', 'success');
    const profile = await getCurrentProfile();
    loadVideo(profile?.role === 'guru');
  }
};

// ------------------------------------------------------------
// 8. HALAMAN LATIHAN
// ------------------------------------------------------------
async function initLatihanPage() {
  const user = await requireAuth();
  if (!user) return;

  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html';
    });
  }

  const { data, error } = await supabaseClient
    .from('exercises')
    .select('*')
    .order('created_at');

  if (error) return console.error(error);

  const container = document.getElementById('latihan-list');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-pen-to-square"></i>
        <h3>Belum ada latihan</h3>
        <p>Latihan soal akan muncul di sini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(l => `
    <div class="latihan-card">
      <h3>${l.title}</h3>
      <p>${l.description || ''}</p>
      <button onclick="kerjakanLatihan('${l.id}')">Kerjakan</button>
    </div>
  `).join('');
}

window.kerjakanLatihan = (id) => {
  showToast('Fitur kerjakan latihan akan dikembangkan. ID: ' + id, 'info');
};

// ------------------------------------------------------------
// 9. HALAMAN KUIS
// ------------------------------------------------------------
async function initKuisPage() {
  const user = await requireAuth();
  if (!user) return;

  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html';
    });
  }

  if (isGuru) {
    const addBtn = document.getElementById('btn-add-kuis');
    if (addBtn) addBtn.style.display = 'inline-flex';
  }

  await loadKuis(isGuru);
}

async function loadKuis(isGuru) {
  const { data, error } = await supabaseClient
    .from('quizzes')
    .select('*')
    .eq('is_active', true);

  if (error) return console.error(error);

  const container = document.getElementById('kuis-list');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-question"></i>
        <h3>Belum ada kuis</h3>
        <p>Kuis akan muncul di sini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = data.map(k => `
    <div class="kuis-card">
      <h3>${k.title}</h3>
      <p>${k.description || ''}</p>
      <p>⏱️ Durasi: ${k.duration_minutes} menit</p>
      ${isGuru
        ? `<button onclick="lihatHasilKuis('${k.id}')">📊 Lihat Hasil</button>`
        : `<button onclick="mulaiKuis('${k.id}')">Mulai Kuis</button>`
      }
    </div>
  `).join('');
}

window.mulaiKuis = (id) => showToast('Fitur kuis akan dikembangkan. ID: ' + id, 'info');
window.lihatHasilKuis = (id) => showToast('Fitur lihat hasil akan dikembangkan. ID: ' + id, 'info');

// ------------------------------------------------------------
// 10. HALAMAN NILAI
// ------------------------------------------------------------
async function initNilaiPage() {
  const user = await requireAuth();
  if (!user) return;

  const profile = await getCurrentProfile();
  const role = profile?.role;

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = role === 'guru' ? 'Guru' : 'Siswa';

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = role === 'guru' ? 'dashboard-guru.html' : 'dashboard-siswa.html';
    });
  }

  if (role === 'guru') {
    const viewSiswa = document.getElementById('nilai-siswa-view');
    const viewGuru = document.getElementById('nilai-guru-view');
    if (viewSiswa) viewSiswa.style.display = 'none';
    if (viewGuru) viewGuru.style.display = 'block';
    await loadNilaiGuru();
  } else {
    const viewSiswa = document.getElementById('nilai-siswa-view');
    const viewGuru = document.getElementById('nilai-guru-view');
    if (viewSiswa) viewSiswa.style.display = 'block';
    if (viewGuru) viewGuru.style.display = 'none';
    await loadNilaiSiswa(user.id);
  }
}

async function loadNilaiSiswa(studentId) {
  const { data, error } = await supabaseClient
    .from('grades')
    .select('*, courses(title)')
    .eq('student_id', studentId);

  if (error) return console.error(error);

  const tbody = document.querySelector('#tabel-nilai-siswa tbody');
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--gray-500);">Belum ada nilai</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(n => `
    <tr>
      <td>${n.courses?.title || '-'}</td>
      <td>${n.exercise_score ?? '-'}</td>
      <td>${n.quiz_score ?? '-'}</td>
      <td><strong>${n.final_score ?? '-'}</strong></td>
    </tr>
  `).join('');
}

async function loadNilaiGuru() {
  const { data, error } = await supabaseClient
    .from('grades')
    .select('*, profiles(full_name, kelas), courses(title)');

  if (error) return console.error(error);

  const tbody = document.querySelector('#tabel-nilai-guru tbody');
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray-500);">Belum ada data nilai</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(n => `
    <tr>
      <td>${n.profiles?.full_name || '-'}</td>
      <td>${n.profiles?.kelas || '-'}</td>
      <td>${n.exercise_score ?? '-'}</td>
      <td>${n.quiz_score ?? '-'}</td>
      <td><strong>${n.final_score ?? '-'}</strong></td>
    </tr>
  `).join('');
}

// ------------------------------------------------------------
// 11. ROUTER OTOMATIS
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body.dataset.page;
  if (!page) return;

  switch (page) {
    case 'login':            initLoginPage();                  break;
    case 'dashboard-siswa':  await initDashboardSiswaPage();   break;
    case 'dashboard-guru':   await initDashboardGuruPage();    break;
    case 'materi':           await initMateriPage();           break;
    case 'video':            await initVideoPage();            break;
    case 'latihan':          await initLatihanPage();          break;
    case 'kuis':             await initKuisPage();             break;
    case 'nilai':            await initNilaiPage();            break;
    default:
      console.warn('Halaman tidak dikenal:', page);
  }
});
