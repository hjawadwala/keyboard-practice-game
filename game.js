// Game state
let currentWord = '';
let currentLetterIndex = 0;
let score = 0;
let streak = 0;
let wordData = null;
let fetchedWords = [];
let wordQueue = [];

// Word list with meanings (fallback if API fails)
const wordBank = [
    { word: 'cat', meaning: 'A small furry animal that says meow and loves to play!', category: 'animal' },
    { word: 'dog', meaning: 'A friendly animal that barks and loves to play fetch!', category: 'animal' },
    { word: 'sun', meaning: 'The bright star in the sky that gives us light and warmth!', category: 'nature' },
    { word: 'moon', meaning: 'The bright object we see in the sky at night!', category: 'nature' },
    { word: 'tree', meaning: 'A tall plant with leaves, branches, and a trunk!', category: 'nature' },
    { word: 'bird', meaning: 'An animal with wings and feathers that can fly!', category: 'animal' },
    { word: 'fish', meaning: 'An animal that lives and swims in water!', category: 'animal' },
    { word: 'star', meaning: 'A bright twinkling light we see in the night sky!', category: 'nature' },
    { word: 'ball', meaning: 'A round toy that you can throw, catch, and bounce!', category: 'toy' },
    { word: 'book', meaning: 'Pages with stories and pictures that you can read!', category: 'object' },
    { word: 'bear', meaning: 'A big furry animal that loves honey!', category: 'animal' },
    { word: 'frog', meaning: 'A green animal that jumps and says ribbit!', category: 'animal' },
    { word: 'duck', meaning: 'A bird that swims in water and says quack!', category: 'animal' },
    { word: 'lion', meaning: 'A big wild cat with a mane, known as the king of the jungle!', category: 'animal' },
    { word: 'rose', meaning: 'A beautiful flower that smells sweet and has thorns!', category: 'nature' },
    { word: 'cake', meaning: 'A sweet dessert we eat on birthdays!', category: 'food' },
    { word: 'kite', meaning: 'A toy that flies high in the sky on a windy day!', category: 'toy' },
    { word: 'boat', meaning: 'A vehicle that floats and moves on water!', category: 'vehicle' },
    { word: 'bell', meaning: 'An object that rings and makes a dinging sound!', category: 'object' },
    { word: 'rain', meaning: 'Water drops that fall from clouds in the sky!', category: 'nature' }
];

// Common simple words for kids to fetch from API
const simpleWordsToFetch = [
    'apple', 'baby', 'beach', 'bread', 'car', 'chair', 'cloud', 'corn', 
    'cup', 'desk', 'door', 'egg', 'farm', 'fire', 'food', 'game', 
    'hand', 'hat', 'hill', 'home', 'horse', 'ice', 'jump', 'king', 
    'lamp', 'leaf', 'milk', 'nest', 'ocean', 'park', 'pen', 'queen', 
    'ring', 'room', 'seed', 'ship', 'shop', 'snow', 'sock', 'table', 
    'tea', 'tent', 'time', 'town', 'train', 'water', 'wind', 'wood'
];

let usedWords = [];

// Initialize game
async function init() {
    updateScore();
    
    // Show loading message
    console.log('🎮 Initializing game...');
    
    // Fetch words from internet first
    await fetchWordsFromAPI();
    
    // Then load first word
    loadNewWord();
    setupEventListeners();
}

// Fetch words from Free Dictionary API
async function fetchWordsFromAPI() {
    console.log('🌐 Fetching words from dictionary API...');
    
    // Fetch multiple words
    const promises = simpleWordsToFetch.slice(0, 20).map(async (word) => {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data[0]) {
                    const entry = data[0];
                    const meaning = entry.meanings[0]?.definitions[0]?.definition || 'A common word';
                    
                    // Simplify meaning for kids
                    const simpleMeaning = simplifyMeaning(meaning);
                    
                    console.log(`✅ Fetched: ${word} - ${simpleMeaning.substring(0, 50)}...`);
                    
                    return {
                        word: word,
                        meaning: simpleMeaning,
                        category: entry.meanings[0]?.partOfSpeech || 'word',
                        source: 'API'
                    };
                }
            }
        } catch (error) {
            console.log(`❌ Could not fetch word: ${word}`, error.message);
        }
        return null;
    });
    
    const results = await Promise.all(promises);
    fetchedWords = results.filter(w => w !== null);
    
    console.log(`🎉 Successfully fetched ${fetchedWords.length} words from API!`);
    console.log('📚 Words available:', fetchedWords.map(w => w.word).join(', '));
    
    // Add fetched words to word queue
    wordQueue = [...fetchedWords];
    
    // If we couldn't fetch enough words, add some from fallback
    if (wordQueue.length < 5) {
        console.log('⚠️ Not enough API words, adding fallback words');
        const fallbackWords = wordBank.map(w => ({...w, source: 'fallback'}));
        wordQueue = [...wordQueue, ...fallbackWords];
    }
    
    return fetchedWords.length;
}

// Simplify dictionary definitions for kids
function simplifyMeaning(meaning) {
    // Remove complex punctuation and shorten
    let simple = meaning
        .replace(/\(.*?\)/g, '') // Remove parentheses
        .replace(/;.*$/, '') // Remove everything after semicolon
        .split('.')[0]; // Take first sentence
    
    // Capitalize first letter
    simple = simple.charAt(0).toUpperCase() + simple.slice(1);
    
    // Ensure it ends with punctuation
    if (!simple.endsWith('!') && !simple.endsWith('.')) {
        simple += '!';
    }
    
    return simple;
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('next-word-btn').addEventListener('click', loadNewWord);
}

// Load a new word
async function loadNewWord() {
    // Hide result section
    document.getElementById('result-section').classList.remove('show');
    
    // Reset state
    currentLetterIndex = 0;
    
    // If word queue is running low, fetch more words
    if (wordQueue.length < 3) {
        console.log('🔄 Queue running low, fetching more words...');
        await fetchWordsFromAPI();
    }
    
    // Get a word from the queue
    if (wordQueue.length > 0) {
        // Remove a random word from queue
        const randomIndex = Math.floor(Math.random() * wordQueue.length);
        wordData = wordQueue.splice(randomIndex, 1)[0];
        console.log(`🎯 Selected word: "${wordData.word}" from ${wordData.source || 'unknown source'}`);
        console.log(`   Definition: ${wordData.meaning}`);
        console.log(`   Remaining in queue: ${wordQueue.length}`);
    } else {
        // Fallback to local word bank
        console.log('⚠️ Queue empty! Using fallback word bank');
        let availableWords = wordBank.filter(w => !usedWords.includes(w.word));
        if (availableWords.length === 0) {
            usedWords = [];
            availableWords = [...wordBank];
        }
        wordData = availableWords[Math.floor(Math.random() * availableWords.length)];
        wordData.source = 'fallback';
    }
    
    currentWord = wordData.word.toLowerCase();
    usedWords.push(currentWord);
    
    // Update word source indicator
    const sourceElement = document.getElementById('word-source');
    if (wordData.source === 'API') {
        sourceElement.textContent = '🌐 From Internet Dictionary';
        sourceElement.className = 'word-source';
    } else {
        sourceElement.textContent = '📚 From Local Bank';
        sourceElement.className = 'word-source fallback';
    }
    
    // Display the word as boxes
    displayWord();
    updateCurrentLetter();
    updateProgress();
    document.getElementById('typed-text').textContent = '';
}

// Display word as letter boxes
function displayWord() {
    const wordDisplay = document.getElementById('word-display');
    wordDisplay.innerHTML = '';
    
    for (let i = 0; i < currentWord.length; i++) {
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        letterBox.textContent = currentWord[i].toUpperCase();
        letterBox.id = `letter-${i}`;
        wordDisplay.appendChild(letterBox);
    }
}

// Update current letter display
function updateCurrentLetter() {
    if (currentLetterIndex < currentWord.length) {
        const currentLetter = currentWord[currentLetterIndex];
        document.getElementById('current-letter').textContent = currentLetter.toUpperCase();
        
        // Update current letter highlighting
        document.querySelectorAll('.letter-box').forEach((box, index) => {
            box.classList.remove('current');
            if (index === currentLetterIndex) {
                box.classList.add('current');
            }
        });
        
        // Highlight the key on virtual keyboard
        highlightKey(currentLetter);
    }
}

// Highlight key on virtual keyboard
function highlightKey(letter) {
    // Remove all highlights
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('highlight');
    });
    
    // Highlight the current key
    const keyElement = document.querySelector(`.key[data-key="${letter}"]`);
    if (keyElement) {
        keyElement.classList.add('highlight');
    }
}

// Show key press animation
function animateKeyPress(letter) {
    const keyElement = document.querySelector(`.key[data-key="${letter}"]`);
    if (keyElement) {
        keyElement.classList.add('pressed');
        setTimeout(() => {
            keyElement.classList.remove('pressed');
        }, 200);
    }
}

// Update progress bar
function updateProgress() {
    const progress = (currentLetterIndex / currentWord.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

// Handle keyboard input
function handleKeyPress(event) {
    // Check if word is completed and Enter is pressed
    if (document.getElementById('result-section').classList.contains('show')) {
        if (event.key === 'Enter') {
            loadNewWord();
        }
        return;
    }
    
    const pressedKey = event.key.toLowerCase();
    const expectedLetter = currentWord[currentLetterIndex];
    
    // Check if the pressed key matches the expected letter
    if (pressedKey === expectedLetter) {
        handleCorrectKey();
    } else if (pressedKey.length === 1 && /[a-z]/.test(pressedKey)) {
        // Only show incorrect feedback for letter keys
        handleIncorrectKey();
    }
}

// Handle correct key press
function handleCorrectKey() {
    // Show correct feedback
    showFeedback('✓', 'correct');
    
    // Animate key press on virtual keyboard
    animateKeyPress(currentWord[currentLetterIndex]);
    
    // Mark letter as typed
    document.getElementById(`letter-${currentLetterIndex}`).classList.add('typed');
    
    // Update typed text
    const typedText = document.getElementById('typed-text');
    typedText.textContent += currentWord[currentLetterIndex].toUpperCase();
    
    // Move to next letter
    currentLetterIndex++;
    updateProgress();
    
    // Check if word is complete
    if (currentLetterIndex >= currentWord.length) {
        completeWord();
    } else {
        updateCurrentLetter();
    }
    
    // Update streak
    streak++;
    score += 10;
    updateScore();
}

// Handle incorrect key press
function handleIncorrectKey() {
    showFeedback('✗', 'incorrect');
    streak = 0;
    updateScore();
}

// Show feedback animation
function showFeedback(text, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = text;
    feedback.className = `feedback ${type}`;
    
    // Reset animation
    void feedback.offsetWidth;
}

// Complete the word
async function completeWord() {
    score += 50; // Bonus for completing word
    updateScore();
    
    // Show result section
    const resultSection = document.getElementById('result-section');
    document.getElementById('completed-word').textContent = currentWord.toUpperCase();
    document.getElementById('word-meaning').textContent = wordData.meaning;
    
    // Fetch image from Unsplash
    await fetchWordImage(currentWord);
    
    resultSection.classList.add('show');
    
    // Celebration effect
    showFeedback('🎉', 'correct');
}

// Fetch word image - using emoji and SVG for reliability
async function fetchWordImage(word) {
    const container = document.getElementById('word-image-container');
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Map of words to emojis and colors for visual representation
    const visualMap = {
        'cat': { emoji: '🐱', color: '#FF9AA2', bg: '#FFE5E9' },
        'dog': { emoji: '🐶', color: '#C7CEEA', bg: '#E8ECFF' },
        'sun': { emoji: '☀️', color: '#FFD93D', bg: '#FFF6D5' },
        'moon': { emoji: '🌙', color: '#B4A7D6', bg: '#E8E3F3' },
        'tree': { emoji: '🌳', color: '#95E1D3', bg: '#D4F4E8' },
        'bird': { emoji: '🐦', color: '#A8E6CF', bg: '#DCF5EB' },
        'fish': { emoji: '🐠', color: '#6BC4E8', bg: '#D4F1F9' },
        'star': { emoji: '⭐', color: '#FFD93D', bg: '#FFF6D5' },
        'ball': { emoji: '⚽', color: '#FF9AA2', bg: '#FFE5E9' },
        'book': { emoji: '📚', color: '#C7CEEA', bg: '#E8ECFF' },
        'bear': { emoji: '🐻', color: '#D4A574', bg: '#F5E6D3' },
        'frog': { emoji: '🐸', color: '#95E1D3', bg: '#D4F4E8' },
        'duck': { emoji: '🦆', color: '#FFD93D', bg: '#FFF6D5' },
        'lion': { emoji: '🦁', color: '#FFB347', bg: '#FFE5CC' },
        'rose': { emoji: '🌹', color: '#FF6B9D', bg: '#FFD5E5' },
        'cake': { emoji: '🎂', color: '#FFA5C0', bg: '#FFE5EE' },
        'kite': { emoji: '🪁', color: '#A8E6CF', bg: '#DCF5EB' },
        'boat': { emoji: '⛵', color: '#6BC4E8', bg: '#D4F1F9' },
        'bell': { emoji: '🔔', color: '#FFD93D', bg: '#FFF6D5' },
        'rain': { emoji: '🌧️', color: '#6BC4E8', bg: '#D4F1F9' },
        // New words from API
        'apple': { emoji: '🍎', color: '#FF6B6B', bg: '#FFD5D5' },
        'baby': { emoji: '👶', color: '#FFA5C0', bg: '#FFE5EE' },
        'beach': { emoji: '🏖️', color: '#FFD93D', bg: '#FFF6D5' },
        'bread': { emoji: '🍞', color: '#D4A574', bg: '#F5E6D3' },
        'car': { emoji: '🚗', color: '#6BC4E8', bg: '#D4F1F9' },
        'chair': { emoji: '🪑', color: '#D4A574', bg: '#F5E6D3' },
        'cloud': { emoji: '☁️', color: '#C7CEEA', bg: '#E8ECFF' },
        'corn': { emoji: '🌽', color: '#FFD93D', bg: '#FFF6D5' },
        'cup': { emoji: '☕', color: '#D4A574', bg: '#F5E6D3' },
        'desk': { emoji: '🪑', color: '#D4A574', bg: '#F5E6D3' },
        'door': { emoji: '🚪', color: '#D4A574', bg: '#F5E6D3' },
        'egg': { emoji: '🥚', color: '#FFF6D5', bg: '#FFFEF0' },
        'farm': { emoji: '🚜', color: '#95E1D3', bg: '#D4F4E8' },
        'fire': { emoji: '🔥', color: '#FF6B6B', bg: '#FFD5D5' },
        'food': { emoji: '🍽️', color: '#FFA5C0', bg: '#FFE5EE' },
        'game': { emoji: '🎮', color: '#C7CEEA', bg: '#E8ECFF' },
        'hand': { emoji: '✋', color: '#FFA5C0', bg: '#FFE5EE' },
        'hat': { emoji: '🎩', color: '#C7CEEA', bg: '#E8ECFF' },
        'hill': { emoji: '⛰️', color: '#95E1D3', bg: '#D4F4E8' },
        'home': { emoji: '🏠', color: '#FF9AA2', bg: '#FFE5E9' },
        'horse': { emoji: '🐴', color: '#D4A574', bg: '#F5E6D3' },
        'ice': { emoji: '🧊', color: '#6BC4E8', bg: '#D4F1F9' },
        'jump': { emoji: '🤾', color: '#FFA5C0', bg: '#FFE5EE' },
        'king': { emoji: '👑', color: '#FFD93D', bg: '#FFF6D5' },
        'lamp': { emoji: '💡', color: '#FFD93D', bg: '#FFF6D5' },
        'leaf': { emoji: '🍃', color: '#95E1D3', bg: '#D4F4E8' },
        'milk': { emoji: '🥛', color: '#FFF6D5', bg: '#FFFEF0' },
        'nest': { emoji: '🪺', color: '#D4A574', bg: '#F5E6D3' },
        'ocean': { emoji: '🌊', color: '#6BC4E8', bg: '#D4F1F9' },
        'park': { emoji: '🏞️', color: '#95E1D3', bg: '#D4F4E8' },
        'pen': { emoji: '🖊️', color: '#C7CEEA', bg: '#E8ECFF' },
        'queen': { emoji: '👸', color: '#FFA5C0', bg: '#FFE5EE' },
        'ring': { emoji: '💍', color: '#FFD93D', bg: '#FFF6D5' },
        'room': { emoji: '🛏️', color: '#C7CEEA', bg: '#E8ECFF' },
        'seed': { emoji: '🌱', color: '#95E1D3', bg: '#D4F4E8' },
        'ship': { emoji: '🚢', color: '#6BC4E8', bg: '#D4F1F9' },
        'shop': { emoji: '🏪', color: '#FF9AA2', bg: '#FFE5E9' },
        'snow': { emoji: '❄️', color: '#C7CEEA', bg: '#E8ECFF' },
        'sock': { emoji: '🧦', color: '#FFA5C0', bg: '#FFE5EE' },
        'table': { emoji: '🪑', color: '#D4A574', bg: '#F5E6D3' },
        'tea': { emoji: '🍵', color: '#95E1D3', bg: '#D4F4E8' },
        'tent': { emoji: '⛺', color: '#FF9AA2', bg: '#FFE5E9' },
        'time': { emoji: '⏰', color: '#C7CEEA', bg: '#E8ECFF' },
        'town': { emoji: '🏘️', color: '#FFB347', bg: '#FFE5CC' },
        'train': { emoji: '🚂', color: '#6BC4E8', bg: '#D4F1F9' },
        'water': { emoji: '💧', color: '#6BC4E8', bg: '#D4F1F9' },
        'wind': { emoji: '💨', color: '#C7CEEA', bg: '#E8ECFF' },
        'wood': { emoji: '🪵', color: '#D4A574', bg: '#F5E6D3' }
    };
    
    const visual = visualMap[word] || { emoji: '❓', color: '#667eea', bg: '#E8ECFF' };
    
    // Create a beautiful emoji display
    const emojiDisplay = document.createElement('div');
    emojiDisplay.className = 'emoji-display';
    emojiDisplay.style.cssText = `
        width: 300px;
        height: 300px;
        background: ${visual.bg};
        border: 5px solid ${visual.color};
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 180px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        animation: emojiPop 0.5s ease-out;
    `;
    emojiDisplay.textContent = visual.emoji;
    
    container.appendChild(emojiDisplay);
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
}

// Start the game when page loads
window.addEventListener('load', init);
