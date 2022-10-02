let TIMELIMIT = 10000; // 10s
let PROPERNAME = "E";
function setUpControl() {
  button = createButton("START");
  button.position(630, 10);
  button.mousePressed(async () => {
    button.remove();

    // ! ======== Blue Option ========

    let blueAgent = "players/Potter-alpha-beta.js";
    // let blueAgent = "players/nor-minimax.js";

    // ! =============================

    // ! ======== Red Option =========

    // let redAgent = "players/nor-random.js";
    let redAgent = "players/nor-minimax.js";

    // ! =============================

    while (!GAMESTATE.isTerminal()) {
      let curAgent = redAgent;
      if (GAMESTATE.player == RED) {
        curAgent = blueAgent;
      }
      let action = await takeTurn(curAgent);
      GAMESTATE = GAMESTATE.transition(action);
      redraw();
    }
  });
}

async function takeTurn(curAgent) {
  const myWorker = new Worker(curAgent);
  let bestMove = null;
  return new Promise((resolve, reject) => {
    myWorker.postMessage([hex_size, GAMESTATE]);
    const timeoutId = setTimeout(() => {
      myWorker.terminate();
      console.log("TIME OUT for " + curAgent + " player");
      clearTimeout(timeoutId);
      resolve(bestMove);
    }, TIMELIMIT);

    myWorker.onmessage = function (e) {
      const result = e.data;
      if (result) {
        bestMove = result;
      } else {
        clearTimeout(timeoutId);
        resolve(bestMove);
      }
    };
  });
}
