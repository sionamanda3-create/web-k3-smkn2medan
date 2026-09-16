// ============================================================
// MEDIA PEMBELAJARAN K3 — SMK NEGERI 2 MEDAN
// File: js/app.js
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

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-message');
  if (!toast || !msg) { alert(message); return; }
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
// HELPER: Generate password siswa (untuk login siswa)
// Formula: k3-{nama}-{kelas}
// ------------------------------------------------------------
function generateStudentPassword(nama, kelas) {
  const namaBersih = nama.toLowerCase().replace(/\s+/g, '');
  const kelasBersih = kelas.replace(/\s+/g, '').toUpperCase();
  return `k3-${namaBersih}-${kelasBersih}`;
}

// ------------------------------------------------------------
// 3. HALAMAN LOGIN (2 TAHAP + REGISTRASI GURU)
// ------------------------------------------------------------
function initLoginPage() {
  function showStep(stepId) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(stepId);
    if (target) target.classList.add('active');
  }

  // STEP 1: Pilih Peran
  document.getElementById('choose-siswa')?.addEventListener('click', () => showStep('step-siswa'));
  document.getElementById('choose-guru')?.addEventListener('click', () => showStep('step-guru'));

  // Tombol Kembali
  document.getElementById('back-from-siswa')?.addEventListener('click', () => showStep('step-role'));
  document.getElementById('back-from-guru')?.addEventListener('click', () => showStep('step-role'));
  document.getElementById('back-from-register')?.addEventListener('click', () => showStep('step-guru'));

  // Link Register
  document.getElementById('link-register-guru')?.addEventListener('click', () => showStep('step-register'));

  // Toggle password login guru
  const toggleLogin = document.getElementById('toggle-password-guru');
  const pwdLogin = document.getElementById('guru-password');
  if (toggleLogin && pwdLogin) {
    toggleLogin.addEventListener('click', () => {
      const isPwd = pwdLogin.type === 'password';
      pwdLogin.type = isPwd ? 'text' : 'password';
      const icon = toggleLogin.querySelector('i');
      if (icon) icon.className = isPwd ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  }

  // Toggle password register
  const toggleReg = document.getElementById('toggle-password-reg');
  const pwdReg = document.getElementById('reg-password');
  if (toggleReg && pwdReg) {
    toggleReg.addEventListener('click', () => {
      const isPwd = pwdReg.type === 'password';
      pwdReg.type = isPwd ? 'text' : 'password';
      const icon = toggleReg.querySelector('i');
      if (icon) icon.className = isPwd ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  }

  // ============================================================
  // LOGIN SISWA: Nama + Kelas
  // ============================================================
  const formSiswa = document.getElementById('login-form-siswa');
  const btnLoginSiswa = document.getElementById('btn-login-siswa');

  formSiswa?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('siswa-nama').value.trim();
    const kelas = document.getElementById('siswa-kelas').value;

    if (!nama || !kelas) {
      showToast('Nama dan kelas wajib diisi!', 'error');
      return;
    }

    btnLoginSiswa?.classList.add('loading');
    if (btnLoginSiswa) btnLoginSiswa.disabled = true;

    try {
      const { data: siswa, error: siswaErr } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('full_name', nama)
        .eq('kelas', kelas)
        .eq('role', 'siswa')
        .maybeSingle();

      if (siswaErr || !siswa) {
        showToast('Siswa tidak ditemukan. Cek nama & kelas.', 'error');
        return;
      }

      if (!siswa.email) {
        showToast('Akun siswa belum punya email. Hubungi guru.', 'error');
        return;
      }

      const password = generateStudentPassword(nama, kelas);

      const { error: authErr } = await supabaseClient.auth.signInWithPassword({
        email: siswa.email,
        password: password
      });

      if (authErr) {
        showToast('Login gagal: ' + authErr.message, 'error');
        return;
      }

      showToast('Login berhasil! Halo ' + siswa.full_name.split(' ')[0], 'success');
      setTimeout(() => { window.location.href = 'dashboard-siswa.html'; }, 800);

    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      if (btnLoginSiswa) {
        btnLoginSiswa.classList.remove('loading');
        btnLoginSiswa.disabled = false;
      }
    }
  });

  // ============================================================
  // LOGIN GURU: Email + Password
  // ============================================================
  const formGuru = document.getElementById('login-form-guru');
  const btnLoginGuru = document.getElementById('btn-login-guru');

  formGuru?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('guru-email').value.trim();
    const password = document.getElementById('guru-password').value;

    btnLoginGuru?.classList.add('loading');
    if (btnLoginGuru) btnLoginGuru.disabled = true;

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        showToast('Login gagal: ' + error.message, 'error');
        return;
      }

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

      if (profile.role !== 'guru') {
        showToast('Akun ini bukan akun guru!', 'error');
        await supabaseClient.auth.signOut();
        return;
      }

      showToast('Login berhasil! Halo ' + profile.full_name, 'success');
      setTimeout(() => { window.location.href = 'dashboard-guru.html'; }, 800);

    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      if (btnLoginGuru) {
        btnLoginGuru.classList.remove('loading');
        btnLoginGuru.disabled = false;
      }
    }
  });

  // ============================================================
  // REGISTRASI GURU BARU
  // ============================================================
  const formReg = document.getElementById('register-form-guru');
  const btnReg = document.getElementById('btn-register-guru');

  formReg?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = document.getElementById('reg-nama').value.trim();
    const nip = document.getElementById('reg-nip').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;

    if (!nama || !email || !password) {
      showToast('Nama, email, dan password wajib diisi!', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password minimal 6 karakter!', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      showToast('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    btnReg?.classList.add('loading');
    if (btnReg) btnReg.disabled = true;

    try {
      // 1. Daftar ke Supabase Auth
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: nama,
            role: 'guru',
            nis_nip: nip || null
          }
        }
      });

      if (error) {
        showToast('Registrasi gagal: ' + error.message, 'error');
        return;
      }

      if (!data.user) {
        showToast('Registrasi gagal: user tidak terbuat.', 'error');
        return;
      }

      // 2. Update profile dengan nis_nip (jika diisi)
      // Trigger handle_new_user sudah buat baris profiles
      if (nip) {
        await supabaseClient
          .from('profiles')
          .update({ nis_nip: nip })
          .eq('id', data.user.id);
      }

      showToast('Registrasi berhasil! Silakan login.', 'success');

      // Reset form
      formReg.reset();

      // Kembali ke halaman login guru setelah 1.5 detik
      setTimeout(() => showStep('step-guru'), 1500);

    } catch (err) {
      showToast('Terjadi kesalahan: ' + err.message, 'error');
    } finally {
      if (btnReg) {
        btnReg.classList.remove('loading');
        btnReg.disabled = false;
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

  const initial = (profile.full_name || 'S').charAt(0).toUpperCase();
  const avatarEl = document.getElementById('user-avatar');
  const nameEl = document.getElementById('user-name');
  const kelasEl = document.getElementById('user-kelas');
  const welcomeEl = document.getElementById('welcome-name');

  if (avatarEl) avatarEl.textContent = initial;
  if (nameEl) nameEl.textContent = profile.full_name || 'Siswa';
  if (kelasEl) kelasEl.textContent = profile.kelas || 'Teknik Pemesinan';
  if (welcomeEl) welcomeEl.textContent = (profile.full_name || 'Siswa').split(' ')[0];

  const hour = new Date().getHours();
  let greeting = 'Selamat datang kembali,';
  if (hour < 11) greeting = 'Selamat pagi,';
  else if (hour < 15) greeting = 'Selamat siang,';
  else if (hour < 18) greeting = 'Selamat sore,';
  else greeting = 'Selamat malam,';
  const greetingEl = document.getElementById('greeting');
  if (greetingEl) greetingEl.textContent = greeting;

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

  const initial = (profile.full_name || 'G').charAt(0).toUpperCase();
  const avatarEl = document.getElementById('user-avatar');
  const nameEl = document.getElementById('user-name');
  const nipEl = document.getElementById('user-nip');
  const welcomeEl = document.getElementById('welcome-name');

  if (avatarEl) avatarEl.textContent = initial;
  if (nameEl) nameEl.textContent = profile.full_name || 'Guru';
  if (nipEl) nipEl.textContent = profile.nis_nip ? 'NIP: ' + profile.nis_nip : 'Pengajar K3';
  if (welcomeEl) welcomeEl.textContent = (profile.full_name || 'Guru').split(' ')[0];

  ['logout-btn', 'logout-btn-2'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handleLogout);
  });

  await loadDataSiswaGuru();
}

async function loadDataSiswaGuru() {
  const { data: siswaList, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('role', 'siswa')
    .order('full_name');

  if (error) { console.error(error); return; }

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
// 6-10. HALAMAN LAINNYA (Materi, Video, Latihan, Kuis, Nilai)
// ------------------------------------------------------------
async function initMateriPage() {
  const user = await requireAuth();
  if (!user) return;
  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';

  document.getElementById('back-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html';
  });

  if (isGuru) {
    const addBtn = document.getElementById('btn-add-materi');
    if (addBtn) addBtn.style.display = 'inline-flex';
  }

  const { data, error } = await supabaseClient.from('materials').select('*').order('order_index');
  if (error) return console.error(error);

  const container = document.getElementById('materi-list');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-book-open"></i><h3>Belum ada materi</h3><p>Materi akan muncul di sini.</p></div>`;
    return;
  }

  container.innerHTML = data.map(m => `
    <div class="materi-card">
      <h3>${m.title}</h3>
      <p>${m.content ? m.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : ''}</p>
      ${isGuru ? `<div class="card-actions"><button onclick="hapusMateri('${m.id}')">🗑️ Hapus</button></div>` : ''}
    </div>
  `).join('');
}

window.hapusMateri = async (id) => {
  if (!confirm('Yakin ingin menghapus materi ini?')) return;
  const { error } = await supabaseClient.from('materials').delete().eq('id', id);
  if (error) showToast('Gagal: ' + error.message, 'error');
  else { showToast('Materi dihapus', 'success'); initMateriPage(); }
};

async function initVideoPage() {
  const user = await requireAuth();
  if (!user) return;
  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';

  document.getElementById('back-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html';
  });

  if (isGuru) {
    const addBtn = document.getElementById('btn-add-video');
    if (addBtn) addBtn.style.display = 'inline-flex';
  }

  const { data, error } = await supabaseClient.from('videos').select('*').order('order_index');
  if (error) return console.error(error);

  const container = document.getElementById('video-list');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-video"></i><h3>Belum ada video</h3><p>Video akan muncul di sini.</p></div>`;
    return;
  }

  container.innerHTML = data.map(v => `
    <div class="video-card">
      <div class="video-thumb"><iframe src="${v.video_url}" frameborder="0" allowfullscreen style="width:100%;height:100%;"></iframe></div>
      <div class="video-body">
        <h4 class="video-title">${v.title}</h4>
        <p class="video-desc">${v.description || ''}</p>
        ${isGuru ? `<div class="card-actions"><button onclick="hapusVideo('${v.id}')">🗑️ Hapus</button></div>` : ''}
      </div>
    </div>
  `).join('');
}

window.hapusVideo = async (id) => {
  if (!confirm('Yakin ingin menghapus video ini?')) return;
  const { error } = await supabaseClient.from('videos').delete().eq('id', id);
  if (error) showToast('Gagal: ' + error.message, 'error');
  else { showToast('Video dihapus', 'success'); initVideoPage(); }
};

async function initLatihanPage() {
  const user = await requireAuth();
  if (!user) return;
  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';

  document.getElementById('back-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html';
  });

  const { data, error } = await supabaseClient.from('exercises').select('*').order('created_at');
  if (error) return console.error(error);

  const container = document.getElementById('latihan-list');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-pen-to-square"></i><h3>Belum ada latihan</h3><p>Latihan akan muncul di sini.</p></div>`;
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

window.kerjakanLatihan = (id) => showToast('Fitur latihan akan dikembangkan. ID: ' + id, 'info');

async function initKuisPage() {
  const user = await requireAuth();
  if (!user) return;
  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';

  document.getElementById('back-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html';
  });

  if (isGuru) {
    const addBtn = document.getElementById('btn-add-kuis');
    if (addBtn) addBtn.style.display = 'inline-flex';
  }

  const { data, error } = await supabaseClient.from('quizzes').select('*').eq('is_active', true);
  if (error) return console.error(error);

  const container = document.getElementById('kuis-list');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-clipboard-question"></i><h3>Belum ada kuis</h3><p>Kuis akan muncul di sini.</p></div>`;
    return;
  }

  container.innerHTML = data.map(k => `
    <div class="kuis-card">
      <h3>${k.title}</h3>
      <p>${k.description || ''}</p>
      <p>⏱️ Durasi: ${k.duration_minutes} menit</p>
      ${isGuru
        ? `<button onclick="lihatHasilKuis('${k.id}')">📊 Lihat Hasil</button>`
        : `<button onclick="mulaiKuis('${k.id}')">Mulai Kuis</button>`}
    </div>
  `).join('');
}

window.mulaiKuis = (id) => showToast('Fitur kuis akan dikembangkan. ID: ' + id, 'info');
window.lihatHasilKuis = (id) => showToast('Fitur hasil kuis akan dikembangkan. ID: ' + id, 'info');

async function initNilaiPage() {
  const user = await requireAuth();
  if (!user) return;
  const profile = await getCurrentProfile();
  const role = profile?.role;

  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = role === 'guru' ? 'Guru' : 'Siswa';

  document.getElementById('back-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = role === 'guru' ? 'dashboard-guru.html' : 'dashboard-siswa.html';
  });

  const viewSiswa = document.getElementById('nilai-siswa-view');
  const viewGuru = document.getElementById('nilai-guru-view');

  if (role === 'guru') {
    if (viewSiswa) viewSiswa.style.display = 'none';
    if (viewGuru) viewGuru.style.display = 'block';

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
  } else {
    if (viewSiswa) viewSiswa.style.display = 'block';
    if (viewGuru) viewGuru.style.display = 'none';

    const { data, error } = await supabaseClient
      .from('grades')
      .select('*, courses(title)')
      .eq('student_id', user.id);
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
