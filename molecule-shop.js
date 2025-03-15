// Объект для хранения состояния магазина
const shop = {
    // Доступные товары
    items: {
        "energy-regen": {
            name: "Скорость восстановления энергии",
            price: 250,
            effect: "5 сек. → 4.9 сек.",
            bought: false
        },
        "click-profit": {
            name: "Прибыль нажатия",
            price: 100,
            effect: "1 мон. за клик → 2 мон. за клик",
            bought: false
        },
        "max-energy": {
            name: "Максимальный запас энергии",
            price: 150,
            effect: "100 макс. энергии → 150 макс. энергии",
            bought: false
        },
        "evolution": {
            name: "Эволюция",
            price: 500,
            effect: "Усиляет молекулу, открывая новые функции",
            levelRequired: 2,
            bought: false
        }
    },
    
    // Инициализация магазина
    init: function() {
        // Элементы магазина
        this.shopBalanceElement = document.getElementById('shop-balance');
        this.buyButtons = document.querySelectorAll('.buy-button');
        
        // Установка обработчиков событий для кнопок покупки
        this.buyButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const itemId = button.getAttribute('data-item');
                this.tryPurchase(itemId);
            });
        });
        
        // Обновление баланса в магазине при загрузке
        this.updateShopUI();
        
        // Добавляем обработчик события для обновления UI магазина при переключении на таб магазина
        const shopTab = document.querySelector('.nav-item[data-target="shop-section"]');
        shopTab.addEventListener('click', () => {
            this.updateShopUI();
        });
    },
    
    // Обновление пользовательского интерфейса магазина
    updateShopUI: function() {
        // Обновление отображения баланса
        this.shopBalanceElement.textContent = balance;
        
        // Проверка доступности товаров (например, в зависимости от уровня)
        const userLevel = parseInt(document.getElementById('user-level').textContent);
        
        // Проверяем требования по уровню для товаров
        this.buyButtons.forEach(button => {
            const itemId = button.getAttribute('data-item');
            const item = this.items[itemId];
            
            // Если товар требует определенного уровня
            if (item.levelRequired && userLevel < item.levelRequired) {
                button.disabled = true;
                button.textContent = "Недоступно";
            } else if (item.bought) {
                button.disabled = true;
                button.textContent = "Куплено";
            } else if (balance < item.price) {
                button.disabled = true;
                button.textContent = "Недостаточно монет";
            } else {
                button.disabled = false;
                button.textContent = "Купить";
            }
        });
    },
    
    // Попытка покупки товара
    tryPurchase: function(itemId) {
        const item = this.items[itemId];
        
        // Проверка возможности покупки
        if (item.bought) {
            this.showMessage("Этот товар уже куплен!");
            return;
        }
        
        // Проверка требований по уровню
        const userLevel = parseInt(document.getElementById('user-level').textContent);
        if (item.levelRequired && userLevel < item.levelRequired) {
            this.showMessage(`Требуется уровень ${item.levelRequired}!`);
            return;
        }
        
        // Проверка хватает ли денег
        if (balance < item.price) {
            this.showMessage("Недостаточно монет!");
            return;
        }
        
        // Обработка покупки
        this.purchaseItem(itemId);
    },
    
    // Покупка товара
    purchaseItem: function(itemId) {
        const item = this.items[itemId];
        
        // Списываем деньги
        balance -= item.price;
        updateBalanceWithAnimation(balance);
        
        // Отмечаем товар как купленный
        item.bought = true;
        
        // Применяем эффект товара
        this.applyItemEffect(itemId);
        
        // Обновляем интерфейс
        this.updateShopUI();
        
        // Показываем сообщение об успешной покупке
        this.showMessage(`Вы успешно приобрели ${item.name}!`);
    },
    
    // Применение эффекта товара
    applyItemEffect: function(itemId) {
        // Применяем различные эффекты в зависимости от товара
        // В будущем здесь будет реальная логика
        switch(itemId) {
            case "energy-regen":
                console.log("Скорость восстановления энергии улучшена");
                // В будущем: energyRegenInterval = 4900;
                break;
                
            case "click-profit":
                console.log("Прибыль от клика увеличена");
                // В будущем: pointsPerClick = 2;
                break;
                
            case "max-energy":
                console.log("Максимальная энергия увеличена");
                // В будущем: maxEnergy = 150;
                break;
                
            case "evolution":
                console.log("Молекула эволюционировала");
                // В будущем: unlockEvolution();
                break;
        }
    },
    
    // Показать сообщение пользователю
    showMessage: function(text) {
        // Создаем элемент сообщения
        const messageElement = document.createElement('div');
        messageElement.className = 'shop-message';
        messageElement.textContent = text;
        
        // Добавляем его на страницу (теперь в shop-container)
        document.querySelector('.shop-container').appendChild(messageElement);
        
        // Удаляем через некоторое время
        setTimeout(() => {
            messageElement.classList.add('hide');
            setTimeout(() => {
                messageElement.remove();
            }, 500);
        }, 2000);
    }
};

// Инициализация магазина при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    shop.init();
}); 