// --------------------------------------------------
// Game Loop Setup ----------------------------------
// --------------------------------------------------

var Game = {};

Game.fps = 100;
Game.theme = "light";

Game.draw = function() {
  drawPlayer();
  drawRocket();
  drawGrid();
  updateHealth();
};
Game.tick = function() {
  updateVar();
  Player.move();
  turnArrow();
  shoot();
  calcPlayer();
  Rocket.testCollision();
  rocketPos();
  calcScore();
};

function Color(r,g,b,id) {
  this.r = r;
  this.g = g;
  this.b = b;
  this.id = 0;
};

// !!! choose
/*var color0 = new Color(128, 33, 166,0); Lila +
var color1 = new Color(26, 156, 132,0); Türkis  */
/*var color0 = new Color(113, 13, 163,0); Lila +
var color1 = new Color(227, 213, 18,0); Gelb  */
/*var color0 = new Color(14, 59, 105,0); Blau +
var color1 = new Color(138, 11, 28,0); Rot  */
var color0 = new Color(37, 219, 232,0); // Cyan +
var color1 = new Color(255, 179, 231,0); // Rosa

var intensity = 1;

// Player Variables ---------------------------------

var Player = {};
Player.x = 0;
Player.y = 0;
Player.width = 90;
Player.height = 90;
Player.velocityX;
Player.velocityY;
Player.team = 0;
Player.team = prompt("Grün = 0, Blau = 1");
Player.maxhealth = 100;
Player.health = 100;
Player.color = color0;

// --------------------------------------------------

var Rocket = {};
Rocket.x;
Rocket.y;
Rocket.width = 40;
Rocket.height = 140;
Rocket.angle = 0;
Rocket.cornerAngles = [Math.atan(-20/75)*180/Math.PI,Math.atan(20/75)*180/Math.PI,Math.atan(-20/-65)*180/Math.PI,Math.atan(20/-65)*180/Math.PI];
Rocket.cornerDists = [Math.hypot(-20,75),Math.hypot(20,75),Math.hypot(-20,-65),Math.hypot(20,65)];
Rocket.flying = false;
var rocketCorners = [];
var frontGradient;
var sideGradient;

var hits = [];

// --------------------------------------------------

var hover = false;
var menu = false;

var vmin;
if (window.innerHeight < window.innerWidth) vmin = window.innerHeight;
else vmin = window.innerWidth;

var gameX = 0.5 * window.innerWidth - 0.675 * vmin;
var gameY = 0.5 * window.innerHeight - 0.45 * vmin;

const gameElem = document.getElementById("game");
const player = document.getElementById("player");
const arrow = document.getElementById("arrow");
const rocket = document.getElementById("rocket");
const arena = document.getElementById("arena").getContext("2d");
const text = document.getElementById("text");
const barGreen = document.getElementById("barG");
const barBlue = document.getElementById("barB");
const settings = document.getElementById("settings");
const menuDiv = document.getElementById("menu");
const settingsMenu = document.getElementById("settingsMenu");
const noShoot = document.getElementsByClassName("no-shoot");
const theme = document.getElementById("theme");
const slider = document.getElementById("slider");
const sliderIcon = document.getElementById("sliderIcon");

barGreen.style.backgroundColor = "rgb("+ color0.r +","+ color0.g +","+ color0.b +")";
barBlue.style.backgroundColor = "rgb("+ color1.r +","+ color1.g +","+ color1.b +")";

// --------------------------------------------------

var keysPressed = {};
var lastGridX;
var lastGridY;

var mouseX;
var mouseY;

var shot = false;
var shotCooldown = 0;
var shotVelocityX = 0;
var shotVelocityY = 0;

// WebSocket + Communication ------------------------

// Source - https://stackoverflow.com/a/22607328
// Posted by neel shah, modified by community. See post 'Timeline' for change history
// Retrieved 2026-02-06, License - CC BY-SA 4.0

function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

// ----------

var Web_Socket = {};
Web_Socket.url = GetURLParameter('ws');
Web_Socket.status = true;
if (Web_Socket.url == null || Web_Socket.url == "dev") Web_Socket.active = false;
else Web_Socket.active = true;
if (Web_Socket.active == true) {
  Web_Socket.server = new WebSocket(Web_Socket.url);
  Web_Socket.status = false;
  Web_Socket.server.addEventListener('open', (event) => {
    Web_Socket.status = true;
  });
  Web_Socket.server.addEventListener('close', (event) => {
    Web_Socket.status = false;
  });
  Web_Socket.server.addEventListener('error', (event) => {
    Web_Socket.status = true;
  });
};
Web_Socket.ownIndex;


function NewPlayer(x,y,team,rX,rY,angle,health) {
  this.x = x;
  this.y = y;
  this.team = team;
  this.rX = rX;
  this.rY = rY;
  this.angle = angle;
  this.health = health;
}

var players = [];
function addPlayer(number, xPos = 0, yPos = 0, team = 0, xPosR = 0, yPosR = 0, angle = 0, health = 100) {
  players[number] = new NewPlayer(xPos,yPos,team,xPosR,yPosR,angle,health);
  var newPlayer = document.createElement("div");
  newPlayer.innerHTML = number;
  newPlayer.style.width = 9 + "vmin";
  newPlayer.style.height = 9 + "vmin";
  if (team == 0) {
    newPlayer.style.backgroundColor = "rgb(50,210,50)";
  }
  else {
    newPlayer.style.backgroundColor = "rgb(50,50,210)";
  }
  newPlayer.style.position = "absolute";
  newPlayer.style.left = (players[number].x/10) + "vmin";
  newPlayer.style.top = (players[number].y/10) + "vmin";
  newPlayer.id = "player" + number;
  game.appendChild(newPlayer);

  var newRocket = document.createElement("div");
  newRocket.style.width = 4 + "vmin";
  newRocket.style.height = 14 + "vmin";
  newRocket.style.position = "absolute";
  newRocket.style.left = (players[number].rX/10) + "vmin";
  newRocket.style.top = (players[number].rY/10) + "vmin";
  newRocket.style.transformOrigin = "2vmin 7.5vmin";
  newRocket.style.backgroundColor = "green";
  newRocket.style.rotate = angle + "deg";
  newRocket.id = "rocket" + number;
  game.appendChild(newRocket);

  var newHealth = document.createElement("div");
  newHealth.style.position = "absolute";
  newHealth.style.backgroundColor = "red";
  newHealth.style.zIndex="1";
  newHealth.style.width = (0.09*players[number].health) + "vmin";
  newHealth.style.height = "1vmin";
  newHealth.style.top = "105%"
  newHealth.id = "health" + number;
  document.getElementById(`player${number}`).appendChild(newHealth);
  console.log("NEW PLAYER");
};

if (Web_Socket.active == true) {
  Web_Socket.server.onmessage = e => {
    recievedData = JSON.parse(e.data);
    if (recievedData["type"] == 0) {
      if (recievedData["id"] == 0) {
        Web_Socket.ownIndex = recievedData["data"];
      }
      else if (recievedData["id"] == 1) {
        addPlayer(recievedData["data"]);
      }
      else if (recievedData["id"] == 2) {
        addPlayer(recievedData["client"],
                  recievedData["data"][0],
                  recievedData["data"][1],
                  recievedData["data"][2],
                  recievedData["data"][3],
                  recievedData["data"][4],
                  recievedData["data"][5],
                  recievedData["data"][6]
                );
        console.log(recievedData["data"][0],recievedData["data"][1]);
      }
      else if (recievedData["id"] == 3) {
        game.removeChild(document.getElementById(`player${recievedData["data"]}`));
        game.removeChild(document.getElementById(`rocket${recievedData["data"]}`));
        delete players[recievedData["data"]];
      };
    }
    else if (recievedData["type"] == 1) {
      if (recievedData["client"] == Web_Socket.ownIndex) {
        Player.health = recievedData["data"][6];
      }
      else {
        players[recievedData["client"]].x = recievedData["data"][0];
        players[recievedData["client"]].y = recievedData["data"][1];
        players[recievedData["client"]].rX = recievedData["data"][3];
        players[recievedData["client"]].rY = recievedData["data"][4];
        document.getElementById("player" + recievedData["client"]).style.left = (players[recievedData["client"]].x/10) + "vmin";
        document.getElementById("player" + recievedData["client"]).style.top = (players[recievedData["client"]].y/10) + "vmin";
        document.getElementById("rocket" + recievedData["client"]).style.left = players[recievedData["client"]].rX/10 + "vmin";
        document.getElementById("rocket" + recievedData["client"]).style.top = players[recievedData["client"]].rY/10 + "vmin";
        document.getElementById("rocket" + recievedData["client"]).style.rotate = recievedData["data"][5] + "deg";
        players[recievedData["client"]].health = recievedData["data"][6];
        document.getElementById("health" + recievedData["client"]).style.width = (players[recievedData["client"]].health * 0.09) + "vmin";
      };
    };
  };
};

Game.sendData = function() {
  if (Web_Socket.active == true) {
    Web_Socket.server.send(JSON.stringify({
      x: Player.x,
      y: Player.y,
      team: Player.team,
      rocketX: Rocket.x,
      rocketY: Rocket.y,
      angle: Rocket.angle,
      health: Player.health,
      hits: hits
    }));
    hits = [];
  };
};

// --------------------------------------------------

function Tile(type = 0,color = -1) {
  this.type = type;
  this.color = color;
};

var walls = [[4,1],[5,1],[6,1],[7,1],[4,2],[4,3],[4,4],[5,4],[6,4],[4,5],[4,6],[4,7]] // [x,y]

var grid = [[],[],[],[],[],[],[],[],[],[],[],[]];

for (var x = 0; x < 16; x++) {
  for (var y = 0; y < 11; y++) {
    grid[y][x] = new Tile(0,-1);
  };
};

for (var wall in walls) {
  grid[walls[wall][1]][walls[wall][0]].type = 1;
};

// --------------------------------------------------


function calcScore() {
  var totalColorG = 0;
  var totalColorB = 0;
  for (var x = 0; x < 16; x++) {
    for (var y = 0; y < 11; y++) {
      if (grid[y][x].color >= 0) {
        totalColorG += grid[y][x].color;
        if ( 255 - grid[y][x].color >= 0) totalColorB += 255 - grid[y][x].color;
      };
    };
  };
  // max score: 35190
  var totalColor = totalColorG+totalColorB;
  //round to two decimals
  totalColorG = Math.round(totalColorG*100)/100;
  totalColorB = Math.round(totalColorB*100)/100;
  var relativeColorG = Math.round((totalColorG*100/totalColor)*100)/100;
  var relativeColorB = Math.round((totalColorB*100/totalColor)*100)/100;
  text.innerHTML = `Green: ${totalColorG} - ${totalColorG/351.90}% --- Blue: ${totalColorB} - ${totalColorB/351.90}%`;
  barGreen.style.width = (relativeColorG*1.35) + "vmin";
  barBlue.style.width = (relativeColorB*1.35) + "vmin";
  barBlue.style.left = (relativeColorG*1.35) + "vmin";
};


// --------------------------------------------------

document.addEventListener('keydown', function (event) {
    keysPressed[event.key.toUpperCase()] = true;
    if (event.key.toUpperCase() == "F") {
      if (Player.team == 0) {
        Player.team = 1;
      }
      else Player.team = 0;
    };
    if (event.code === "Escape") menu = false;
});

document.addEventListener('keyup', function (event) {
    delete keysPressed[event.key.toUpperCase()];
});

document.addEventListener('mousemove', function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

document.addEventListener('mousedown', function(event) {
  if (shotCooldown == 0 && hover == false) {
    Rocket.flying = true;
    shot = true;
  };
});

// listen for hover of no-shoot element -> supress shooting while clicking these
for (var element = 0; element < noShoot.length; element++) {
  noShoot[element].addEventListener('mouseover', function(event) {
    hover = true;
  });

  noShoot[element].addEventListener('mouseout', function(event) {
    hover = false;
  });
};

settings.addEventListener('click', function(event) {
  menu = !menu;
});

// slider
var sliderActive = false;
sliderIcon.addEventListener('mousedown', function(event) {
  sliderActive = true;
});

document.addEventListener('mouseup', function(event) {
  sliderActive = false;
});

slider.addEventListener('mousedown', function(event) {
  intensity = event.layerX/vmin+0.2;
});

theme.addEventListener('click', function(event) {
  if (Game.theme == "light") {
    document.body.style.backgroundColor = "#303033";
    menuBG.style.backgroundColor = "#303035";
    game.style.backgroundColor = "#505050";
    intensity = 0.7;
    theme.style.filter = "invert(0.6)";
    theme.src = "hellesonne.png";
    settings.style.filter = "invert(0.6)";
    sliderIcon.style.filter = "invert(0.6)";
    Game.theme = "dark";
  }
  else if (Game.theme == "dark") {
    document.body.style.backgroundColor = "#FFFFFF";
    menuBG.style.backgroundColor = "#909093";
    game.style.backgroundColor = "lightgray";
    intensity = 1;
    theme.style.filter = "invert(0)";
    theme.src = "mond.png";
    settings.style.filter = "invert(0)";
    sliderIcon.style.filter = "invert(0)";
    Game.theme = "light";
  };
});

function updateVar() {
  if (window.innerHeight < window.innerWidth) vmin = window.innerHeight;
  else vmin = window.innerWidth;
  gameX = 0.5 * window.innerWidth - 0.675 * vmin;
  gameY = 0.5 * window.innerHeight - 0.45 * vmin;
  if (shotCooldown > 0) shotCooldown -= 1;
  Player.velocityY = shotVelocityY;
  Player.velocityX = shotVelocityX;
  if (shotVelocityX != 0) shotVelocityX *= 0.9;
  if (shotVelocityY != 0) shotVelocityY *= 0.9;
  if (Math.abs(shotVelocityX) < 0.1) shotVelocityX = 0;
  if (Math.abs(shotVelocityY) < 0.1) shotVelocityY = 0;
};

Player.move = function() {
  if (keysPressed["W"]) {
      Player.velocityY -= 5;
  };
  if (keysPressed["A"]) {
      Player.velocityX -= 5;
  };
  if (keysPressed["S"]) {
      Player.velocityY += 5;
  };
  if (keysPressed["D"]) {
      Player.velocityX += 5;
  };
};

function turnArrow() {
  angle = Math.atan((Player.y/1000*vmin+45+gameY-mouseY)/(Player.x/1000*vmin+45+gameX-mouseX))*180/Math.PI+90;
  if (mouseX <= Player.x/1000*vmin+45+gameX) angle += 180;
  arrow.style.rotate = angle + "deg";
};

// !!! rocket "clone"
function shoot() {
  if (shot == true) {
    shotCooldown = 75;
    shotVelocityX += -25 * Math.cos(((angle-90) * Math.PI) / 180);
    shotVelocityY += -25 * Math.sin(((angle-90) * Math.PI) / 180);
    Rocket.flying = true;
    shot = false;
  };
};

Rocket.explode = function() {
  if (shotCooldown <= 73) {
    var explosionPointX = Rocket.x+20+75*Math.cos((Rocket.angle-90)*Math.PI/180);
    var explosionPointY = Rocket.y+75+75*Math.sin((Rocket.angle-90)*Math.PI/180);
    document.getElementById("test").style.left = explosionPointX/10 + "vmin";
    document.getElementById("test").style.top = explosionPointY/10 + "vmin";
    // check own distance
    var distX = Player.x+45-explosionPointX;
    var distY = Player.y+45-explosionPointY;
    var dist = Math.hypot(distX,distY);
    if (dist <= 164) {
      var damage = Math.round(164-dist);
      console.log(`Self hit at ${dist} = ${damage}`);
      Player.health -= damage; // apply damage
      if (Player.health < 0) Player.health = 0;
      if (dist < 64) {
        console.log(`Killed self`);
      };
    };
    // check others distance
    for (var player in players) {
      var distX = players[player].x+45-explosionPointX;
      var distY = players[player].y+45-explosionPointY;
      var dist = Math.hypot(distX,distY);
      if (dist <= 164) {
        var damage =  Math.round(164-dist);
        console.log(`player${player} hit at ${dist} = ${damage}`);
        hits.push([player,damage]); // save damage (sent with next packet)
      };
    };
    Rocket.flying = false;
    rocket.style.opacity = "10%";
  };
};

function rocketSquareCollision(xVal, yVal, size) {
  for (var k = 0; k <= 1; k++) { // change variables for x and y testing
    var mainPos;
    var secPos;
    if (k == 0) {
      mainPos = xVal;
      secPos = yVal;
    }
    else if (k == 1) {
      mainPos = yVal;
      secPos = xVal;
    };
    for (var j = 0; j <= 1; j++) { // chech two parallel sides of rocket each
      for (var sides = 0; sides <= 1; sides++) { // change variables for sides of rocket
        var corner1;
        var corner2;
        var gradient;
        if (sides == 0) {
          corner1 = 0+j;
          corner2 = 2+j;
          gradient = sideGradient;
        }
        else if (sides == 1) {
          corner1 = 0+(j*2);
          corner2 = 1+(j*2);
          gradient = frontGradient;
        };
        for (var i = 0; i <= 1; i++) { // check two parallel sides of wall each
          if ((rocketCorners[corner1][k] < mainPos+i*size && mainPos+i*size < rocketCorners[corner2][k]) || (rocketCorners[corner1][k] > mainPos+i*size && mainPos+i*size > rocketCorners[corner2][k])) {
            var mainCollisionDist = mainPos+i*size-rocketCorners[corner1][k];
            if (k == 0) var secCollisionDist = gradient*mainCollisionDist;
            else var secCollisionDist = mainCollisionDist/gradient;
            if (rocketCorners[corner1][1-k]+secCollisionDist > secPos && rocketCorners[corner1][1-k]+secCollisionDist < secPos+size) {
              return true;
            };
          };
        };
      };
    };
  };
};

Rocket.testCollision = function() {
  if (Rocket.flying) {
    var collision = false;
    var smallestX = 30;
    var biggestX = 0;
    var smallestY = 30;
    var biggestY = 0;
    for (var x = 0; x < 4; x++) {
      var invert = 1;
      if (x/2 >= 1) invert = -1;
      rocketCorners[x] = [
        Rocket.x+20+(Rocket.cornerDists[x])*invert*Math.cos((Rocket.angle-90+Rocket.cornerAngles[x])*Math.PI/180),
        Rocket.y+75+(Rocket.cornerDists[x])*invert*Math.sin((Rocket.angle-90+Rocket.cornerAngles[x])*Math.PI/180)
      ];
      if (Math.floor(rocketCorners[x][0]/90) < smallestX) smallestX = Math.floor(rocketCorners[x][0]/90);
      if (Math.floor(rocketCorners[x][0]/90) > biggestX) biggestX = Math.floor(rocketCorners[x][0]/90);
      if (Math.floor(rocketCorners[x][1]/90) < smallestY) smallestY = Math.floor(rocketCorners[x][1]/90);
      if (Math.floor(rocketCorners[x][1]/90) > biggestY) biggestY = Math.floor(rocketCorners[x][1]/90);
    };
    frontGradient = Math.tan(Rocket.angle*Math.PI/180);
    sideGradient = Math.tan((Rocket.angle-90)*Math.PI/180);

    for (var gridX = smallestX; gridX <= biggestX; gridX++) { // iterate through possible colliding squares
      for (var gridY = smallestY; gridY <= biggestY; gridY++) { // iterate
        if (gridX >= 0 && gridY >= 0 && gridX <= 15 && gridY <= 10) { // confine arena
          if (grid[gridY][gridX].type == 1) { // test if wall
            if (rocketSquareCollision(gridX*90,gridY*90,90)) collision = true; // collision test for walls
          };
        };
      };
    };
    for (var player in players) {
      if(rocketSquareCollision(players[player].x,players[player].y,Player.width)) collision = true; // collision test for players
    };
    // !!! rocket x rocket
    if (collision) {
      Rocket.explode();
    };
  };
};

function calcPlayer() {
  var realPlayerX = Player.x+45;
  var realPlayerY = Player.y+45;
  var gridPlayerX = Math.floor(realPlayerX/90);
  var gridPlayerY = Math.floor(realPlayerY/90);
  var gridLeftPlayer = Math.floor(Player.x/90);
  var gridRightPlayer = Math.floor(Player.x/90+0.99);
  var gridTopPlayer = Math.floor(Player.y/90);
  var gridBottomPlayer = Math.floor(Player.y/90+0.99);
  var xEdge = 0;
  var yEdge = 0;
  if (Player.velocityX > 0) xEdge = 1;
  if (Player.velocityY > 0) yEdge = 1;
  if (Player.x+90*xEdge+Player.velocityX < 1260 && Player.x+90*xEdge+Player.velocityX > 0) {
    var nextGridX = Math.floor((Player.x+90*xEdge+Player.velocityX)/90);
    if (gridTopPlayer != gridPlayerY) {
      if (grid[gridTopPlayer][nextGridX].type == 1) {
        Player.velocityX = nextGridX*90+90-90*xEdge-(Player.x+90*xEdge);
      };
    };
    if (gridBottomPlayer != gridPlayerY) {
      if (grid[gridBottomPlayer][nextGridX].type == 1) {
        Player.velocityX = nextGridX*90+90-90*xEdge-(Player.x+90*xEdge);
      };
    };
    if (grid[gridPlayerY][nextGridX].type == 1) {
      Player.velocityX = nextGridX*90+90-90*xEdge-(Player.x+90*xEdge);
    };
  };

  if (Player.y+90*yEdge+Player.velocityY < 810 && Player.y+90*yEdge+Player.velocityY > 0) {
    var nextGridY = Math.floor((Player.y+90*yEdge+Player.velocityY)/90);
    if (gridLeftPlayer != gridPlayerX) {
      if (grid[nextGridY][gridLeftPlayer].type == 1) {
        Player.velocityY = nextGridY*90+90-90*yEdge-(Player.y+90*yEdge);
      };
    };
    if (gridRightPlayer != gridPlayerX) {
      if (grid[nextGridY][gridRightPlayer].type == 1) {
        Player.velocityY = nextGridY*90+90-90*yEdge-(Player.y+90*yEdge);
      };
    };
    if (grid[nextGridY][gridPlayerX].type == 1) {
      Player.velocityY = nextGridY*90+90-90*yEdge-(Player.y+90*yEdge);
    };
  };
  Player.x += Player.velocityX;
  Player.y += Player.velocityY;
  if (Player.x < 0) Player.x = 0;
  if (Player.x > 1260) Player.x = 1260;
  if (Player.y < 0) Player.y = 0;
  if (Player.y > 810) Player.y = 810;
};

function rocketPos() {
  if (shotCooldown == 0) {
    Rocket.x = Player.x+25;
    Rocket.y = Player.y-30;
    document.getElementById("test2").style.left = Rocket.x/10 + "vmin";
    document.getElementById("test2").style.top = Rocket.y/10 + "vmin";
    Rocket.angle = angle;
    Rocket.flying = false;
    rocket.style.opacity = "100%";
  }
  else {
    if (Rocket.flying) {
      Rocket.x += 15 * Math.cos(((Rocket.angle-90) * Math.PI) / 180);
      Rocket.y += 15 * Math.sin(((Rocket.angle-90) * Math.PI) / 180);
    };
  };
};

function drawPlayer() {
  player.style.top = Player.y/10 + "vmin";
  arrow.style.top = (Player.y-7)/10 + "vmin";
  player.style.left = Player.x/10 + "vmin";
  arrow.style.left = (Player.x+23)/10 + "vmin";

  var gridPlayerX = Math.floor((Player.x+45)/90);
  var gridPlayerY = Math.floor((Player.y+45)/90);
  var team0Color;
  var team1Color;

  if (!(lastGridX == gridPlayerX && lastGridY == gridPlayerY)) {
    if (grid[gridPlayerY][gridPlayerX].color != -1) {
      if (Player.team == 0) {
        grid[gridPlayerY][gridPlayerX].color += (255 - grid[gridPlayerY][gridPlayerX].color)/2;
      };
      if (Player.team == 1) {
        grid[gridPlayerY][gridPlayerX].color *= 0.5;
      };
    }
    else {
      if (Player.team == 0) grid[gridPlayerY][gridPlayerX].color = 255;
      else grid[gridPlayerY][gridPlayerX].color = 0;
    };
    team0Color = grid[gridPlayerY][gridPlayerX].color;
    team1Color = 255 - grid[gridPlayerY][gridPlayerX].color;
    lastGridX = gridPlayerX;
    lastGridY = gridPlayerY;
    // !!! send
  };
};

function drawRocket() {
  rocket.style.top = Rocket.y/10 + "vmin";
  rocket.style.left = Rocket.x/10 + "vmin";
  rocket.style.rotate = Rocket.angle + "deg";
};

function updateHealth() {
  document.getElementById("health").style.width = (30*Player.health/100) + "vmin";
};

function drawGrid() {
  //arena.clearRect(0,0,1100,600);
  for (y = 0; y < 10; y++) {
    for (x = 0; x < 15; x++) {
      if (grid[y][x].type == 1) {
        arena.fillStyle = "black";
        arena.fillRect(x*90,y*90,90,90);
      };
      if (grid[y][x].color != -1) {
        team0Color = grid[y][x].color;
        team1Color = 255 - grid[y][x].color;
        arena.fillStyle = "rgb("+ ((Player.color.r*team0Color+color1.r*team1Color)/255*intensity) + "," + ((Player.color.g*team0Color+color1.g*team1Color)/255*intensity) + "," + ((Player.color.b*team0Color+color1.b*team1Color)/255*intensity)  + ")";
        arena.fillRect(x*90,y*90,90,90);
        // !!! send
      };
    };
  };
};

Game.updateMenus = function() {
  if (menu) {
    settingsMenu.style.visibility = "visible";
    menuBG.style.visibility = "visible";
  }
  else {
    settingsMenu.style.visibility = "hidden";
    menuBG.style.visibility = "hidden";
  };
  if (sliderActive) {
    intensity = (mouseX - 0.5*window.innerWidth + 0.45*vmin)/vmin + 0.25;
    if (intensity < 0.2) intensity = 0.2;
    else if (intensity > 1) intensity = 1;
  }
  sliderIcon.style.left = (intensity-0.25)*vmin + "px";
  barGreen.style.backgroundColor = "rgb("+ (color0.r*intensity) +","+ (color0.g*intensity) +","+ (color0.b*intensity) +")";
  barBlue.style.backgroundColor = "rgb("+ (color1.r*intensity) +","+ (color1.g*intensity) +","+ (color1.b*intensity) +")";
};

var count = 0;

Game.run = function() {
  if (Web_Socket.status == 0) { // Waiting for connection
    console.log("Loading...");
  };
  if (Web_Socket.status == 1) { // Connected
    count += 1;
    //if ((count/63)%1 == 0) console.log(count/63);
    Game.tick();
    Game.draw();
    Game.sendData();
    Game.updateMenus();
    if (Player.health < 100) Player.health += 0.15;
  };
};

Game.interval = setInterval(Game.run, 1000 / Game.fps);

