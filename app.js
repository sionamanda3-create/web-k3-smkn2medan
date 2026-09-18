<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Guru | Media Pembelajaran K3</title>

  <!-- Fonts & Icons -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

  <!-- Style System Utama -->
  <link rel="stylesheet" href="css/style.css">

  <!-- CSS Tambahan khusus dashboard -->
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
  </style>
</head>
<body data-page="dashboard-guru" data-role="guru">

  <!-- Toast (untuk notifikasi dari app.js) -->
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

  </div>

  <!-- ================= SUPABASE & APP.JS ================= -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/app.js"></script>

  <!-- ================= SCRIPT KHUSUS DASHBOARD ================= -->
  <script>
    // ============================================================
    // DASHBOARD GURU — Load data tambahan setelah initDashboardGuruPage()
    // ============================================================

    // Update tanggal & waktu di hero
    function updateDateTime() {
      const now = new Date();
      const opsi = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const dateEl = document.getElementById('heroDate');
      const timeEl = document.getElementById('heroTime');
      if (dateEl) dateEl.textContent = now.toLocaleDateString('id-ID', opsi);
      if (timeEl) timeEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    // Muat statistik dari database
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

        // Rata-rata nilai
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

    // Muat progres pembelajaran
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
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Gagal memuat data progres.</p>
          </div>`;
      }
    }

    // Muat aktivitas terbaru
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
    // JALANKAN SETELAH app.js selesai init
    // ============================================================
    window.addEventListener('load', async () => {
      // Tunggu app.js selesai cek auth & render
      setTimeout(async () => {
        updateDateTime();
        setInterval(updateDateTime, 60000);

        // Pastikan user adalah guru
        const profile = await getCurrentProfile();
        if (profile?.role !== 'guru') return;

        await muatStatistik();
        await muatProgres();
        await muatAktivitas();
      }, 300);
    });
  </script>

</body>
</html>
