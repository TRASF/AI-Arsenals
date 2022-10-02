/**
 * TODO: Project crawling [Comments].
 * ! Size 11: Alpha-Beta 6 - 2 Minimax
 * ! Size 7: Alpha-Beta 6 - 1 Minimax
 * ! Size 5: Alpha-Beta 6 - 0 Minimax
 */

// ! Variables for players [Red and Blue].
let RED = "r";
let BLUE = "b";

// ! Variable for indication empty spaces.
let EMPTY = "e";

// ! Variable for map size.
let hex_size = 5; // 5, 7, or 11 are possible

// ! Variable for players and emyty space appearance.
let colors = { r: "#ff0000", b: "#0000ff", e: "#ffffff" };

// ! Variables for map customization.
let r = 20;
let s = Math.sqrt((3 * Math.pow(r, 2)) / 4);

// ! Variables for Game appearances.
let GAMESTATE;
let hexagon_shapes;
let button;

/**
 * ! Game set up fucntions.
 * ? Might need to put some code here,
 */
function setup() {
  createCanvas(700, 400);

  textAlign(CENTER, CENTER);

  GAMESTATE = HexGameState.create_empty_state(hex_size);
  hexagon_shapes = [];

  for (let i = 0; i < hex_size; i++) {
    // ! From Right (TOP) to Left (Bottom)
    let x = r * i * 0.9 + 2 * r;
    let y = 1.75 * s * i + 2 * r;

    // ! From Left (Bottom) to Right (TOP)
    // let y = 1.75*s * i + r;
    // let x = 300 - i * r * 0.9 - r;

    // ! Creating hexagon shapes
    let row = [];
    hexagon_shapes.push(row);
    for (let j = 0; j < hex_size; j++) {
      let player = GAMESTATE.board[i][j];
      let h = new Hexagon(x, y, r, i + "," + j, colors[player]);
      row.push(h);
      x += r * 1.75;
    }
    y += s * 1.75;
  }
  setUpControl();
  noLoop();
}

// ! Rendering function
function draw() {
  background(220);
  render_state(GAMESTATE);
  // ! State information log
  // console.log(GAMESTATE);
}

// ! No need to put any attention to this part yet,
function render_state(state) {
  let q = hex_size - 1;
  let currentPlayer = "e";
  fill(colors[RED]);
  rect(
    hexagon_shapes[0][0].x - r,
    hexagon_shapes[0][0].y - r - 10,
    1.75 * r * hex_size,
    20
  );
  rect(
    hexagon_shapes[q][0].x - r,
    hexagon_shapes[q][0].y + 10,
    1.75 * r * hex_size,
    20
  );
  fill(colors[BLUE]);
  quad(
    hexagon_shapes[0][0].x - r - 10,
    hexagon_shapes[0][0].y - 10,
    hexagon_shapes[0][q].x + r + 10,
    hexagon_shapes[0][q].y - 10,
    hexagon_shapes[q][q].x + r + 10,
    hexagon_shapes[q][q].y + 10,
    hexagon_shapes[q][0].x - r - 10,
    hexagon_shapes[q][0].y + 10
  );
  // quad(
  //   r - r, r + r / 2,
  //   r + r / 2 + 1.75 * r * hex_size, r + r / 2,
  //   r * 19 + 11.5 * r, r * 17.5 + r / 4,
  //   r * 6 * 1.75 - r, r * 17.5 + r / 4);
  for (let i = 0; i < hex_size; i++) {
    for (let j = 0; j < hex_size; j++) {
      let h = hexagon_shapes[i][j];
      h.color = colors[state.board[i][j]];
      h.render();
      // console.log(h)
    }
  }

  fill(0);
  noStroke();
  text("Alpha-Beta vs Minimax", 550, r);
  if (
    GAMESTATE.player == "b" ? (currentPlayer = "Blue") : (currentPlayer = "Red")
  );
  text("Current player: " + currentPlayer, 550, 50);
  let Winner = "None";
  if (state.isTerminal()) {
    state._winner == "b" ? (Winner = "Blue") : (Winner = "Red");
    text("Winner: " + Winner, 550, r * 4);
    text("RED" + "'s Utility: " + state.utility(RED), 550, r * 5);
    text("BLUE" + "'s Utility: " + state.utility(BLUE), 550, r * 6);
  }
}
// ! Click handler function.
function mouseClicked() {
  let min_i = -1;
  let min_j = -1;
  let min_dis = 9999;
  for (let i = 0; i < hex_size; i++) {
    for (let j = 0; j < hex_size; j++) {
      let hex_shape = hexagon_shapes[i][j];

      // ! =========================================================
      if (min_dis > hex_shape.distanceToMouse) {
        min_i = i;
        min_j = j;
        min_dis = hex_shape.distanceToMouse;
      }
      // ! =========================================================
    }
  }

  // ! =========================================================
  if (min_dis < r && GAMESTATE.isValidAction(min_i, min_j)) {
    GAMESTATE = GAMESTATE.transition(new Action(min_i, min_j));
    // console.log(state.isTerminal())
  }
  // ! =========================================================

  redraw();
  // prevent default
  return false;
}

// ! Hexagon space appearance and constructor.
// ! =========================================================
class Hexagon {
  constructor(x, y, r, name, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.name = name;
    this.color = color;
  }

  render() {
    fill(this.color);
    if (this.color != "#ffffff") {
      stroke("#ffffff");
    } else {
      stroke(0);
    }

    this.hexagon(this.x, this.y, this.r);
    noStroke();
    if (this.color != "#ffffff") {
      fill("#fff");
    } else {
      fill(0);
    }

    text(this.name, this.x, this.y);
  }

  hexagon(x, y, r) {
    beginShape();
    for (let a = 0; a < 2 * PI; a += (2 * PI) / 6) {
      let x2 = cos(a + PI / 6) * r;
      let y2 = sin(a + PI / 6) * r;
      vertex(x + x2, y + y2);
    }
    endShape(CLOSE);
  }
  // ! =========================================================
  get distanceToMouse() {
    return dist(mouseX, mouseY, this.x, this.y);
  }
}
