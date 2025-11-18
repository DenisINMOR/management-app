// Main Application Logic
const App = {
    currentPage: 'dashboard',
    currentDiscipline: null,
    studyTimer: null,
    studyStartTime: null,

    init() {
        console.log('🚀 App.init() started');
        
        // Проверяем доступность DOM
        if (!document.getElementById) {
            console.error('❌ DOM недоступен!');
            alert('❌ Критическая ошибка: DOM недоступен!\nВозможно, файл открыт некорректно.');
            return;
        }
        
        // Проверяем наличие критических элементов
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (!loadingScreen) {
            console.error('❌ loading-screen элемент не найден!');
        } else {
            console.log('✅ loading-screen найден');
        }
        
        if (!app) {
            console.error('❌ app элемент не найден!');
        } else {
            console.log('✅ app найден');
        }
        
        // Hide loading screen after timeout
        setTimeout(() => {
            try {
                console.log('🔧 Выполняем инициализацию...');
                
                // Всегда скрываем экран загрузки
                if (loadingScreen) {
                    loadingScreen.style.display = 'none';
                    console.log('✅ Экран загрузки скрыт');
                }
                
                if (app) {
                    app.style.display = 'flex';
                    console.log('✅ Приложение показано');
                }
                
                // Инициализируем компоненты с обработкой ошибок
                try {
                    this.setupEventListeners();
                    console.log('✅ Event listeners установлены');
                } catch (error) {
                    console.error('❌ Ошибка setupEventListeners:', error);
                }
                
                try {
                    this.loadPage('dashboard');
                    console.log('✅ Dashboard загружен');
                } catch (error) {
                    console.error('❌ Ошибка loadPage:', error);
                }

                // Загружаем фото пользователя
                try {
                    this.loadPhoto();
                    console.log('✅ Фото пользователя загружено');
                } catch (error) {
                    console.error('❌ Ошибка загрузки фото:', error);
                }
                
                console.log('✅ Инициализация завершена');
                
            } catch (error) {
                console.error('❌ Критическая ошибка инициализации:', error);
                // В любом случае пытаемся скрыть экран загрузки
                if (loadingScreen) loadingScreen.style.display = 'none';
                if (app) app.style.display = 'flex';
            }
        }, 1500);
    },

    setupEventListeners() {
        // Menu toggle (с защитой от отсутствующих элементов)
        try {
            const menuBtn = document.getElementById('menu-btn');
            if (menuBtn) {
                menuBtn.addEventListener('click', () => {
                    const sideMenu = document.getElementById('side-menu');
                    if (sideMenu) {
                        sideMenu.classList.add('active');
                        this.createOverlay();
                    }
                });
                console.log('✅ menu-btn listeners установлены');
            } else {
                console.warn('⚠️ menu-btn не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка установки menu-btn listeners:', error);
        }

        try {
            const closeMenuBtn = document.getElementById('close-menu-btn');
            if (closeMenuBtn) {
                closeMenuBtn.addEventListener('click', () => this.closeMenu());
                console.log('✅ close-menu-btn listeners установлены');
            } else {
                console.warn('⚠️ close-menu-btn не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка установки close-menu-btn listeners:', error);
        }

        // Menu links (с защитой)
        try {
            const menuLinks = document.querySelectorAll('.menu-link');
            if (menuLinks.length > 0) {
                menuLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const page = link.dataset.page;
                        if (page) {
                            this.loadPage(page);
                            this.closeMenu();
                        }
                        
                        // Update active link
                        document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    });
                });
                console.log(`✅ menu-link listeners установлены (${menuLinks.length} элементов)`);
            } else {
                console.warn('⚠️ menu-link элементы не найдены');
            }
        } catch (error) {
            console.error('❌ Ошибка установки menu-link listeners:', error);
        }

        // Study timer FAB
        try {
            const timerFab = document.getElementById('study-timer-fab');
            const timerModal = document.getElementById('timer-modal');
            if (timerFab && timerModal) {
                timerFab.addEventListener('click', () => {
                    timerModal.classList.add('active');
                });
                console.log('✅ study-timer-fab listeners установлены');
            } else {
                console.warn('⚠️ study-timer-fab или timer-modal не найдены');
            }
        } catch (error) {
            console.error('❌ Ошибка установки timer listeners:', error);
        }

        // Close modal buttons
        try {
            const closeModalBtns = document.querySelectorAll('.close-modal-btn');
            if (closeModalBtns.length > 0) {
                closeModalBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const modalId = btn.dataset.modal || btn.closest('.modal')?.id;
                        if (modalId) {
                            const modal = document.getElementById(modalId);
                            if (modal) modal.classList.remove('active');
                        }
                    });
                });
                console.log(`✅ close-modal-btn listeners установлены (${closeModalBtns.length} элементов)`);
            } else {
                console.warn('⚠️ close-modal-btn элементы не найдены');
            }
        } catch (error) {
            console.error('❌ Ошибка установки close-modal-btn listeners:', error);
        }

        // Timer controls
        try {
            const startTimerBtn = document.getElementById('start-timer-btn');
            if (startTimerBtn) {
                startTimerBtn.addEventListener('click', () => this.startTimer());
                console.log('✅ start-timer-btn listeners установлены');
            } else {
                console.warn('⚠️ start-timer-btn не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка установки start-timer-btn listeners:', error);
        }
        
        // Timer stop and reset buttons
        try {
            const stopTimerBtn = document.getElementById('stop-timer-btn');
            const resetTimerBtn = document.getElementById('reset-timer-btn');
            
            if (stopTimerBtn) {
                stopTimerBtn.addEventListener('click', () => this.stopTimer());
                console.log('✅ stop-timer-btn listeners установлены');
            } else {
                console.warn('⚠️ stop-timer-btn не найден');
            }
            
            if (resetTimerBtn) {
                resetTimerBtn.addEventListener('click', () => this.resetTimer());
                console.log('✅ reset-timer-btn listeners установлены');
            } else {
                console.warn('⚠️ reset-timer-btn не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка установки timer control listeners:', error);
        }

        // Photo management
        try {
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar) {
                userAvatar.addEventListener('click', () => this.openPhotoModal());
                console.log('✅ user-avatar click listener установлен');
            } else {
                console.warn('⚠️ user-avatar не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка установки user-avatar listener:', error);
        }

        try {
            const photoInput = document.getElementById('photo-input');
            if (photoInput) {
                photoInput.addEventListener('change', (event) => this.handlePhotoUpload(event));
                console.log('✅ photo-input change listener установлен');
            } else {
                console.warn('⚠️ photo-input не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка установки photo-input listener:', error);
        }

        try {
            const uploadPhotoBtn = document.getElementById('upload-photo-btn');
            if (uploadPhotoBtn) {
                uploadPhotoBtn.addEventListener('click', () => {
                    const photoInput = document.getElementById('photo-input');
                    if (photoInput) photoInput.click();
                });
                console.log('✅ upload-photo-btn listener установлен');
            } else {
                console.warn('⚠️ upload-photo-btn не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка установки upload-photo-btn listener:', error);
        }

        try {
            const removePhotoBtn = document.getElementById('remove-photo-btn');
            if (removePhotoBtn) {
                removePhotoBtn.addEventListener('click', () => this.removePhoto());
                console.log('✅ remove-photo-btn listener установлен');
            } else {
                console.warn('⚠️ remove-photo-btn не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка установки remove-photo-btn listener:', error);
        }

        // Modal close buttons
        try {
            document.querySelectorAll('.close-modal-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modalId = e.target.closest('.modal').id;
                    if (modalId) this.closeModal(modalId);
                });
            });
            console.log('✅ Modal close listeners установлены');
        } catch (error) {
            console.error('❌ Ошибка установки modal close listeners:', error);
        }

        // Close modals on overlay click
        try {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeModal(modal.id);
                    }
                });
            });
            console.log('✅ Modal overlay listeners установлены');
        } catch (error) {
            console.error('❌ Ошибка установки modal overlay listeners:', error);
        }
    },

    createOverlay() {
        if (!document.querySelector('.menu-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'menu-overlay active';
            overlay.addEventListener('click', () => this.closeMenu());
            document.body.appendChild(overlay);
        }
    },

    closeMenu() {
        document.getElementById('side-menu').classList.remove('active');
        const overlay = document.querySelector('.menu-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    },

    loadPage(pageName) {
        console.log(`🔄 Загрузка страницы: ${pageName}`);
        
        try {
            this.currentPage = pageName;
            const content = document.getElementById('main-content');
            const title = document.getElementById('page-title');

            if (!content) {
                console.error('❌ main-content элемент не найден!');
                return;
            }
            
            if (!title) {
                console.warn('⚠️ page-title элемент не найден, но продолжаем...');
            }

            switch(pageName) {
                case 'dashboard':
                    console.log('📊 Загружаем dashboard...');
                    if (title) title.textContent = 'Dashboard';
                    try {
                        content.innerHTML = this.renderDashboard();
                        console.log('✅ Dashboard загружен успешно');
                    } catch (error) {
                        console.error('❌ Ошибка renderDashboard:', error);
                        content.innerHTML = '<div class="error">❌ Ошибка загрузки dashboard</div>';
                    }
                    break;
                    
                case 'disciplines':
                    console.log('📚 Загружаем дисциплины...');
                    if (title) title.textContent = 'Мои дисциплины';
                    try {
                        content.innerHTML = this.renderDisciplines();
                        console.log('✅ Дисциплины загружены успешно');
                    } catch (error) {
                        console.error('❌ Ошибка renderDisciplines:', error);
                        content.innerHTML = '<div class="error">❌ Ошибка загрузки дисциплин</div>';
                    }
                    break;
                    
                case 'schedule':
                    console.log('📅 Загружаем расписание...');
                    if (title) title.textContent = 'Расписание сессии';
                    try {
                        content.innerHTML = this.renderSchedule();
                        console.log('✅ Расписание загружено успешно');
                    } catch (error) {
                        console.error('❌ Ошибка renderSchedule:', error);
                        content.innerHTML = '<div class="error">❌ Ошибка загрузки расписания</div>';
                    }
                    break;
                    
                case 'tasks':
                    console.log('✅ Загружаем задачи...');
                    if (title) title.textContent = 'Задачи';
                    try {
                        content.innerHTML = this.renderTasks();
                        console.log('✅ Задачи загружены успешно');
                    } catch (error) {
                        console.error('❌ Ошибка renderTasks:', error);
                        content.innerHTML = '<div class="error">❌ Ошибка загрузки задач</div>';
                    }
                    break;
                    
                case 'results':
                    console.log('🏆 Загружаем результаты...');
                    if (title) title.textContent = 'Результаты';
                    try {
                        content.innerHTML = this.renderResults();
                        console.log('✅ Результаты загружены успешно');
                    } catch (error) {
                        console.error('❌ Ошибка renderResults:', error);
                        content.innerHTML = '<div class="error">❌ Ошибка загрузки результатов</div>';
                    }
                    break;
                    
                case 'achievements':
                    console.log('🏆 Загружаем достижения...');
                    if (title) title.textContent = 'Достижения';
                    try {
                        content.innerHTML = this.renderAchievements();
                        console.log('✅ Достижения загружены успешно');
                    } catch (error) {
                        console.error('❌ Ошибка renderAchievements:', error);
                        content.innerHTML = '<div class="error">❌ Ошибка загрузки достижений</div>';
                    }
                    break;
                    
                case 'settings':
                    console.log('⚙️ Загружаем настройки...');
                    if (title) title.textContent = 'Настройки';
                    try {
                        content.innerHTML = this.renderSettings();
                        console.log('✅ Настройки загружены успешно');
                    } catch (error) {
                        console.error('❌ Ошибка renderSettings:', error);
                        content.innerHTML = '<div class="error">❌ Ошибка загрузки настроек</div>';
                    }
                    break;
                    
                default:
                    console.warn(`⚠️ Неизвестная страница: ${pageName}`);
                    if (title) title.textContent = 'Страница не найдена';
                    content.innerHTML = '<div class="error">❌ Страница не найдена</div>';
            }
            
            console.log(`✅ Страница ${pageName} загружена`);
            
        } catch (error) {
            console.error('❌ Критическая ошибка loadPage:', error);
            if (content) {
                content.innerHTML = '<div class="error">❌ Критическая ошибка загрузки страницы</div>';
            }
        }
    },

    renderDashboard() {
        const progress = StorageManager.get(StorageManager.KEYS.PROGRESS);
        const studyTime = StorageManager.get(StorageManager.KEYS.STUDY_TIME);
        const today = new Date().toISOString().split('T')[0];
        const todayTime = studyTime.byDate[today] || 0;

        return `
            <div class="dashboard">
                <div class="card mb-lg">
                    <div class="card-header">
                        <h2 class="card-title">Общий прогресс</h2>
                    </div>
                    <div class="card-body">
                        <p>Добро пожаловать в систему подготовки к сессии!</p>
                        <p class="text-red">Сегодня: ${todayTime} минут</p>
                        <p>Всего времени: ${Math.round(studyTime.total / 60)} часов</p>
                    </div>
                </div>

                <h3 class="mb-md">Дисциплины</h3>
                ${Object.keys(DISCIPLINES_DATA).map(key => {
                    const disc = DISCIPLINES_DATA[key];
                    const percent = StorageManager.getProgressPercent(key);
                    return `
                        <div class="card mb-md" onclick="App.loadDiscipline('${key}')">
                            <div class="card-header">
                                <h3 class="card-title">${disc.icon} ${disc.shortName}</h3>
                                <span class="badge ${disc.examType === 'exam' ? 'badge-red' : 'badge-gray'}">
                                    ${disc.examType === 'exam' ? 'ЭКЗАМЕН' : 'ЗАЧЕТ'}
                                </span>
                            </div>
                            <div class="card-body">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percent}%"></div>
                                </div>
                                <p class="mt-sm">${percent}% изучено</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderDisciplines() {
        return `
            <div class="disciplines-grid">
                ${Object.keys(DISCIPLINES_DATA).map(key => {
                    const disc = DISCIPLINES_DATA[key];
                    const percent = StorageManager.getProgressPercent(key);
                    return `
                        <div class="discipline-card card" onclick="App.loadDiscipline('${key}')">
                            <div class="card-header">
                                <h2 class="card-title">${disc.icon}</h2>
                                <span class="badge ${disc.examType === 'exam' ? 'badge-red' : 'badge-gray'}">
                                    ${disc.examType === 'exam' ? 'ЭКЗАМЕН' : 'ЗАЧЕТ'}
                                </span>
                            </div>
                            <div class="card-body">
                                <h3>${disc.shortName}</h3>
                                <div class="progress-bar mt-md">
                                    <div class="progress-fill" style="width: ${percent}%"></div>
                                </div>
                                <p class="mt-sm">${percent}%</p>
                                <p class="text-sm">${disc.flashcards.length} карточек</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    loadDiscipline(disciplineId) {
        this.currentDiscipline = disciplineId;
        const disc = DISCIPLINES_DATA[disciplineId];
        const title = document.getElementById('page-title');
        const content = document.getElementById('main-content');

        title.textContent = disc.shortName;
        content.innerHTML = `
            <div class="discipline-detail">
                <div class="card mb-lg">
                    <div class="card-header">
                        <h2>${disc.icon} ${disc.name}</h2>
                        <span class="badge ${disc.examType === 'exam' ? 'badge-red' : 'badge-gray'}">
                            ${disc.examType === 'exam' ? 'ЭКЗАМЕН' : 'ЗАЧЕТ'}
                        </span>
                    </div>
                    <div class="card-body">
                        <div class="progress-bar mb-md">
                            <div class="progress-fill" style="width: ${StorageManager.getProgressPercent(disciplineId)}%"></div>
                        </div>
                        <p>Прогресс: ${StorageManager.getProgressPercent(disciplineId)}%</p>
                        
                        <!-- Кнопка зачет/экзамен -->
                        <button class="btn btn-primary mb-md" onclick="alert('Тип аттестации: ${disc.examType === 'exam' ? 'ЭКЗАМЕН' : 'ЗАЧЕТ'}');">
                            📝 ${disc.examType === 'exam' ? 'Экзамен' : 'Зачет'}
                        </button>
                    </div>
                </div>

                <div class="learning-modes">
                    <button class="mode-btn card" onclick="App.startFlashcards('${disciplineId}')">
                        <h3>📇 Карточки</h3>
                        <p>${disc.flashcards.length} карточек</p>
                    </button>
                    <button class="mode-btn card" onclick="App.startMatching('${disciplineId}')">
                        <h3>🎯 Соответствие</h3>
                        <p>${disc.matchingPairs.length} пар</p>
                    </button>
                    <button class="mode-btn card" onclick="App.showTheory('${disciplineId}')">
                        <h3>📚 Теория</h3>
                        <p>${disc.theory.modules.length} модулей</p>
                        </div>

                <button class="btn btn-secondary mt-lg" onclick="App.loadPage('disciplines')">← Назад к дисциплинам</button>
            </div>
        `;
    },

    startFlashcards(disciplineId) {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div id="flashcards-container"></div>
            <button class="btn btn-secondary mt-lg" onclick="App.loadDiscipline('${disciplineId}')">← Назад</button>
        `;
        GamesManager.initFlashcards(disciplineId, 'flashcards-container');
    },

    startMatching(disciplineId) {
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <h2 class="mb-lg">Игра: Найди пару</h2>
            <p class="mb-lg">Сопоставьте термины с определениями</p>
            <div id="matching-container"></div>
            <button class="btn btn-secondary mt-lg" onclick="App.loadDiscipline('${disciplineId}')">← Назад</button>
        `;
        GamesManager.initMatchingGame(disciplineId, 'matching-container');
    },

    showTheory(disciplineId) {
        const disc = DISCIPLINES_DATA[disciplineId];
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="theory-content">
                ${disc.theory.modules.map(module => `
                    <div class="card mb-lg">
                        <div class="card-header">
                            <h3 class="card-title">${module.title}</h3>
                        </div>
                        <div class="card-body">
                            <p style="white-space: pre-line;">${module.content}</p>
                        </div>
                    </div>
                `).join('')}
                <button class="btn btn-secondary" onclick="App.loadDiscipline('${disciplineId}')">← Назад</button>
            </div>
        `;
    },

    // startFinalTest method removed - no tests functionality
        // startFinalTest method removed - no tests functionality
        
    renderSchedule() {
        const schedule = StorageManager.get(StorageManager.KEYS.SCHEDULE);
        return `
            <div class="schedule">
                <button class="btn btn-primary mb-lg" onclick="App.addScheduleItem().catch(console.error)">+ Добавить в расписание</button>
                ${schedule.length === 0 ? '<p>Расписание пусто. Добавьте даты экзаменов и зачетов.</p>' : ''}
                <div id="schedule-list">
                    ${schedule.map((item, index) => `
                        <div class="card mb-md">
                            <div class="card-body">
                                <h3>${item.discipline}</h3>
                                <p>Дата: ${item.date}</p>
                                <p>Время: ${item.time || 'Не указано'}</p>
                                <button class="btn btn-danger btn-sm" onclick="App.removeScheduleItem(${index})">Удалить</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    async addScheduleItem() {
        try {
            const discipline = await prompt('Название дисциплины:');
            if (!discipline) return;
            
            const date = await prompt('Дата (ГГГГ-ММ-ДД):');
            if (!date) return;
            
            const time = await prompt('Время (необязательно):') || '';
            
            if (discipline && date) {
                const schedule = StorageManager.get(StorageManager.KEYS.SCHEDULE);
                schedule.push({ discipline, date, time });
                StorageManager.set(StorageManager.KEYS.SCHEDULE, schedule);
                this.loadPage('schedule');
                showCustomAlert(`Добавлено в расписание:\nДисциплина: ${discipline}\nДата: ${date}\nВремя: ${time || 'не указано'}`);
            }
        } catch (error) {
            console.error('Ошибка добавления в расписание:', error);
        }
    },

    removeScheduleItem(index) {
        const schedule = StorageManager.get(StorageManager.KEYS.SCHEDULE);
        schedule.splice(index, 1);
        StorageManager.set(StorageManager.KEYS.SCHEDULE, schedule);
        this.loadPage('schedule');
    },

    renderTasks() {
        const tasks = StorageManager.get(StorageManager.KEYS.TASKS);
        return `
            <div class="tasks">
                <button class="btn btn-primary mb-lg" onclick="App.addTask().catch(console.error)">+ Добавить задачу</button>
                <h3>Общие задачи</h3>
                ${this.renderTaskList(tasks.general, 'general')}
                
                <h3 class="mt-lg">Задачи по дисциплинам</h3>
                ${Object.keys(DISCIPLINES_DATA).map(key => `
                    <div class="card mb-md">
                        <div class="card-header">
                            <h4>${DISCIPLINES_DATA[key].shortName}</h4>
                            <button class="btn btn-sm btn-primary" onclick="App.addDisciplineTask('${key}').catch(console.error)">+</button>
                        </div>
                        <div class="card-body">
                            ${this.renderTaskList(tasks.disciplines[key] || [], 'disciplines', key)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderTaskList(tasks, type, disciplineId = null) {
        if (!tasks || tasks.length === 0) return '<p>Нет задач</p>';
        
        return tasks.map((task, index) => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="App.toggleTask('${type}', ${index}, ${disciplineId ? `'${disciplineId}'` : 'null'})">
                <span>${task.text}</span>
                <button class="btn btn-sm btn-danger" onclick="App.removeTask('${type}', ${index}, ${disciplineId ? `'${disciplineId}'` : 'null'})">×</button>
            </div>
        `).join('');
    },

    async addTask() {
        try {
            const text = await prompt('Текст задачи:');
            if (!text) return;
            
            const tasks = StorageManager.get(StorageManager.KEYS.TASKS);
            tasks.general.push({ text, completed: false });
            StorageManager.set(StorageManager.KEYS.TASKS, tasks);
            this.loadPage('tasks');
            showCustomAlert('Задача добавлена');
        } catch (error) {
            console.error('Ошибка добавления задачи:', error);
        }
    },

    async addDisciplineTask(disciplineId) {
        try {
            const text = await prompt('Текст задачи:');
            if (!text) return;
            
            const tasks = StorageManager.get(StorageManager.KEYS.TASKS);
            if (!tasks.disciplines[disciplineId]) tasks.disciplines[disciplineId] = [];
            tasks.disciplines[disciplineId].push({ text, completed: false });
            StorageManager.set(StorageManager.KEYS.TASKS, tasks);
            this.loadPage('tasks');
            showCustomAlert('Задача добавлена');
        } catch (error) {
            console.error('Ошибка добавления задачи дисциплины:', error);
        }
    },

    toggleTask(type, index, disciplineId) {
        const tasks = StorageManager.get(StorageManager.KEYS.TASKS);
        const taskList = disciplineId ? tasks.disciplines[disciplineId] : tasks[type];
        taskList[index].completed = !taskList[index].completed;
        StorageManager.set(StorageManager.KEYS.TASKS, tasks);
        this.loadPage('tasks');
    },

    removeTask(type, index, disciplineId) {
        const tasks = StorageManager.get(StorageManager.KEYS.TASKS);
        const taskList = disciplineId ? tasks.disciplines[disciplineId] : tasks[type];
        taskList.splice(index, 1);
        StorageManager.set(StorageManager.KEYS.TASKS, tasks);
        this.loadPage('tasks');
    },

    renderResults() {
        const results = StorageManager.get(StorageManager.KEYS.RESULTS);
        const testResults = StorageManager.get(StorageManager.KEYS.TEST_RESULTS) || {};
        
        return `
            <div class="results">
                <div class="results-section mb-xl">
                    <h2 class="mb-lg">📊 Итоговые результаты сессии</h2>
                    ${Object.keys(DISCIPLINES_DATA).filter(key => key !== 'final_tests').map(key => {
                        const disc = DISCIPLINES_DATA[key];
                        const result = results[key];
                        const testResult = testResults[key];
                        
                        return `
                            <div class="card mb-md">
                                <div class="card-header">
                                    <h3>${disc.icon} ${disc.shortName}</h3>
                                    <span class="badge ${disc.examType === 'exam' ? 'badge-red' : 'badge-gray'}">
                                        ${disc.examType === 'exam' ? 'ЭКЗАМЕН' : 'ЗАЧЕТ'}
                                    </span>
                                </div>
                                <div class="card-body">
                                    ${disc.examType === 'exam' ? `
                                        <input type="number" min="0" max="100" placeholder="Баллы (0-100)" 
                                               value="${result.score || ''}" 
                                               onchange="App.saveResult('${key}', this.value)">
                                        ${result.score ? `<p class="mt-sm">Оценка: ${this.calculateGrade(result.score)}</p>` : ''}
                                    ` : `
                                        <select onchange="App.saveResult('${key}', this.value)">
                                            <option value="">Не указано</option>
                                            <option value="passed" ${result.passed === true ? 'selected' : ''}>Зачтено</option>
                                            <option value="failed" ${result.passed === false ? 'selected' : ''}>Не зачтено</option>
                                        </select>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="test-results-section">
                    <h2 class="mb-lg">📝 Результаты тестов</h2>
                    ${Object.keys(testResults).length === 0 ? 
                        '<p>Пока не пройдено ни одного теста.</p>' : 
                        Object.keys(testResults).map(key => {
                            const testResult = testResults[key];
                            const disc = DISCIPLINES_DATA[key];
                            const date = new Date(testResult.date).toLocaleDateString('ru-RU');
                            
                            return `
                                <div class="card mb-md">
                                    <div class="card-header">
                                        <h3>${disc.icon} ${disc.shortName}</h3>
                                        <div class="test-score">
                                            <span class="score">${testResult.score} б.</span>
                                            <span class="grade">${testResult.grade}</span>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div class="test-details">
                                            <p><strong>Дата:</strong> ${date}</p>
                                            <p><strong>Правильных ответов:</strong> ${testResult.correctAnswers} из ${testResult.totalQuestions}</p>
                                            <p><strong>Время:</strong> ${Math.floor(testResult.timeSpent / 60)}:${(testResult.timeSpent % 60).toString().padStart(2, '0')}</p>
                                        </div>
                                        <div class="test-actions">
                                            <button class="btn btn-sm btn-secondary" onclick="App.viewTestDetails('${key}')">Подробнее</button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')
                    }
                </div>
            </div>
        `;
    },

    renderAchievements() {
        const achievements = StorageManager.getAchievements();
        const studyTime = StorageManager.get(StorageManager.KEYS.STUDY_TIME) || { total: 0 };
        const progress = StorageManager.get(StorageManager.KEYS.PROGRESS) || {};
        
        const totalStudiedCards = Object.values(progress).reduce((sum, d) => sum + (d.studiedCards?.length || 0), 0);
        const totalKnownCards = Object.values(progress).reduce((sum, d) => sum + (d.knownCards?.length || 0), 0);
        const completedDisciplines = Object.keys(DISCIPLINES_DATA).filter(key => {
            const totalCards = DISCIPLINES_DATA[key].flashcards.length;
            const knownCards = progress[key]?.knownCards?.length || 0;
            return totalCards > 0 && knownCards === totalCards;
        }).length;

        return `
            <div class="achievements">
                <div class="stats-overview mb-xl">
                    <h2 class="mb-lg">📈 Статистика обучения</h2>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${achievements.length}</div>
                            <div class="stat-label">Достижений получено</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${totalStudiedCards}</div>
                            <div class="stat-label">Карточек изучено</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${totalKnownCards}</div>
                            <div class="stat-label">Карточек выучено</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${Math.floor(studyTime.total / 60)}ч ${studyTime.total % 60}м</div>
                            <div class="stat-label">Время изучения</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${completedDisciplines}/7</div>
                            <div class="stat-label">Дисциплин изучено</div>
                        </div>
                    </div>
                </div>

                <div class="achievements-section">
                    <h2 class="mb-lg">🏆 Ваши достижения</h2>
                    ${achievements.length === 0 ? 
                        '<p class="text-center">Пока нет достижений. Начните изучение карточек, чтобы получить первые награды!</p>' :
                        `<div class="achievements-grid">
                            ${achievements.map(achievement => `
                                <div class="achievement-card unlocked">
                                    <div class="achievement-icon">${achievement.title.split(' ')[0]}</div>
                                    <div class="achievement-content">
                                        <h3 class="achievement-title">${achievement.title}</h3>
                                        <p class="achievement-description">${achievement.description}</p>
                                        <p class="achievement-date">Получено: ${new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>`
                    }
                </div>

                <div class="progress-section mt-xl">
                    <h2 class="mb-lg">🎯 Прогресс к достижениям</h2>
                    <div class="progress-achievements">
                        ${this.renderProgressAchievements()}
                    </div>
                </div>
            </div>
        `;
    },

    renderProgressAchievements() {
        const progress = StorageManager.get(StorageManager.KEYS.PROGRESS) || {};
        const studyTime = StorageManager.get(StorageManager.KEYS.STUDY_TIME) || { total: 0 };
        const testResults = StorageManager.get(StorageManager.KEYS.TEST_RESULTS) || {};
        
        const totalStudiedCards = Object.values(progress).reduce((sum, d) => sum + (d.studiedCards?.length || 0), 0);
        const completedDisciplines = Object.keys(DISCIPLINES_DATA).filter(key => {
            const totalCards = DISCIPLINES_DATA[key].flashcards.length;
            const knownCards = progress[key]?.knownCards?.length || 0;
            return totalCards > 0 && knownCards === totalCards;
        }).length;

        return `
            <div class="progress-item">
                <div class="progress-header">
                    <h3>⚡ Быстрый ученик</h3>
                    <span class="progress-text">${Math.min(totalStudiedCards, 10)}/10 карточек</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((totalStudiedCards / 10) * 100, 100)}%"></div>
                </div>
            </div>

            <div class="progress-item">
                <div class="progress-header">
                    <h3>📚 Прилежный студент</h3>
                    <span class="progress-text">${Math.floor(studyTime.total / 60)}/120 минут</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((studyTime.total / 120) * 100, 100)}%"></div>
                </div>
            </div>

            <div class="progress-item">
                <div class="progress-header">
                    <h3>🎓 Магистр знаний</h3>
                    <span class="progress-text">${completedDisciplines}/7 дисциплин</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min((completedDisciplines / 7) * 100, 100)}%"></div>
                </div>
            </div>
        `;
    },

    saveResult(disciplineId, value) {
        const results = StorageManager.get(StorageManager.KEYS.RESULTS);
        const disc = DISCIPLINES_DATA[disciplineId];
        
        if (disc.examType === 'exam') {
            results[disciplineId].score = parseInt(value);
            results[disciplineId].grade = this.calculateGrade(value);
        } else {
            results[disciplineId].passed = value === 'passed';
        }
        
        StorageManager.set(StorageManager.KEYS.RESULTS, results);
        this.loadPage('results');
    },

    calculateGrade(score) {
        score = parseInt(score);
        if (score >= 98) return 'A+ (Отлично)';
        if (score >= 93) return 'A (Отлично)';
        if (score >= 90) return 'A- (Отлично)';
        if (score >= 87) return 'B+ (Хорошо)';
        if (score >= 83) return 'B (Хорошо)';
        if (score >= 80) return 'B- (Хорошо)';
        if (score >= 77) return 'C+ (Удовлетворительно)';
        if (score >= 73) return 'C (Удовлетворительно)';
        if (score >= 70) return 'C- (Удовлетворительно)';
        if (score >= 67) return 'D+ (Удовлетворительно)';
        if (score >= 63) return 'D (Удовлетворительно)';
        if (score >= 60) return 'D- (Удовлетворительно)';
        if (score >= 50) return 'E (Неудовлетворительно)';
        return 'F (Неудовлетворительно)';
    },



    renderSettings() {
        const settings = StorageManager.get(StorageManager.KEYS.SETTINGS);
        return `
            <div class="settings">
                <div class="card mb-md">
                    <div class="card-body">
                        <label>
                            <input type="checkbox" ${settings.notifications ? 'checked' : ''} 
                                   onchange="App.updateSetting('notifications', this.checked)">
                            Уведомления
                        </label>
                    </div>
                </div>
                <div class="card mb-md">
                    <div class="card-body">
                        <label>
                            <input type="checkbox" ${settings.soundEffects ? 'checked' : ''} 
                                   onchange="App.updateSetting('soundEffects', this.checked)">
                            Звуковые эффекты
                        </label>
                    </div>
                </div>
                <div class="card mb-md">
                    <div class="card-body">
                        <label>
                            Дневная цель (минут):
                            <input type="number" value="${settings.dailyGoal}" 
                                   onchange="App.updateSetting('dailyGoal', parseInt(this.value))">
                        </label>
                    </div>
                </div>
            </div>
        `;
    },

    updateSetting(key, value) {
        const settings = StorageManager.get(StorageManager.KEYS.SETTINGS);
        settings[key] = value;
        StorageManager.set(StorageManager.KEYS.SETTINGS, settings);
    },

    updateCountdown() {
        try {
            const userData = StorageManager.get(StorageManager.KEYS.USER_DATA);
            if (!userData) return;
            
            const sessionDate = new Date(userData.sessionStartDate);
            const today = new Date();
            const diff = Math.ceil((sessionDate - today) / (1000 * 60 * 60 * 24));
            
            const countdownElement = document.getElementById('countdown-days');
            if (countdownElement) {
                countdownElement.textContent = diff > 0 ? diff : 0;
            }
            
            // Update every hour only if we're still in the app
            setTimeout(() => this.updateCountdown(), 3600000);
        } catch (e) {
            console.error('Ошибка в updateCountdown:', e);
        }
    },

    startTimer() {
        this.studyStartTime = Date.now();
        document.getElementById('start-timer-btn').disabled = true;
        document.getElementById('stop-timer-btn').disabled = false;
        
        this.studyTimer = setInterval(() => {
            const elapsed = Date.now() - this.studyStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            const display = `${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
            document.getElementById('timer-time').textContent = display;
            
            // Update progress circle
            const progress = document.getElementById('timer-progress');
            const percent = (seconds % 60) / 60;
            const offset = 565.48 * (1 - percent);
            progress.style.strokeDashoffset = offset;
        }, 100);
    },

    stopTimer() {
        if (this.studyTimer) {
            clearInterval(this.studyTimer);
            const elapsed = Date.now() - this.studyStartTime;
            const minutes = Math.floor(elapsed / (1000 * 60));
            
            StorageManager.addStudyTime(minutes, this.currentDiscipline);
            
            document.getElementById('start-timer-btn').disabled = false;
            document.getElementById('stop-timer-btn').disabled = true;
            
            const studyTime = StorageManager.get(StorageManager.KEYS.STUDY_TIME);
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('today-study-time').textContent = `${studyTime.byDate[today] || 0} мин`;
            
            alert(`Сохранено: ${minutes} минут`);
        }
    },

    resetTimer() {
        if (this.studyTimer) {
            clearInterval(this.studyTimer);
        }
        document.getElementById('timer-time').textContent = '00:00:00';
        document.getElementById('start-timer-btn').disabled = false;
        document.getElementById('stop-timer-btn').disabled = true;
        document.getElementById('timer-progress').style.strokeDashoffset = 0;
    },

    calculateTotalProgress() {
        try {
            const progress = StorageManager.get(StorageManager.KEYS.PROGRESS);
            if (!progress) return 0;
            
            let totalCards = 0;
            let knownCards = 0;
            
            Object.keys(DISCIPLINES_DATA).forEach(key => {
                if (DISCIPLINES_DATA[key].flashcards) {
                    totalCards += DISCIPLINES_DATA[key].flashcards.length;
                }
                if (progress[key] && progress[key].knownCards) {
                    knownCards += progress[key].knownCards.length;
                }
            });
            
            return totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0;
        } catch (e) {
            console.error('Ошибка calculateTotalProgress:', e);
            return 0;
        }
    },

    viewTestDetails(disciplineId) {
        const testResults = StorageManager.get(StorageManager.KEYS.TEST_RESULTS);
        const testResult = testResults[disciplineId];
        
        if (!testResult) {
            alert('Результаты теста не найдены');
            return;
        }
        
        const content = document.getElementById('main-content');
        content.innerHTML = `
            <div class="test-results">
                <h2 class="mb-lg">📝 Подробные результаты теста</h2>
                <div class="test-summary mb-xl">
                    <div class="score-circle">
                        <div class="score-number">${testResult.score}</div>
                        <div class="score-label">баллов</div>
                    </div>
                    <div class="grade-display">
                        <span class="grade-value">${testResult.grade}</span>
                    </div>
                    <p>Правильных ответов: ${testResult.correctAnswers} из ${testResult.totalQuestions}</p>
                    <p>Время выполнения: ${Math.floor(testResult.timeSpent / 60)}:${(testResult.timeSpent % 60).toString().padStart(2, '0')}</p>
                </div>
                
                <div class="detailed-results">
                    ${testResult.results.map((result, index) => `
                        <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'} mb-md">
                            <div class="result-header">
                                <span class="result-number">Вопрос ${index + 1}</span>
                                <span class="result-status">${result.isCorrect ? '✅' : '❌'}</span>
                            </div>
                            <p class="result-question mb-sm">${result.question}</p>
                            <div class="result-answers">
                                <p><strong>Ваш ответ:</strong> ${result.options[result.userAnswer] || 'Не отвечен'}</p>
                                <p><strong>Правильный ответ:</strong> ${result.options[result.correctAnswer]}</p>
                                ${!result.isCorrect ? `<p class="explanation"><strong>Объяснение:</strong> ${result.explanation}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <button class="btn btn-secondary mt-xl" onclick="App.loadPage('results')">← Назад к результатам</button>
            </div>
        `;
    },

    // =========================================
    // PHOTO MANAGEMENT FUNCTIONS
    // =========================================

    async loadPhoto() {
        try {
            const savedPhoto = StorageManager.get(StorageManager.KEYS.USER_PHOTO);
            if (savedPhoto) {
                this.displayPhoto(savedPhoto);
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки фото:', error);
        }
    },

    displayPhoto(photoData) {
        const userPhoto = document.getElementById('user-photo');
        const userLetter = document.getElementById('user-letter');
        
        if (userPhoto && userLetter) {
            userPhoto.src = photoData;
            userPhoto.style.display = 'block';
            userLetter.style.display = 'none';
        }
    },

    showLetter() {
        const userPhoto = document.getElementById('user-photo');
        const userLetter = document.getElementById('user-letter');
        
        if (userPhoto && userLetter) {
            userPhoto.style.display = 'none';
            userLetter.style.display = 'block';
        }
    },

    async handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('❌ Пожалуйста, выберите файл изображения (JPG, PNG, GIF)');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('❌ Размер файла не должен превышать 5MB');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const photoData = e.target.result;
                
                // Save to storage
                StorageManager.set(StorageManager.KEYS.USER_PHOTO, photoData);
                
                // Display in UI
                this.displayPhoto(photoData);
                
                // Close modal if open
                this.closeModal('photo-modal');
                
                alert('✅ Фото успешно загружено!');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('❌ Ошибка загрузки фото:', error);
            alert('❌ Ошибка при загрузке фото. Попробуйте еще раз.');
        }
    },

    removePhoto() {
        try {
            StorageManager.remove(StorageManager.KEYS.USER_PHOTO);
            this.showLetter();
            this.closeModal('photo-modal');
            alert('✅ Фото удалено!');
        } catch (error) {
            console.error('❌ Ошибка удаления фото:', error);
            alert('❌ Ошибка при удалении фото');
        }
    },

    openPhotoModal() {
        const modal = document.getElementById('photo-modal');
        const currentPhoto = document.getElementById('current-photo');
        const removeBtn = document.getElementById('remove-photo-btn');
        
        if (modal) {
            // Check if photo exists
            const savedPhoto = StorageManager.get(StorageManager.KEYS.USER_PHOTO);
            
            if (savedPhoto && currentPhoto) {
                currentPhoto.src = savedPhoto;
                currentPhoto.style.display = 'block';
                if (removeBtn) removeBtn.style.display = 'block';
            } else {
                if (currentPhoto) currentPhoto.style.display = 'none';
                if (removeBtn) removeBtn.style.display = 'none';
            }
            
            modal.style.display = 'flex';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

};

// Update user info in UI
function updateUserInfo() {
    const nameElement = document.querySelector('.user-name');
    const groupElement = document.querySelector('.user-group');
    const birthElement = document.querySelector('.user-birth');
    
    if (nameElement) nameElement.textContent = USER_INFO.name;
    if (groupElement) groupElement.textContent = `${USER_INFO.group} ${USER_INFO.university}`;
    if (birthElement) birthElement.textContent = `Д.р.: ${USER_INFO.birthDate}`;
}

// Update current date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateTimeString = now.toLocaleDateString('ru-RU', options);
    const dateTimeElement = document.getElementById('current-datetime');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeString;
    }
}

// Update time immediately and then every minute
updateDateTime();
updateUserInfo();
setInterval(() => {
    updateDateTime();
}, 60000);

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    updateUserInfo(); // Ensure user info is updated after DOM is loaded
});