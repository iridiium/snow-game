var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var logs;
var snowballs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var gameOverText;
var restartText;
var wood_sound = new Audio('assets/wood_sound.mp3');

var game = new Phaser.Game(config);

function preload (){
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('log', 'assets/log.png');
    this.load.image('snowball', 'assets/snowball.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create(){
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400,570,'ground').setScale(2).refreshBody();
    platforms.create(800,470,'ground');  //Goes from lowest to highest - y value gets bigger the closer to ground
    platforms.create(200,470,'ground');
    platforms.create(300,390,'ground');
    platforms.create(400,390,'ground');
    platforms.create(650,310,'ground');
    platforms.create(350,230,'ground');
    platforms.create(500,150,'ground');

    player = this.physics.add.sprite(100, 450, 'dude');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    cursors = this.input.keyboard.createCursorKeys();
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); 

    logs = this.physics.add.group({
        key: 'log',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    logs.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    snowballs = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFFFFF' });
    controls = this.add.text(500, 16, 'Arrow keys to move', { fontSize: '24px', fill: '#FFFFFF' });
    objectives = this.add.text(278, 44, 'Collect the logs, avoid snowballs', { fontSize: '24px', fill: '#FFFFFF' });
    gameOverText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#FFFFFF' }); //The text for the last time
    restartText = this.add.text(16, 48, '', { fontSize: '32px', fill: '#FFFFFF' });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(logs, platforms);
    this.physics.add.collider(snowballs, platforms);

    this.physics.add.overlap(player, logs, collectLog, null, this);

    this.physics.add.collider(player, snowballs, hitSnowball, null, this);
}

function update(){

    if (cursors.left.isDown) {

        player.setVelocityX(-160);

        player.anims.play('left', true);

    } else if (cursors.right.isDown){

        player.setVelocityX(160);

        player.anims.play('right', true);

    } else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-250);
    }

    if (spaceBar.isDown && gameOver === true) {
        location.reload();
    }
}

function collectLog (player, log)
{
    log.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);
    wood_sound.play();

    if (logs.countActive(true) === 0) {

        logs.children.iterate(function (child) {
            controls.visible = false;
            objectives.visible = false;
            
            var y;
            var yPick = Math.floor(Math.random()*5);

            if (yPick==1) {
                y=430;
            } else if (yPick==2) {
                y=350;
            } else if (yPick==3) {
                y=270;
            }  else {
                y=0;
            }
            child.enableBody(true, child.x, y, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var snowball = snowballs.create(x, 16, 'snowball');
        snowball.setBounce(1);
        snowball.setCollideWorldBounds(true);
        snowball.setVelocity(Phaser.Math.Between(-200, 200), 20);
        snowball.allowGravity = false;

    }
}

function hitSnowball (player, snowball){
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;

    scoreText.visible = false;
    gameOverText = this.add.text(16, 16, 'Game Over! Your score was ' + score, { fontSize: '32px', fill: '#FFFFFF' });
    restartText.setText('Press Space to restart.')
}