(function () {
  const user = Auth.user(); if (!user) return;
  const API = 'https://api.alquran.cloud/v1', KEY = 'mh_mushaf_' + user.email;
  const $ = id => document.getElementById(id);
  const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const norm = s => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[ٱأإآ]/g, 'ا');
  // عرض أي خطأ برمجي داخل الصفحة نفسها لتسهيل التشخيص
  window.addEventListener('error', e => { const s = $('status'); if (s) s.textContent = 'خطأ في الكود: ' + e.message + ' (سطر ' + e.lineno + ')'; });
  window.addEventListener('unhandledrejection', e => { const s = $('status'); if (s) s.textContent = 'خطأ: ' + ((e.reason && e.reason.message) || e.reason); });
  let st = Store.get(KEY, { surah: 1, size: 1.4, bm: null, v: 2 });
  if (st.v !== 2) { st.size = 1.4; st.v = 2; } // إعادة ضبط حجم الخط الافتراضي مرة واحدة
  const save = () => Store.set(KEY, st);
  let surahs = [], cur = 0;

  // يجلب من الإنترنت أول مرة ثم يحفظ نسخة في المتصفح للقراءة لاحقاً
  async function load(path, ck) {
    const c = Store.get(ck, null); if (c) return c;
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000);
    let r; try { r = await fetch(API + path, { signal: ctl.signal }); } finally { clearTimeout(t); }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(); if (j.code !== 200) throw new Error('bad response');
    try { Store.set(ck, j.data); } catch (e) { /* مساحة التخزين ممتلئة: نتجاوز الحفظ */ }
    return j.data;
  }
  function fail(e) {
    const box = $('ayahs'); box.textContent = '';
    const p = document.createElement('p');
    p.textContent = 'تعذّر تحميل المصحف (' + (e && e.name === 'AbortError' ? 'انتهت المهلة' : (e && e.message) || 'خطأ غير معروف') + '). تأكد من اتصال الإنترنت ثم أعد المحاولة.';
    const b = document.createElement('button'); b.className = 'btn dark'; b.type = 'button'; b.textContent = 'إعادة المحاولة';
    b.onclick = () => init();
    const l = document.createElement('a'); l.href = API + '/surah/1/quran-uthmani'; l.target = '_blank'; l.textContent = 'اختبر الاتصال بالمصدر';
    l.style.cssText = 'font-size:1rem;margin-inline-start:14px;text-decoration:underline';
    box.append(p, b, l);
  }
  const size = () => { $('ayahs').style.fontSize = st.size + 'rem'; $('bism').style.fontSize = st.size + 'rem'; };

  function mark(n, a) {
    document.querySelectorAll('.ay.mark').forEach(e => e.classList.remove('mark'));
    const el = $('a' + a); if (el && st.bm && st.bm.surah === n && st.bm.ayah === a) el.classList.add('mark');
  }

  function render(d, focus) {
    const n = d.number; cur = n; st.surah = n; save();
    $('surah').value = n;
    $('title').textContent = d.name;
    $('meta').textContent = (d.revelationType === 'Meccan' ? 'مكية' : 'مدنية') + ' · ' + toAr(d.numberOfAyahs) + ' آية';
    $('bism').hidden = (n === 1 || n === 9);
    const box = $('ayahs'); box.textContent = '';
    d.ayahs.forEach(a => {
      let t = a.text;
      // نزيل البسملة من أول آية إن كانت مضمّنة في النص، لنعرضها كعنوان منفصل
      if (n !== 1 && n !== 9 && a.numberInSurah === 1 && norm(t).startsWith('بسم الله الرحمن الرحيم'))
        t = t.trim().split(/\s+/).slice(4).join(' ');
      const sp = document.createElement('span');
      sp.className = 'ay'; sp.id = 'a' + a.numberInSurah;
      sp.append(t + ' ');
      const no = document.createElement('span'); no.className = 'no'; no.textContent = toAr(a.numberInSurah);
      sp.append(no, ' ');
      sp.onclick = () => {
        st.bm = { surah: n, ayah: a.numberInSurah }; save(); mark(n, a.numberInSurah);
        $('status').textContent = 'تم وضع العلامة عند الآية ' + toAr(a.numberInSurah) + ' من سورة ' + d.name + '.';
      };
      box.append(sp);
    });
    $('jump').max = d.numberOfAyahs;
    if (st.bm && st.bm.surah === n) mark(n, st.bm.ayah);
    if (focus) { const el = $('a' + focus); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    else window.scrollTo({ top: 0 });
  }

  async function open(n, focus) {
    n = Math.min(114, Math.max(1, +n)); $('ayahs').textContent = 'جارٍ التحميل…';
    try { render(await load('/surah/' + n + '/quran-uthmani', 'mh_q_s' + n), focus); } catch (e) { fail(e); }
  }

  $('surah').onchange = e => open(e.target.value);
  $('prev').onclick = () => open(cur - 1);
  $('next').onclick = () => open(cur + 1);
  $('bigger').onclick = () => { st.size = Math.min(3.2, +(st.size + .2).toFixed(1)); save(); size(); };
  $('smaller').onclick = () => { st.size = Math.max(1, +(st.size - .2).toFixed(1)); save(); size(); };
  $('jump').addEventListener('change', e => { const a = +e.target.value; if (a >= 1) { const el = $('a' + a); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  $('resume').onclick = () => {
    if (!st.bm) { $('status').textContent = 'لم تضع علامة بعد. اضغط على آية لوضع علامة.'; return; }
    st.bm.surah === cur ? $('a' + st.bm.ayah).scrollIntoView({ behavior: 'smooth', block: 'center' }) : open(st.bm.surah, st.bm.ayah);
  };

  async function init() {
    size();
    $('ayahs').textContent = 'جارٍ الاتصال بالمصدر…'; $('status').textContent = 'نسخة الملف: 3';
    try { surahs = await load('/surah', 'mh_q_list'); } catch (e) { return fail(e); }
    $('surah').textContent = '';
    surahs.forEach(s => $('surah').add(new Option(s.number + '. ' + s.name, s.number)));
    st.bm ? open(st.bm.surah, st.bm.ayah) : open(st.surah);
  }
  init();
})();
