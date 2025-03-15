document.addEventListener('DOMContentLoaded', function() {
    const messageContainer = document.getElementById('messageContainer');
    const inputContainer = document.getElementById('inputContainer');
    const userInput = document.getElementById('userInput');
    const submitButton = document.getElementById('submitButton');
    const loginLink = document.getElementById('loginLink');

    // Состояние регистрации
    let registrationState = {
        step: 0,
        isLogin: false,
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    };

    // Тексты сообщений
    const messages = {
        welcome: 'Приветствую тебя, потерянная душа',
        username: 'Как зовут тебя?',
        email: 'Назови мне свой дом...',
        password: 'Скажи свое секретное слово...',
        confirmPassword: 'Ты <span class="blue-text">точно</span> назвал мне свое секретное слово?',
        error: 'Я думаю ты <span class="red-text">ошибся</span>...',
        success: 'Приветствую тебя {username}. Добро пожаловать в твою утопию!',
        // Сообщения для входа
        loginWelcome: 'Рад видеть тебя снова, путник',
        loginUsername: 'Напомни, как тебя зовут?',
        loginPassword: 'Шепни мне свое секретное слово...',
        loginError: 'Кажется, ты <span class="red-text">забыл</span> свое имя или слово...',
        loginSuccess: 'С возвращением, {username}!'
    };

    // Плейсхолдеры для полей ввода
    const placeholders = {
        username: 'Введите имя (от 5 до 25 символов, только англ. буквы)',
        email: 'Введите email адрес',
        password: 'Введите пароль (минимум 8 символов)',
        confirmPassword: 'Введите пароль ещё раз',
        loginUsername: 'Введите имя',
        loginPassword: 'Введите пароль'
    };

    // Функция валидации
    function validateInput(type, value) {
        switch(type) {
            case 'username':
                // Только английские буквы, 5-25 символов, без пробелов
                const usernameRegex = /^[a-zA-Z0-9_]{5,25}$/;
                return usernameRegex.test(value) ? '' : 'Имя должно содержать от 5 до 25 символов, только английские буквы и цифры, без пробелов';
            case 'email':
                // Простая проверка email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) ? '' : 'Пожалуйста, введите корректный email адрес';
            case 'password':
                // Минимум 8 символов
                return value.length >= 8 ? '' : 'Пароль должен содержать минимум 8 символов';
            case 'confirmPassword':
                // Проверка совпадения паролей
                return value === registrationState.password ? '' : 'Пароли не совпадают';
            default:
                return '';
        }
    }

    // Функция для показа сообщения с анимацией
    function showMessage(message, callback = null) {
        // Плавно убираем старое сообщение (если есть)
        const oldMessages = document.querySelectorAll('.welcome-message');
        oldMessages.forEach(oldMsg => {
            oldMsg.classList.add('message-exit');
            setTimeout(() => {
                oldMsg.remove();
            }, 800); // Увеличили время для полного выхода сообщения
        });

        // Создаем новый элемент для сообщения
        const messageElement = document.createElement('div');
        messageElement.className = 'welcome-message';
        messageElement.innerHTML = message; // Сразу устанавливаем полный текст
        messageContainer.appendChild(messageElement);

        // Даем время для применения начальных стилей, затем показываем сообщение
        setTimeout(() => {
            // Добавляем класс для запуска анимации появления
            messageElement.classList.add('visible');
            
            // Если есть callback, вызываем его после завершения анимации
            if (callback) {
                setTimeout(callback, 1000); // Увеличили время для соответствия новой анимации
            }
        }, 50);
    }

    // Функция для показа поля ввода
    function showInputField(placeholder, type = 'text') {
        inputContainer.style.display = 'flex';
        userInput.setAttribute('placeholder', placeholder);
        userInput.setAttribute('type', type);
        userInput.value = '';
        userInput.focus();
    }

    // Функция для скрытия поля ввода
    function hideInputField() {
        inputContainer.style.display = 'none';
    }

    // Функция для отображения ошибки
    function showError(errorMessage) {
        // Удаляем предыдущую ошибку, если она есть
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Создаем и показываем новое сообщение об ошибке
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        inputContainer.insertBefore(errorElement, submitButton);

        // Показываем сообщение об ошибке
        showMessage(messages.error);
    }

    // Функция для перехода к следующему шагу регистрации
    function nextStep() {
        registrationState.step++;
        processStep();
    }

    // Функция для обработки текущего шага регистрации
    function processStep() {
        // Определяем, какую последовательность сообщений показывать
        const steps = registrationState.isLogin ? 
            ['loginWelcome', 'loginUsername', 'loginPassword'] : 
            ['welcome', 'username', 'email', 'password', 'confirmPassword'];
        
        const currentStep = steps[registrationState.step];

        // Если шаг валидный
        if (currentStep) {
            if (registrationState.step === 0) {
                // Первое сообщение
                showMessage(messages[currentStep], () => {
                    // После первого сообщения показываем поле ввода для следующего шага
                    nextStep();
                });
            } else {
                // Показываем сообщение для текущего шага
                showMessage(messages[currentStep]);
                
                // Показываем соответствующее поле ввода
                if (currentStep === 'password' || currentStep === 'confirmPassword' || currentStep === 'loginPassword') {
                    showInputField(placeholders[currentStep], 'password');
                } else {
                    showInputField(placeholders[currentStep], 'text');
                }
            }
        } else {
            // Последний шаг - успешная регистрация или вход
            handleCompletion();
        }
    }

    // Обработка завершения регистрации/входа
    function handleCompletion() {
        // Скрываем поле ввода
        hideInputField();
        
        // Сохраняем данные пользователя
        const userData = {
            username: registrationState.username,
            email: registrationState.isLogin ? '' : registrationState.email,
            isLoggedIn: true
        };
        
        localStorage.setItem('moleculeUser', JSON.stringify(userData));
        
        // Показываем сообщение об успехе
        const successMessage = registrationState.isLogin ? 
            messages.loginSuccess.replace('{username}', registrationState.username) : 
            messages.success.replace('{username}', registrationState.username);
        
        showMessage(successMessage, () => {
            // Перенаправляем на страницу с молекулой
            setTimeout(() => {
                window.location.href = 'molecule.html';
            }, 1500);
        });
    }

    // Обработчик кнопки отправки
    submitButton.addEventListener('click', function() {
        const value = userInput.value.trim();
        let errorMessage = '';
        
        // Определяем шаг и валидируем ввод
        if (registrationState.isLogin) {
            // Логика для входа
            switch(registrationState.step) {
                case 1: // Имя пользователя
                    errorMessage = validateInput('username', value);
                    if (!errorMessage) {
                        // Проверяем, существует ли пользователь
                        const storedUsers = JSON.parse(localStorage.getItem('moleculeUsers') || '[]');
                        const user = storedUsers.find(u => u.username === value);
                        if (user) {
                            registrationState.username = value;
                            registrationState.storedPassword = user.password;
                            nextStep();
                        } else {
                            errorMessage = 'Пользователь не найден';
                        }
                    }
                    break;
                case 2: // Пароль
                    if (value === registrationState.storedPassword) {
                        nextStep();
                    } else {
                        errorMessage = 'Неверный пароль';
                    }
                    break;
            }
        } else {
            // Логика для регистрации
            switch(registrationState.step) {
                case 1: // Имя пользователя
                    errorMessage = validateInput('username', value);
                    if (!errorMessage) {
                        // Проверяем, не занято ли имя
                        const storedUsers = JSON.parse(localStorage.getItem('moleculeUsers') || '[]');
                        if (storedUsers.some(u => u.username === value)) {
                            errorMessage = 'Это имя уже занято';
                        } else {
                            registrationState.username = value;
                            nextStep();
                        }
                    }
                    break;
                case 2: // Email
                    errorMessage = validateInput('email', value);
                    if (!errorMessage) {
                        registrationState.email = value;
                        nextStep();
                    }
                    break;
                case 3: // Пароль
                    errorMessage = validateInput('password', value);
                    if (!errorMessage) {
                        registrationState.password = value;
                        nextStep();
                    }
                    break;
                case 4: // Подтверждение пароля
                    errorMessage = validateInput('confirmPassword', value);
                    if (!errorMessage) {
                        // Сохраняем пользователя в localStorage
                        const storedUsers = JSON.parse(localStorage.getItem('moleculeUsers') || '[]');
                        storedUsers.push({
                            username: registrationState.username,
                            email: registrationState.email,
                            password: registrationState.password
                        });
                        localStorage.setItem('moleculeUsers', JSON.stringify(storedUsers));
                        
                        nextStep();
                    }
                    break;
            }
        }
        
        // Если есть ошибка, показываем её
        if (errorMessage) {
            showError(errorMessage);
        }
    });

    // Обработчик клавиши Enter в поле ввода
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });

    // Обработчик для ссылки "Я уже существую"
    loginLink.addEventListener('click', function() {
        // Очищаем все сообщения
        messageContainer.innerHTML = '';
        
        // Сбрасываем состояние и переключаемся на логин
        registrationState = {
            step: 0,
            isLogin: true,
            username: '',
            password: ''
        };
        
        // Начинаем процесс входа
        processStep();
    });

    // Начинаем процесс регистрации
    processStep();
}); 