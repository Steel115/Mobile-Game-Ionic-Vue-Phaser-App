import { Scene } from "phaser";

export class PlayScene extends Scene {
    constructor () {
      super({ key: 'PlayScene' })
    }
    preload ()
{
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('platform', 'assets/platform.png');
    this.load.image('leftArrow', 'assets/leftarrow.png');
    this.load.image('rightArrow', 'assets/rightarrow.png');
    this.load.spritesheet('player', 
        'assets/player.png',
        { frameWidth: 32, frameHeight: 48 }
    );
  }
    create () {
    // Establece los valores del juego según el tamaño de la pantalla.
    this.screenWidth = this.scale.width;
    this.screenHeight = this.scale.height;
    this.screenCenterX = this.screenWidth / 2;
    this.controlsAreaHeight = this.screenHeight * 0.2;
    this.gameAreaHeight = this.screenHeight - this.controlsAreaHeight;

    // Agrega el jugador, la plataforma y los controles.
    // staticImage(0) es el eje de las x.
    this.platform = this.physics.add.staticImage(0, this.gameAreaHeight, 'platform').setOrigin(0, 0).refreshBody();
    this.platform.displayWidth = this.screenWidth;

    this.player = this.physics.add.sprite(this.screenCenterX, this.gameAreaHeight - 24, 'player');
    this.leftArrow = this.add.image(this.screenWidth * 0.1, this.gameAreaHeight + 40, 'leftArrow').setOrigin(0, 0).setInteractive()
    this.rightArrow = this.add.image(this.screenWidth * 0.7, this.gameAreaHeight + 40, 'rightArrow').setOrigin(0, 0).setInteractive()
   
//Salto
// Variable para almacenar el tiempo entre toques
let lastTapTime = 0;
const doubleTapThreshold = 300; // Umbral para considerar un doble toque (en milisegundos)
// evita saltos cuando no está en el suelo
let isJumping = false;

this.input.on('pointerdown', (pointer) => {
  const currentTime = Date.now(); // Se obtiene el tiempo
  // Si se hace el doble toque dentro del umbral se realiza el salto
  if (currentTime - lastTapTime <= doubleTapThreshold && !isJumping) {
    this.jump(); // Se realiza el salto
  }
  // Se actualiza el tiempo del ultimo toque
  lastTapTime = currentTime;
});
this.jump = () => {
  if (this.player.body.onFloor()) {
    // Marca al si esta saltando
    isJumping = true;
    // Salto
    this.player.setVelocityY(-200); // Velocidad negativa para saltar
  }
};

// Detecta cuando el jugador vuelve al suelo
this.physics.world.on('worldstep', () => {
  if (this.player.body.onFloor() && isJumping) {
    // Permite saltar de nuevo
    isJumping = false;
  }
});
//salto
   
  if (!this.anims.exists('left')) {
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  if (!this.anims.exists('turn')) {
    this.anims.create({
      key: "turn",
      frames: [{ key: 'player', frame: 4 }],
    });
  }

  if (!this.anims.exists('right')) {
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }
// Establece la física del jugador
this.player.body.setGravityY(300);
this.player.setCollideWorldBounds(true);

//agrega un colisionador entre el jugador y las plataforma
this.physics.add.collider(this.player, this.platform);

// controladores de eventos para entrada de flecha
this.moveLeft = false;
this.moveRight = false;

this.leftArrow.on('pointerdown', () => {
this.moveLeft = true;
});

this.leftArrow.on('pointerup', () => {
this.moveLeft = false;
});

this.rightArrow.on('pointerdown', () => { 
this.moveRight = true;
});

this.rightArrow.on('pointerup', () => {
this.moveRight = false;
});

// agregamos la generacion de estrellas.
this.stars = this.physics.add.group({
  gravityY: 300,
 });
 const createStar = () => {
  const x = Math.random() * this.screenWidth;
  const star = this.stars.create(x, 0, 'star');
 }
 const createStarLoop = this.time.addEvent({
  //Número aleatorio entre 1 y 1,2 segundos.
  delay: Math.floor(Math.random() * (1200 - 1000 + 1)) + 1000,
  callback: createStar,
  callbackScope: this,
  loop: true,
 });
 // agregamos generacion de bombas.
  this.bombs = this.physics.add.group({
    gravityY: 900,
  });
  //bomba a los lados y arriba
  const createBomb = () => {
    const bombType = Math.random() < 0.5 ? 'falling' : 'side'; // Decide el tipo de bomba.
    if (bombType === 'falling') {
      // Bomba que cae de arriba.
      const x = Math.random() * this.screenWidth;
      const bomb = this.bombs.create(x, 0, 'bomb'); // Crea la bomba que cae desde arriba.
      const scale = Phaser.Math.FloatBetween(1, 3); // Tamaño de las bombas.
      bomb.setScale(scale).refreshBody();
    } else {
      // Bomba que aparece al nivel del jugador desde los lados.
      const side = Math.random() < 0.5 ? 'left' : 'right';
      const x = side === 'left' ? 0 : this.screenWidth;
      const y = this.player.y; // Poicion en la que se encontra el jugador.
      const bomb = this.bombs.create(x, y, 'bomb');
      const velocityX = side === 'left' ? 200 : -200; // Velocidad horizontal hacia el centro.
      bomb.setVelocityX(velocityX); // Se aplica la velocidad.
      bomb.setScale(2).refreshBody();
      bomb.setGravityY(0); // No se afecta por la gravedad.
    }
  };
  //bombas
  const createBombLoop = this.time.addEvent({
    // Número aleatorio entre 4.5 y 5 segundos.
    delay: Math.floor(Math.random() * (5000 - 4500 + 1)) + 4500,
    callback: createBomb,
    callbackScope: this,
    loop: true,
  });

  // colisiones entre el jugador y las bombas.
  this.physics.add.collider(this.stars, this.platform, function(object1, object2) {
    const star = (object1.key === 'star') ? object1 : object2;
    star.destroy();
  });
  
  this.physics.add.collider(this.bombs, this.platform, function(object1, object2) {
    const bomb = (object1.key === 'bomb') ? object1 : object2;
    bomb.destroy();
  });

  //Añade superposición entre el jugador y las estrellas.
this.score = 0;
this.scoreText = this.add.text(this.screenCenterX, this.gameAreaHeight + 16, 'Score: 0', { fontSize: '16px', fill: '#000' }).setOrigin(0.5, 0.5);

this.physics.add.overlap(this.player, this.stars, function(object1, object2) {
  const star = (object1.key === 'player') ? object1 : object2;
  star.destroy();
  this.score += 10;
  this.scoreText.setText('Score: ' + this.score);
}, null, this);

// Añade superposición entre el jugador y las bombas.

this.physics.add.overlap(this.player, this.bombs, function(object1, object2) {
  const bomb = (object1.key === 'player') ? object1 : object2;
  bomb.destroy();

  createStarLoop.destroy();
  createBombLoop.destroy();
  this.physics.pause();

  const gameEndEvent = new CustomEvent("gameEnded", {
    detail: { score: this.score }
 });

 window.dispatchEvent(gameEndEvent);

  
  this.scene.stop('PlayScene')
  this.scene.start('ScoreScene',{score:this.score});

 
}, null, this);
}

update () {
  if (this.moveLeft && !this.moveRight) {
    this.player.setVelocityX(0 - 200);   
    this.player.anims.play('left', true);
  }

  else if (this.moveRight && !this.moveLeft) {
     this.player.setVelocityX(200);    
     this.player.anims.play('right', true);
  }

  else {
    this.player.setVelocityX(0);
    this.player.anims.play('turn');
  }
}
}