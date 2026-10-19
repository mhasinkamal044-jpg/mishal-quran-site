/* وظائف مشتركة: التخزين، تسجيل الدخول، حماية الصفحات، تسجيل الخروج */
const Store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

const Auth = {
  user() { return Store.get('mh_session', null); },
  register(name, email, password) {
    const users = Store.get('mh_users', []);
    if (users.some(u => u.email === email)) return { ok: false, error: 'هذا البريد مسجّل من قبل. سجّل الدخول بدلاً من ذلك.' };
    users.push({ name, email, password });
    Store.set('mh_users', users);
    Store.set('mh_session', { name, email });
    return { ok: true };
  },
  login(email, password) {
    const u = Store.get('mh_users', []).find(x => x.email === email && x.password === password);
    if (!u) return { ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    Store.set('mh_session', { name: u.name, email: u.email });
    return { ok: true };
  },
  logout() { localStorage.removeItem('mh_session'); }
};

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.user();
  // الصفحات المحمية تتطلب تسجيل دخول
  if (document.body.dataset.protected === 'true' && !user) { location.replace('index.html'); return; }
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user ? user.name : '');
  const out = document.getElementById('logout');
  if (out) out.addEventListener('click', () => Auth.logout());
  const mb = document.getElementById('menuBtn'), nav = document.getElementById('mainNav');
  if (mb && nav) mb.addEventListener('click', () => nav.classList.toggle('open'));
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
});
