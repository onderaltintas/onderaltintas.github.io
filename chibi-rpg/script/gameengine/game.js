var Game = function() {
  var lastRender = 0;
  var canvas = document.getElementById("canvas")
  var width = canvas.width = window.innerWidth;
  var height = canvas.height = window.innerHeight;
  var ctx = canvas.getContext("2d")
  var characterImage = new Image();
  var backgroundImage = new Image();
  var animState = 3;  
  var jumpPower = -999;
  var initialY = -999;
  var jumpStep = 0;
  var movementDirection = 0;
  var soundManager;
  var state = {
    x: (71),
    y: (187),
    pressedKeys: {
      left: false,
      right: false,
      up: false,
      down: false
    }
  }
  
  var keyMap = {
    39: 'right',
    37: 'left',
    38: 'up',
    40: 'down',
    32: 'jump'
  }
  
  function init(){
    backgroundImage.src = 'media/background2.jpg';
    characterImage.src = 'media/character1/move.png';
    window.addEventListener("keydown", keydown, false)
    window.addEventListener("keyup", keyup, false)
  }
 
  function keydown(event) {
    var key = keyMap[event.keyCode]
    state.pressedKeys[key] = true
  }
  
  function keyup(event) {
    var key = keyMap[event.keyCode]
    state.pressedKeys[key] = false
  }

  function update(progress) {
    movementDirection = 0;
    var moved = false;
    if (state.pressedKeys.left) {
        moved = true;
        state.x -= 2
        movementDirection = -1;
    }
    if (state.pressedKeys.right) {
      moved = true;
      state.x += 2
      movementDirection = +1;
    }
    if (state.pressedKeys.up) {
      moved = true;
      state.y -= 1
    }
    if (state.pressedKeys.down) {
      moved = true;
      state.y += 1
    }
    
    if (state.pressedKeys.jump) {
      if(initialY === -999){
        initialY = state.y;
      }
      
      if(jumpPower === -999) {
        jumpPower = 12;
      } else {
        jumpPower = jumpPower + 0.5 > 20? 20 : jumpPower + 0.5;
      }
    }

    if(initialY !== -999) 
    {
      jumpStep++;
      jumpPower = jumpPower - 1;
      state.y = state.y - jumpPower > initialY? initialY : state.y - jumpPower;
      
      state.y = state.y < 0 ? 0 : state.y;
      //superjump// state.x = state.x + (initialY - state.y);
      state.x = state.x + movementDirection * (initialY - state.y)/30;
      if(state.y === initialY){
        initialY = -999;
        jumpPower = -999;
        jumpStep = 0;
      }
    }
    
    if(state.y < 170 && jumpPower === -999) state.y = 170;
    // Flip position at boundaries
    if (state.x > width) {
      state.x -= width
    }
    else if (state.x < 0) {
      state.x += width
    }
    if (state.y > height) {
      state.y -= height
    }
    else if (state.y < 0) {
      state.y += height
    }
    
    if(moved) animState = (animState+1)%17;
    else animState = 0;
    
    document.getElementById('stateDiv').innerHTML = "x:"+state.x + " y:"+state.y;
  }
  
  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(backgroundImage, -0.5 * state.x , 0, canvas.width * 1.5, canvas.height * 1);
    ctx.drawImage(characterImage, 0 , animState * 100, 100, 100, state.x, state.y, 100, 100);
  }
  
  function loop(timestamp) {
    var progress = timestamp - lastRender;
    update(progress);
    draw()
    lastRender = timestamp
    window.requestAnimationFrame(loop)
  }

  this.run = function(){ 
    init();
    soundManager = new SoundManager();
    var music = new SoundFile("heyoh", "media/music/heyoh.ogg");
    soundManager.addMusic(music);
    soundManager.loopPlaylist();
    window.requestAnimationFrame(loop);
  }
  
  var self = this;
}

var game = new Game();
game.run();

