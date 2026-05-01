const CD = { color: 'rgba(255,255,255,0.6)', grid: 'rgba(255,255,255,0.06)' };

document.getElementById('datePicker').addEventListener('change', function () {
    const d = new Date(this.value);
    if (isNaN(d)) return;
    document.getElementById('year').value = d.getFullYear();
    document.getElementById('month').value = d.getMonth() + 1;
    document.getElementById('day').value = d.getDate();
});

function buildSalesTrend() {
    const el = document.getElementById('salesTrendChart');
    if (!el || !SALES_HISTORY.length) return;
    
    const labels = SALES_HISTORY.map(r => r.month);
    const data = SALES_HISTORY.map(r => r.avg_sales);
    
    new Chart(el.getContext('2d'), {
        type: 'line',
        data: { 
            labels, 
            datasets: [{ 
                label: 'Avg Sales', 
                data, 
                borderColor: '#00d4ff', 
                backgroundColor: 'rgba(0,212,255,0.1)', 
                fill: true, 
                tension: 0.4 
            }] 
        },
        options: { 
            responsive: true, 
            plugins: { legend: { display: false } }, 
            scales: { 
                x: { ticks: { color: CD.color, font: { family: 'Inter'} } }, 
                y: { ticks: { color: CD.color, font: { family: 'Inter'} } } 
            } 
        }
    });
}

// Fungsi Handling Error Input
function validateInputs(payload) {
    // Validasi Tanggal
    if (!payload.year || !payload.month || !payload.day) return "Please fill in the complete prediction date.";
    
    const y = parseInt(payload.year);
    const m = parseInt(payload.month);
    const d = parseInt(payload.day);
    
    if (y < 2000 || y > 2100) return "Please enter a valid year (e.g., 2010 - 2020).";
    if (m < 1 || m > 12) return "Month must be between 1 and 12.";
    
    // Cek jumlah hari dalam bulan tersebut (termasuk tahun kabisat)
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d < 1 || d > daysInMonth) return `Day must be between 1 and ${daysInMonth} for the selected month.`;

    // Validasi Store & Dept
    const store = parseInt(payload.store);
    const dept = parseInt(payload.dept);
    if (!payload.store || store < 1 || store > 45) return "Store ID must be between 1 and 45.";
    if (!payload.dept || dept < 1 || dept > 99) return "Department must be between 1 and 99.";

    // Validasi Indikator Ekonomi
    if (payload.size === "" || parseFloat(payload.size) <= 0) return "Please enter a valid positive Store Size.";
    if (payload.temperature === "") return "Please enter the Temperature.";
    if (payload.fuel_price === "" || parseFloat(payload.fuel_price) < 0) return "Please enter a valid positive Fuel Price.";
    if (payload.cpi === "" || parseFloat(payload.cpi) < 0) return "Please enter a valid positive CPI.";
    if (payload.unemployment === "" || parseFloat(payload.unemployment) < 0) return "Please enter a valid positive Unemployment rate.";

    return null; // Tidak ada error
}

async function submitPrediction() {
    const payload = {
        store: document.getElementById('store').value,
        dept: document.getElementById('dept').value,
        temperature: document.getElementById('temperature').value,
        fuel_price: document.getElementById('fuel_price').value,
        cpi: document.getElementById('cpi').value,
        unemployment: document.getElementById('unemployment').value,
        size: document.getElementById('size').value,
        year: document.getElementById('year').value,
        month: document.getElementById('month').value,
        day: document.getElementById('day').value,
        is_holiday: document.getElementById('is_holiday').value
    };

    // Jalankan pengecekan error sebelum proses berlanjut
    const errorMessage = validateInputs(payload);
    if (errorMessage) {
        alert("Input Error: " + errorMessage);
        return; // Hentikan proses jika ada error
    }

    const btn = document.getElementById('submitBtn');
    const overlay = document.getElementById('loadingOverlay');
    
    btn.querySelector('.sb-text').textContent = 'Processing...';
    overlay.classList.add('show');

    try {
        const res = await fetch('/api/predict', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        
        const data = await res.json();
        
        if (data.error) { 
            alert('Server Error: ' + data.error); 
            return; 
        }
        
        window.location.href = '/result';
    } catch (err) {
        alert('Connection Failed: ' + err.message);
    } finally {
        btn.querySelector('.sb-text').textContent = 'Predict Now';
        overlay.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => { 
    buildSalesTrend(); 
});