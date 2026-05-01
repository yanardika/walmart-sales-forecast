const CD = { color: 'rgba(255,255,255,0.6)', grid: 'rgba(255,255,255,0.06)' };

function animateValue(el, target, duration = 1600) {
  const start = performance.now();
  function update(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.floor(ease * target).toLocaleString('en-US');
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  requestAnimationFrame(update);
}

function buildTrendContext() {
  const el = document.getElementById('trendContextChart');
  if (!el || !SALES_HISTORY.length) return;
  const labels = SALES_HISTORY.map(r => r.month);
  const data = SALES_HISTORY.map(r => r.avg_sales);
  const predLabel = `${INPUT_DATE.year}-${String(INPUT_DATE.month).padStart(2,'0')}`;

  new Chart(el.getContext('2d'), {
    type: 'line',
    data: {
      labels: [...labels, predLabel + ' (Pred)'],
      datasets: [
        { label: 'Historical', data: [...data, null], borderColor: '#3b82f6', fill: true, tension: 0.4 },
        { label: 'Prediction', data: [...data.map(()=>null), PREDICTION], borderColor: '#00d4ff', pointRadius: 8, pointBackgroundColor: '#00d4ff', fill: false }
      ]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: CD.color, font: { family: 'Inter'} } }, y: { ticks: { color: CD.color, font: { family: 'Inter'} } } } }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  animateValue(document.getElementById('animatedValue'), PREDICTION);
  buildTrendContext();
});