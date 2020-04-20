// Generate the letter buttons
function renderBtns() {
    let alphabet = "abcdefghijklmnopqrstuvwxyz";
    let alphabetArr = alphabet.toUpperCase().split("");
    let btn = alphabetArr.map((letter) => {
        return "<li><button class='letter' data-letter=" + letter + ">" + letter + "</button></li>"
    })
    document.getElementById("btn-container").innerHTML = btn.join("")
}
renderBtns()

// Audio Controller
class AudioController {
    constructor() {
        this.spinning = new Audio("Assets/Nhac-nen-lucky-wheel.mp3");
        this.ding = new Audio("Assets/ding.mp3");
        this.wrong = new Audio("Assets/wrong.mp3")
    }
    spinPlay() {
        this.spinning.play();
        this.spinning.volume = 0.5;
    }
    stopSpin() {
        this.spinning.pause();
        this.spinning.currentTime = 0
    }
    dingPlay() {
        this.ding.play();
        this.ding.volume = 0.5;
        this.ding.currentTime = 0;
    }
    wrongPlay() {
        this.wrong.play();
        this.wrong.volume = 0.5;
        this.wrong.currentTime = 0;
    }
}
var audioController = new AudioController()
// Play the spinning sound
function spinSound() {
    let spin = document.getElementsByClassName("spinner"); // or document.getElementById("spinner")
    spin[0].addEventListener("click", () => { //without the index [0], the code will not run
        audioController.spinPlay()
    });
}
spinSound();

// Spin the wheel
function wheelSpin() {
    let wheel = document.getElementById("wheel-img");
    let spinBtn = document.getElementById("spinner");
    let deg;

    spinBtn.addEventListener("click", () => {
        // can not click the spin button while the wheel is spinning
        spinBtn.style.pointerEvents = 'none'
        // set the degree for the rotattion: between 5000 - 10000
        deg = Math.floor(5000 + Math.random() * 5000);
        // make the wheel slown down when it is about to stop and speed up while spinning. Without this, it will stop immediately when runs out of degree
        wheel.style.transition = "all 10s ease-in-out";
        wheel.style.transform = `rotate(${deg}deg)`;
    })

    // Assume that the wheel spin 5000 deg after the first player clicks the spin button
    // When the second player clicks the spin button again, assume that this time the wheel will spin 3000 deg
    // However, the wheel will not spin 3000 deg
    // Because, the first player has set the deg to 5000. 
    // Therefore, when the player 2 spins, the wheel will start from 5000 deg and rotate back to 3000 deg
    // In order to prevent this, coder needs to set the start point to 0 (reset start point) after the first rotation
    // So, after the wheel stops (transitioned), add a rotation effect with transition set to none
    // By doing so, we can both reset the start point and prevent players from seeing the effect
    wheel.addEventListener("transitionend", () => {
        spinBtn.style.pointerEvents = 'auto';
        wheel.style.transition = 'none';
        let resetDeg = deg % 360;
        wheel.style.transform = `rotate(${resetDeg}deg)`
    })
}
wheelSpin()

// Handle-points function
class HandlePoints {
    constructor() {
        this.audioController = new AudioController();

        this.player1Points = document.getElementsByClassName("player-points")[0];
        this.player2Points = document.getElementsByClassName("player-points")[1];

        this.point1 = document.getElementsByClassName("points-option")[0];
        this.point2 = document.getElementsByClassName("points-option")[1];
        

        this.double = Array.from(document.getElementsByClassName("double-points"));
        this.loseAll = Array.from(document.getElementsByClassName("lose-all"));
        this.divideInHalf = Array.from(document.getElementsByClassName("divide-in-half"));

        this.hiddenWord = document.getElementById("secret-word"); 

        this.secretLetters;

        this.letterBtns = Array.from(document.getElementsByClassName("letter"));

        this.luckyLetter = document.getElementById("lucky-letter");

        // Questions Database
        this.secretWordsArr = [
            {id:1,
            question: "If I sit down I'm high. If I stand up I'm low. I am very friendly and people love me. What am I?",
            answer: "Dog",
            },

            {id:2,
            question: "This animal is big and grey. It lives in Africa.What is it?",
            answer: "Hippo",
            },

            {id:3, 
            question: "What has arms but cannot hug?",
            answer: "Armchair",
            },

            {id:4, 
            question: "What is the best place to put the cake in?",
            answer: "Mouth",
            },

            {id:5, 
                question: "When I eat, I live but when I drink, I die. What am I?",
                answer: "Fire",
            },

            {id:6, 
                question: "Which letter of the alphabet goes around Ha Long Bay?",
                answer: "Letter C",
            },
            
            {id:7, 
            question: "What belongs only to you, but is used more by other people?",
            answer: "My Name",
            },

            {id:8, 
            question: "What goes up when the rain comes down?",
            answer: "Umbrella",
            },
            
            {id:9, 
            question: "What has a head and a foot but no body?",
            answer: "Bed",
            },

            {id:10, 
                question: "Who works only one day in a year but never gets fired?",
                answer: "SantaClaus",
            }
        ];
        
    }
    
    startGame() {
    
        this.player1Points.innerText = this.player2Points.innerText = "0";
        this.point1.value = this.point2.value = "ADD"

        this.double.forEach(double => {
            double.addEventListener("click", () => {
                this.doublePoints(double)
            })
        });
        this.loseAll.forEach(loseAll => {        
            loseAll.addEventListener("click", () => {
                this.loseAllPoints(loseAll)
            })
        })
        this.divideInHalf.forEach(divide => {
            divide.addEventListener("click", () => {
                this.dividePointsInHalf(divide)
            })
        })
        
        this.addPlayer1();
        this.addPlayer2();

        this.randomIndex = Math.floor(Math.random() * (this.secretWordsArr.length - 0.5));
        this.secretWord = this.secretWordsArr[this.randomIndex].answer; // string
        this.wordToFind = this.secretWord.toUpperCase().split(""); // array
        document.getElementById("quiz").innerHTML = this.secretWordsArr[this.randomIndex].question;
        this.generateSecretWord();

        this.resetBtns();

        this.lucky();
    }

    lucky() {
        this.luckyLetter.onclick = () => {
            let random = Math.floor(Math.random() * (this.wordToFind.length));
            this.secretLetters[random].classList.remove("hidden");
            this.audioController.dingPlay()
        }
    }
    resetBtns() {
        for (let k = 0; k < this.letterBtns.length; k++) {
            this.letterBtns[k].classList.remove("turn-red")
        }
    }

    matchOrNot(letterBtn) {
        letterBtn.classList.add("turn-red")
        if (this.wordToFind.includes(letterBtn.dataset.letter)) {
            this.match(letterBtn)
        } else {
            this.notMatch(letterBtn)
        }
        this.letterBtnToCheck = letterBtn 
    }
    match(letterBtn) {
        this.audioController.dingPlay();
        this.revealSecretLetter(letterBtn);
    }
    notMatch() {
        this.audioController.wrongPlay();
    }

    // Generate secret boxes containing secret letters of the answer
    generateSecretWord() {
        let secretLetters = this.wordToFind.map(letter => {
            if (letter === " ") {
                return "<li><button class='secret-letter empty-letter'><span class='empty'>" + " " + "</span></button></li>"
            }
            else {
                return "<li><button class='secret-letter'><span class='empty hidden' data-letter=" + letter +">" + letter + "</span></button></li>"
            }                                     
        });                                       
        this.hiddenWord.innerHTML = secretLetters.join("");
        this.secretLetters = Array.from(document.getElementsByClassName("empty"));
    }

    // Reaveal a secret letter if there is a matched guess
    revealSecretLetter(letterBtn) {
        let secretLetters = Array.from(document.getElementsByClassName("empty"));
        for ( let i = 0; i < secretLetters.length; i++) {
            if (secretLetters[i].dataset.letter == letterBtn.dataset.letter) {
                secretLetters[i].classList.remove("hidden");
            }
        }
    }

    // Handle Points
    addPlayer1() {
        this.point1.onchange = () => {
            this.player1Points.innerText = parseInt(this.player1Points.innerText) + parseInt(this.point1.value)
        }
    }
    addPlayer2() {
        this.point2.onchange = () => {
            this.player2Points.innerText = parseInt(this.player2Points.innerText) + parseInt(this.point2.value)
        }
    }
    doublePoints(double) {
        if (double.dataset.double == "one") {
            this.player1Points.innerText = parseInt(this.player1Points.innerText) * 2;
        } 
        if (double.dataset.double == "two") {
            this.player2Points.innerText = parseInt(this.player2Points.innerText) * 2
        }
    }
    loseAllPoints(loseAll) {
        if (loseAll.dataset.lose == "one") {
            this.player1Points.innerText = 0
        } 
        if (loseAll.dataset.lose == "two") {
            this.player2Points.innerText = 0
        }
    }
    dividePointsInHalf(divide) {
        if (divide.dataset.divide == "one") {
            this.player1Points.innerText = parseInt(this.player1Points.innerText) / 2;
        } 
        if (divide.dataset.divide == "two") {
            this.player2Points.innerText = parseInt(this.player2Points.innerText) / 2
        }
    }
}

let handlePoints = new HandlePoints();
handlePoints.startGame();

// Check if the selected letter button matched or not
let letterBtns = Array.from(document.getElementsByClassName("letter"));
letterBtns.forEach(letterBtn => {
    letterBtn.addEventListener('click', () => {
        handlePoints.matchOrNot(letterBtn)
    });
});

// Reveal Answer function
let revealBtn = document.getElementById("reveal-button");
let answer = document.getElementsByClassName("empty");
revealBtn.addEventListener("click", () => {
    for (let i of answer) {
        audioController.dingPlay();
        i.classList.remove("hidden")
    }
})

// Reset game
let reset = document.getElementById("reset");
reset.addEventListener("click", () => {
    window.location.reload(false)
});