(function () {
  const user = Auth.user(); if (!user) return;
  const KEY = 'mh_progress_' + user.email;
  const $ = id => document.getElementById(id);
  const SURAHS = ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];

  let data = Store.get(KEY, { juz: 0, logs: [] });
  const save = () => Store.set(KEY, data);

  SURAHS.forEach((s, i) => $('surah').add(new Option((i + 1) + '. ' + s, s)));
  for (let i = 0; i <= 30; i++) $('juz').add(new Option(i + ' جزء', i));
  $('date').value = new Date().toISOString().slice(0, 10);

  function render() {
    const logs = data.logs;
    $('stJuz').textContent = data.juz;
    $('stNew').textContent = logs.filter(l => l.type === 'حفظ جديد').length;
    $('stRev').textContent = logs.filter(l => l.type === 'مراجعة').length;
    $('stAvg').textContent = logs.length ? (logs.reduce((a, l) => a + l.rating, 0) / logs.length).toFixed(1) : '–';
    const pct = Math.round(data.juz / 30 * 100);
    $('bar').style.width = pct + '%';
    $('barTxt').textContent = pct + '% من القرآن الكريم';
    $('juz').value = data.juz;

    const body = $('rows'); body.innerHTML = '';
    if (!logs.length) {
      const tr = body.insertRow(), td = tr.insertCell();
      td.colSpan = 6; td.className = 'empty'; td.textContent = 'لا توجد جلسات بعد. سجّل أول جلسة من النموذج أعلاه.';
      return;
    }
    logs.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach(l => {
      const tr = body.insertRow();
      tr.insertCell().textContent = l.date;
      const t = tr.insertCell(), tag = document.createElement('span');
      tag.className = 'tag' + (l.type === 'مراجعة' ? ' rev' : ''); tag.textContent = l.type; t.appendChild(tag);
      tr.insertCell().textContent = l.surah;
      tr.insertCell().textContent = l.from + ' – ' + l.to;
      tr.insertCell().textContent = l.rating + ' / 5';
      const d = document.createElement('button');
      d.className = 'del'; d.type = 'button'; d.textContent = 'حذف';
      d.onclick = () => { data.logs = data.logs.filter(x => x.id !== l.id); save(); render(); };
      tr.insertCell().appendChild(d);
    });
  }

  $('juz').onchange = e => { data.juz = +e.target.value; save(); render(); };

  $('logForm').addEventListener('submit', e => {
    e.preventDefault();
    const from = +$('from').value, to = +$('to').value, m = $('msg');
    if (!$('date').value) { m.className = 'msg err'; m.textContent = 'اختر التاريخ.'; return; }
    if (!from || !to || from < 1 || to < from) { m.className = 'msg err'; m.textContent = 'أدخل نطاق آيات صحيحاً (الآية الأخيرة لا تقل عن الأولى).'; return; }
    data.logs.push({ id: Date.now(), date: $('date').value, type: $('type').value, surah: $('surah').value, from, to, rating: +$('rating').value });
    save(); render();
    $('from').value = ''; $('to').value = '';
    m.className = 'msg ok'; m.textContent = 'تم حفظ الجلسة.';
  });

  render();
})();
