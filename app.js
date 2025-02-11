document.addEventListener("DOMContentLoaded", () => {
    class Tetris {
      constructor(gridSelector, miniGridSelector) {
        this.grid = document.querySelector(gridSelector);
        this.squares = Array.from(document.querySelectorAll(`${gridSelector} div`));
        this.displaySquares = document.querySelectorAll(`${miniGridSelector} div`);
        this.scoreDisplay = document.querySelector("#score");
        this.startBtn = document.querySelector("#start-button");
        this.width = 10;
        this.displayWidth = 4;
        this.timerId = null;
        this.score = 0;
        this.isPaused = false;
        this.currentPosition = 4;
        this.currentRotation = 0;
        this.nextRandom = Math.floor(Math.random() * this.tetrominoes.length);

        this.colors = ["orange", "red", "purple", "green", "blue", "white"];
        this.init();
      }

      get tetrominoes() {
        return [
          [[1, this.width + 1, this.width * 2 + 1, 2], [this.width, this.width + 1, this.width + 2, this.width * 2 + 2],
           [1, this.width + 1, this.width * 2 + 1, this.width * 2], [this.width, this.width * 2, this.width * 2 + 1, this.width * 2 + 2]],
          [[0, this.width, this.width + 1, this.width * 2 + 1], [this.width + 1, this.width + 2, this.width * 2, this.width * 2 + 1],
           [0, this.width, this.width + 1, this.width * 2 + 1], [this.width + 1, this.width + 2, this.width * 2, this.width * 2 + 1]],
          [[1, this.width, this.width + 1, this.width + 2], [1, this.width + 1, this.width + 2, this.width * 2 + 1],
           [this.width, this.width + 1, this.width + 2, this.width * 2 + 1], [1, this.width, this.width + 1, this.width * 2 + 1]],
          [[0, 1, this.width, this.width + 1], [0, 1, this.width, this.width + 1],
           [0, 1, this.width, this.width + 1], [0, 1, this.width, this.width + 1]],
          [[1, this.width + 1, this.width * 2 + 1, this.width * 3 + 1], [this.width, this.width + 1, this.width + 2, this.width + 3],
           [1, this.width + 1, this.width * 2 + 1, this.width * 3 + 1], [this.width, this.width + 1, this.width + 2, this.width + 3]]
        ];
      }

      init() {
        this.random = Math.floor(Math.random() * this.tetrominoes.length);
        this.current = this.tetrominoes[this.random][this.currentRotation];
        document.addEventListener("keydown", (e) => this.control(e));
        this.startBtn.addEventListener("click", () => this.toggleGame());
        this.draw();
        this.displayNextShape();
      }

      draw() {
        this.current.forEach(index => {
          this.squares[this.currentPosition + index].classList.add("tetromino");
          this.squares[this.currentPosition + index].style.backgroundColor = this.colors[this.random];
        });
      }

      undraw() {
        this.current.forEach(index => {
          this.squares[this.currentPosition + index].classList.remove("tetromino");
          this.squares[this.currentPosition + index].style.backgroundColor = "";
        });
      }

      control(e) {
        if (e.key === "ArrowLeft") this.moveLeft();
        else if (e.key === "ArrowRight") this.moveRight();
        else if (e.key === "ArrowDown") this.moveDown();
        else if (e.key === "ArrowUp") this.rotate();
      }

      moveDown() {
        this.undraw();
        this.currentPosition += this.width;
        this.draw();
        this.freeze();
      }

      moveLeft() {
        this.undraw();
        if (!this.current.some(index => (this.currentPosition + index) % this.width === 0)) {
          this.currentPosition -= 1;
        }
        if (this.current.some(index => this.squares[this.currentPosition + index].classList.contains("taken"))) {
          this.currentPosition += 1;
        }
        this.draw();
      }

      moveRight() {
        this.undraw();
        if (!this.current.some(index => (this.currentPosition + index) % this.width === this.width - 1)) {
          this.currentPosition += 1;
        }
        if (this.current.some(index => this.squares[this.currentPosition + index].classList.contains("taken"))) {
          this.currentPosition -= 1;
        }
        this.draw();
      }

      rotate() {
        this.undraw();
        this.currentRotation = (this.currentRotation + 1) % this.tetrominoes[this.random].length;
        this.current = this.tetrominoes[this.random][this.currentRotation];
        this.draw();
      }

      freeze() {
        if (this.current.some(index => this.squares[this.currentPosition + index + this.width].classList.contains("taken"))) {
          this.current.forEach(index => this.squares[this.currentPosition + index].classList.add("taken"));
          this.random = this.nextRandom;
          this.nextRandom = Math.floor(Math.random() * this.tetrominoes.length);
          this.current = this.tetrominoes[this.random][this.currentRotation];
          this.currentPosition = 4;
          this.draw();
          this.displayNextShape();
          this.addScore();
          this.checkGameOver();
        }
      }

      displayNextShape() {
        this.displaySquares.forEach(square => {
          square.classList.remove("tetromino");
          square.style.backgroundColor = "";
        });

        this.tetrominoes[this.nextRandom][0].forEach(index => {
          this.displaySquares[index].classList.add("tetromino");
          this.displaySquares[index].style.backgroundColor = this.colors[this.nextRandom];
        });
      }

      addScore() {
        for (let i = 0; i < 199; i += this.width) {
          const row = [...Array(10).keys()].map(x => x + i);
          if (row.every(index => this.squares[index].classList.contains("taken"))) {
            this.score += 10;
            this.scoreDisplay.innerHTML = this.score;
            row.forEach(index => {
              this.squares[index].classList.remove("tetromino", "taken");
              this.squares[index].style.backgroundColor = "";
            });
          }
        }
      }

      checkGameOver() {
        if (this.current.some(index => this.squares[this.currentPosition + index].classList.contains("taken"))) {
          this.scoreDisplay.innerHTML = "Game Over!";
          clearInterval(this.timerId);
        }
      }

      toggleGame() {
        if (this.timerId) {
          clearInterval(this.timerId);
          this.timerId = null;
        } else {
          this.timerId = setInterval(() => this.moveDown(), 1000);
        }
      }
    }

    new Tetris(".grid", ".mini-grid");
  });
