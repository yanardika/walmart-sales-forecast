const CD = { color: 'rgba(255,255,255,0.7)', grid: 'rgba(255,255,255,0.06)' };

function buildHeroChart() {
  if (!SALES_HISTORY.length) return;
  const ctx = document.getElementById('heroChart').getContext('2d');
  const labels = SALES_HISTORY.slice(-12).map(r => r.month);
  const data = SALES_HISTORY.slice(-12).map(r => r.avg_sales);
  new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Avg Sales', data, borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.12)', fill: true, tension: 0.4 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: CD.color, font: { size: 9, family: 'Inter' } } }, y: { ticks: { color: CD.color, font: { size: 9, family: 'Inter' } } } } }
  });
}

function buildSalesTrend() {
  const el = document.getElementById('salesTrendChart');
  if (!el || !SALES_HISTORY.length) return;
  const labels = SALES_HISTORY.map(r => r.month);
  const data = SALES_HISTORY.map(r => r.avg_sales);
  new Chart(el.getContext('2d'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'Avg Weekly Sales', data, borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.1)', fill: true, tension: 0.4 }] },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: CD.color, font: { size: 8, family: 'Inter' } } }, y: { ticks: { color: CD.color, font: { size: 9, family: 'Inter' } } } } }
  });
}

document.addEventListener('DOMContentLoaded', () => { buildHeroChart(); buildSalesTrend(); });