(function () {
  const user = Auth.user(); if (!user) return;
  const $ = id => document.getElementById(id);
  $('name').value = user.name; $('email').value = user.email;

  $('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const m = $('msg'), name = $('name').value.trim(), email = $('email').value.trim(), text = $('text').value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { m.className = 'msg err'; m.textContent = 'أدخل اسمك وبريداً إلكترونياً صحيحاً.'; return; }
    if (text.length < 10) { m.className = 'msg err'; m.textContent = 'اكتب رسالة لا تقل عن 10 أحرف.'; return; }
    // حالياً تُحفظ الرسائل في المتصفح فقط. اربطها بخادم أو خدمة بريد لإرسالها فعلياً.
    const all = Store.get('mh_messages', []);
    all.push({ name, email, phone: $('phone').value.trim(), subject: $('subject').value, text, date: new Date().toISOString() });
    Store.set('mh_messages', all);
    $('text').value = '';
    m.className = 'msg ok'; m.textContent = 'تم إرسال رسالتك. شكراً لتواصلك.';
  });
})();
