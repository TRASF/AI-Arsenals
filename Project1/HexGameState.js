// ! Most of the game action rely in this function.
class HexGameState {
  constructor(hex_size, board, player) {
    this.hex_size = hex_size;
    this.board = board; // a 2D array for the board.
    this.player = player; // current player of the state (might not be MAX agent)
    this._winner = EMPTY; // cache
    this._end = false; // cache
    this._terminal_called = false; // cache
  }

  //! Static Function to create empty state.
  static create_empty_state(hex_size) {
    // return the staring board of the game.
    // the board is a 2D array where i, j action is a position i, j on the board.
    let board = [];

    // ! Board implementation.
    for (let i = 0; i < hex_size; i++) {
      let row = [];

      // ? Push row to the board.
      board.push(row);

      for (let j = 0; j < hex_size; j++) {
        // ? Push each row an empty space.
        row.push(EMPTY);
      }
    }
    return new HexGameState(hex_size, board, BLUE);
  }

  // ! Check current player.
  static togglePlayer(curPlayer) {
    if (curPlayer == RED) {
      curPlayer = BLUE;
    } else {
      curPlayer = RED;
    }
    return curPlayer;
  }

  // ! Empty space validation function.
  actions() {
    // return a list of valid action (i, j).
    let valid_moves = [];
    for (let i = 0; i < this.hex_size; i++) {
      for (let j = 0; j < this.hex_size; j++) {
        if (this.board[i][j] == EMPTY) {
          valid_moves.push(new Action(i, j));
        }
      }
    }
    return valid_moves;
  }
  // ! Legal move validation and placement action validation.
  transition(action) {
    // place a piece of the current player on the board.
    // then, toggle the player.
    // If action is not valid, the turn will be skipped.

    // ! Create a piece of player for movement prediction.
    let nextPlayer = HexGameState.togglePlayer(this.player);
    let newBoard = [];

    // ! Space captured updating used for prediction.
    /**
     * - P1 Played
     * - e P1  < Updated
     * - e e
     * - P2 Played
     * - P2 P1 < Updated
     * - e e
     */
    for (let i = 0; i < this.hex_size; i++) {
      newBoard.push(this.board[i].slice(0));
    }

    // ! Approved action step.
    if (action && this.isValidAction(action.i, action.j)) {
      // ! Space captured.
      newBoard[action.i][action.j] = this.player;
    }
    return new HexGameState(this.hex_size, newBoard, nextPlayer);
  }
  // !
  isTerminal() {
    // ! build a disjoint set per player.
    let blueDSU = new DSU();
    let redDSU = new DSU();

    for (let i = 0; i < this.hex_size; i++) {
      for (let j = 0; j < this.hex_size; j++) {
        // ! If the current space is empty, then continue.
        let p = this.board[i][j];
        if (p == EMPTY) {
          continue;
        }

        // ! Loop for child seeking [Top, Left, Right, Below].
        /**
         * -  e e
         * - e e e   < Check all of the surround node,
         * -  e e
         */
        for (let m = -1; m < 2; m++) {
          for (let n = -1; n < 2; n++) {
            // ! if row and column is equal, then continue.
            if (m == n) {
              continue;
            }

            // ! Find the parent node.
            let u = i + m;
            let v = j + n;

            // ! IF x and y is exceed the map limitation, then continue.
            if (u < 0 || u >= this.hex_size || v < 0 || v >= this.hex_size) {
              continue;
            }

            // ! IF current state is the same player as surround space, then union them together as parent and child concept.
            if (p == this.board[u][v]) {
              if (p == RED) {
                redDSU.union(i + "," + j, u + "," + v);
                console.log(redDSU);
              } else {
                blueDSU.union(i + "," + j, u + "," + v);
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < this.hex_size; i++) {
      for (let u = 0; u < this.hex_size; u++) {
        // ! check if BLUE wins
        let subset1 = blueDSU.find(i + ",0");
        let subset2 = blueDSU.find(u + "," + (this.hex_size - 1));
        // console.log([subset1, subset2])

        // ! When the blue player winning.
        // ? subset1 == subset2
        if (subset1 == subset2 && this.board[i][0] == BLUE) {
          this._winner = BLUE;
          break;
        }

        // ! check if RED wins
        let subset3 = redDSU.find("0," + i);
        let subset4 = redDSU.find(this.hex_size - 1 + "," + u);

        // ! When the red player winning.
        // ? subset1 == subset2
        if (subset3 == subset4 && this.board[0][i] == RED) {
          this._winner = RED;
          break;
        }
      }

      // ! If there are the winner, break the loop.
      if (this._winner != EMPTY) {
        break;
      }
    }

    // ! If there is no winnder, then call the terminal and check the empty spaces in the map.
    if (this._winner == EMPTY) {
      // ! a long way to find whether the game has ended...
      this._terminal_called = true;
      let _c = 0;
      for (let i = 0; i < this.hex_size; i++) {
        for (let j = 0; j < this.hex_size; j++) {
          // ! Empty space counting.
          let p = this.board[i][j];
          if (p != EMPTY) {
            _c++;
          }
        }
      }

      // ! If reserved space are take over the map, then assume that the game is ended.
      if (_c == this.hex_size * this.hex_size) {
        this._end = true;
        return true;
      }
    }

    // ! evaluate the end condition
    this._end = this._winner != EMPTY;

    // ! Send the winner condition
    return this._winner != EMPTY;
  }
  // ! Terminal and winning condition.
  utility(query_player) {
    // Winner get 1.0 and the loser got -1.0

    // ! Caching
    if (!this._terminal_called) {
      this.isTerminal();
    }

    // ! The winner get 1 point.
    if (this._winner == query_player) {
      return 1.0;
    }

    // ! Tie, no ine get point.
    if (this._winner == EMPTY) {
      return 0.0;
    }

    // ! lose will get minus 1 point.
    return -1.0;
  }

  // ! Action validation function.
  isValidAction(i, j) {
    // Check if the action i, j is valid
    return this.board[i][j] == EMPTY;
  }
}

// ! Constructor of an action.
class Action {
  constructor(i, j) {
    this.i = i;
    this.j = j;
  }
}
