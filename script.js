document.addEventListener('DOMContentLoaded', () => {
    const questionDisplay = document.getElementById('question-display');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {}; // To store user's selected answer for each question

    // Function to fetch questions from JSON
    async function fetchQuestions() {
        try {
            const response = await fetch('data/questions.json');
            questions = await response.json();
            loadQuestion();
        } catch (error) {
            console.error('Error loading questions:', error);
            questionDisplay.innerHTML = `<p class="text-red-500">Failed to load quiz questions. Please try again later.</p>`;
        }
    }

    // Function to load and display a question
    function loadQuestion() {
        if (questions.length === 0) {
            questionDisplay.innerHTML = `<p class="text-center text-gray-400">No questions available.</p>`;
            updateNavigationButtons();
            return;
        }

        const questionData = questions[currentQuestionIndex];
        questionDisplay.innerHTML = `
            <div class="text-xl font-semibold mb-4">
                ${questionData.question_number}. ${questionData.question_text}
            </div>
            ${questionData.question_image ? `<div class="mb-4 flex justify-center"><img src="${questionData.question_image}" alt="Question Image" class="max-w-full h-auto rounded-md shadow-lg"></div>` : ''}
            <div id="options-container" class="space-y-3">
                ${Object.entries(questionData.options).map(([key, value]) => `
                    <button class="option-button w-full text-left p-3 rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            data-option="${key}">
                        <span class="font-bold">${key}:</span> ${value}
                    </button>
                `).join('')}
            </div>
            <div id="explanation-container" class="mt-6 p-4 rounded-md explanation-box hidden">
                <h3 class="text-lg font-bold mb-2">Explanation:</h3>
                <p id="correct-explanation" class="mb-2"></p>
                <p id="incorrect-explanation"></p>
                ${questionData.explanation.explanation_image ? `<div class="mt-4 flex justify-center"><img src="${questionData.explanation.explanation_image}" alt="Explanation Image" class="max-w-full h-auto rounded-md shadow-lg"></div>` : ''}
            </div>
        `;

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.addEventListener('click', handleOptionClick);

        // If user has already answered this question, display the result
        if (userAnswers[currentQuestionIndex]) {
            displayAnswerResult(userAnswers[currentQuestionIndex].selectedOption, questionData.correct_answer);
        }

        updateNavigationButtons();
    }

    // Function to handle option clicks
    function handleOptionClick(event) {
        const clickedButton = event.target.closest('.option-button');
        if (!clickedButton || userAnswers[currentQuestionIndex]) { // Prevent multiple clicks
            return;
        }

        const selectedOption = clickedButton.dataset.option;
        const questionData = questions[currentQuestionIndex];
        const correctAnswer = questionData.correct_answer;

        userAnswers[currentQuestionIndex] = { selectedOption: selectedOption, answered: true };
        displayAnswerResult(selectedOption, correctAnswer);
    }

    // Function to display answer result and explanation
    function displayAnswerResult(selectedOption, correctAnswer) {
        const optionsButtons = document.querySelectorAll('.option-button');
        const explanationContainer = document.getElementById('explanation-container');
        const correctExplanationP = document.getElementById('correct-explanation');
        const incorrectExplanationP = document.getElementById('incorrect-explanation');
        const questionData = questions[currentQuestionIndex];

        optionsButtons.forEach(button => {
            button.disabled = true; // Disable all options after an answer is selected
            const optionKey = button.dataset.option;
            if (optionKey === correctAnswer) {
                button.classList.add('correct');
            } else if (optionKey === selectedOption) {
                button.classList.add('incorrect');
            }
        });

        correctExplanationP.textContent = `Correct: ${questionData.explanation.correct}`;
        incorrectExplanationP.innerHTML = ''; // Clear previous incorrect explanations

        if (selectedOption !== correctAnswer && questionData.explanation.incorrect) {
            const incorrectExplanations = Object.entries(questionData.explanation.incorrect)
                .map(([option, text]) => `<p><span class="font-bold">${option}:</span> ${text}</p>`)
                .join('');
            incorrectExplanationP.innerHTML = `Incorrect: ${incorrectExplanations}`;
        }

        explanationContainer.classList.remove('hidden');
    }

    // Function to update navigation button states
    function updateNavigationButtons() {
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === questions.length - 1;

        if (prevBtn.disabled) {
            prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
            prevBtn.classList.remove('hover:bg-gray-700');
        } else {
            prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            prevBtn.classList.add('hover:bg-gray-700');
        }

        if (nextBtn.disabled) {
            nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
            nextBtn.classList.remove('hover:bg-blue-700');
        } else {
            nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            nextBtn.classList.add('hover:bg-blue-700');
        }
    }

    // Event listeners for navigation buttons
    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        }
    });

    // Initial fetch of questions
    fetchQuestions();
});
