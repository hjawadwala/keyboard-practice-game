// Game state
let currentWord = '';
let currentLetterIndex = 0;
let score = 0;
let streak = 0;
let wordData = null;

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

let usedWords = [];

// Initialize game
function init() {
    updateScore();
    loadNewWord();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('next-word-btn').addEventListener('click', loadNewWord);
}

// Load a new word
function loadNewWord() {
    // Hide result section
    document.getElementById('result-section').classList.remove('show');
    
    // Reset state
    currentLetterIndex = 0;
    
    // Get a random word that hasn't been used recently
    if (usedWords.length >= wordBank.length) {
        usedWords = []; // Reset if all words have been used
    }
    
    let availableWords = wordBank.filter(w => !usedWords.includes(w.word));
    wordData = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentWord = wordData.word.toLowerCase();
    usedWords.push(currentWord);
    
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
    // Ignore if showing results
    if (document.getElementById('result-section').classList.contains('show')) {
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

// Fetch word image from Pexels API or use fallback images
async function fetchWordImage(word) {
    const imageElement = document.getElementById('word-image');
    
    // Map of words to specific image URLs (using reliable free image sources)
    const imageMap = {
        'cat': 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'dog': 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'sun': 'https://images.pexels.com/photos/301599/pexels-photo-301599.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'moon': 'https://images.pexels.com/photos/1405977/pexels-photo-1405977.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'tree': 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'bird': 'https://images.pexels.com/photos/349758/hummingbird-bird-birds-349758.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'fish': 'https://images.pexels.com/photos/1125979/pexels-photo-1125979.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'star': 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'ball': 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'book': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'bear': 'https://images.pexels.com/photos/158109/kodiak-brown-bear-adult-portrait-158109.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'frog': 'https://images.pexels.com/photos/70083/frog-macro-amphibian-green-70083.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'duck': 'https://images.pexels.com/photos/133408/pexels-photo-133408.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'lion': 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'rose': 'https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'cake': 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'kite': 'https://images.pexels.com/photos/1295036/pexels-photo-1295036.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'boat': 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'bell': 'https://images.pexels.com/photos/208315/pexels-photo-208315.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
        'rain': 'https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop'
    };
    
    // Use mapped image or fallback
    const imageUrl = imageMap[word] || `https://via.placeholder.com/400x400/667eea/ffffff?text=${word.toUpperCase()}`;
    
    imageElement.src = imageUrl;
    imageElement.alt = word;
    
    // Handle image load error
    imageElement.onerror = function() {
        this.src = `https://via.placeholder.com/400x400/667eea/ffffff?text=${word.toUpperCase()}`;
    };
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('streak').textContent = streak;
}

// Start the game when page loads
window.addEventListener('load', init);
