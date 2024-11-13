document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trivia-form");
    const questionContainer = document.getElementById("question-container");
    const submitButton = document.getElementById("submit-game");

    let currentQuestions = [];

    // Initialize the game
    checkUsername();
    fetchQuestions();
    displayScores();

    function checkUsername() {
        const username = getCookie("username");
        if (username) {
            document.getElementById("username").value = username;
        }
    }

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

    function showLoading(isLoading) {
        document.getElementById("loading-container").classList = isLoading
            ? ""
            : "hidden";
        document.getElementById("question-container").classList = isLoading
            ? "hidden"
            : "";
    }

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

    form.addEventListener("submit", handleFormSubmit);

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

    function saveScore(username, score) {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];
        scores.push({ username, score });
        localStorage.setItem("scores", JSON.stringify(scores));
        displayScores();
    }

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

    function newPlayer() {
        document.getElementById("username").value = ""; // Clear username
        questionContainer.innerHTML = ""; // Clear questions
        fetchQuestions(); // Fetch new questions for the next player
    }

    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    }

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
