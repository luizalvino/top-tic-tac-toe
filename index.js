const playerFactory = (name, mark) => {
  return { name, mark };
};

const player1 = playerFactory("Player 1", "X");
const player2 = playerFactory("Player 2", "O");

const Gameboard = ((players) => {
  let _board;
  let _status;
  let _currentPlayer;
  let _player2Type;

  const start = (player2Type) => {
    _board = Array(3)
      .fill(null)
      .map(() => Array(3).fill());
    _player2Type = player2Type || "human";
    _currentPlayer = players[0];
    _status = "active";
  };

  const choose = (x, y) => {
    if (!!_board[x][y]) {
      return false;
    }

    _board[x][y] = _currentPlayer.mark;
    if (_checkWinner()) {
      _status = "won";
    } else if (_checkDraw()) {
      _status = "draw";
    }
    return true;
  };

  const chooseRandom = () => {
    let x = _rand();
    let y = _rand();

    while (!choose(x, y)) {
      x = _rand();
      y = _rand();
    }

    return { x, y };
  };

  const _rand = () => {
    const min = 0;
    const max = 2;
    return (
      (Math.floor(Math.pow(10, 14) * Math.random() * Math.random()) %
        (max - min + 1)) +
      min
    );
  };

  const isActive = () => {
    return _status === "active";
  };

  const hasWinner = () => {
    return _status === "won";
  };

  const isDrawn = () => {
    return _status === "drawn";
  };

  const _checkWinner = () => {
    return _checkRows() || _checkColumns() || _checkDiagonal();
  };

  const _checkDraw = () => {
    return !_board
      .map((row) => row.map((cell) => !!cell).includes(false))
      .includes(true);
  };

  const _checkRows = () => {
    for (let i in [0, 1, 2]) {
      if (
        !!_board[i][0] &&
        _board[i][0] === _board[i][1] &&
        _board[i][1] === _board[i][2]
      ) {
        return true;
      }
    }
    return false;
  };

  const _checkColumns = () => {
    for (let i in [0, 1, 2]) {
      if (
        !!_board[0][i] &&
        _board[0][i] === _board[1][i] &&
        _board[1][i] === _board[2][i]
      ) {
        return true;
      }
    }
    return false;
  };

  const _checkDiagonal = () => {
    return (
      (!!_board[0][0] &&
        _board[0][0] === _board[1][1] &&
        _board[1][1] === _board[2][2]) ||
      (!!_board[2][0] &&
        _board[2][0] === _board[1][1] &&
        _board[1][1] === _board[0][2])
    );
  };

  const changeCurrentPlayer = () => {
    _currentPlayer = _currentPlayer === players[0] ? players[1] : players[0];
  };

  return {
    get status() {
      return _status;
    },
    get board() {
      return [..._board];
    },
    get currentPlayer() {
      return _currentPlayer;
    },
    start,
    choose,
    chooseRandom,
    changeCurrentPlayer,
    isActive,
    hasWinner,
    isDrawn,
  };
})([player1, player2]);

const displayController = ((gameboard) => {
  let player2Type = "";

  const showMainScreen = () => {
    const title = document.querySelector("header h1");
    title.addEventListener("click", () => {
      showMainScreen();
    });

    const mainEl = document.querySelector("main .container");
    const mainScreenButtons = document
      .querySelector("#main-screen-buttons-template")
      .content.cloneNode(true);

    const humanBtn = mainScreenButtons.querySelector("#human-btn");
    const iaBtn = mainScreenButtons.querySelector("#cpu-btn");
    const startBtn = mainScreenButtons.querySelector("#start-btn");

    humanBtn.addEventListener("click", () => {
      player2Type = "human";
      humanBtn.classList.add("choosed");
      iaBtn.classList.remove("choosed");
      startBtn.removeAttribute("disabled");
    });

    iaBtn.addEventListener("click", () => {
      player2Type = "cpu";
      iaBtn.classList.add("choosed");
      humanBtn.classList.remove("choosed");
      startBtn.removeAttribute("disabled");
    });

    startBtn.addEventListener("click", () => {
      showGameBoard();
    });

    mainEl.innerHTML = "";
    mainEl.appendChild(mainScreenButtons);
  };

  const showGameBoard = () => {
    gameboard.start(player2Type);

    const mainEl = document.querySelector("main .container");
    const boardTemplate = document
      .querySelector("#board-template")
      .content.cloneNode(true);
    const boardEl = boardTemplate.querySelector("#board");

    const restartEl = boardEl.querySelector(".restart");
    restartEl.addEventListener("click", () => {
      gameboard.start(player2Type);

      const resultEl = document.querySelector(".result");
      resultEl?.remove();

      const playerOneEl = boardEl.querySelector(".players .p1");
      playerOneEl.classList.add("active");
      const playerTwoEl = boardEl.querySelector(".players .p2");
      playerTwoEl.classList.remove("active");

      _renderBoard();
    });

    mainEl.innerHTML = "";
    mainEl.appendChild(boardEl);

    _renderBoard();
  };

  const _renderBoard = () => {
    const spotsEl = document.querySelector("#board .spots");
    spotsEl.innerHTML = "";

    gameboard.board.forEach((row, i) =>
      row.forEach((spot, j) => {
        const spotTemplate = document.querySelector("#spot-template");

        const spotEl = _template(spotTemplate, {
          mark: spot,
        });

        spotEl.addEventListener("click", () => {
          if (gameboard.isActive() && gameboard.choose(i, j)) {
            const spanEl = spotEl.querySelector("span");
            spanEl.classList.add("fade-in");
            spanEl.innerHTML = gameboard.currentPlayer.mark;

            _verifyResult();

            if (gameboard.isActive() && player2Type === "cpu") {
              const { x, y } = gameboard.chooseRandom();
              const cellIdx = x * 3 + y + 1;
              const cpuSpanEl = spotsEl.querySelector(
                `.spot:nth-of-type(${cellIdx}) span`
              );
              cpuSpanEl.classList.add("fade-in");
              cpuSpanEl.innerHTML = gameboard.currentPlayer.mark;
              _verifyResult();
            }
          }
        });
        spotsEl.appendChild(spotEl);
      })
    );
  };

  const _verifyResult = () => {
    if (gameboard.isActive()) {
      gameboard.changeCurrentPlayer();

      const activePlayersEl = document.querySelectorAll(".players span");
      activePlayersEl.forEach((activePlayerEl) =>
        activePlayerEl.classList.toggle("active")
      );
    } else if (gameboard.hasWinner()) {
      _showResult(`${gameboard.currentPlayer.name} won!`);
    } else if (gameboard.isDrawn) {
      _showResult("Draw game!");
    }
  };

  const _showResult = (message) => {
    const mainEl = document.querySelector("main .container");
    const resultadoEl = document.createElement("div");
    resultadoEl.classList.add("result", "fade-in");
    resultadoEl.textContent = message;
    mainEl.appendChild(resultadoEl);
  };

  const _template = (element, data) => {
    const parser = new DOMParser();
    const str = element.innerHTML.replaceAll(/{(\w*)}/g, function (m, key) {
      return data[key] || "";
    });
    const doc = parser.parseFromString(str, "text/html");
    return doc.body.firstChild;
  };

  return {
    showMainScreen,
    showGameBoard,
  };
})(Gameboard);

displayController.showMainScreen();
