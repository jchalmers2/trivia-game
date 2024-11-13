/**
 * Initializes the trivia game by setting up event listeners, fetching questions, and displaying the scores.
 */
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const submitButton = document.getElementById("submit-game");

    let currentQuestions = [];

    // Initialize the game
    checkUsername();
    fetchQuestions();
    displayScores();

    /**
     * Checks if a username is stored in the cookies and populates the input field with it.
     */
    function checkUsername() {
        const username = getCookie("username");
        if (username) {
            document.getElementById("username").value = username;
        }
    }

    /**
     * Fetches trivia questions from the API and handles loading states.
     */
    function fetchQuestions() {
        showLoading(true); // Show loading state

        fetch("https://opentdb.com/api.php?amount=10&type=multiple")
            .then((response) => response.json())
            .then((data) => {
                currentQuestions = data.results;
                displayQuestions(currentQuestions);
                showLoading(false); // Hide loading state
            })
            .catch((error) => {
                console.error("Error fetching questions:", error);
                showLoading(false); // Hide loading state on error
            });
    }

    /**
     * Toggles the loading state visibility for the loading container and question container.
     * @param {boolean} isLoading - Indicates whether the loading state should be displayed.
     */
    function showLoading(isLoading) {
        document.getElementById("loading-container").classList = isLoading
            ? ""
            : "hidden";
        document.getElementById("question-container").classList = isLoading
            ? "hidden"
            : "";
    }

    /**
     * Displays the trivia questions on the page.
     * @param {Array} questions - The list of questions to display.
     */
    function displayQuestions(questions) {
        questionContainer.innerHTML = ""; // Clear existing questions
        questions.forEach((question, index) => {
            const questionDiv = document.createElement("div");
            questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(question.correct_answer, question.incorrect_answers, index)}
            `;
            questionContainer.appendChild(questionDiv);
        });
    }

    /**
     * Creates the HTML for the answer options, including randomizing the correct and incorrect answers.
     * @param {string} correctAnswer - The correct answer.
     * @param {Array} incorrectAnswers - The list of incorrect answers.
     * @param {number} questionIndex - The index of the current question.
     * @returns {string} - The HTML string containing the answer options.
     */
    function createAnswerOptions(correctAnswer, incorrectAnswers, questionIndex) {
        const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
            () => Math.random() - 0.5
        );
        return allAnswers
            .map(
                (answer) => `
            <label>
                <input type="radio" name="answer${questionIndex}" value="${answer}" ${
                    answer === correctAnswer ? 'data-correct="true"' : ""
                }>
                ${answer}
            </label>
        `
            )
            .join("");
    }

    /**
     * Handles the form submission, calculates the score, saves the score, and resets the game for the next player.
     * @param {Event} event - The form submit event.
     */
    form.addEventListener("submit", handleFormSubmit);

    /**
     * Calculates the player's score based on their answers.
     * @returns {number} - The player's score.
     */
    function calculateScore() {
        let score = 0;

        currentQuestions.forEach((question, index) => {
            const selectedAnswer = document.querySelector(
                `input[name="answer${index}"]:checked`
            );
            if (selectedAnswer) {
                if (selectedAnswer.value === question.correct_answer) {
                    score++;
                }
            }
        });

        return score;
    }

    /**
     * Handles the game form submission: saves the score, sets the username cookie, and resets the game.
     * @param {Event} event - The form submit event.
     */
    function handleFormSubmit(event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        if (username) {
            setCookie("username", username, 7);
            const score = calculateScore();
            saveScore(username, score);
        }

        // Reset for the next player
        newPlayer();
    }

    /**
     * Saves the player's score to localStorage and updates the displayed scores.
     * @param {string} username - The player's name.
     * @param {number} score - The player's score.
     */
    function saveScore(username, score) {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];
        scores.push({ username, score });
        localStorage.setItem("scores", JSON.stringify(scores));
        displayScores();
    }

    /**
     * Displays the scores from localStorage in the score table.
     */
    function displayScores() {
        const scores = JSON.parse(localStorage.getItem("scores")) || [];
        const tbody = document.querySelector("#score-table tbody");
        tbody.innerHTML = scores
            .map(
                (score) => `
            <tr>
                <td>${score.username}</td>
                <td>${score.score}</td>
            </tr>
        `
            )
            .join("");
    }

    /**
     * Resets the game for the next player by clearing the username, questions, and fetching new trivia questions.
     */
    function newPlayer() {
        document.getElementById("username").value = ""; // Clear username
        questionContainer.innerHTML = ""; // Clear questions
        fetchQuestions(); // Fetch new questions for the next player
    }

    /**
     * Sets a cookie with a specific name, value, and expiration date.
     * @param {string} name - The name of the cookie.
     * @param {string} value - The value of the cookie.
     * @param {number} days - The number of days until the cookie expires.
     */
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

    /**
     * Retrieves the value of a cookie by its name.
     * @param {string} name - The name of the cookie.
     * @returns {string} - The value of the cookie.
     */
    function getCookie(name) {
        const cookieArr = document.cookie.split(";");
        for (let i = 0; i < cookieArr.length; i++) {
            const cookie = cookieArr[i].trim();
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length + 1);
            }
        }
        return "";
    }
});
