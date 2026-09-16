// ============================================================
// MEDIA PEMBELAJARAN K3 — SMK NEGERI 2 MEDAN
// File: js/app.js
// ============================================================

const SUPABASE_URL = 'https://ddnhwcxfktcsyngupdex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ogAtXLGklIivo88I41J8ZA_9CWzS8D3';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------------------------------------------
// HELPER UMUM
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

function generateStudentPassword(nama, kelas) {
  const namaBersih = nama.toLowerCase().replace(/\s+/g, '');
  const kelasBersih = kelas.replace(/\s+/g, '').toUpperCase();
  return `k3-${namaBersih}-${kelasBersih}`;
}

// ------------------------------------------------------------
// HALAMAN LOGIN — 3 STEP
// ------------------------------------------------------------
function initLoginPage() {
  console.log('✅ initLoginPage jalan');

  // Helper pindah step
  window.__showStep = function(stepId) {
    console.log('➡️ Pindah ke:', stepId);
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(stepId);
    if (target) {
      target.classList.add('active');
    } else {
      console.warn('❌ Step tidak ditemukan:', stepId);
    }
  };

  // STEP 1: pilih peran
  const btnSiswa = document.getElementById('choose-siswa');
  const btnGuru  = document.getElementById('choose-guru');

  if (btnSiswa) {
    btnSiswa.onclick = (e) => {
      e.preventDefault();
      window.__showStep('step-siswa');
    };
  }

  if (btnGuru) {
    btnGuru.onclick = (e) => {
      e.preventDefault();
      window.__showStep('step-guru');
    };
  }

  // Tombol kembali
  const backSiswa = document.getElementById('back-from-siswa');
  const backGuru  = document.getElementById('back-from-guru');
  const backReg   = document.getElementById('back-from-register');

  if (backSiswa) backSiswa.onclick = () => window.__showStep('step-role');
  if (backGuru)  backGuru.onclick  = () => window.__showStep('step-role');
  if (backReg)   backReg.onclick   = () => window.__showStep('step-guru');

  // Link daftar guru
  const linkReg = document.getElementById('link-register-guru');
  if (linkReg) linkReg.onclick = () => window.__showStep('step-register');

  // Toggle password
  function setupToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (btn && input) {
      btn.onclick = () => {
        const isPwd = input.type === 'password';
        input.type = isPwd ? 'text' : 'password';
        const icon = btn.querySelector('i');
        if (icon) icon.className = isPwd ? 'fas fa-eye-slash' : 'fas fa-eye';
      };
    }
  }
  setupToggle('toggle-password-guru', 'guru-password');
  setupToggle('toggle-password-reg', 'reg-password');

  // LOGIN SISWA
  const formSiswa = document.getElementById('login-form-siswa');
  if (formSiswa) {
    formSiswa.onsubmit = async (e) => {
      e.preventDefault();

      const nama = document.getElementById('siswa-nama').value.trim();
      const kelas = document.getElementById('siswa-kelas').value;
      const btn = document.getElementById('btn-login-siswa');

      if (!nama || !kelas) {
        showToast('Nama dan kelas wajib diisi!', 'error');
        return;
      }

      if (btn) { btn.classList.add('loading'); btn.disabled = true; }

      try {
        const { data: siswa, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('full_name', nama)
          .eq('kelas', kelas)
          .eq('role', 'siswa')
          .maybeSingle();

        if (error || !siswa) {
          showToast('Siswa tidak ditemukan. Cek nama & kelas.', 'error');
          return;
        }

        const password = generateStudentPassword(nama, kelas);
        console.log('🔑 Password yang dipakai:', password);

        const { error: authErr } = await supabaseClient.auth.signInWithPassword({
          email: siswa.email,
          password
        });

        if (authErr) {
          showToast('Login gagal: ' + authErr.message, 'error');
          return;
        }

        showToast('Login berhasil!', 'success');
        setTimeout(() => { window.location.href = 'dashboard-siswa.html'; }, 700);
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
      }
    };
  }

  // LOGIN GURU
  const formGuru = document.getElementById('login-form-guru');
  if (formGuru) {
    formGuru.onsubmit = async (e) => {
      e.preventDefault();

      const email = document.getElementById('guru-email').value.trim();
      const password = document.getElementById('guru-password').value;
      const btn = document.getElementById('btn-login-guru');

      if (btn) { btn.classList.add('loading'); btn.disabled = true; }

      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
          showToast('Login gagal: ' + error.message, 'error');
          return;
        }

        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single();

        if (profile?.role !== 'guru') {
          showToast('Akun ini bukan akun guru!', 'error');
          await supabaseClient.auth.signOut();
          return;
        }

        showToast('Login berhasil! Halo ' + profile.full_name, 'success');
        setTimeout(() => { window.location.href = 'dashboard-guru.html'; }, 700);
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
      }
    };
  }

  // REGISTRASI GURU
  const formReg = document.getElementById('register-form-guru');
  if (formReg) {
    formReg.onsubmit = async (e) => {
      e.preventDefault();

      const nama = document.getElementById('reg-nama').value.trim();
      const nip = document.getElementById('reg-nip').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const konfirmasi = document.getElementById('reg-password-confirm').value;
      const btn = document.getElementById('btn-register-guru');

      if (!nama || !email || !password) {
        showToast('Nama, email, dan password wajib diisi!', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('Password minimal 6 karakter!', 'error');
        return;
      }
      if (password !== konfirmasi) {
        showToast('Konfirmasi password tidak cocok!', 'error');
        return;
      }

      if (btn) { btn.classList.add('loading'); btn.disabled = true; }

      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: nama, role: 'guru', nis_nip: nip || null }
          }
        });

        if (error) { showToast('Gagal daftar: ' + error.message, 'error'); return; }
        if (!data.user) { showToast('Gagal daftar.', 'error'); return; }

        if (nip) {
          await supabaseClient.from('profiles').update({ nis_nip: nip }).eq('id', data.user.id);
        }

        showToast('Registrasi berhasil! Silakan login.', 'success');
        formReg.reset();
        setTimeout(() => window.__showStep('step-guru'), 1500);
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
      }
    };
  }
}

// ------------------------------------------------------------
// DASHBOARD SISWA
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
    if (btn) btn.onclick = handleLogout;
  });
}

// ------------------------------------------------------------
// DASHBOARD GURU
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
    if (btn) btn.onclick = handleLogout;
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
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#6b7280;">Belum ada data siswa</td></tr>';
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
    filterInput.oninput = (e) => {
      const q = e.target.value.toLowerCase();
      render(siswaList.filter(s =>
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.kelas || '').toLowerCase().includes(q) ||
        (s.nis_nip || '').toLowerCase().includes(q)
      ));
    };
  }
}

// ------------------------------------------------------------
// PLACEHOLDER HALAMAN LAIN
// ------------------------------------------------------------
async function initMateriPage() {
  const user = await requireAuth(); if (!user) return;
  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';
  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.onclick = (e) => { e.preventDefault(); window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html'; };
}

async function initVideoPage() {
  const user = await requireAuth(); if (!user) return;
  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';
  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.onclick = (e) => { e.preventDefault(); window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html'; };
}

async function initLatihanPage() {
  const user = await requireAuth(); if (!user) return;
  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';
  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.onclick = (e) => { e.preventDefault(); window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html'; };
}

async function initKuisPage() {
  const user = await requireAuth(); if (!user) return;
  const profile = await getCurrentProfile();
  const isGuru = profile?.role === 'guru';
  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = isGuru ? 'Guru' : 'Siswa';
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.onclick = (e) => { e.preventDefault(); window.location.href = isGuru ? 'dashboard-guru.html' : 'dashboard-siswa.html'; };
}

async function initNilaiPage() {
  const user = await requireAuth(); if (!user) return;
  const profile = await getCurrentProfile();
  const role = profile?.role;
  const roleEl = document.getElementById('user-role');
  if (roleEl) roleEl.textContent = role === 'guru' ? 'Guru' : 'Siswa';
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.onclick = (e) => { e.preventDefault(); window.location.href = role === 'guru' ? 'dashboard-guru.html' : 'dashboard-siswa.html'; };
}

// ------------------------------------------------------------
// ROUTER OTOMATIS
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  console.log('📄 Halaman:', page);
  if (!page) return;

  switch (page) {
    case 'login':            initLoginPage();              break;
    case 'dashboard-siswa':  initDashboardSiswaPage();     break;
    case 'dashboard-guru':   initDashboardGuruPage();      break;
    case 'materi':           initMateriPage();             break;
    case 'video':            initVideoPage();              break;
    case 'latihan':          initLatihanPage();            break;
    case 'kuis':             initKuisPage();               break;
    case 'nilai':            initNilaiPage();              break;
    default: console.warn('Halaman tidak dikenal:', page);
  }
});
