// LocalStorage Manager
const StorageManager = {
    // Keys
    KEYS: {
        USER_DATA: 'session_prep_user',
        PROGRESS: 'session_prep_progress',
        TASKS: 'session_prep_tasks',
        SCHEDULE: 'session_prep_schedule',
        RESULTS: 'session_prep_results',
        TEST_RESULTS: 'session_prep_test_results',
        ACHIEVEMENTS: 'session_prep_achievements',
        STUDY_TIME: 'session_prep_study_time',
        SETTINGS: 'session_prep_settings',
        USER_PHOTO: 'session_prep_user_photo'
    },

    // Get data
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error getting data:', e);
            return null;
        }
    },

    // Set data
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error setting data:', e);
            return false;
        }
    },

    // Initialize default data
    init() {
        if (!this.get(this.KEYS.USER_DATA)) {
            this.set(this.KEYS.USER_DATA, {
                name: 'Магистрант',
                group: 'зФБМ-41',
                sessionStartDate: '2026-01-15' // Январь 2026
            });
        }

        if (!this.get(this.KEYS.PROGRESS)) {
            const progress = {};
            Object.keys(DISCIPLINES_DATA).forEach(key => {
                progress[key] = {
                    studiedCards: [],
                    knownCards: [],
                    testsCompleted: 0,
                    gamesCompleted: 0,
                    lastStudied: null
                };
            });
            this.set(this.KEYS.PROGRESS, progress);
        }

        if (!this.get(this.KEYS.TASKS)) {
            this.set(this.KEYS.TASKS, {
                general: [],
                disciplines: {}
            });
        }

        if (!this.get(this.KEYS.SCHEDULE)) {
            this.set(this.KEYS.SCHEDULE, []);
        }

        if (!this.get(this.KEYS.RESULTS)) {
            const results = {};
            Object.keys(DISCIPLINES_DATA).forEach(key => {
                const disc = DISCIPLINES_DATA[key];
                results[key] = {
                    examType: disc.examType,
                    score: null,
                    grade: null,
                    passed: null
                };
            });
            this.set(this.KEYS.RESULTS, results);
        }

        if (!this.get(this.KEYS.ACHIEVEMENTS)) {
            this.set(this.KEYS.ACHIEVEMENTS, []);
        }

        if (!this.get(this.KEYS.STUDY_TIME)) {
            this.set(this.KEYS.STUDY_TIME, {
                total: 0,
                byDate: {},
                byDiscipline: {}
            });
        }

        if (!this.get(this.KEYS.SETTINGS)) {
            this.set(this.KEYS.SETTINGS, {
                notifications: true,
                soundEffects: true,
                dailyGoal: 60 // минут
            });
        }
    },

    // Progress methods
    markCardStudied(disciplineId, cardId) {
        const progress = this.get(this.KEYS.PROGRESS);
        if (!progress[disciplineId].studiedCards.includes(cardId)) {
            progress[disciplineId].studiedCards.push(cardId);
            progress[disciplineId].lastStudied = new Date().toISOString();
            this.set(this.KEYS.PROGRESS, progress);
        }
    },

    markCardKnown(disciplineId, cardId, known) {
        const progress = this.get(this.KEYS.PROGRESS);
        if (known && !progress[disciplineId].knownCards.includes(cardId)) {
            progress[disciplineId].knownCards.push(cardId);
        } else if (!known) {
            const index = progress[disciplineId].knownCards.indexOf(cardId);
            if (index > -1) progress[disciplineId].knownCards.splice(index, 1);
        }
        this.set(this.KEYS.PROGRESS, progress);
    },

    // Calculate progress percentage
    getProgressPercent(disciplineId) {
        const progress = this.get(this.KEYS.PROGRESS);
        const discipline = DISCIPLINES_DATA[disciplineId];
        if (!discipline || !progress[disciplineId]) return 0;
        
        const totalCards = discipline.flashcards.length;
        const knownCards = progress[disciplineId].knownCards.length;
        return Math.round((knownCards / totalCards) * 100);
    },

    // Study time methods
    addStudyTime(minutes, disciplineId = null) {
        const studyTime = this.get(this.KEYS.STUDY_TIME);
        const today = new Date().toISOString().split('T')[0];
        
        studyTime.total += minutes;
        studyTime.byDate[today] = (studyTime.byDate[today] || 0) + minutes;
        
        if (disciplineId) {
            studyTime.byDiscipline[disciplineId] = (studyTime.byDiscipline[disciplineId] || 0) + minutes;
        }
        
        this.set(this.KEYS.STUDY_TIME, studyTime);
    },

    // Achievement methods
    addAchievement(achievement) {
        const achievements = this.get(this.KEYS.ACHIEVEMENTS);
        const existing = achievements.find(a => a.id === achievement.id);
        
        if (!existing) {
            achievement.unlockedAt = new Date().toISOString();
            achievements.push(achievement);
            this.set(this.KEYS.ACHIEVEMENTS, achievements);
            return true; // New achievement unlocked
        }
        return false;
    },

    getAchievements() {
        return this.get(this.KEYS.ACHIEVEMENTS) || [];
    },

    // Check and unlock achievements based on progress
    checkAchievements() {
        const progress = this.get(this.KEYS.PROGRESS);
        const studyTime = this.get(this.KEYS.STUDY_TIME);
        const achievements = this.get(this.KEYS.ACHIEVEMENTS);
        const unlockedIds = achievements.map(a => a.id);
        
        const newAchievements = [];
        
        // Define all possible achievements
        const allAchievements = [
            {
                id: 'first_study',
                title: '🎯 Первая попытка',
                description: 'Изучите первую карточку',
                condition: (progress) => {
                    return Object.values(progress).some(d => d.studiedCards.length > 0);
                }
            },
            {
                id: 'quick_learner',
                title: '⚡ Быстрый ученик',
                description: 'Изучите 10 карточек',
                condition: (progress) => {
                    const totalStudied = Object.values(progress).reduce((sum, d) => sum + d.studiedCards.length, 0);
                    return totalStudied >= 10;
                }
            },
            {
                id: 'knowledge_master',
                title: '🧠 Знаток',
                description: 'Изучите 50 карточек',
                condition: (progress) => {
                    const totalStudied = Object.values(progress).reduce((sum, d) => sum + d.studiedCards.length, 0);
                    return totalStudied >= 50;
                }
            },
            {
                id: 'study_streak_3',
                title: '🔥 Ученик дня',
                description: 'Изучайте 3 дня подряд',
                condition: (studyTime) => {
                    const dates = Object.keys(studyTime.byDate).sort();
                    let streak = 0;
                    let maxStreak = 0;
                    
                    for (let i = 0; i < dates.length; i++) {
                        if (i === 0) {
                            streak = 1;
                        } else {
                            const prevDate = new Date(dates[i-1]);
                            const currDate = new Date(dates[i]);
                            const diffTime = currDate - prevDate;
                            const diffDays = diffTime / (1000 * 60 * 60 * 24);
                            
                            if (diffDays === 1) {
                                streak++;
                            } else {
                                streak = 1;
                            }
                        }
                        maxStreak = Math.max(maxStreak, streak);
                    }
                    return maxStreak >= 3;
                }
            },
            {
                id: 'perfectionist',
                title: '💎 Перфекционист',
                description: 'Изучите все карточки в одной дисциплине',
                condition: (progress) => {
                    return Object.keys(DISCIPLINES_DATA).some(disciplineId => {
                        const totalCards = DISCIPLINES_DATA[disciplineId].flashcards.length;
                        const knownCards = progress[disciplineId].knownCards.length;
                        return knownCards === totalCards && totalCards > 0;
                    });
                }
            },
            {
                id: 'test_taker',
                title: '📝 Экзаменатор',
                description: 'Пройдите первый тест',
                condition: (progress) => {
                    return Object.values(progress).some(d => d.testsCompleted > 0);
                }
            },
            {
                id: 'good_student',
                title: '⭐ Отличник',
                description: 'Наберите 80% или выше в тесте',
                condition: (progress) => {
                    const testResults = this.get(this.KEYS.TEST_RESULTS) || [];
                    return testResults.some(result => result.score >= 80);
                }
            },
            {
                id: 'dedicated_student',
                title: '📚 Прилежный студент',
                description: 'Потратьте 2 часа на изучение',
                condition: (studyTime) => studyTime.total >= 120
            },
            {
                id: 'all_disciplines',
                title: '🎓 Магистр знаний',
                description: 'Изучите все дисциплины на 100%',
                condition: (progress) => {
                    return Object.keys(DISCIPLINES_DATA).every(disciplineId => {
                        const totalCards = DISCIPLINES_DATA[disciplineId].flashcards.length;
                        const knownCards = progress[disciplineId].knownCards.length;
                        return totalCards > 0 && knownCards === totalCards;
                    });
                }
            }
        ];
        
        // Check which achievements should be unlocked
        allAchievements.forEach(achievement => {
            if (!unlockedIds.includes(achievement.id) && achievement.condition(progress)) {
                this.addAchievement(achievement);
                newAchievements.push(achievement);
            }
        });
        
        return newAchievements;
    },

    // Increment matching game score
    incrementMatchingScore(disciplineId) {
        const progress = this.get(this.KEYS.PROGRESS);
        if (progress[disciplineId]) {
            progress[disciplineId].gamesCompleted = (progress[disciplineId].gamesCompleted || 0) + 1;
            this.set(this.KEYS.PROGRESS, progress);
        }
    }
};

// Initialize on load
StorageManager.init();
