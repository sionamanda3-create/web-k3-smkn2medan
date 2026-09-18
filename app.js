<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Dashboard Guru - Media Pembelajaran K3 SMK Negeri 2 Medan">
  <title>Dashboard Guru | Media Pembelajaran K3</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <!-- Style System Utama -->
  <link rel="stylesheet" href="css/style.css">

  <!-- CSS Tambahan Dashboard -->
  <style>
    .progress-bar-custom {
      height: 8px;
      background: var(--gray-100);
      border-radius: var(--radius-pill);
      overflow: hidden;
      margin-top: 0.4rem;
    }
    .progress-bar-custom > div {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--primary-light));
      border-radius: var(--radius-pill);
      transition: var(--transition-slow);
    }
    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--gray-500);
    }
    .empty-state i {
      font-size: 2.2rem;
      color: var(--gray-300);
      display: block;
      margin-bottom: 0.75rem;
    }
    .empty-state p { font-size: 0.88rem; }
    .empty-state .sub { font-size: 0.78rem; margin-top: 0.3rem; color: var(--gray-400); }

    /* Tab */
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    /* Modal */
    .modal-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 999;
      justify-content: center; align-items: center;
      padding: 1rem;
    }
    .modal-overlay.show { display: flex; }

    .modal {
      background: white;
      border-radius: var(--radius);
      max-width: 520px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      animation: slideUp 0.3s ease-out;
    }
    .modal-header {
      padding: 1.3rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { font-size: 1.05rem; font-weight: 700; color: var(--gray-800); }
    .modal-close {
      width: 32px; height: 32px;
      border-radius: 8px; border: none;
      background: var(--gray-100); color: var(--gray-600);
      cursor: pointer; font-size: 0.9rem;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-close:hover { background: var(--gray-200); }
    .modal-body { padding: 1.5rem; }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--gray-100);
      display: flex; justify-content: flex-end; gap: 0.6rem;
    }
  </style>
</head>
<body data-page="dashboard-guru" data-role="guru">

  <!-- TOAST -->
  <div id="toast" class="toast">
    <i class="fas fa-info-circle"></i>
    <span id="toast-message">Pesan</span>
  </div>

  <!-- ================= NAVBAR ================= -->
  <nav class="navbar">
    <div class="navbar-left">
      <a href="dashboard-guru.html" class="navbar-brand">
        <div class="brand-icon"><i class="fas fa-hard-hat"></i></div>
        <span>Media K3</span>
      </a>
      <span class="role-badge">Guru</span>
    </div>

    <div class="navbar-right">
      <div class="search-box" style="max-width:260px;">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Cari data...">
      </div>
      <div class="user-chip">
        <div class="user-avatar guru" id="user-avatar">--</div>
        <div class="user-details">
          <span class="user-name" id="user-name">Memuat...</span>
          <span class="user-role" id="user-nip">-</span>
        </div>
      </div>
      <button class="btn-icon" id="logout-btn" title="Keluar">
        <i class="fas fa-right-from-bracket"></i>
      </button>
    </div>
  </nav>

  <!-- ================= CONTAINER ================= -->
  <div class="container">

    <!-- HERO -->
    <div class="hero">
      <div class="hero-content">
        <div class="hero-greeting">Selamat datang kembali,</div>
        <h1>Dashboard <span class="highlight">Guru K3</span></h1>
        <p>Kelola data siswa, materi, dan nilai pembelajaran Keselamatan &amp; Kesehatan Kerja untuk Teknik Pemesinan SMK Negeri 2 Medan.</p>
        <div class="hero-meta">
          <span class="meta-badge"><i class="fas fa-calendar"></i> <span id="heroDate">-</span></span>
          <span class="meta-badge"><i class="fas fa-clock"></i> <span id="heroTime">-</span></span>
          <span class="meta-badge"><i class="fas fa-user-tie"></i> <span id="welcome-name">Guru</span></span>
        </div>
      </div>
    </div>

    <!-- ================= STATISTIK ================= -->
    <div class="section-header">
      <h2><i class="fas fa-chart-pie"></i> Ringkasan Data</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-user-graduate"></i></div>
        <div class="stat-info">
          <div class="stat-label">Total Siswa</div>
          <div class="stat-value" id="stat-siswa">0</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple"><i class="fas fa-chalkboard-user"></i></div>
        <div class="stat-info">
          <div class="stat-label">Total Guru</div>
          <div class="stat-value" id="stat-guru">0</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-book"></i></div>
        <div class="stat-info">
          <div class="stat-label">Materi K3</div>
          <div class="stat-value" id="stat-materi">0</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-clipboard-check"></i></div>
        <div class="stat-info">
          <div class="stat-label">Rata-rata Nilai</div>
          <div class="stat-value" id="stat-nilai">0<small>%</small></div>
        </div>
      </div>
    </div>

    <!-- ================= MENU CEPAT ================= -->
    <div class="section-header">
      <h2><i class="fas fa-bolt"></i> Menu Cepat</h2>
    </div>

    <div class="menu-grid">
      <a href="data-siswa.html" class="menu-item">
        <div class="menu-icon blue"><i class="fas fa-user-graduate"></i></div>
        <div class="menu-label">Data Siswa</div>
        <div class="menu-desc">Kelola siswa</div>
      </a>

      <a href="data-guru.html" class="menu-item">
        <div class="menu-icon purple"><i class="fas fa-chalkboard-user"></i></div>
        <div class="menu-label">Data Guru</div>
        <div class="menu-desc">Kelola guru</div>
      </a>

      <a href="materi.html" class="menu-item">
        <div class="menu-icon green"><i class="fas fa-book"></i></div>
        <div class="menu-label">Materi K3</div>
        <div class="menu-desc">Kelola materi</div>
      </a>

      <a href="nilai.html" class="menu-item">
        <div class="menu-icon orange"><i class="fas fa-clipboard-check"></i></div>
        <div class="menu-label">Nilai Siswa</div>
        <div class="menu-desc">Rekap nilai</div>
      </a>
    </div>

    <!-- ================= PROGRES PEMBELAJARAN ================= -->
    <div class="section-header">
      <h2><i class="fas fa-chart-line"></i> Progres Pembelajaran</h2>
    </div>

    <div class="card">
      <div class="card-body" id="progress-container">
        <div class="empty-state">
          <i class="fas fa-chart-simple"></i>
          <p>Belum ada data progres.</p>
        </div>
      </div>
    </div>

    <!-- ================= KELOLA KONTEN (KHUSUS GURU) ================= -->
    <div class="section-header">
      <h2><i class="fas fa-screwdriver-wrench"></i> Kelola Konten Pembelajaran</h2>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="openModal('materi')">
          <i class="fas fa-plus"></i> Materi
        </button>
        <button class="btn btn-primary btn-sm" onclick="openModal('soal')">
          <i class="fas fa-plus"></i> Soal
        </button>
        <button class="btn btn-primary btn-sm" onclick="openModal('video')">
          <i class="fas fa-plus"></i> Video
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" data-tab="materi" onclick="switchTab('materi')">
            <i class="fas fa-book"></i> Materi
          </button>
          <button class="btn btn-ghost btn-sm" data-tab="soal" onclick="switchTab('soal')">
            <i class="fas fa-clipboard-question"></i> Soal
          </button>
          <button class="btn btn-ghost btn-sm" data-tab="video" onclick="switchTab('video')">
            <i class="fas fa-video"></i> Video
          </button>
        </div>
      </div>

      <!-- Tab Materi -->
      <div id="tab-materi" class="tab-content active">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-materi">
              <tr><td colspan="4"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Soal -->
      <div id="tab-soal" class="tab-content">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pertanyaan</th>
                <th>Jawaban Benar</th>
                <th>Kesulitan</th>
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-soal">
              <tr><td colspan="4"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab Video -->
      <div id="tab-video" class="tab-content">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>URL</th>
                <th>Durasi</th>
                <th style="text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody id="tbody-video">
              <tr><td colspan="4"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ================= MONITORING SISWA LOGIN ================= -->
    <div class="section-header">
      <h2><i class="fas fa-user-check"></i> Monitoring Siswa Login</h2>
      <button class="btn btn-ghost btn-sm" onclick="loadMonitoring()">
        <i class="fas fa-rotate"></i> Muat Ulang
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="d-flex gap-1" style="flex-wrap:wrap;">
          <div class="search-box" style="max-width:300px;">
            <i class="fas fa-search"></i>
            <input type="text" id="filter-monitoring" placeholder="Cari nama atau email...">
          </div>
          <select class="filter-select" id="filter-monitoring-kelas">
            <option value="">Semua Kelas</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Siswa</th>
              <th>Kelas</th>
              <th>Login Terakhir</th>
              <th>Total Login</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="tbody-monitoring">
            <tr><td colspan="5"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= FILE NILAI SISWA ================= -->
    <div class="section-header">
      <h2><i class="fas fa-file-lines"></i> File Nilai Siswa</h2>
      <button class="btn btn-primary btn-sm" onclick="loadNilai()">
        <i class="fas fa-rotate"></i> Muat Nilai
      </button>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Materi</th>
              <th>Nilai</th>
              <th>Tanggal</th>
              <th style="text-align:right;">File</th>
            </tr>
          </thead>
          <tbody id="tbody-nilai">
            <tr><td colspan="6"><div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada data nilai. Klik "Muat Nilai" untuk memuat.</p></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= AKTIVITAS TERBARU ================= -->
    <div class="section-header">
      <h2><i class="fas fa-clock-rotate-left"></i> Aktivitas Terbaru</h2>
    </div>

    <div class="card">
      <div class="card-body" id="activity-container">
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>Belum ada aktivitas pembelajaran.</p>
          <p class="sub">Data akan muncul setelah siswa mulai mengerjakan materi.</p>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <footer style="text-align:center;padding:2rem 1rem 1rem;font-size:0.75rem;color:var(--gray-500);font-weight:500;">
      © 2026 SMK Negeri 2 Medan — Media Pembelajaran K3
    </footer>
  </div>

  <!-- ============================================================
       MODAL: TAMBAH / EDIT
       ============================================================ -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3 id="modal-title">Tambah Data</h3>
        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
      </div>
      <form id="modal-form" onsubmit="handleModalSubmit(event)">
        <div class="modal-body" id="modal-body"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
          <button type="submit" class="btn btn-primary">
            <i class="fas fa-save"></i> Simpan
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ================= SUPABASE & APP.JS ================= -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/app.js"></script>

  <!-- ================= SCRIPT DASHBOARD GURU ================= -->
  <script>
    // ============================================================
    // STATE
    // ============================================================
    let currentModalType = null;

    // ============================================================
    // UPDATE TANGGAL & WAKTU
    // ============================================================
    function updateDateTime() {
      const now = new Date();
      const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const dateEl = document.getElementById('heroDate');
      const timeEl = document.getElementById('heroTime');
      if (dateEl) dateEl.textContent = now.toLocaleDateString('id-ID', opsi);
      if (timeEl) timeEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    // ============================================================
    // MUAT STATISTIK
    // ============================================================
    async function muatStatistik() {
      try {
        const [siswa, guru, materi] = await Promise.all([
          supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'siswa'),
          supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'guru'),
          supabaseClient.from('materi').select('*', { count: 'exact', head: true })
        ]);

        const setText = (id, val) => {
          const el = document.getElementById(id);
          if (el) el.textContent = val;
        };

        setText('stat-siswa', siswa.count || 0);
        setText('stat-guru', guru.count || 0);
        setText('stat-materi', materi.count || 0);

        const { data: nilaiData } = await supabaseClient.from('nilai').select('nilai');
        const nilaiEl = document.getElementById('stat-nilai');
        if (nilaiEl) {
          if (nilaiData && nilaiData.length > 0) {
            const rata = nilaiData.reduce((a, b) => a + (b.nilai || 0), 0) / nilaiData.length;
            nilaiEl.innerHTML = rata.toFixed(0) + '<small>%</small>';
          } else {
            nilaiEl.innerHTML = '0<small>%</small>';
          }
        }
      } catch (err) {
        console.error('Gagal memuat statistik:', err);
      }
    }

    // ============================================================
    // MUAT PROGRES
    // ============================================================
    async function muatProgres() {
      const container = document.getElementById('progress-container');
      if (!container) return;

      try {
        const { data, error } = await supabaseClient
          .from('materi')
          .select('judul, progres')
          .order('urutan');

        if (error) throw error;

        if (!data || data.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-chart-simple"></i>
              <p>Belum ada data progres.</p>
            </div>`;
          return;
        }

        container.innerHTML = data.map(m => `
          <div style="margin-bottom:1.2rem;">
            <div class="d-flex justify-between align-center mb-1" style="font-size:0.85rem;font-weight:600;color:var(--gray-700);">
              <span>${m.judul}</span>
              <span>${m.progres || 0}%</span>
            </div>
            <div class="progress-bar-custom">
              <div style="width:${m.progres || 0}%"></div>
            </div>
          </div>
        `).join('');
      } catch (err) {
        console.error('Gagal memuat progres:', err);
      }
    }

    // ============================================================
    // MUAT AKTIVITAS
    // ============================================================
    async function muatAktivitas() {
      const container = document.getElementById('activity-container');
      if (!container) return;

      try {
        const { data, error } = await supabaseClient
          .from('aktivitas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        if (!data || data.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Belum ada aktivitas pembelajaran.</p>
              <p class="sub">Data akan muncul setelah siswa mulai mengerjakan materi.</p>
            </div>`;
          return;
        }

        container.innerHTML = `
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Materi</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(a => `
                  <tr>
                    <td>
                      <div class="d-flex align-center gap-1">
                        <div class="user-avatar" style="width:32px;height:32px;font-size:0.75rem;">
                          ${(a.nama_siswa || '?').substring(0,2).toUpperCase()}
                        </div>
                        <span style="font-weight:600;">${a.nama_siswa || '-'}</span>
                      </div>
                    </td>
                    <td>${a.materi || '-'}</td>
                    <td>
                      <span class="badge ${a.status === 'selesai' ? 'success' : 'warning'}">
                        ${a.status === 'selesai' ? 'Selesai' : 'Proses'}
                      </span>
                    </td>
                    <td class="text-muted" style="font-size:0.82rem;">
                      ${new Date(a.created_at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;
      } catch (err) {
        console.error('Gagal memuat aktivitas:', err);
      }
    }

    // ============================================================
    // SWITCH TAB
    // ============================================================
    function switchTab(tab) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tab).classList.add('active');

      document.querySelectorAll('.card-header [data-tab]').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-ghost');
      });
      const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
      activeBtn.classList.remove('btn-ghost');
      activeBtn.classList.add('btn-primary');

      loadKonten(tab);
    }

    // ============================================================
    // LOAD KONTEN
    // ============================================================
    async function loadKonten(type) {
      const tbody = document.getElementById('tbody-' + type);
      if (!tbody) return;

      tbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>';

      try {
        const { data, error } = await supabaseClient.from(type).select('*').order('created_at', { ascending: false });
        if (error) throw error;

        if (!data || data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada data ${type}.</p></div></td></tr>`;
          return;
        }

        if (type === 'materi') {
          tbody.innerHTML = data.map(m => `
            <tr>
              <td><strong>${m.judul || '-'}</strong></td>
              <td>${(m.deskripsi || '-').substring(0, 60)}${(m.deskripsi || '').length > 60 ? '...' : ''}</td>
              <td><span class="badge ${m.status === 'aktif' ? 'success' : 'warning'}">${m.status || 'draft'}</span></td>
              <td style="text-align:right;">
                <button class="btn-icon" style="width:34px;height:34px;" onclick="editItem('materi', '${m.id}')"><i class="fas fa-pen"></i></button>
                <button class="btn-icon" style="width:34px;height:34px;" onclick="hapusItem('materi', '${m.id}')"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          `).join('');
        } else if (type === 'soal') {
          tbody.innerHTML = data.map(s => `
            <tr>
              <td>${(s.pertanyaan || '-').substring(0, 60)}...</td>
              <td>${s.jawaban_benar || '-'}</td>
              <td><span class="badge primary">${s.kesulitan || 'sedang'}</span></td>
              <td style="text-align:right;">
                <button class="btn-icon" style="width:34px;height:34px;" onclick="editItem('soal', '${s.id}')"><i class="fas fa-pen"></i></button>
                <button class="btn-icon" style="width:34px;height:34px;" onclick="hapusItem('soal', '${s.id}')"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          `).join('');
        } else if (type === 'video') {
          tbody.innerHTML = data.map(v => `
            <tr>
              <td><strong>${v.judul || '-'}</strong></td>
              <td><a href="${v.url}" target="_blank" style="color:var(--primary);">${(v.url || '-').substring(0, 40)}...</a></td>
              <td>${v.durasi || '-'}</td>
              <td style="text-align:right;">
                <button class="btn-icon" style="width:34px;height:34px;" onclick="editItem('video', '${v.id}')"><i class="fas fa-pen"></i></button>
                <button class="btn-icon" style="width:34px;height:34px;" onclick="hapusItem('video', '${v.id}')"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          `).join('');
        }
      } catch (err) {
        console.error('Gagal load ' + type + ':', err);
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat data.</p></div></td></tr>`;
      }
    }

    // ============================================================
    // MONITORING SISWA LOGIN
    // ============================================================
    async function loadMonitoring() {
      const tbody = document.getElementById('tbody-monitoring');
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>';

      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('id, full_name, kelas, last_sign_in_at, login_count, email')
          .eq('role', 'siswa')
          .order('last_sign_in_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada siswa yang login.</p></div></td></tr>';
          return;
        }

        const kelasSet = new Set(data.map(s => s.kelas).filter(Boolean));
        const filterKelas = document.getElementById('filter-monitoring-kelas');
        filterKelas.innerHTML = '<option value="">Semua Kelas</option>' +
          [...kelasSet].map(k => `<option value="${k}">${k}</option>`).join('');

        const render = (list) => {
          if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-inbox"></i><p>Tidak ada data yang cocok.</p></div></td></tr>';
            return;
          }
          tbody.innerHTML = list.map(s => `
            <tr>
              <td>
                <div class="d-flex align-center gap-1">
                  <div class="user-avatar" style="width:36px;height:36px;font-size:0.85rem;">${(s.full_name || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <div style="font-weight:600;color:var(--gray-800);">${s.full_name || '-'}</div>
                    <div style="font-size:0.78rem;color:var(--gray-500);">${s.email || '-'}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge primary">${s.kelas || '-'}</span></td>
              <td>${s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleString('id-ID') : '-'}</td>
              <td><strong>${s.login_count || 0}x</strong></td>
              <td><span class="badge success">Aktif</span></td>
            </tr>
          `).join('');
        };

        render(data);

        const filterInput = document.getElementById('filter-monitoring');
        const filterKelasEl = document.getElementById('filter-monitoring-kelas');

        const applyFilter = () => {
          const q = filterInput.value.toLowerCase();
          const kls = filterKelasEl.value;
          render(data.filter(s =>
            ((s.full_name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)) &&
            (!kls || s.kelas === kls)
          ));
        };

        filterInput.addEventListener('input', applyFilter);
        filterKelasEl.addEventListener('change', applyFilter);
      } catch (err) {
        console.error('Gagal load monitoring:', err);
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat data.</p></div></td></tr>';
      }
    }

    // ============================================================
    // LOAD NILAI SISWA
    // ============================================================
    async function loadNilai() {
      const tbody = document.getElementById('tbody-nilai');
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>';

      try {
        const { data, error } = await supabaseClient
          .from('nilai')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada data nilai siswa.</p></div></td></tr>';
          return;
        }

        tbody.innerHTML = data.map(n => `
          <tr>
            <td><strong>${n.nama_siswa || '-'}</strong></td>
            <td><span class="badge primary">${n.kelas || '-'}</span></td>
            <td>${n.materi || '-'}</td>
            <td><strong style="color:${n.nilai >= 75 ? 'var(--success)' : 'var(--danger)'};">${n.nilai || 0}</strong></td>
            <td>${n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID') : '-'}</td>
            <td style="text-align:right;">
              ${n.file_url ? `<a href="${n.file_url}" target="_blank" class="btn-icon" style="width:34px;height:34px;" title="Download"><i class="fas fa-download"></i></a>` : '-'}
            </td>
          </tr>
        `).join('');
      } catch (err) {
        console.error('Gagal load nilai:', err);
        tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat data nilai.</p></div></td></tr>';
      }
    }

    // ============================================================
    // MODAL
    // ============================================================
    function openModal(type, data = null) {
      currentModalType = type;
      const title = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      const isEdit = !!data;
      title.textContent = (isEdit ? 'Edit ' : 'Tambah ') + (type === 'materi' ? 'Materi' : type === 'soal' ? 'Soal' : 'Video');

      if (type === 'materi') {
        body.innerHTML = `
          <div class="form-group">
            <label>Judul Materi</label>
            <input type="text" name="judul" value="${data?.judul || ''}" required>
          </div>
          <div class="form-group">
            <label>Deskripsi</label>
            <textarea name="deskripsi" required>${data?.deskripsi || ''}</textarea>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select name="status">
              <option value="aktif" ${data?.status === 'aktif' ? 'selected' : ''}>Aktif</option>
              <option value="draft" ${data?.status === 'draft' ? 'selected' : ''}>Draft</option>
            </select>
          </div>
        `;
      } else if (type === 'soal') {
        body.innerHTML = `
          <div class="form-group">
            <label>Pertanyaan</label>
            <textarea name="pertanyaan" required>${data?.pertanyaan || ''}</textarea>
          </div>
          <div class="form-group"><label>Pilihan A</label><input type="text" name="pilihan_a" value="${data?.pilihan_a || ''}" required></div>
          <div class="form-group"><label>Pilihan B</label><input type="text" name="pilihan_b" value="${data?.pilihan_b || ''}" required></div>
          <div class="form-group"><label>Pilihan C</label><input type="text" name="pilihan_c" value="${data?.pilihan_c || ''}" required></div>
          <div class="form-group"><label>Pilihan D</label><input type="text" name="pilihan_d" value="${data?.pilihan_d || ''}" required></div>
          <div class="form-group">
            <label>Jawaban Benar</label>
            <select name="jawaban_benar">
              <option value="A" ${data?.jawaban_benar === 'A' ? 'selected' : ''}>A</option>
              <option value="B" ${data?.jawaban_benar === 'B' ? 'selected' : ''}>B</option>
              <option value="C" ${data?.jawaban_benar === 'C' ? 'selected' : ''}>C</option>
              <option value="D" ${data?.jawaban_benar === 'D' ? 'selected' : ''}>D</option>
            </select>
          </div>
          <div class="form-group">
            <label>Kesulitan</label>
            <select name="kesulitan">
              <option value="mudah" ${data?.kesulitan === 'mudah' ? 'selected' : ''}>Mudah</option>
              <option value="sedang" ${data?.kesulitan === 'sedang' ? 'selected' : ''}>Sedang</option>
              <option value="sulit" ${data?.kesulitan === 'sulit' ? 'selected' : ''}>Sulit</option>
            </select>
          </div>
        `;
      } else if (type === 'video') {
        body.innerHTML = `
          <div class="form-group"><label>Judul Video</label><input type="text" name="judul" value="${data?.judul || ''}" required></div>
          <div class="form-group"><label>URL Video</label><input type="url" name="url" value="${data?.url || ''}" required></div>
          <div class="form-group"><label>Durasi</label><input type="text" name="durasi" value="${data?.durasi || ''}" placeholder="contoh: 05:30"></div>
        `;
      }

      document.getElementById('modal-form').dataset.editId = data?.id || '';
      document.getElementById('modal-overlay').classList.add('show');
    }

    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('show');
      document.getElementById('modal-form').reset();
      currentModalType = null;
    }

    async function handleModalSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      const editId = form.dataset.editId;

      try {
        let result;
        if (editId) {
          result = await supabaseClient.from(currentModalType).update(data).eq('id', editId);
        } else {
          result = await supabaseClient.from(currentModalType).insert([data]);
        }

        if (result.error) throw result.error;

        showToast((editId ? 'Berhasil diperbarui!' : 'Berhasil ditambahkan!'), 'success');
        closeModal();
        loadKonten(currentModalType);
      } catch (err) {
        console.error(err);
        showToast('Gagal menyimpan: ' + err.message, 'error');
      }
    }

    async function editItem(type, id) {
      const { data, error } = await supabaseClient.from(type).select('*').eq('id', id).single();
      if (error || !data) { showToast('Gagal memuat data.', 'error'); return; }
      openModal(type, data);
    }

    async function hapusItem(type, id) {
      if (!confirm('Yakin ingin menghapus data ini?')) return;
      try {
        const { error } = await supabaseClient.from(type).delete().eq('id', id);
        if (error) throw error;
        showToast('Berhasil dihapus!', 'success');
        loadKonten(type);
      } catch (err) {
        showToast('Gagal menghapus: ' + err.message, 'error');
      }
    }

    // ============================================================
    // JALANKAN SETELAH app.js SELESAI INIT
    // ============================================================
    window.addEventListener('load', async () => {
      setTimeout(async () => {
        updateDateTime();
        setInterval(updateDateTime, 60000);

        const profile = await getCurrentProfile();
        if (profile?.role !== 'guru') return;

        await muatStatistik();
        await muatProgres();
        await muatAktivitas();
        await loadKonten('materi');
        await loadMonitoring();
      }, 400);
    });

    // Expose ke global
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.handleModalSubmit = handleModalSubmit;
    window.switchTab = switchTab;
    window.editItem = editItem;
    window.hapusItem = hapusItem;
    window.loadMonitoring = loadMonitoring;
    window.loadNilai = loadNilai;
  </script>

</body>
</html>
