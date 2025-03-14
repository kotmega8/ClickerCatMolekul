// Инициализация переменных игры
let balance = 0;
let energy = 100;
const maxEnergy = 100;
const energyRegenRate = 1; // Сколько энергии восстанавливается за интервал
const energyRegenInterval = 5000; // 5 секунд (5000 мс)
const energyPerClick = 1; // Сколько энергии тратится за клик
const rotationSpeed = 0.005; // Базовая скорость вращения
let currentRotationSpeed = rotationSpeed;
const doubleClickChance = 0.1; // 10% шанс удвоенного клика

// Элементы DOM
const balanceElement = document.getElementById('balance');
const energyFillElement = document.getElementById('energy-fill');
const currentEnergyElement = document.getElementById('current-energy');
const moleculeContainer = document.querySelector('.molecule-container');

// Настройка 3D сцены
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(300, 300);
renderer.setClearColor(0x000000, 0); // Прозрачный фон
document.getElementById('molecule').appendChild(renderer.domElement);

// Создание молекулы в стиле line-art
function createMolecule() {
    const moleculeGroup = new THREE.Group();
    
    // Создание центрального атома
    const centerGeometry = new THREE.SphereGeometry(1, 16, 16);
    const centerEdges = new THREE.EdgesGeometry(centerGeometry);
    const centerMaterial = new THREE.LineBasicMaterial({ 
        color: 0x005e9e,
        linewidth: 2
    });
    const centerAtom = new THREE.LineSegments(centerEdges, centerMaterial);
    moleculeGroup.add(centerAtom);
    
    // Создаем атомы и орбитали
    const orbitals = 3;
    const atomsPerOrbital = [3, 4, 5]; // Разное количество атомов для каждой орбитали
    const orbitRadius = 2.5;
    
    // Массив для хранения позиций всех созданных атомов
    const atomPositions = [];
    const atoms = [];
    
    // Создаем атомы
    for (let i = 0; i < orbitals; i++) {
        const orbitalGroup = new THREE.Group();
        const numAtoms = atomsPerOrbital[i];
        
        // Угол наклона для этой орбитали - распределяем равномерно
        const orbitalTiltX = (Math.PI / orbitals) * i;
        const orbitalTiltY = (Math.PI / 2) + (i * Math.PI / orbitals);
        
        // Создаем атомы на этой орбитали
        for (let j = 0; j < numAtoms; j++) {
            const angle = (Math.PI * 2 / numAtoms) * j;
            
            // Создаем атом (сфера в стиле line-art)
            const atomGeometry = new THREE.SphereGeometry(0.4, 8, 8);
            const atomEdges = new THREE.EdgesGeometry(atomGeometry);
            const atomMaterial = new THREE.LineBasicMaterial({ 
                color: 0x4ba6ff,
                linewidth: 1.5
            });
            const atom = new THREE.LineSegments(atomEdges, atomMaterial);
            
            // Вычисляем позицию атома на сфере
            const x = Math.sin(angle) * Math.cos(orbitalTiltX) * orbitRadius;
            const y = Math.sin(angle) * Math.sin(orbitalTiltX) * orbitRadius;
            const z = Math.cos(angle) * orbitRadius;
            
            atom.position.set(x, y, z);
            
            // Сохраняем позицию атома для последующего создания соединений
            atomPositions.push(new THREE.Vector3(x, y, z));
            atoms.push(atom);
            
            orbitalGroup.add(atom);
        }
        
        // Добавляем орбиталь
        moleculeGroup.add(orbitalGroup);
    }
    
    // Создаем соединения между атомами и центром
    for (let i = 0; i < atomPositions.length; i++) {
        const start = new THREE.Vector3(0, 0, 0); // Центр молекулы
        const end = atomPositions[i];
        
        // Материал для связи
        const bondMaterial = new THREE.LineBasicMaterial({ 
            color: 0x2b88d8 
        });
        
        // Создаем геометрию линии
        const bondGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const bondLine = new THREE.Line(bondGeometry, bondMaterial);
        
        moleculeGroup.add(bondLine);
    }
    
    // Создаем несколько дополнительных связей между атомами
    // для более сложной и интересной структуры
    const numConnections = 10; // Количество дополнительных связей
    for (let i = 0; i < numConnections; i++) {
        // Выбираем случайные атомы для соединения
        const idx1 = Math.floor(Math.random() * atomPositions.length);
        let idx2 = Math.floor(Math.random() * atomPositions.length);
        
        // Убедимся, что не соединяем атом с самим собой
        while (idx2 === idx1) {
            idx2 = Math.floor(Math.random() * atomPositions.length);
        }
        
        // Проверяем расстояние между атомами (соединяем только близкие)
        const distance = atomPositions[idx1].distanceTo(atomPositions[idx2]);
        if (distance < orbitRadius * 1.5) {
            const start = atomPositions[idx1];
            const end = atomPositions[idx2];
            
            // Материал для связи между атомами
            const connectionMaterial = new THREE.LineBasicMaterial({ 
                color: 0x7fb8ff,
                opacity: 0.7,
                transparent: true
            });
            
            // Создаем геометрию линии
            const connectionGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
            const connectionLine = new THREE.Line(connectionGeometry, connectionMaterial);
            
            moleculeGroup.add(connectionLine);
        }
    }
    
    return moleculeGroup;
}

const molecule = createMolecule();
scene.add(molecule);

// Добавление освещения
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(1, 1, 1);
scene.add(light1);

const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
light2.position.set(-1, -1, -1);
scene.add(light2);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Устанавливаем позицию камеры
camera.position.z = 7;

// Функция анимации для вращения молекулы
function animate() {
    requestAnimationFrame(animate);
    
    // Вращение молекулы
    molecule.rotation.y += currentRotationSpeed;
    molecule.rotation.z += currentRotationSpeed * 0.3;
    
    // Постепенное уменьшение скорости вращения до нормальной
    if (currentRotationSpeed > rotationSpeed) {
        currentRotationSpeed = Math.max(
            rotationSpeed, 
            currentRotationSpeed - 0.0001
        );
    }
    
    renderer.render(scene, camera);
}
animate();

// Обновление отображения энергии
function updateEnergyDisplay() {
    const percentage = (energy / maxEnergy) * 100;
    energyFillElement.style.width = `${percentage}%`;
    currentEnergyElement.textContent = Math.floor(energy);
    
    // Изменение цвета при низкой энергии
    if (percentage < 20) {
        energyFillElement.style.background = 'linear-gradient(90deg, #ff6b6b 0%, #ffaa00 100%)';
    } else {
        energyFillElement.style.background = 'linear-gradient(90deg, #ffd700 0%, #ffaa00 100%)';
    }
}

// Регенерация энергии
function regenerateEnergy() {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + energyRegenRate);
        updateEnergyDisplay();
    }
}

// Запуск регенерации энергии
setInterval(regenerateEnergy, energyRegenInterval);

// Функция для анимированного обновления баланса
function updateBalanceWithAnimation(newValue) {
    // Обновляем числовое значение баланса
    balance = newValue;
    balanceElement.textContent = balance;
    
    // Добавляем класс для подсветки
    balanceElement.classList.add('balance-highlight');
    
    // Добавляем анимацию пульсации
    balanceElement.style.animation = 'pulse 0.3s ease-in-out';
    
    // Через небольшую задержку убираем класс подсветки и анимацию
    setTimeout(() => {
        balanceElement.classList.remove('balance-highlight');
        balanceElement.style.animation = '';
    }, 500);
}

// Функция для создания летящего числа к балансу
function createFlyingNumber(value, startX, startY) {
    const statsRect = document.querySelector('.stats').getBoundingClientRect();
    const containerRect = moleculeContainer.getBoundingClientRect();
    
    // Создаем элемент летящего числа
    const flyingNumber = document.createElement('div');
    flyingNumber.className = 'flying-number';
    flyingNumber.textContent = value > 0 ? `+${value}` : value;
    
    // Если это удвоенный клик, меняем цвет на красный
    if (value >= 2) {
        flyingNumber.style.color = '#ff3b30';
    }
    
    // Задаем начальную позицию (по координатам клика)
    flyingNumber.style.left = `${startX}px`;
    flyingNumber.style.top = `${startY}px`;
    
    // Вычисляем конечную позицию (баланс в шапке)
    const targetX = statsRect.left + statsRect.width - 40 - containerRect.left;
    const targetY = statsRect.top + statsRect.height / 2 - containerRect.top;
    
    // Добавляем элемент в DOM
    moleculeContainer.appendChild(flyingNumber);
    
    // Запускаем анимацию движения к счетчику баланса
    setTimeout(() => {
        flyingNumber.style.left = `${targetX}px`;
        flyingNumber.style.top = `${targetY}px`;
        flyingNumber.style.opacity = '0';
        flyingNumber.style.transform = 'scale(0.5)';
    }, 10);
    
    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        flyingNumber.remove();
    }, 1000);
}

// Обработка клика по молекуле
moleculeContainer.addEventListener('click', function(event) {
    // Проверяем, достаточно ли энергии
    if (energy >= energyPerClick) {
        // Уменьшаем энергию
        energy -= energyPerClick;
        updateEnergyDisplay();
        
        // Проверяем на удвоенный клик (10% шанс)
        const isDoubleClick = Math.random() < doubleClickChance;
        const pointsToAdd = isDoubleClick ? 2 : 1;
        
        // Координаты клика
        const clickX = event.offsetX;
        const clickY = event.offsetY;
        
        // Увеличиваем баланс с анимацией
        updateBalanceWithAnimation(balance + pointsToAdd);
        
        // Создаем летящее число к балансу
        createFlyingNumber(pointsToAdd, clickX, clickY);
        
        // Увеличиваем скорость вращения молекулы
        currentRotationSpeed = rotationSpeed * 3;
        
        // Добавляем визуальный эффект клика
        const clickEffect = document.createElement('div');
        clickEffect.classList.add('click-effect');
        clickEffect.style.left = `${clickX - 25}px`;
        clickEffect.style.top = `${clickY - 25}px`;
        moleculeContainer.appendChild(clickEffect);
        
        // Удаляем эффект после анимации
        setTimeout(() => {
            clickEffect.remove();
        }, 500);
        
        // Показываем плавающий текст +1 или +2 по центру кружка клика
        const floatingText = document.createElement('div');
        floatingText.classList.add('energy-add');
        floatingText.innerText = isDoubleClick ? '+2' : '+1';
        
        // Если это удвоенный клик, меняем цвет на красный
        if (isDoubleClick) {
            floatingText.style.color = '#ff3b30';
            
            // Также показываем надпись "Doubled!"
            const doubledText = document.createElement('div');
            doubledText.classList.add('doubled-text');
            doubledText.innerText = 'Doubled!';
            doubledText.style.left = '50%';
            doubledText.style.top = '50%';
            moleculeContainer.appendChild(doubledText);
            
            // Удаляем надпись после анимации
            setTimeout(() => {
                doubledText.remove();
            }, 1200);
        }
        
        floatingText.style.left = `${clickX}px`;
        floatingText.style.top = `${clickY}px`;
        floatingText.style.transform = 'translate(-50%, -50%)';
        moleculeContainer.appendChild(floatingText);
        
        // Удаляем плавающий текст после анимации
        setTimeout(() => {
            floatingText.remove();
        }, 1000);
    } else {
        // Визуальное уведомление о недостатке энергии
        energyFillElement.style.background = '#ff4040';
        setTimeout(() => {
            updateEnergyDisplay();
        }, 300);
    }
});

// Инициализация дисплея
updateEnergyDisplay();
balanceElement.textContent = balance;

// Базовая подготовка для будущего переключения между разделами
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function() {
        // Убираем класс active у всех элементов
        navItems.forEach(navItem => navItem.classList.remove('active'));
        
        // Добавляем класс active к нажатому элементу
        this.classList.add('active');
        
        // Получаем целевой раздел
        const targetSection = this.getAttribute('data-target');
        
        // Логируем выбранный раздел (позже здесь будет реальное переключение)
        console.log(`Выбран раздел: ${targetSection}`);
        
        // Здесь в будущем будет код для переключения видимости разделов
    });
}); 