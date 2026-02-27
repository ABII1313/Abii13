// Глобальные переменные и функции для всех страниц
let transactions = JSON.parse(localStorage.getItem('transactions')) || [
    { id: 1, type: 'income', category: 'Зарплата', amount: 50000, date: '2024-01-15', description: 'Зарплата за январь' },
    { id: 2, type: 'expense', category: 'Продукты', amount: 5000, date: '2024-01-16', description: 'Покупка продуктов' },
    { id: 3, type: 'expense', category: 'Транспорт', amount: 3000, date: '2024-01-17', description: 'Проездной' }
];

// Сохранение транзакций
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Добавление транзакции
function addTransaction(type, category, amount, date, description) {
    const newTransaction = {
        id: Date.now(),
        type: type,
        category: category,
        amount: Number(amount),
        date: date,
        description: description
    };
    
    transactions.push(newTransaction);
    saveTransactions();
    return newTransaction;
}

// Удаление транзакции
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
}

// Подсчет статистики
function calculateStats() {
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
        }
    });
    
    return {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
    };
}

// Отображение сообщений
function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type} show`;
        
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 3000);
    }
}

// Форматирование даты
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

// Форматирование суммы
function formatAmount(amount, type) {
    const formatted = amount.toLocaleString('ru-RU') + ' ₽';
    return type === 'expense' ? `-${formatted}` : formatted;
}

// Функции для главной страницы
function initDashboard() {
    updateDashboard();
    showRecentTransactions();
}

function updateDashboard() {
    const stats = calculateStats();
    const statsContainer = document.getElementById('stats');
    
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card income">
                <h3>💰 Доходы</h3>
                <div class="amount">${stats.income.toLocaleString()} ₽</div>
            </div>
            <div class="stat-card expense">
                <h3>💸 Расходы</h3>
                <div class="amount">${stats.expense.toLocaleString()} ₽</div>
            </div>
            <div class="stat-card balance">
                <h3>💵 Баланс</h3>
                <div class="amount">${stats.balance.toLocaleString()} ₽</div>
            </div>
        `;
    }
}

function showRecentTransactions() {
    const tbody = document.getElementById('recent-transactions-body');
    if (tbody) {
        const recentTransactions = transactions.slice(-5).reverse();
        
        tbody.innerHTML = '';
        recentTransactions.forEach(t => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${formatDate(t.date)}</td>
                <td>${t.category}</td>
                <td>${t.description}</td>
                <td class="${t.type}-text">${formatAmount(t.amount, t.type)}</td>
            `;
        });
    }
}

// Функции для страницы добавления
function initAddPage() {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date');
    if (dateInput) {
        dateInput.value = today;
    }
    
    const form = document.getElementById('transaction-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    if (category && amount && date && description) {
        addTransaction(type, category, amount, date, description);
        showMessage('Операция успешно добавлена!', 'success');
        e.target.reset();
        
        // Устанавливаем сегодняшнюю дату после сброса
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    } else {
        showMessage('Пожалуйста, заполните все поля', 'error');
    }
}

// Функции для страницы истории
function initHistoryPage() {
    showAllTransactions();
}

function showAllTransactions() {
    const tbody = document.getElementById('transactions-history');
    if (tbody) {
        const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        tbody.innerHTML = '';
        sortedTransactions.forEach(t => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${formatDate(t.date)}</td>
                <td>${t.category}</td>
                <td>${t.description}</td>
                <td class="${t.type}-text">${formatAmount(t.amount, t.type)}</td>
                <td>
                    <button class="btn-small" onclick="deleteTransactionHandler(${t.id})">Удалить</button>
                </td>
            `;
        });
    }
}

// Глобальный обработчик удаления
window.deleteTransactionHandler = function(id) {
    if (confirm('Вы уверены, что хотите удалить эту операцию?')) {
        deleteTransaction(id);
        showMessage('Операция удалена', 'success');
        showAllTransactions();
    }
};

// Инициализация в зависимости от страницы
document.addEventListener('DOMContentLoaded', () => {
    // Определяем текущую страницу по URL
    const path = window.location.pathname;
    
    if (path.includes('add')) {
        initAddPage();
    } else if (path.includes('history')) {
        initHistoryPage();
    } else {
        // Главная страница (index.html или корень)
        initDashboard();
    }
});