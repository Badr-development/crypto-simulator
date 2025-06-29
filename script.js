const currencyRates = {
    BTC: 10000000,
    ETH: 600000,
    SOL: 15000,
    XRP: 100,
    USDT: 150
};

document.addEventListener('DOMContentLoaded', () => {
    const currencySelect = document.getElementById('currency');
    const amountInput = document.getElementById('amount');
    const interestInput = document.getElementById('interest');
    const durationInput = document.getElementById('duration');
    const compoundRadio = document.getElementsByName('compound');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultSection = document.getElementById('resultSection');
    const finalAmount = document.getElementById('finalAmount');
    const profit = document.getElementById('profit');
    const currencySymbol = document.getElementById('currency-symbol');



    // 通貨選択時のイベント
    currencySelect.addEventListener('change', () => {
        currencySymbol.textContent = currencySelect.value;
    });

    // 計算ボタンのイベント
    calculateBtn.addEventListener('click', () => {
        const currency = currencySelect.value;
        const amount = parseFloat(amountInput.value);
        const interest = parseFloat(interestInput.value);
        const duration = parseInt(durationInput.value);
        const isCompound = Array.from(compoundRadio).find(radio => radio.checked).value === 'true';

        if (!isValidInput(amount, interest, duration)) {
            alert('入力値を確認してください');
            return;
        }

        // 計算実行
        const result = calculateInvestment(
            amount,
            interest,
            duration,
            isCompound
        );

        // 結果表示
        resultSection.style.display = 'block';
        finalAmount.textContent = formatCurrency(result.finalAmount, currency);
        profit.textContent = formatCurrency(result.profit, currency);

        // グラフ表示
        displayChart(result.assetHistory, currency);
    });

    // リセットボタンのイベント
    resetBtn.addEventListener('click', () => {
        amountInput.value = '';
        interestInput.value = '';
        durationInput.value = '';
        compoundRadio[1].checked = true;
        resultSection.style.display = 'none';
    });
});

function isValidInput(amount, interest, duration) {
    return !isNaN(amount) && amount > 0 &&
           !isNaN(interest) && interest >= 0 &&
           !isNaN(duration) && duration >= 1 && duration <= 60;
}

function calculateInvestment(amount, interest, duration, isCompound, startDate) {
    let assetHistory = [];
    let currentAmount = amount;

    for (let month = 0; month <= duration; month++) {
        assetHistory.push({
            month: month,
            amount: currentAmount
        });

        if (isCompound) {
            // 複利計算
            currentAmount *= (1 + interest / 100 / 12);
        } else {
            // 単利計算
            if (month === duration) {
                currentAmount += amount * (interest / 100) * (month / 12);
            }
        }
    }

    return {
        finalAmount: currentAmount,
        profit: currentAmount - amount,
        assetHistory: assetHistory
    };
}

function formatCurrency(amount, currency) {
    return amount.toFixed(2) + ' ' + currency;
}

function displayChart(data, currency, jpyConversion) {
    const ctx = document.getElementById('assetChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.month === 0 ? '開始' : `${d.month}ヶ月`),
            datasets: [{
                label: '資産推移',
                data: data.map(d => d.amount),
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => {
                            return formatCurrency(value, currency);
                        }
                    }
                }
            }
        }
    });
}
