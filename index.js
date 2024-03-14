// import { sprite, fighter } from "./Js/classes"

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d"); //canvas_context

const gravity = 0.9;
//16 by 9 ratio good for most screens
canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

class sprite {
  constructor({ position, imageSrc, scale = 1, frames = 1 }) {
    // We are passing an object that contains two arguments for cleaner code and we won't have to remember the order
    this.position = position;
    this.width = 50;
    this.height = 150;
    this.image = new Image();
    this.image.src = imageSrc;
    this.framesMax = frames;
    this.scale = scale;
    this.currentFrame = 0;
    this.frameHold = 5;
    this.frameElapsed = 0;
  }

  draw() {
    c.drawImage(
      this.image,
      this.currentFrame * (this.image.width / this.framesMax),
      0,
      this.image.width / this.framesMax,
      this.image.height,
      this.position.x,
      this.position.y,
      (this.image.width / this.framesMax) * this.scale,
      this.image.height * this.scale
    );
  }

  update() {
    this.draw();
    this.frameElapsed += 1;

    // to give the shop an animation effect
    if (this.frameElapsed % this.frameHold == 0) {
      if (this.currentFrame < this.framesMax - 1) {
        this.currentFrame += 1;
      } else {
        this.currentFrame = 0;
      }
    }
  }
}

class fighter {
  constructor({ position, velocity, color, offset }) {
    // We are passing an object that contains two arguments for cleaner code and we won't have to remember the order
    this.position = position;
    this.velocity = velocity;
    this.width = 50;
    this.height = 150;
    this.lastKey;
    this.attackBox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: offset,
      width: 100,
      height: 50,
    };
    this.color = color;
    this.isAttacking;
    this.health = 100;
  }

  drawPlayer() {
    c.fillStyle = this.color;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);

    //attack box
    if (this.isAttacking) {
      c.fillStyle = "green";
      c.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
      );
    }
  }

  update() {
    this.drawPlayer();

    //Attack Box position
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y;

    //to update the position of player and enemy
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.position.y + this.height + this.velocity.y >= canvas.height - 75) {
      this.velocity.y = 0;
    } else {
      this.velocity.y += gravity; //as long as the player or enemy doesn't reach the end of canvas we will keep on adding gravity to give a falling effect
    }
    if (
      this.position.x + this.width >= canvas.width ||
      this.position.x + this.width <= 0
    ) {
      this.velocity.x = 0;
    }
  }

  attack() {
    this.isAttacking = true;
    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
  }
}

// classes fighter and sprite are in classes.js in Js folder
const background = new sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./assests/background2.jpg",
});

const shop = new sprite({
  position: {
    x: 600,
    y: 80,
  },
  imageSrc: "./assests/shop.png",
  scale: 3.0,
  frames: 6,
});

//player and enemy are moving objects
const player = new fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  color: "blue",
  offset: {
    x: 0,
    y: 0,
  },
});
// player.drawPlayer()
// console.log(player)

const enemy = new fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 10,
  },
  color: "red",
  offset: {
    x: -50, // value of x is -50 because attack box width is 100
    y: 0,
  },
});
// enemy.drawPlayer()
// enemy.drawPlayer()

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};

function rectanglarCollision({ recttangle1, recttangle2 }) {
  //rectangle1 => player, enemy ; rectangle2 => enemy, player
  return (
    recttangle1.attackBox.position.x + recttangle1.attackBox.width >=
      recttangle2.position.x &&
    recttangle1.attackBox.position.x <=
      recttangle2.position.x + recttangle2.width &&
    recttangle1.attackBox.position.y + recttangle1.attackBox.height >=
      recttangle2.position.y &&
    recttangle1.attackBox.position.y <=
      recttangle2.position.y + recttangle2.height
  );
}

function result({ player, enemy, timerId }) {
  clearTimeout(timerId);
  document.querySelector("#result").style.display = "flex";
  if (player.health == enemy.health) {
    document.querySelector("#result").innerHTML = "Tie";
    console.log("Tie");
  } else if (player.health > enemy.health) {
    document.querySelector("#result").innerHTML = "Player One Won";
  } else if (player.health < enemy.health) {
    document.querySelector("#result").innerHTML = "Player Two Won";
  }
}

let timer = 60;
let timerId;
function decreasetimer() {
  timerId = setTimeout(decreasetimer, 1000);
  if (timer > 0) {
    timer -= 1;
    document.querySelector("#timer").innerHTML = timer;
  }

  // End game after timer runs out
  if (timer == 0) {
    result({ player, enemy });
  }
}

decreasetimer();

//Since player and enemy are moving objects we need to define their direction (to the bottom)
// Create an infinite loop until we stop it so that player and enemy look like they are falling down
function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "Black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  player.update();
  enemy.update();
  // console.log("go")
  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // Player Movement
  if (keys.a.pressed && player.lastKey == "a") {
    // we use lastKey to override the key to the last pressed
    player.velocity.x = -7; //to move to the right
  } else if (keys.d.pressed && player.lastKey == "d") {
    player.velocity.x = 7; //to move to the left
  }

  // Enemy Movement
  if (keys.ArrowLeft.pressed && enemy.lastKey == "ArrowLeft") {
    // we use lastKey to override the key to the last pressed
    enemy.velocity.x = -7; //to move to the right
  } else if (keys.ArrowRight.pressed && enemy.lastKey == "ArrowRight") {
    enemy.velocity.x = 7; //to move to the left
  }

  // Detect collision for Player
  if (
    rectanglarCollision({ recttangle1: player, recttangle2: enemy }) &&
    player.isAttacking
  ) {
    player.isAttacking = false;
    // console.log("Player is Attacking")
    enemy.health -= 5;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }

  // Detect collision for Player
  if (
    rectanglarCollision({ recttangle1: enemy, recttangle2: player }) &&
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    // console.log("Enemy is Attacking")
    player.health -= 5;
    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  //End game based on health
  if (player.health <= 0 || enemy.health <= 0) {
    result({ player, enemy, timerId });
  }
}
animate();

window.addEventListener("keydown", (event) => {
  // to define movement of player
  switch (event.key) {
    case "d":
      keys.d.pressed = true; //to move to the right
      player.lastKey = "d";
      break;
    case "a":
      keys.a.pressed = true; //to move to the left
      player.lastKey = "a";
      break;
    case "w":
      player.velocity.y = -15;
      break;
    case " ":
      player.attack();
      break;
  }
  //to define movement enemy
  switch (event.key) {
    // to define movement of enemy
    case "ArrowRight": //written in the exact case as in the console of browser
      keys.ArrowRight.pressed = true; //to move to the right
      enemy.lastKey = "ArrowRight";
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true; //to move to the left
      enemy.lastKey = "ArrowLeft";
      break;
    case "ArrowUp":
      enemy.velocity.y = -15;
      break;
    case "0":
      enemy.attack();
      break;
  }
  // console.log(event.key)
});

window.addEventListener("keyup", (event) => {
  //player keys
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "w":
      player.velocity.y = 0;
      break;
  }
  //enemy keys
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowUp":
      enemy.velocity.y = 0;
      break;
  }
  // console.log(event.key)
});
