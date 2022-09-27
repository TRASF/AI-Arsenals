/*
Cannot run on p5js online editor

TODO 1: [95% rotation [L&R Rotation], 100% movement] Agent rotation and movement. 
TODO 2: [25% agent know its neighbors] Make angent know its surround walkable position.  
TODO 3: [0% Nothing done] Apply stategy and search algorithm.
TODO 4: [0% Nothing done] Spot function from A* Example with detail of current position and its neighbors, then search for a nodes.
*/
// ! Map data [Set/ Change here]

/*
0123450
1ddggr1
2mdtmg2
3dmdwg3
4trgmde
5123456

0123450
1ddggr1
2mdtmg2
3dtdwg3
4trgmde
5123456

012345
1gdmt1
2mwmg2
3dggd3
4gmdm4
5mgmr5
612e45


012340
1gdgg1
2gwdr2
3gmgd3
4tmgg4
5123e5


012345
egrrrr1
2rrrrr2
3rrrrr3
4rrrrr4
5rrrrr5
6rrrrr5
*/

let map_data = `
0123450
1ddggr1
2mdtmg2
3dmdwg3
4trgmde
5123456

`;

// + ----------------------------------------------------
// ! Variables
let map;
let state;

// ! -- Map size --
let mz = 15;
let cz = 50;
// ! --------------

let openSet = [];
let closedSet = [];
let path = [];
let grandTotals = 0;
let start, end, values;
let explorer, current;
let histoty;
let win = false;
let index = 0;
// + Default position setup
let DFx = 1;
let DFy = 1;
let DFdirection = "s";
let angle = 0;
// + ----------------------------------------------------

// ! Assets Rotation
function rotate_and_draw_image(
  img,
  img_x,
  img_y,
  img_width,
  img_height,
  img_angle
) {
  // ! Set images to fit its
  imageMode(CENTER);

  // ! Alignment of map assets
  translate(img_x + img_width / 2, img_y + img_width / 2);

  // ! Fomula for converting integer to degree
  rotate((-PI / 180) * img_angle);

  // ! Load images
  image(img, 0, 0, img_width, img_height);

  // ! Fomula for converting  integer to degree
  rotate((PI / 180) * img_angle);

  // ! Alignment of map assets
  translate(-(img_x + img_width / 2), -(img_y + img_width / 2));
  imageMode(CORNER);
}

// ! World Components | Configuration
class WorldMap {
  constructor(map_data) {
    this.map_data = map_data;
    this.data = [];
    this.assets = {};
    this.rows = 0;
    this.cols = 0;

    // ! Store goal position
    this.goal = { x: -1, y: -1 };
    this.walkable = ["d", "m", "g", "e"];

    this.costs = {
      e: 1,
      d: 1,
      g: 2,
      m: 4,
      r: 10000,
      t: 10000,
      w: 10000,
      b: 10000,
    };

    this.setupMap();
    this.loadAssets();
  }

  setupMap() {
    let lines = this.map_data.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.length > 0) {
        this.data.push(line.split(""));
      }
    }
    this.rows = this.data.length;
    this.cols = this.data[0].length;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (this.data[i][j] == "e") {
          this.goal = { x: j, y: i };
        }
      }
    }
  }
  // ! Load assets image objects.
  loadAssets() {
    this.assets["d"] = loadImage("assets/dirt.png");
    this.assets["e"] = loadImage("assets/end.png");
    this.assets["g"] = loadImage("assets/grass.png");
    this.assets["m"] = loadImage("assets/mud.png");
    this.assets["r"] = loadImage("assets/rock.png");
    this.assets["t"] = loadImage("assets/tree.png");
    this.assets["w"] = loadImage("assets/water.png");
    this.assets["b"] = loadImage("assets/brick.png");
  }

  render() {
    textAlign(CENTER, CENTER);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < map.cols; j++) {
        let xpos = j * cz + mz;
        let ypos = i * cz + mz;
        fill(240);
        stroke(0);
        rect(xpos, ypos, cz, cz);
        fill(0);
        noStroke();
        //
        let a = 0;
        if (this.data[i][j] in this.assets) {
          if (this.data[i][j] == "e") {
            rotate_and_draw_image(this.assets["b"], xpos, ypos, cz, cz, a);
          } else {
            rotate_and_draw_image(this.assets["d"], xpos, ypos, cz, cz, a);
          }
          rotate_and_draw_image(
            this.assets[this.data[i][j]],
            xpos,
            ypos,
            cz,
            cz,
            a
          );
        } else {
          rotate_and_draw_image(this.assets["b"], xpos, ypos, cz, cz, a);
          text(this.data[i][j], xpos, ypos, cz, cz);
        }
      }
    }
  }

  check_wall(x, y) {
    // console.log("Check WAll: " + this.data[y][x] + " At " + x + " " + y);
    return !this.walkable.includes(this.data[y][x]);
  }
}
// ! Agent Actions | States | Configuration
class AgentState {
  // ! Set the location and direction of the agent and its assets.
  constructor(x, y, o, assets) {
    this.x = x;
    this.y = y;
    // ! Variable for storing direction of the agent.
    this.o = o;
    // ! ENUM for rotation.
    this.angles = { n: 180, e: 90, s: 0, w: 270 };
    if (!assets) {
      // ! Variable for storing the image object of the agent.
      this.assets = {};
      this.loadAssets();
    } else {
      this.assets = assets;
    }
  }
  // ! Load agent assets [Image]
  loadAssets() {
    this.assets["a"] = loadImage("assets/agent.png");
  }
  // ! Allow agent to moving forward, left, and right.
  actions() {
    return ["u", "d", "l", "r"];
  }
  // ! Check the cost of the current location/ terrain.
  cost() {
    let tile = map.data[this.y][this.x];
    return map.costs[tile];
  }

  // ! Function that related to agent movement [Important | Key]
  transition(action, mode) {
    let x = this.x;
    let y = this.y;
    let o = this.o;
    // + ----------------------------------------------------
    let i;
    // console.log("O: " + o + " and A: " + action);
    // + ----------------------------------------------------
    // ! Case of movement and direction [Key | Important]
    switch (action) {
      case "u":
        switch (angle) {
          case 0:
            y++;
            break;
          case 90:
            x++;
            break;
          case 180:
            y--;
            break;
          case 270:
            x--;
            break;
        }
        break;
      case "d":
        break;
      case "l":
        console.log("| L => Current direction: " + o);
        o = Object.keys(this.angles)[
          Object.values(this.angles).indexOf((angle -= 90))
        ];
        if (angle < 0) angle = 270;
        break;
      case "r":
        console.log("| R => Current direction: " + o);
        o = Object.keys(this.angles)[
          Object.values(this.angles).indexOf((angle += 90))
        ];
        if (angle == 360) angle = 0;
        break;
    }
    // ! Used for predict children
    if (!map.check_wall(x, y)) {
      return new AgentState(x, y, o, this.assets);
    } else {
      return new AgentState(this.x, this.y, o, this.assets);
    }
  }

  predictMove(action) {
    let x = this.x;
    let y = this.y;
    let o = this.o;
    switch (action) {
      case "u":
        y--;
        // o = "n";
        break;
      case "d":
        y++;
        // o = "s";
        break;
      case "l":
        x--;
        // o = "w";
        break;
      case "r":
        x++;
        // o = "e";
        break;
    }
    if (!map.check_wall(x, y)) {
      return new AgentState(x, y, o, this.assets);
    } else {
      return new AgentState(this.x, this.y, o, this.assets);
    }
  }
  // ! Distant metric between two points.
  /*
  +               B
  +          |----|
  +          |    |
  +         _|    |
  +       _|      |
  +  --> |        | <--
  +      |_       |  
  +       |_______|
  +      A    ^
  +           
  */
  manhattan(x0, y0, x1, y1) {
    return Math.abs(x0 - x1) + Math.abs(y0 - y1);
  }
  // ! Shortest path between two points.
  /*
  +             B
  +            /|
  +           / |
  +          /  |
  +         /   |
  +    --> /    | 
  +       /     |  
  +      /______|
  +     A          
  */
  euclidean(x0, y0, x1, y1) {
    return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
  }
  // ! Compute path from current position to goal.
  heuristic() {
    // return this.euclidean(this.x, this.y, map.goal.x, map.goal.y);
    return this.manhattan(this.x, this.y, map.goal.x, map.goal.y);
  }
  // ! Render agent position and direction.
  render() {
    let xpos = this.x * cz + mz;
    let ypos = this.y * cz + mz;
    rotate_and_draw_image(
      this.assets["a"],
      xpos + cz / 5,
      ypos + cz / 4,
      cz / 1.5,
      cz / 2,
      angle
    );
  }
}
// + ----------------------------- Exploration -----------------------
class SearchNode {
  constructor(state, parent, action) {
    this.state = state;
    this.parent = parent;
    this.action = action;
    this.x = this.state.x;
    this.y = this.state.y;
    this.good = true;
    if (parent) {
      // ! Cost from parent
      this.g = parent.g + state.cost();
    } else {
      // ! Its cost
      this.g = state.cost();
    }
    // ! Heuristic function
    this.h = state.heuristic();
    // !
    this.f = this.g + this.h;
  }

  value() {
    return this.f;
  }

  get_path() {
    let path = [];
    let node = this;
    while (node.parent) {
      path.push(node.action);
      node = node.parent;
    }
    return path.reverse();
  }

  get_path_nodes() {
    let path = [];
    let node = this;
    while (node.parent) {
      path.push(node);
      node = node.parent;
    }
    path.push(node);
    return path.reverse();
  }
}

class Explorer {
  constructor(start) {
    this.start = start;
    this.root = { node: this.start, children: [] };
    this.data = [];
    this.expand(this.root.node, this.root.children);
  }

  expand(node, children) {
    let actions = node.state.actions();
    children.splice(0, children.length);
    for (let i = 0; i < actions.length; i++) {
      let child = node.state.predictMove(actions[i]);
      if (child.x == node.x && child.y == node.y) {
        continue;
      }
      let childNode = new SearchNode(child, node, actions[i]);
      children.push({ node: childNode, children: [] });
    }
  }

  explorer(key) {
    let d = this.data[key];
    this.expand(d.node, d.children);
    history.splice(0, history.length);
    let nodes = d.node.get_path_nodes();
    for (let i = 0; i < nodes.length; i++) {
      history.push(nodes[i]);
    }
    state = history[history.length - 1].state;
    redraw();
    // this.renderSearchTree();
  }
  // ! How !!!!!!!!
  renderSearchTree() {
    this.data.splice(0, this.data.length);
    this.renderNode(explorer.root.node, explorer.root.children);
    let all_li = selectAll("div.search-item");
    for (let i = 0; i < all_li.length; i++) {
      let key = all_li[i].attribute("data");

      all_li[i].mouseClicked(this.explorer.bind(this, key));
    }
  }
  // ! How !!!!!!
  renderNode(node, children) {
    this.data.push({ node: node, children: children });
    for (let i = 0; i < children.length; i++) {
      this.renderNode(children[i].node, children[i].children);
    }
    st += "</ul></li>";
    return st;
  }
}
// + ------------------------- End Exploration -----------------------

// ! Load Components before hand
function preload() {
  map = new WorldMap(map_data);
  state = new AgentState(DFx, DFy, DFdirection);
}
// ! UI Configuration
function setup() {
  createCanvas(cz * map.cols + mz * 2, cz * map.rows + mz * 2);

  // + ----------------------------------------------------
  start = map.data[1][1];
  openSet.push(start);
  end = map.goal;
  // + ----------------------------------------------------

  redraw();
  noLoop();
}

function keyReleased() {
  let action = 0;
  if (keyCode === UP_ARROW) {
    action = "u";
  } else if (keyCode === DOWN_ARROW) {
    action = "f";
  } else if (keyCode === LEFT_ARROW) {
    action = "l";
  } else if (keyCode === RIGHT_ARROW) {
    action = "r";
  }
  if (keyCode === ENTER) console.log("Move");
  if (state.actions().includes(action)) {
    state = state.transition(action, "A");
    // history.push(new SearchNode(state, history[history.length - 1], action));
    redraw();
  }
}

// ! Components rendering
function draw() {
  map.render();
  state.render();
  // ! Uncommemted here
  UCS();
  // Astar();
  // GS();
}

function removeFromArray(arr, elt) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === elt) {
      arr.splice(i, 1);
    }
  }
}

function UCS() {
  let i;
  current = new SearchNode(state, null, null);
  explorer = new Explorer(current);
  let childNode = explorer.root.children;
  if ((state.x != end.x && state.y != end.y) || !win) {
    console.log("----- Progress -----");
    console.log(
      "| Current: x = " +
        state.x +
        " y = " +
        state.y +
        " With direction " +
        state.o
    );

    console.log("| Cuurent Children");
    if (childNode.length >= 0 && !win) {
      let Gn = [];
      let lowestG = childNode[0].node;
      for (i = 0; i < childNode.length; i++) {
        console.log(
          "| Action: " +
            childNode[i].node.action +
            " at (" +
            childNode[i].node.x +
            ", " +
            childNode[i].node.y +
            ") with F(" +
            childNode[i].node.f +
            ")"
        );
        if (!openSet.includes(childNode[i])) {
          if (childNode[i].node.x == end.x && childNode[i].node.y == end.y) {
            openSet.push("e");
          }
          openSet.push(
            "(" + childNode[i].node.x + ", " + childNode[i].node.y + ")"
          );
          Gn.push(childNode[i].node.g);
        } else {
          continue;
        }
        lowestG = childNode[Gn.indexOf(min(Gn))].node;
        closedSet.push(lowestG);
        removeFromArray(lowestG);
      }

      if (!win) {
        switch (state.o) {
          case "n":
            if (lowestG.action == "r") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "d") {
              state = state.transition("l", "A");
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "u") {
              state = state.transition("u", "A");
            } else if (lowestG.action == "l") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            }
            break;
          case "s":
            if (lowestG.action == "r") {
              state = state.transition(lowestG.action, "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "d") {
              state = state.transition("u", "A");
            } else if (lowestG.action == "u") {
              state = state.transition("l", "A");
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "l") {
              state = state.transition(lowestG.action, "A");
              state = state.transition("u", "A");
            }
            break;
          case "w":
            if (lowestG.action == "r") {
              state = state.transition(lowestG.action, "A");
              state = state.transition(lowestG.action, "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "d") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "u") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "l") {
              state = state.transition("u", "A");
            }
            break;
          case "e":
            if (lowestG.action == "r") {
              state = state.transition("u", "A");
            } else if (lowestG.action == "d") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "u") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            } else if (lowestG.action == "l") {
              state = state.transition(lowestG.action, "A");
              state = state.transition(lowestG.action, "A");
              state = state.transition("u", "A");
            }
            break;
        }
        state.render();
        redraw();
      } else {
        win = true;
        console.log("Win");
        noLoop();
      }

      //
    }
  }
  console.log("--------------------");
}
function GS() {
  let i;
  current = new SearchNode(state, null, null);
  explorer = new Explorer(current);
  let childNode = explorer.root.children;
  if ((state.x != end.x && state.y != end.y) || !win) {
    console.log("----- Progress -----");
    console.log(
      "| Current: x = " +
        state.x +
        " y = " +
        state.y +
        " With direction " +
        state.o
    );

    console.log("| Cuurent Children");
    if (childNode.length >= 0 && !win) {
      let Hs = [];
      let lowestH = childNode[0].node;
      for (i = 0; i < childNode.length; i++) {
        console.log(
          "| Action: " +
            childNode[i].node.action +
            " at (" +
            childNode[i].node.x +
            ", " +
            childNode[i].node.y +
            ") with F(" +
            childNode[i].node.f +
            ")"
        );
        if (!openSet.includes(childNode[i])) {
          if (childNode[i].node.x == end.x && childNode[i].node.y == end.y) {
            openSet.push("e");
          }
          openSet.push(
            "(" + childNode[i].node.x + ", " + childNode[i].node.y + ")"
          );
          Hs.push(childNode[i].node.h);
          lowestH = childNode[Hs.indexOf(min(Hs))].node;
        } else {
          continue;
        }
        closedSet.push(lowestH);
        removeFromArray(lowestH);
      }
      // console.log(
      //   "| Chosen Node will be (" +
      //     "" +
      //     lowestH.x +
      //     ", " +
      //     lowestH.y +
      //     ") with Lowest f(s): " +
      //     lowestH.f +
      //     " Action of " +
      //     lowestH.action
      // );

      // console.log(state.o, lowestH.action);
      if (!win) {
        switch (state.o) {
          case "n":
            if (lowestH.action == "r") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "d") {
              state = state.transition("l", "A");
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "u") {
              state = state.transition("u", "A");
            } else if (lowestH.action == "l") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            }
            break;
          case "s":
            if (lowestH.action == "r") {
              state = state.transition(lowestH.action, "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "d") {
              state = state.transition("u", "A");
            } else if (lowestH.action == "u") {
              state = state.transition("l", "A");
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "l") {
              state = state.transition(lowestH.action, "A");
              state = state.transition("u", "A");
            }
            break;
          case "w":
            if (lowestH.action == "r") {
              state = state.transition(lowestH.action, "A");
              state = state.transition(lowestH.action, "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "d") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "u") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "l") {
              state = state.transition("u", "A");
            }
            break;
          case "e":
            if (lowestH.action == "r") {
              state = state.transition("u", "A");
            } else if (lowestH.action == "d") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "u") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            } else if (lowestH.action == "l") {
              state = state.transition(lowestH.action, "A");
              state = state.transition(lowestH.action, "A");
              state = state.transition("u", "A");
            }
            break;
        }
        state.render();
        redraw();
      } else {
        win = true;
        console.log("Win");
        noLoop();
      }

      //
    }
  }
  console.log("--------------------");
}
function Astar() {
  let i;
  current = new SearchNode(state, null, null);
  explorer = new Explorer(current);
  let childNode = explorer.root.children;
  if ((state.x != end.x && state.y != end.y) || !win) {
    console.log("----- Progress -----");
    console.log(
      "| Current: x = " +
        state.x +
        " y = " +
        state.y +
        " With direction " +
        state.o
    );

    console.log("| Cuurent Children");
    if (childNode.length >= 0 && !win) {
      let Fs = [];
      let lowestF = childNode[0].node;
      for (i = 0; i < childNode.length; i++) {
        console.log(
          "| Action: " +
            childNode[i].node.action +
            " at (" +
            childNode[i].node.x +
            ", " +
            childNode[i].node.y +
            ") with F(" +
            childNode[i].node.f +
            ")"
        );
        if (!openSet.includes(childNode[i])) {
          if (childNode[i].node.x == end.x && childNode[i].node.y == end.y) {
            openSet.push("e");
          }
          openSet.push(
            "(" + childNode[i].node.x + ", " + childNode[i].node.y + ")"
          );
          Fs.push(childNode[i].node.f);
          lowestF = childNode[Fs.indexOf(min(Fs))].node;
        } else {
          continue;
        }
        closedSet.push(lowestF);
        removeFromArray(lowestF);
      }
      // console.log(
      //   "| Chosen Node will be (" +
      //     "" +
      //     lowestF.x +
      //     ", " +
      //     lowestF.y +
      //     ") with Lowest f(s): " +
      //     lowestF.f +
      //     " Action of " +
      //     lowestF.action
      // );

      // console.log(state.o, lowestF.action);
      if (!win) {
        switch (state.o) {
          case "n":
            if (lowestF.action == "r") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "d") {
              state = state.transition("l", "A");
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "u") {
              state = state.transition("u", "A");
            } else if (lowestF.action == "l") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            }
            break;
          case "s":
            if (lowestF.action == "r") {
              state = state.transition(lowestF.action, "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "d") {
              state = state.transition("u", "A");
            } else if (lowestF.action == "u") {
              state = state.transition("l", "A");
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "l") {
              state = state.transition(lowestF.action, "A");
              state = state.transition("u", "A");
            }
            break;
          case "w":
            if (lowestF.action == "r") {
              state = state.transition(lowestF.action, "A");
              state = state.transition(lowestF.action, "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "d") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "u") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "l") {
              state = state.transition("u", "A");
            }
            break;
          case "e":
            if (lowestF.action == "r") {
              state = state.transition("u", "A");
            } else if (lowestF.action == "d") {
              state = state.transition("l", "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "u") {
              state = state.transition("r", "A");
              state = state.transition("u", "A");
            } else if (lowestF.action == "l") {
              state = state.transition(lowestF.action, "A");
              state = state.transition(lowestF.action, "A");
              state = state.transition("u", "A");
            }
            break;
        }
        state.render();
        redraw();
      } else {
        win = true;
        console.log("Win");
        noLoop();
      }

      //
    }
  }
  console.log("--------------------");
}
