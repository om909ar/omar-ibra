// Placeholder for interactions (future)
document.addEventListener('click', (e)=>{
  const el = e.target.closest('.card');
  if(!el) return;
  e.preventDefault();
  alert('نموذج تجريبي — اربط البطاقة بالرابط الحقيقي هنا.');
});

/* أدوات صغيرة */
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));

/* عناصر واجهة */
const dateEl = $('#attDate');
const nameEl = $('#empName');
const rankEl = $('#empRank');
const timeEl = $('#checkTime');
const btnIn = $('#btnCheckIn');
const btnOut = $('#btnCheckOut');
const reqType = $('#reqType');
const fromTime = $('#fromTime');
const toTime = $('#toTime');
const btnAddReq = $('#btnAddReq');
const logEl = $('#empLog');

const roleBtn = $('#roleToggle');
const mgrPanel = $('#managerPanel');
const tbl = $('#mgrTable tbody');
const btnAddRow = $('#btnAddRow');
const btnFinalize = $('#btnFinalize');
const finalMsg = $('#finalMsg');
const deptName = $('#deptName');

/* تواريخ */
function todayISO(){
  const d=new Date();
  const off = d.getTimezoneOffset();
  const d2 = new Date(d.getTime()-off*60000);
  return d2.toISOString().slice(0,10);
}
function nowHM(){ const d=new Date(); return d.toTimeString().slice(0,5); }

function key(prefix){
  return `${prefix}:${dateEl.value || todayISO()}`;
}

/* سجل الموظف */
function loadEmpLog(){
  logEl.innerHTML='';
  const arr = JSON.parse(localStorage.getItem(key('empLog'))||'[]');
  arr.forEach(item=>{
    const li = document.createElement('li');
    li.textContent = item;
    logEl.appendChild(li);
  });
}
function pushEmpLog(text){
  const k = key('empLog');
  const arr = JSON.parse(localStorage.getItem(k)||'[]');
  arr.push(text);
  localStorage.setItem(k, JSON.stringify(arr));
  loadEmpLog();
}

/* تهيئة */
function init(){
  dateEl.value = todayISO();
  timeEl.value = nowHM();
  loadEmpLog();

  const role = localStorage.getItem('role') || 'employee';
  setRole(role);
  loadMgrTable();
}

/* تبديل الدور */
function setRole(role){
  if(role==='manager'){
    mgrPanel.hidden = false;
    roleBtn.textContent = 'أنا مدير';
    roleBtn.classList.add('primary');
    roleBtn.setAttribute('aria-pressed','true');
  }else{
    mgrPanel.hidden = true;
    roleBtn.textContent = 'أنا موظف';
    roleBtn.classList.remove('primary');
    roleBtn.setAttribute('aria-pressed','false');
  }
  localStorage.setItem('role', role);
}
roleBtn.addEventListener('click', ()=>{
  const now = localStorage.getItem('role')==='manager' ? 'employee' : 'manager';
  setRole(now);
});

/* أزرار الموظف */
btnIn.addEventListener('click', ()=>{
  const n = nameEl.value.trim()||'موظف';
  const r = rankEl.value.trim()||'—';
  const t = timeEl.value || nowHM();
  pushEmpLog(`حضور: ${n} (${r}) عند ${t}`);
});
btnOut.addEventListener('click', ()=>{
  const n = nameEl.value.trim()||'موظف';
  const r = rankEl.value.trim()||'—';
  const t = timeEl.value || nowHM();
  pushEmpLog(`انصراف: ${n} (${r}) عند ${t}`);
});
btnAddReq.addEventListener('click', ()=>{
  const typeMap = {partial:'استئذان جزئي', full:'استئذان كلي', leave:'إجازة'};
  const tp = reqType.value;
  if(!tp){ alert('اختر نوع الطلب'); return; }
  const f = fromTime.value || '—'; const to = toTime.value || '—';
  pushEmpLog(`طلب: ${typeMap[tp]} من ${f} إلى ${to}`);
  reqType.value=''; fromTime.value=''; toTime.value='';
});

/* تغيير التاريخ */
dateEl.addEventListener('change', ()=>{
  loadEmpLog();
  loadMgrTable();
});

/* لوحة المدير */
function loadMgrTable(){
  const data = JSON.parse(localStorage.getItem(key('mgr'))||'[]');
  tbl.innerHTML='';
  data.forEach(row=> addRow(row.name,row.status,row.note,false));
}
function getMgrData(){
  const rows = [];
  $$('#mgrTable tbody tr').forEach(tr=>{
    const name = $('input[name="emp"]', tr).value.trim();
    const status = $('select[name="status"]', tr).value;
    const note = $('input[name="note"]', tr).value.trim();
    rows.push({name,status,note});
  });
  return rows;
}
function saveMgr(){
  localStorage.setItem(key('mgr'), JSON.stringify(getMgrData()));
}
function addRow(name='',status='present',note='',save=true){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input name="emp" placeholder="اسم الموظف" value="${name}"></td>
    <td>
      <select name="status">
        <option value="present" ${status==='present'?'selected':''}>حاضر</option>
        <option value="absent" ${status==='absent'?'selected':''}>غائب</option>
        <option value="leave" ${status==='leave'?'selected':''}>إجازة</option>
        <option value="partial" ${status==='partial'?'selected':''}>استئذان جزئي</option>
        <option value="full" ${status==='full'?'selected':''}>استئذان كلي</option>
      </select>
    </td>
    <td><input name="note" placeholder="ملاحظة" value="${note}"></td>
  `;
  tr.addEventListener('input', saveMgr);
  tbl.appendChild(tr);
  if(save) saveMgr();
}
btnAddRow.addEventListener('click', ()=> addRow());

btnFinalize.addEventListener('click', ()=>{
  const rows = getMgrData();
  if(!rows.length){ alert('أضف موظف واحد على الأقل'); return; }
  saveMgr();
  const d = dateEl.value;
  const dept = deptName.value || '—';
  finalMsg.innerHTML = `تم توجيه الحضور بتاريخ <b>${d}</b> لإدارة الموارد البشرية (${dept}).<br>
  إجمالي الموظفين: ${rows.length}.`;
  finalMsg.hidden = false;
  setTimeout(()=> finalMsg.hidden = true, 5000);
});

/* ابدأ */
document.addEventListener('DOMContentLoaded', init);
