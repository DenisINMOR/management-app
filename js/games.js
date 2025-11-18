// Games and Interactive Elements
const GamesManager = {
    // Flashcard game
    initFlashcards(disciplineId, containerId) {
        const discipline = DISCIPLINES_DATA[disciplineId];
        const container = document.getElementById(containerId);
        const progress = StorageManager.get(StorageManager.KEYS.PROGRESS)[disciplineId];
        
        let currentIndex = 0;
        const cards = discipline.flashcards;

        const render = () => {
            const card = cards[currentIndex];
            const isKnown = progress.knownCards.includes(card.id);
            
            container.innerHTML = `
                <div class="flashcard-container">
                    <div class="flashcard-counter">${currentIndex + 1} / ${cards.length}</div>
                    <div class="flashcard" id="flashcard-${card.id}">
                        <div class="flashcard-inner">
                            <div class="flashcard-front">
                                <h3>${card.question}</h3>
                                <p class="hint">Нажмите для переворота</p>
                            </div>
                            <div class="flashcard-back">
                                <p>${card.answer.replace(/\n/g, '<br>')}</p>
                                ${card.needsSimplify ? `
                                    <button class="btn btn-secondary btn-sm mt-md" onclick="GamesManager.showSimplified('${disciplineId}', ${card.id})">
                                        Упростить
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flashcard-controls">
                        <button class="btn btn-danger" onclick="GamesManager.markCard('${disciplineId}', ${card.id}, false)">
                            Не знаю
                        </button>
                        <button class="btn btn-success" onclick="GamesManager.markCard('${disciplineId}', ${card.id}, true)">
                            Знаю
                        </button>
                    </div>
                    <div class="flashcard-navigation">
                        <button class="btn btn-secondary" onclick="GamesManager.prevCard()" ${currentIndex === 0 ? 'disabled' : ''}>
                            ← Назад
                        </button>
                        <button class="btn btn-secondary" onclick="GamesManager.nextCard()" ${currentIndex === cards.length - 1 ? 'disabled' : ''}>
                            Вперед →
                        </button>
                    </div>
                </div>
            `;

            // Add flip functionality
            const flashcard = document.getElementById(`flashcard-${card.id}`);
            flashcard.addEventListener('click', () => {
                flashcard.classList.toggle('flipped');
                StorageManager.markCardStudied(disciplineId, card.id);
                
                // Check for new achievements
                const newAchievements = StorageManager.checkAchievements();
                if (newAchievements.length > 0 && !window.achievementsNotified) {
                    const achievementMessages = newAchievements.map(a => `🏆 ${a.title}\n${a.description}`).join('\n\n');
                    alert(`Новые достижения!\n\n${achievementMessages}`);
                    window.achievementsNotified = true;
                    setTimeout(() => { window.achievementsNotified = false; }, 5000);
                }
            });
        };

        this.nextCard = () => {
            if (currentIndex < cards.length - 1) {
                currentIndex++;
                render();
            }
        };

        this.prevCard = () => {
            if (currentIndex > 0) {
                currentIndex--;
                render();
            }
        };

        render();
    },

    markCard(disciplineId, cardId, known) {
        StorageManager.markCardKnown(disciplineId, cardId, known);
        
        // Check for new achievements
        const newAchievements = StorageManager.checkAchievements();
        if (newAchievements.length > 0 && !window.achievementsNotified) {
            const achievementMessages = newAchievements.map(a => `🏆 ${a.title}\n${a.description}`).join('\n\n');
            alert(`Новые достижения!\n\n${achievementMessages}`);
            window.achievementsNotified = true;
            setTimeout(() => { window.achievementsNotified = false; }, 5000);
        }
        
        this.nextCard();
    },

    showSimplified(disciplineId, cardId) {
        const card = DISCIPLINES_DATA[disciplineId].flashcards.find(c => c.id === cardId);
        alert(card.simplifiedExplanation.replace(/\n/g, '\n'));
    },

    // Matching game
    initMatchingGame(disciplineId, containerId) {
        const discipline = DISCIPLINES_DATA[disciplineId];
        const container = document.getElementById(containerId);
        const pairs = [...discipline.matchingPairs];
        
        // Shuffle both columns independently only once
        const shuffledPairs = pairs.sort(() => Math.random() - 0.5).slice(0, 7);
        const leftColumn = [...shuffledPairs]; // Terms column
        const rightColumn = [...shuffledPairs].sort(() => Math.random() - 0.5); // Definitions column
        
        let selected = [];
        let matched = [];

        const render = () => {
            container.innerHTML = `
                <div class="matching-game">
                    <div class="matching-terms">
                        ${leftColumn.map((pair, i) => `
                            <button class="matching-item ${selected.includes('term-' + i) ? 'selected' : ''} ${matched.includes('term-' + i) ? 'matched' : ''}" 
                                    data-id="term-${i}" 
                                    data-value="${pair.term}"
                                    data-correct="${pair.term}"
                                    onclick="GamesManager.selectMatching('term-${i}', '${pair.term}', true)">
                                ${pair.term}
                            </button>
                        `).join('')}
                    </div>
                    <div class="matching-definitions">
                        ${rightColumn.map((pair, i) => `
                            <button class="matching-item ${selected.includes('def-' + i) ? 'selected' : ''} ${matched.includes('def-' + i) ? 'matched' : ''}" 
                                    data-id="def-${i}" 
                                    data-value="${pair.definition}"
                                    data-correct="${pair.term}"
                                    onclick="GamesManager.selectMatching('def-${i}', '${pair.definition}', false)">
                                ${pair.definition}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <p class="text-center mt-md">Найдено пар: ${matched.length / 2} / ${shuffledPairs.length}</p>
            `;
        };

        this.selectMatching = (id, value, isLeftColumn) => {
            if (matched.includes(id)) return;
            
            if (selected.length < 2 && !selected.includes(id)) {
                selected.push(id);
                render(); // Update selection state immediately
                
                if (selected.length === 2) {
                    // Check match using correct pairs
                    const firstElement = document.querySelector(`[data-id="${selected[0]}"]`);
                    const secondElement = document.querySelector(`[data-id="${selected[1]}"]`);
                    
                    const isCorrect = firstElement.dataset.correct === secondElement.dataset.correct;
                    
                    if (isCorrect) {
                        matched.push(...selected);
                        if (matched.length === shuffledPairs.length * 2) {
                            // Complete the game - save progress and achievements
                            StorageManager.incrementMatchingScore(disciplineId);
                            
                            // Check for new achievements
                            const newAchievements = StorageManager.checkAchievements();
                            
                            setTimeout(() => {
                                if (newAchievements.length > 0) {
                                    const achievementMessages = newAchievements.map(a => `🏆 ${a.title}\n${a.description}`).join('\n\n');
                                    alert(`Поздравляем! Все пары найдены! 🎉\n\nНовые достижения:\n\n${achievementMessages}`);
                                } else {
                                    alert('Поздравляем! Все пары найдены! 🎉');
                                }
                                App.loadDiscipline(disciplineId);
                            }, 300);
                        }
                    } else {
                        // Wrong match - flash red
                        firstElement.classList.add('wrong');
                        secondElement.classList.add('wrong');
                        setTimeout(() => {
                            firstElement.classList.remove('wrong');
                            secondElement.classList.remove('wrong');
                        }, 500);
                    }
                    
                    setTimeout(() => {
                        selected = [];
                        render();
                    }, 800);
                }
            }
        };

        render();
    }
};
