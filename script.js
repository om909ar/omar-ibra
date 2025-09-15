// Placeholder for interactions (future)
document.addEventListener('click', (e)=>{
  const el = e.target.closest('.card');
  if(!el) return;
  e.preventDefault();
  alert('نموذج تجريبي — اربط البطاقة بالرابط الحقيقي هنا.');
});
