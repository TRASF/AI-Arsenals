let TIMELIMIT = 10000;  // 10s

function setUpControl() {
  button = createButton('START');
  button.position(20, 360);
  button.mousePressed(async () => {
    button.remove();
    let blueAgent = 'players/nor-alpha-beta.js'
    let redAgent = 'players/nor-minimax.js';

    while (!GAMESTATE.isTerminal()) {
      let curAgent = blueAgent;

      if (GAMESTATE.player == RED) {
        curAgent = redAgent;
      }
    //   console.log(curPlayer.player)
      let action = await takeTurn(curAgent);
      console.log(curAgent, ':', action)
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
      console.log('TIME OUT for ' + curAgent + ' player')
      clearTimeout(timeoutId);
      resolve(bestMove);
    }, TIMELIMIT);

    myWorker.onmessage = function(e) {
      const result = e.data;
      if (result) {
        bestMove = result;
      } else {
        clearTimeout(timeoutId);
        resolve(bestMove);
      }
    }
  });


}
