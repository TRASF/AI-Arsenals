let blueCount = 0;
let redCount = 0;
let hex_size = state.hex_size;
// console.log( `action);
if (
  action.i == Math.floor(hex_size / 2) &&
  action.j == Math.floor(hex_size / 2)
) {
  return -100;
}

for (let i = 0; i < hex_size; i++) {
  for (let j = 0; j < hex_size; j++) {
    if (state.board[i][j] == BLUE) {
      //#1
      // Encourage to conquest the middle row
      let rowS = [-1, 0, 1];
      // ===============================================
      for (let k = 0; k < 3; k++) {
        try {
          if (i == Math.floor(hex_size / 2) + rowS[k]) {
            blueCount++;
          }
        } catch (error) {}
      }
      // ===============================================

      //#2
      // Encourage to stick together
      let rowT = [-1, -1, 0, 0, 1, 1];
      let colT = [0, 1, -1, 1, -1, 0];

      // ===============================================
      for (let k = 0; k < 6; k++) {
        try {
          if (state.board[i + rowT[k]][j + colT[k]] == BLUE) {
            blueCount++;
          }
        } catch (error) {}
      }
      // ===============================================

      //#3
      // Encourage to put piece at the top or bottom side
      let distanceTop = Math.abs(0 - i);
      let distanceBot = Math.abs(i - (hex_size - 1));
      blueCount -= distanceTop + distanceBot;
    } else if (state.board[i][j] == RED) {
      //#1
      // Encourage to conquest the middle row
      let ColS = [-1, 0, 1];
      for (let k = 0; k < 3; k++) {
        try {
          if (i == Math.floor(hex_size / 2) + ColS[k]) {
            redCount++;
          }
        } catch (error) {}
      }

      //#2
      // Encourage to stick together
      let rowT = [-1, -1, 0, 0, 1, 1];
      let colT = [0, 1, -1, 1, -1, 0];

      for (let k = 0; k < 6; k++) {
        try {
          if (state.board[i + rowT[k]][j + colT[k]] == RED) {
            redCount++;
          }
        } catch (error) {}
      }

      //#3
      // Encourage to put piece at the top or bottom side
      let distanceTop = Math.abs(0 - i);
      let distanceBot = Math.abs(i - (hex_size - 1));
      redCount -= distanceTop + distanceBot;
    }
  }
}
