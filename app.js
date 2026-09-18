  <!-- ================= SUPABASE & APP.JS ================= -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <!-- ================= KONFIGURASI SUPABASE ================= -->
  <script>
    // ============================================================
    // KONFIGURASI SUPABASE (GANTI DENGAN MILIK ANDA)
    // ============================================================
    const SUPABASE_URL = 'https://ddnhwcxfktcsyngupdex.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_ogAtXLGklIivo88I41J8ZA_9CWzS8D3';


  <!-- ================= APP.JS (OPSIONAL, JIKA ADA) ================= -->
  <script src="js/app.js"></script>

  <!-- ================= SCRIPT DASHBOARD GURU ================= -->
  <script>
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
    // CEK LOGIN GURU (dari Supabase Auth)
    // ============================================================
    async function cekLoginGuru() {
      const { data: { user } } = await supabaseClient.auth.getUser();

      if (!user) {
        console.warn('⚠️ Belum login, redirect ke index');
        window.location.href = 'index.html';
        return null;
      }

      const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile || profile.role !== 'guru') {
        console.warn('⚠️ Bukan guru, redirect');
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
        return null;
      }

      return profile;
    }

    // ============================================================
    // MUAT STATISTIK
    // ============================================================
    async function muatStatistik() {
      try {
        const [siswa, guru, materi] = await Promise.all([
          supabaseClient.from('siswa').select('*', { count: 'exact', head: true }),
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
    // MONITORING SISWA LOGIN (dari tabel `siswa`)
    // ============================================================
    async function loadMonitoring() {
      const tbody = document.getElementById('tbody-monitoring');
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>';

      try {
        const { data, error } = await supabaseClient
          .from('siswa')
          .select('*')
          .order('last_login', { ascending: false });

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
                <div style="display:flex;align-items:center;gap:0.7rem;">
                  <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#1e40af);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0;">
                    ${(s.nama || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style="font-weight:600;color:var(--gray-800);">${s.nama || '-'}</div>
                    <div style="font-size:0.78rem;color:var(--gray-500);">${s.nis || '-'}</div>
                  </div>
                </div>
              </td>
              <td><span class="badge primary">${s.kelas || '-'}</span></td>
              <td>${s.last_login ? new Date(s.last_login).toLocaleString('id-ID') : '-'}</td>
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
            ((s.nama || '').toLowerCase().includes(q)) &&
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
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat data...</p></div></td></tr>';

      try {
        const { data, error } = await supabaseClient
          .from('nilai')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada data nilai siswa.</p></div></td></tr>';
          return;
        }

        tbody.innerHTML = data.map(n => `
          <tr>
            <td><strong>${n.nama_siswa || '-'}</strong></td>
            <td><span class="badge primary">${n.kelas || '-'}</span></td>
            <td>${n.materi || '-'}</td>
            <td><strong style="color:${(n.nilai >= 75) ? 'var(--success)' : 'var(--danger)'};">${n.nilai || 0}</strong></td>
            <td>${n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID') : '-'}</td>
          </tr>
        `).join('');
      } catch (err) {
        console.error('Gagal load nilai:', err);
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat data nilai.</p></div></td></tr>';
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
          .limit(8);

        if (error) throw error;

        if (!data || data.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Belum ada aktivitas pembelajaran.</p>
            </div>`;
          return;
        }

        container.innerHTML = `
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Siswa</th>
                  <th>Tipe</th>
                  <th>Judul</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(a => `
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:0.6rem;">
                        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#1e40af);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;">
                          ${(a.nama_siswa || '?').substring(0,2).toUpperCase()}
                        </div>
                        <span style="font-weight:600;">${a.nama_siswa || '-'}</span>
                      </div>
                    </td>
                    <td><span class="badge primary">${a.tipe || '-'}</span></td>
                    <td>${a.judul || '-'}</td>
                    <td>
                      <span class="badge ${a.status === 'selesai' ? 'success' : 'warning'}">
                        ${a.status === 'selesai' ? 'Selesai' : 'Proses'}
                      </span>
                    </td>
                    <td class="text-muted" style="font-size:0.82rem;">
                      ${a.created_at ? new Date(a.created_at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '-'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`;
      } catch (err) {
        console.error('Gagal memuat aktivitas:', err);
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Gagal memuat aktivitas.</p>
          </div>`;
      }
    }

    // ============================================================
    // LOGOUT
    // ============================================================
    async function logout() {
      if (!confirm('Yakin ingin keluar dari akun guru?')) return;
      await supabaseClient.auth.signOut();
      window.location.href = 'index.html';
    }

    // ============================================================
    // JALANKAN SETELAH PAGE LOAD
    // ============================================================
    document.addEventListener('DOMContentLoaded', async () => {
      console.log('📄 Dashboard Guru init');

      updateDateTime();
      setInterval(updateDateTime, 60000);

      const profile = await cekLoginGuru();
      if (!profile) return;

      const initial = (profile.full_name || 'G').charAt(0).toUpperCase();
      document.getElementById('user-avatar').textContent = initial;
      document.getElementById('user-name').textContent = profile.full_name || 'Guru';
      document.getElementById('user-nip').textContent = profile.nis_nip ? 'NIP: ' + profile.nis_nip : 'Pengajar K3';
      document.getElementById('welcome-name').textContent = (profile.full_name || 'Guru').split(' ')[0];

      document.getElementById('logout-btn').addEventListener('click', logout);

      await muatStatistik();
      await loadMonitoring();
      await loadNilai();
      await muatAktivitas();
    });

    // Expose ke global
    window.loadMonitoring = loadMonitoring;
    window.loadNilai = loadNilai;
    window.logout = logout;
  </script>
