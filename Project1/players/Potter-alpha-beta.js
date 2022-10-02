// ========================================================
// EXAMPLE AGENT: YOU CAN COPY AND MODIFY THIS AGENT
// ========================================================

let beta = Number.NEGATIVE_INFINITY;
let alpha = Number.POSITIVE_INFINITY;
class Agent {
  constructor(player) {
    this.player = player;
    this.curBestMove = null;
    // ! [5: , 7:, 11: 7]
    this.depthLimit = 2;
  }

  // START MINIMAX ALGORITHM (WITH ADAPTIVE DEPTH LIMIT)
  searchMove(initial_state, keepBestMove) {
    let actions = initial_state.actions();

    // ! ===== Dept limit =========

    if (actions.length < 20) {
      this.depthLimit = 4;
    }
    if (actions.length < 10) {
      this.depthLimit = 3;
    }
    if (actions.length < 6) {
      this.depthLimit = 3;
    }

    // ! ==== End Dept limit ======

    let curMaxVal = Number.NEGATIVE_INFINITY;

    // ! =============== Process ===========================

    this.curBestMove = actions[0];
    console.log(actions.length);
    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];
      let newState = initial_state.transition(action);
      // console.log("Alpha", alpha, "Beta", beta);
      let minimaxVal = this.minVal(newState, 1, action);
      if (minimaxVal > curMaxVal) {
        curMaxVal = minimaxVal;
        this.curBestMove = action;
        // console.log("Aplha-Beta Option:", action, minimaxVal, "...");
        // console.log(
        // this.player,
        // "Alpha-Beta Best Move: ",
        // action.i,
        // action.j,
        // " with " + minimaxVal
        // );
        keepBestMove(action);
      }
    }

    // ! ============ End Process ==========================

    return this.curBestMove; // not used.
  }
  // TODO: Do this part 1st
  // + Implement and adapt minimax to alpha-beta.
  minVal(state, depth, action) {
    if (state.isTerminal())
      return state.utility(this.player) * Number.POSITIVE_INFINITY;

    // ! End loop condition
    if (depth >= this.depthLimit) return this.evaluate(state, action);

    let minimaxVal = Number.POSITIVE_INFINITY;
    let actions = state.actions();

    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];
      let newState = state.transition(action);

      minimaxVal = Math.min(
        minimaxVal,
        this.maxVal(newState, depth + 1, action)
      );

      // ! ======== Implement Part ==============

      beta = minimaxVal;
      if (beta <= alpha) break;

      // ! ======= End Implement Part ===========
    }
    return minimaxVal;
  }

  maxVal(state, depth, action) {
    if (state.isTerminal())
      return state.utility(this.player) * Number.POSITIVE_INFINITY;

    if (depth >= this.depthLimit) return this.evaluate(state, action);

    let minimaxVal = Number.NEGATIVE_INFINITY;
    let actions = state.actions();

    for (let i = 0; i < actions.length; i++) {
      let action = actions[i];
      let newState = state.transition(action);

      minimaxVal = Math.max(
        minimaxVal,
        this.minVal(newState, depth + 1, action)
      );

      // ! ======== Implement Part ==============

      alpha = minimaxVal;
      if (beta <= alpha) break;

      // ! ======= End Implement Part ===========
    }
    return minimaxVal;
  }

  // ! =============== EVALUATION FUNCTIONS ===============
  /**
   * ! Step
   *   + Eval center space  to -100
   *     = [1, 1], [1, 2], [1, 3] <
   *     = [2, 1], [2, 2], [3, 3]   < Set these eval val to -100
   *     = [2, 1], [2, 2], [3, 3] <
   *   + Check wall
   *     = [i, j - 1] <
   *     = [i, j - 1]  < If there are pieces against the all count it, then convert it to negative for eval.
   *     = [i, j - 1] <
   *
   */
  evaluate(state, action) {
    let Bluecount = 0;
    let Redcount = 0;
    let hex_size = state.hex_size;
    let SurroundRows = [-1, -1, 0, 0, 1, 1];
    let SurroundCols = [0, 1, -1, 1, -1, 0];

    // ! CALL CHECK WALL FUNCTION
    let wallCount = this._evaluate(state);
    if (
      (action.i > 0 && action.i < hex_size - 1) ||
      (action.j > 0 && action.j < hex_size - 1)
    ) {
      return -100;
    }
    // ! =============== Process ===========================

    for (let i = 0; i < hex_size; i++) {
      for (let j = 0; j < hex_size; j++) {
        if (state.board[i][j] == BLUE) {
          // ! Check for surround neighbor
          for (let k = 0; k < 6; k++) {
            try {
              if (state.board[i + SurroundRows[k]][j + SurroundCols[k]] == BLUE)
                Bluecount++;
            } catch (error) {}
          }
          let distanceL = Math.abs(0 - j);
          let distanceR = Math.abs(j - (hex_size - 1));
          // Bluecount -= distanceL + distanceR - wallCount;
          Bluecount -= distanceL + distanceR;
        } else if (state.board[i][j] == RED) {
          for (let k = 0; k < 6; k++) {
            try {
              if (state.board[i + SurroundRows[k]][j + SurroundCols[k]] == RED)
                Redcount++;
            } catch (error) {}
          }
          let distanceT = Math.abs(0 - i);
          let distanceB = Math.abs(i - (hex_size - 1));
          // Redcount -= distanceT + distanceB - wallCount;
          Redcount -= distanceT + distanceB;
        }
      }
    }

    // ! =========== End Process ===========================

    if (this.player == BLUE) {
      return Bluecount;
    } else {
      return Redcount;
    }
  }
  __evaluate(state, action) {
    // a dummy evaluation function that

    // encourages the agent to not put piece agaist the wall
    let blueWallCount = 0;
    let redWallCount = 0;
    let hex_size = state.hex_size;
    for (let i = 0; i < hex_size; i++) {
      if (state.board[i][0] == BLUE || state.board[i][hex_size - 1] == BLUE) {
        blueWallCount++;
      }
      if (state.board[0][i] == RED || state.board[hex_size - 1][i] == RED) {
        redWallCount++;
      }
    }
    if (this.player == RED) {
      return -redWallCount;
    } else {
      return -blueWallCount;
    }
  }

  // ! =========== End EVALUATION FUNCTIONS ================
  _evaluate(state) {
    return Math.random();
  }
}

// ======================================================================
// DO NO CHANGE
// BOILERPLATE FOR WEB WORKER
// ======================================================================

const RED = "r";
const BLUE = "b";
const EMPTY = "e";

onmessage = function (e) {
  const hex_size = e.data[0];
  const state = e.data[1];
  const initial_state = new HexGameState(hex_size, state.board, state.player);
  const agent = new Agent(state.player);
  const x = agent.searchMove(initial_state, this.postMessage);
  this.postMessage(x);
  this.postMessage(false);
  this.close();
};

class HexGameState {
  constructor(hex_size, board, player) {
    this.hex_size = hex_size;
    this.board = board; // a 2D array for the board.
    this.player = player; // current player of the state (might not be MAX agent)
    this._winner = EMPTY; // cache
    this._end = false; // cache
    this._terminal_called = false; // cache
  }

  static create_empty_state(hex_size) {
    // return the staring board of the game.
    // the board is a 2D array where i, j action is a position i, j on the board.
    let board = [];

    for (let i = 0; i < hex_size; i++) {
      let row = [];
      board.push(row);
      for (let j = 0; j < hex_size; j++) {
        row.push(EMPTY);
      }
    }
    return new HexGameState(hex_size, board, BLUE);
  }

  static togglePlayer(curPlayer) {
    if (curPlayer == RED) {
      curPlayer = BLUE;
    } else {
      curPlayer = RED;
    }
    return curPlayer;
  }

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

  transition(action) {
    // place a piece of the current player on the board.
    // then, toggle the player.
    // If action is not valid, the turn will be skipped.
    let nextPlayer = HexGameState.togglePlayer(this.player);
    let newBoard = [];
    for (let i = 0; i < this.hex_size; i++) {
      newBoard.push(this.board[i].slice(0));
    }
    if (action && this.isValidAction(action.i, action.j)) {
      newBoard[action.i][action.j] = this.player;
    }
    return new HexGameState(this.hex_size, newBoard, nextPlayer);
  }

  isTerminal() {
    // build a disjoint set
    let blueDSU = new DSU();
    let redDSU = new DSU();
    for (let i = 0; i < this.hex_size; i++) {
      for (let j = 0; j < this.hex_size; j++) {
        let p = this.board[i][j];
        if (p == EMPTY) {
          continue;
        }
        for (let m = -1; m < 2; m++) {
          for (let n = -1; n < 2; n++) {
            if (m == n) {
              continue;
            }
            let u = i + m;
            let v = j + n;
            if (u < 0 || u >= this.hex_size || v < 0 || v >= this.hex_size) {
              continue;
            }
            if (p == this.board[u][v]) {
              if (p == RED) {
                redDSU.union(i + "," + j, u + "," + v);
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
        let subset1 = blueDSU.find(i + ",0");
        let subset2 = blueDSU.find(u + "," + (this.hex_size - 1));
        // console.log([subset1, subset2]);
        if (subset1 == subset2 && this.board[i][0] == BLUE) {
          this._winner = BLUE;
          break;
        }
        // check if RED wins
        let subset3 = redDSU.find("0," + i);
        let subset4 = redDSU.find(this.hex_size - 1 + "," + u);

        if (subset3 == subset4 && this.board[0][i] == RED) {
          this._winner = RED;
          break;
        }
      }
      if (this._winner != EMPTY) {
        break;
      }
    }
    if (this._winner == EMPTY) {
      // a long way to find whether the game has ended...
      this._terminal_called = true;
      let _c = 0;
      for (let i = 0; i < this.hex_size; i++) {
        for (let j = 0; j < this.hex_size; j++) {
          let p = this.board[i][j];
          if (p != EMPTY) {
            _c++;
          }
        }
      }
      if (_c == this.hex_size * this.hex_size) {
        this._end = true;
        return true;
      }
    }

    this._end = this._winner != EMPTY;
    return this._winner != EMPTY;
  }

  utility(query_player) {
    // Winner get 1.0 and the loser got -1.0
    if (!this._terminal_called) {
      this.isTerminal();
    }
    if (this._winner == query_player) {
      return 1.0;
    }
    if (this._winner == EMPTY) {
      return 0.0;
    }
    return -1.0;
  }

  isValidAction(i, j) {
    // Check if the action i, j is valid
    return this.board[i][j] == EMPTY;
  }
}

class Action {
  constructor(i, j) {
    this.i = i;
    this.j = j;
  }
}

/*
Disjoint Set Union (“DSU”)  is the Data Structure: disjoint-set data structure
is a data structure that keeps track of a set of elements partitioned into a
number of disjoint (non-overlapping) subsets.
Union Find is the Algorithm: A union-find algorithm is an algorithm that can
be used to detect cycles in an undirected graph & performs two useful operations
 on such a data structure:

1) Find: Determine which subset a particular element is in. This can be used
for determining if two elements are in the same subset.
2) Union: Join two subsets into a single subset.

Source: https://gist.github.com/KSoto/3300322fc2fb9b270dce2bf1e3d80cf3
*/

class DSU {
  constructor() {
    this.parents = [];
  }
  find(x) {
    if (typeof this.parents[x] != "undefined") {
      if (this.parents[x] < 0) {
        return x; //x is a parent
      } else {
        //recurse until you find x's parent
        return this.find(this.parents[x]);
      }
    } else {
      // initialize this node to it's on parent (-1)
      this.parents[x] = -1;
      return x; //return the index of the parent
    }
  }
  union(x, y) {
    var xpar = this.find(x);
    var ypar = this.find(y);
    if (xpar != ypar) {
      // x's parent is now the parent of y also.
      // if y was a parent to more than one node, then
      // all of those nodes are now also connected to x's parent.
      this.parents[xpar] += this.parents[ypar];
      this.parents[ypar] = xpar;
      return false;
    } else {
      return true; //this link creates a cycle
    }
  }
}
