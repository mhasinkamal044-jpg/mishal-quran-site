(function () {
  if (Auth.user()) { location.replace('home.html'); return; }

  const $ = id => document.getElementById(id);
  const tabs = { login: $('tabLogin'), signup: $('tabSignup') };
  const forms = { login: $('loginForm'), signup: $('signupForm') };

  function show(which) {
    for (const k in tabs) {
      tabs[k].classList.toggle('on', k === which);
      forms[k].classList.toggle('hidden', k !== which);
    }
  }
  tabs.login.onclick = () => show('login');
  tabs.signup.onclick = () => show('signup');
  $('toSignup').onclick = e => { e.preventDefault(); show('signup'); };
  $('toLogin').onclick = e => { e.preventDefault(); show('login'); };
  if (location.hash === '#signup') show('signup');

  function error(el, text) { el.className = 'msg err'; el.textContent = text; }
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  forms.login.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('lEmail').value.trim().toLowerCase(), pass = $('lPass').value;
    if (!validEmail(email) || !pass) return error($('lMsg'), 'أدخل بريداً إلكترونياً صحيحاً وكلمة المرور.');
    const r = Auth.login(email, pass);
    r.ok ? location.href = 'home.html' : error($('lMsg'), r.error);
  });

  forms.signup.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('sName').value.trim(), email = $('sEmail').value.trim().toLowerCase();
    const p1 = $('sPass').value, p2 = $('sPass2').value, m = $('sMsg');
    if (name.length < 3) return error(m, 'اكتب اسمك الكامل (3 أحرف على الأقل).');
    if (!validEmail(email)) return error(m, 'أدخل بريداً إلكترونياً صحيحاً.');
    if (p1.length < 6) return error(m, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
    if (p1 !== p2) return error(m, 'كلمتا المرور غير متطابقتين.');
    const r = Auth.register(name, email, p1);
    r.ok ? location.href = 'home.html' : error(m, r.error);
  });
})();
