// ===== attendance.js =====
(function(){
  // عناصر عامة
  const dateInput = document.getElementById('attDate');
  const accNameEl = document.getElementById('accName');
  const accRankEl = document.getElementById('accRank');

  // عناصر التحضير
  const hudCircle = document.getElementById('hudCircle');
  const hudPicker = document.getElementById('hudPicker');
  const hudSet    = document.getElementById('hudSet');
  const hudClear  = document.getElementById('hudClear');
  const hudTimeEl = document.getElementById('hudTime');

  // عناصر الانصراف
  const insCircle = document.getElementById('insCircle');
  const insPicker = document.getElementById('insPicker');
  const insSet    = document.getElementById('insSet');
  const insClear  = document.getElementById('insClear');
  const insTimeEl = document.getElementById('insTime');

  // أزرار عامة
  const sendBtn   = document.getElementById('sendToManager');
  const resetDay  = document.getElementById('resetDay');

  // مفاتيح التخزين
  const KEY = 'attendance_employee_v1';
  const ACC_KEY = 'attendance_account';

  // أدوات مساعدة
  const pad = n => String(n).padStart(2,'0');
  const todayISO = ()=>{
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };

  // تهيئة التاريخ الافتراضي إلى اليوم
  if (!dateInput.value) dateInput.value = todayISO();

  // تحميل بيانات الحساب (قراءة فقط الآن)
  (function loadAccount(){
    try{
      const acc = JSON.parse(localStorage.getItem(ACC_KEY) || '{}');
      accNameEl && (accNameEl.textContent = acc.name || '—');
      accRankEl && (accRankEl.textContent = acc.rank || '—');
    }catch(e){}
  })();

  // تحميل أوقات تاريخ محدد
  function loadForDate(iso){
    try{
      const all = JSON.parse(localStorage.getItem(KEY) || '{}');
      const rec = all[iso] || {};
      hudTimeEl.textContent = rec.hudur   || '—';
      insTimeEl.textContent = rec.insiraf || '—';
      // عكس قيمة المنتقي لتكون ظاهرة عند الفتح التالي (تحسين صغير)
      hudPicker.value = (rec.hudur   || '');
      insPicker.value = (rec.insiraf || '');
    }catch(e){
      hudTimeEl.textContent = '—';
      insTimeEl.textContent = '—';
    }
  }

  // حفظ وقت معين
  function saveTime(iso, key, value){
    const all = JSON.parse(localStorage.getItem(KEY) || '{}');
    const rec = all[iso] || {};
    rec[key] = value;
    all[iso] = rec;
    localStorage.setItem(KEY, JSON.stringify(all));
  }

  // فتح منتقي الوقت بشكل آمن
  function openPicker(input){
    input.hidden = false;              // للسماح بالتركيز في iOS
    input.showPicker && input.showPicker();
    input.focus();
  }

  // تغيير التاريخ
  dateInput.addEventListener('change', ()=> loadForDate(dateInput.value));
  // أول تحميل
  loadForDate(dateInput.value);

  // أحداث الدائرة/الأزرار (تحضير)
  hudCircle && hudCircle.addEventListener('click', ()=> openPicker(hudPicker));
  hudSet && hudSet.addEventListener('click', ()=> openPicker(hudPicker));
  hudClear && hudClear.addEventListener('click', ()=>{
    saveTime(dateInput.value, 'hudur', '');
    hudTimeEl.textContent = '—';
    hudPicker.value = '';
  });
  hudPicker && hudPicker.addEventListener('change', ()=>{
    const v = hudPicker.value; // HH:MM
    if (v){
      saveTime(dateInput.value, 'hudur', v);
      hudTimeEl.textContent = v;
    }
  });

  // أحداث الدائرة/الأزرار (انصراف)
  insCircle && insCircle.addEventListener('click', ()=> openPicker(insPicker));
  insSet && insSet.addEventListener('click', ()=> openPicker(insPicker));
  insClear && insClear.addEventListener('click', ()=>{
    saveTime(dateInput.value, 'insiraf', '');
    insTimeEl.textContent = '—';
    insPicker.value = '';
  });
  insPicker && insPicker.addEventListener('change', ()=>{
    const v = insPicker.value;
    if (v){
      saveTime(dateInput.value, 'insiraf', v);
      insTimeEl.textContent = v;
    }
  });

  // إعادة تعيين اليوم الحالي (مسح تحضير/انصراف لليوم فقط)
  resetDay && resetDay.addEventListener('click', ()=>{
    const all = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (all[dateInput.value]){
      all[dateInput.value].hudur = '';
      all[dateInput.value].insiraf = '';
      localStorage.setItem(KEY, JSON.stringify(all));
    }
    hudTimeEl.textContent = '—';
    insTimeEl.textContent = '—';
    hudPicker.value = '';
    insPicker.value = '';
  });

  // إرسال لصفحة المدير (تقدر تغيّر المسار)
  sendBtn && sendBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    // بإمكانك هنا لاحقًا ترسل عبر fetch إلى API
    const date = dateInput.value;
    const all  = JSON.parse(localStorage.getItem(KEY) || '{}');
    const rec  = all[date] || {};
    const payload = {
      date,
      hudur: rec.hudur || '',
      insiraf: rec.insiraf || '',
      account: {
        name: accNameEl ? accNameEl.textContent : '',
        rank: accRankEl ? accRankEl.textContent : ''
      }
    };
    // مؤقتًا: نفتح صفحة المدير ونمرر التاريخ (وبإمكانك حفظ payload في localStorage/Session)
    sessionStorage.setItem('last_attendance_payload', JSON.stringify(payload));
    window.location.href = `/manager?date=${encodeURIComponent(date)}`;
  });
})();