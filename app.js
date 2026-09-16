// ============================================================
// MEDIA PEMBELAJARAN K3 — SMK NEGERI 2 MEDAN
// ============================================================

const SUPABASE_URL = 'https://ddnhwcxfktcsyngupdex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ogAtXLGklIivo88I41J8ZA_9CWzS8D3';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- Helper ----------
async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await supabaseClient
    .from('profiles').select('*').eq('id', user.id).single();
  return data;
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) { window.location.href = 'index.html'; return null; }
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

  const icons = { error:'fa-circle-exclamation', success:'fa-circle-check', info:'fa-circle-info' };
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

// ============================================================
// HALAMAN LOGIN
// ============================================================
function initLoginPage() {
  console.log('✅ initLoginPage jalan');

  // Pindah step
  function showStep(stepId) {
    console.log('➡️ showStep:', stepId);
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(stepId);
    if (target) target.classList.add('active');
  }

  // STEP 1 — pilih peran
  const btnSiswa = document.getElementById('choose-siswa');
  const btnGuru  = document.getElementById('choose-guru');
  if (btnSiswa) btnSiswa.onclick = () => { muatDaftarSiswa(); showStep('step-siswa'); };
  if (btnGuru)  btnGuru.onclick  = () => showStep('step-guru');

  // Tombol kembali
  const backSiswa = document.getElementById('back-from-siswa');
  const backGuru  = document.getElementById('back-from-guru');
  const backReg   = document.getElementById('back-from-register');
  if (backSiswa) backSiswa.onclick = () => showStep('step-role');
  if (backGuru)  backGuru.onclick  = () => showStep('step-role');
  if (backReg)   backReg.onclick   = () => showStep('step-guru');

  // Link daftar guru
  const linkReg = document.getElementById('link-register-guru');
  if (linkReg) linkReg.onclick = () => showStep('step-register');

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

  // ---------- LOGIN SISWA ----------
  const formSiswa = document.getElementById('login-form-siswa');
  if (formSiswa) {
    formSiswa.onsubmit = async (e) => {
      e.preventDefault();

      const nama = document.getElementById('siswa-nama').value;
      const kelas = document.getElementById('siswa-kelas').value;
      const btn = document.getElementById('btn-login-siswa');

      if (!nama || !kelas) {
        showToast('Nama dan kelas wajib diisi!', 'error');
        return;
      }

      if (btn) { btn.classList.add('loading'); btn.disabled = true; }

      try {
        const { data: siswa, error } = await supabaseClient
          .from('profiles').select('*')
          .eq('full_name', nama)
          .eq('kelas', kelas)
          .eq('role', 'siswa')
          .maybeSingle();

        if (error || !siswa) {
          showToast('Data siswa tidak ditemukan.', 'error');
          return;
        }

        const password = generateStudentPassword(nama, kelas);
        console.log('🔑 Password siswa:', password);

        const { error: authErr } = await supabaseClient.auth.signInWithPassword({
          email: siswa.email,
          password
        });

        if (authErr) {
          showToast('Login gagal: ' + authErr.message, 'error');
          return;
        }

        showToast('Login berhasil! Selamat datang.', 'success');
        setTimeout(() => { window.location.href = 'dashboard-siswa.html'; }, 700);

      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
      }
    };
  }

  // ---------- LOGIN GURU ----------
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
          .from('profiles').select('role, full_name').eq('id', data.user.id).single();

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

  // ---------- REGISTRASI GURU ----------
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
        showToast('Nama, email, dan password wajib diisi!', 'error'); return;
      }
      if (password.length < 6) {
        showToast('Password minimal 6 karakter!', 'error'); return;
      }
      if (password !== konfirmasi) {
        showToast('Konfirmasi password tidak cocok!', 'error'); return;
      }

      if (btn) { btn.classList.add('loading'); btn.disabled = true; }

      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email, password,
          options: { data: { full_name: nama, role: 'guru', nis_nip: nip || null } }
        });

        if (error) { showToast('Gagal daftar: ' + error.message, 'error'); return; }
        if (!data.user) { showToast('Gagal daftar.', 'error'); return; }

        if (nip) {
          await supabaseClient.from('profiles').update({ nis_nip: nip }).eq('id', data.user.id);
        }

        showToast('Registrasi berhasil! Silakan login.', 'success');
        formReg.reset();
        setTimeout(() => showStep('step-guru'), 1500);

      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      } finally {
        if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
      }
    };
  }
}

// ============================================================
// MUAT DAFTAR SISWA KE DROPDOWN
// ============================================================
async function muatDaftarSiswa() {
  const selectNama = document.getElementById('siswa-nama');
  if (!selectNama) return;

  selectNama.innerHTML = '<option value="">-- Memuat... --</option>';

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('full_name, kelas')
    .eq('role', 'siswa')
    .order('full_name');

  if (error || !data) {
    selectNama.innerHTML = '<option value="">-- Gagal memuat --</option>';
    return;
  }

  if (data.length === 0) {
    selectNama.innerHTML = '<option value="">-- Belum ada siswa terdaftar --</
