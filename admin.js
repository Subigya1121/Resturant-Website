const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

/* ==========================================================
   AUTH
========================================================== */
async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    showDashboard();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginView.style.display = 'block';
  dashboardView.style.display = 'none';
}

function showDashboard() {
  loginView.style.display = 'none';
  dashboardView.style.display = 'block';
  loadReservations();
  loadMessages();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.style.display = 'none';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const btn = loginForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Logging in…';

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  btn.disabled = false;
  btn.textContent = 'Log in';

  if (error) {
    loginError.textContent = 'Incorrect email or password.';
    loginError.style.display = 'block';
    return;
  }

  showDashboard();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

/* ==========================================================
   DATA LOADING
========================================================== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function loadReservations() {
  const wrap = document.getElementById('reservationsWrap');
  const { data, error } = await supabaseClient
    .from('reservations')
    .select('*')
    .order('reservation_date', { ascending: true });

  if (error) {
    wrap.innerHTML = `<p class="empty-note">Couldn't load reservations. ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    wrap.innerHTML = `<p class="empty-note">No reservations yet.</p>`;
    return;
  }

  const statuses = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Name</th><th>Date</th><th>Time</th><th>Guests</th>
          <th>Phone</th><th>Email</th><th>Request</th><th>Ref</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((r) => `
          <tr>
            <td>${escapeHtml(r.customer_name)}</td>
            <td>${escapeHtml(r.reservation_date)}</td>
            <td>${escapeHtml(r.reservation_time)}</td>
            <td>${escapeHtml(r.guest_count)}</td>
            <td>${escapeHtml(r.phone)}</td>
            <td>${escapeHtml(r.email)}</td>
            <td>${escapeHtml(r.special_request) || '—'}</td>
            <td>${escapeHtml(r.confirmation_code)}</td>
            <td>
              <select class="status-select" data-id="${r.id}">
                ${statuses.map((s) => `<option value="${s}" ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  wrap.querySelectorAll('.status-select').forEach((sel) => {
    sel.addEventListener('change', async () => {
      const { error } = await supabaseClient
        .from('reservations')
        .update({ status: sel.value })
        .eq('id', sel.dataset.id);
      if (error) alert('Could not update status: ' + error.message);
    });
  });
}

async function loadMessages() {
  const wrap = document.getElementById('messagesWrap');
  const { data, error } = await supabaseClient
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    wrap.innerHTML = `<p class="empty-note">Couldn't load messages. ${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    wrap.innerHTML = `<p class="empty-note">No messages yet.</p>`;
    return;
  }

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Received</th></tr>
      </thead>
      <tbody>
        ${data.map((m) => `
          <tr>
            <td>${escapeHtml(m.name)}</td>
            <td>${escapeHtml(m.email)}</td>
            <td>${escapeHtml(m.phone) || '—'}</td>
            <td>${escapeHtml(m.message)}</td>
            <td>${new Date(m.created_at).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

checkSession();
