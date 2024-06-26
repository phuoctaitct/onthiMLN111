let move_speed = 3, grativy = 0.5;
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

// getting bird element properties
let bird_props = bird.getBoundingClientRect();

// This method returns DOMReact -> top, right, bottom, left, x, y, width and height
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

let game_state = 'Start';

let questions = []
let answers = []

img.style.display = 'none';
message.classList.add('messageStyle');

async function loadCourse() {
    var course = document.getElementById("course-code").value;
    await fetchQuestions(`${course.toLowerCase()}.json`);
    document.getElementById("code-input-container").style.display = 'none';
    document.querySelectorAll('.pipe_sprite').forEach((e) => {
        e.remove();
    });
    img.style.display = 'block';
    bird.style.top = '40vh';
    game_state = 'Play';
    message.innerHTML = '';
    score_title.innerHTML = 'Score : ';
    score_val.innerHTML = '0';
    message.classList.remove('messageStyle');
    play();
}

async function fetchQuestions(filePath) {
    try {
        const response = await fetch(filePath); // Adjust the file path based on your project structure
        const data = await response.json();
        questions = data.map(item => item.question);
        console.log(questions);
        answers = data.map(item => item.answer);
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
}
function getQuestionLength() {
    console.log(questions.length);
    return questions.length;
}
function play() {
    function move() {
        if (game_state != 'Play') return;
        if (getQuestionLength() == 0) {
            endGame();
        }
        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                if (bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width && bird_props.left + bird_props.width > pipe_sprite_props.left && bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height && bird_props.top + bird_props.height > pipe_sprite_props.top) {
                    // game_state = 'End';
                    // message.innerHTML = 'Game Over'.fontcolor('red') + '<br>Press Enter To Restart';
                    // message.classList.add('messageStyle');
                    // img.style.display = 'none';
                    sound_die.play();
                    endGame();
                    return;
                } else {
                    if (pipe_sprite_props.right < bird_props.left && pipe_sprite_props.right + move_speed >= bird_props.left && element.increase_score == '1') {
                        pauseGame();
                        score_val.innerHTML = + score_val.innerHTML + 1;
                        sound_point.play();
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
        // move questions with pipes
        let questions = document.querySelectorAll('.question');
        questions.forEach((element) => {
            let question_props = element.getBoundingClientRect();
            element.style.left = question_props.left - move_speed + 'px';
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    let bird_dy = 0;
    function apply_gravity() {
        if (game_state != 'Play') return;
        bird_dy = bird_dy + grativy;
        document.addEventListener('keydown', (e) => {
            if (e.key == 'ArrowUp' || e.key == ' ') {
                img.src = 'images/Bird-2.png';
                bird_dy = -7.6;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key == 'ArrowUp' || e.key == ' ') {
                img.src = 'images/Bird.png';
            }
        });

        if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
            game_state = 'End';
            message.style.left = '28vw';
            window.location.reload();
            message.classList.remove('messageStyle');
            return;
        }
        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    let pipe_seperation = 0;

    let pipe_gap = 40;

    function create_pipe() {
        if (game_state != 'Play') return;

        // Adjusted the condition to check if the gap between pipes is too large
        if (pipe_seperation > 90) {
            let pipe_posi = Math.floor(Math.random() * 43) + 8;

            // Create the first pipe
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';
            document.body.appendChild(pipe_sprite_inv);

            // Create the second pipe
            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.increase_score = '1';
            document.body.appendChild(pipe_sprite);
            console.log(pipe_seperation);
            pipe_seperation = 0;
        } else {
            pipe_seperation++;
        }

        requestAnimationFrame(create_pipe);
    }

    requestAnimationFrame(create_pipe);

    function getRandomQuestion() {
        const index = Math.floor(Math.random() * questions.length);
        return questions[index];
    }

    function resumeGame() {
        game_state = 'Play';
        play();
        let popup = document.getElementById("quiz-popup");
        popup.style.display = 'none';
    }

    function pauseGame() {
        let bird_props = bird.getBoundingClientRect();
        let popup = document.getElementById("quiz-popup");
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.display = 'block';
        game_state = 'Pause';
        let qa = getRandomQA();
        let question = qa.question;
        let answer = qa.answer;
        document.getElementById('question').innerText = question;
        document.getElementById('answer').innerText = answer;
        document.addEventListener('keydown', resumeOnKeyPress);
    }

    function resumeOnKeyPress() {
        resumeGame();
        document.removeEventListener('keydown', resumeOnKeyPress); // Xóa trình xử lý sau khi tiếp tục
    }

    function getRandomQA() {
        let index = Math.floor(Math.random() * questions.length);
        let question = questions[index];
        let answer = answers[index];
        // Loại bỏ câu hỏi và câu trả lời đã lấy để tránh lặp lại
        questions.splice(index, 1);
        answers.splice(index, 1);
        return { question, answer };
    }

    function endGame() {
        let popup = document.getElementById("end-popup");
        game_state = "End";
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.display = 'block';

        document.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                location.reload();
            }
        });
    }
}


