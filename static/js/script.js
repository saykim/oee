document.addEventListener('DOMContentLoaded', function() {
    // const calculateBtn = document.getElementById('calculateBtn');
    const quantityModeBtn = document.getElementById('quantityMode');
    const weightModeBtn = document.getElementById('weightMode');
    let currentMode = 'quantity';

    calculateBtn.addEventListener('click', calculateOEE);
    quantityModeBtn.addEventListener('click', () => toggleMode('quantity'));
    weightModeBtn.addEventListener('click', () => toggleMode('weight'));

    function toggleMode(mode) {
        currentMode = mode;
        updateUIForMode();
        quantityModeBtn.classList.toggle('active', mode === 'quantity');
        weightModeBtn.classList.toggle('active', mode === 'weight');
    }

    function updateUIForMode() {
        const totalProducedLabel = document.getElementById('totalProducedLabel');
        const idealRateLabel = document.getElementById('idealRateLabel');
        const idealRateValueLabel = document.getElementById('idealRateValueLabel');
        const idealRateTimeLabel = document.getElementById('idealRateTimeLabel');
        const idealRateUnit = document.getElementById('idealRateUnit');
        const totalScrapLabel = document.getElementById('totalScrapLabel');
    
        if (currentMode === 'weight') {
            totalProducedLabel.textContent = 'Total Weight Produced (kg)';
            idealRateLabel.textContent = 'Ideal Production Rate';
            idealRateValueLabel.textContent = 'Weight (kg)';
            idealRateTimeLabel.textContent = 'Time (min)';
            idealRateUnit.textContent = 'kg/min';
            totalScrapLabel.textContent = 'Total Scrap (kg)';
        } else {
            totalProducedLabel.textContent = 'Total Parts Produced (ea)';
            idealRateLabel.textContent = 'Ideal Cycle Time';
            idealRateValueLabel.textContent = 'Time (min)';
            idealRateTimeLabel.textContent = 'Amount (ea)';
            idealRateUnit.textContent = 'min/ea';
            totalScrapLabel.textContent = 'Total Scrap (ea)';
        }
    }

    function calculateOEE() {
        const data = {
            mode: currentMode,
            shiftStart: document.getElementById('shiftStart').value,
            shiftEnd: document.getElementById('shiftEnd').value,
            plannedDowntime: parseFloat(document.getElementById('plannedDowntime').value),
            unplannedDowntime: parseFloat(document.getElementById('unplannedDowntime').value),
            totalProduced: parseFloat(document.getElementById('totalProduced').value),
            idealRateValue: parseFloat(document.getElementById('idealRateValue').value),
            idealRateTime: parseFloat(document.getElementById('idealRateTime').value),
            totalScrap: parseFloat(document.getElementById('totalScrap').value)
        };
        
        // Validation
        // 수정된 유효성 검사
        if (Object.values(data).some(value => value === '' || (typeof value === 'number' && isNaN(value)))) {
            alert("모든 필드에 유효한 값을 입력해주세요.");
            return;
        }

        if (data.plannedDowntime < 0 || data.unplannedDowntime < 0 || data.totalProduced < 0 || 
            data.idealRateValue <= 0 || data.idealRateTime <= 0 || data.totalScrap < 0) {
            alert("모든 값은 0 이상이어야 하며, Ideal Rate 값들은 0보다 커야 합니다.");
            return;
        }

        if (data.totalScrap > data.totalProduced) {
            alert("Total Scrap은 Total Produced보다 클 수 없습니다.");
            return;
        }

        fetch('/calculate_oee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            updateUI(result);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }


    function updateUI(result) {
        document.getElementById('oee-value').textContent = result.oee + '%';
        document.getElementById('capacity-value').textContent = result.capacity;
        document.getElementById('total-produced-value').textContent = result.totalProduced;
        document.getElementById('performance-value').textContent = result.performance + '%';
        document.getElementById('quality-value').textContent = result.quality + '%';
        document.getElementById('availability-value').textContent = result.availability + '%';

        updateTileColor('oee-tile', result.oee);
        updateTileColor('performance-tile', result.performance);
        updateTileColor('quality-tile', result.quality);
        updateTileColor('availability-tile', result.availability);
    }

    function updateTileColor(tileId, value) {
        const tile = document.getElementById(tileId);
        if (value >= 80) {
            tile.style.backgroundColor = '#4CAF50';
        } else if (value >= 50) {
            tile.style.backgroundColor = '#FFC107';
        } else {
            tile.style.backgroundColor = '#F44336';
        }
    }

        // 초기 UI 설정
        toggleMode('quantity');


});

