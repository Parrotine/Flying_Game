/* 

Steve code 

*/


/* Step 1: Create Steve! */

var Steve = function(){
    
    var frames = [
        PIXI.Texture.fromImage('assets/characterFlying_01.png'),
        PIXI.Texture.fromImage('assets/characterFlying_02.png'),
        PIXI.Texture.fromImage('assets/characterFlying_03.png')
    ];
    
    PIXI.MovieClip.call(this, frames);
    this.anchor.set(0.5);
    this.speed = new PIXI.Point();
    this.gravity = 0.4;
    this.maxSpeed = 10;
    this.position.x = 240;
    this.spinSpeed = 0;
    this.play();
    this.animationSpeed = 0.4;
}

Steve.prototype = Object.create( PIXI.MovieClip.prototype );

/* Step 2: Make him fly! */

Steve.prototype.flap = function(){
    this.speed.y -= 15;
}

/* Step 3: Make him hit */

Steve.prototype.hit = function(){
    this.speed.y -= 15;
    this.spinSpeed = 0.1;
}

/* Step 4: Create a reset function to revert Steve */

Steve.prototype.reset = function(){
    this.position.y = 200;
    this.speed.y = 0;
    this.spinSpeed = 0;
    this.rotation = 0;
}

/* Step 5: Make sure he updates! */

Steve.prototype.update = function(){
    this.speed.y += this.gravity;
    this.speed.y = Math.min(this.speed.y, this.maxSpeed);
    this.speed.y = Math.max(this.speed.y, -this.maxSpeed);
    this.position.y += this.speed.y;
    this.rotation += this.spinSpeed;
}


/* EXTRA Trail class code */
Trail = function(target){
    PIXI.DisplayObjectContainer.call( this );
    this.target = target;
    this.particles = [];
    var total = 20;
    
    for (var i = 0; i < total; i++) {
        var particle = new PIXI.Sprite.fromImage('assets/characterBlurTrail.png');
        particle.life = (i / total-1) * 100;
        particle.anchor.set(0.5);
        particle.blendMode = PIXI.blendModes.ADD
        this.particles.push(particle);
        this.addChild(particle);
    };
}

Trail.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );

/* Create an update function */
Trail.prototype.update = function(speedX){
    
    for (var i = 0; i < this.particles.length; i++)
    {
        var particle = this.particles[i];
        
        if(particle.life < 0)
        {
            particle.life += 100;
            particle.position.set(this.target.position.x, this.target.position.y);
        }
        else
        {
            particle.life -= 5;
            particle.alpha = ( particle.life/100) * 0.75;
            particle.x -= speedX
        }
    };
} 

/* 

Lay down dat PIPE! 

*/


/* Step 6: Piping hot! (pipes to avoid) */

var Pipe = function( entryPoint, maxHeight, minHeight ){
    PIXI.DisplayObjectContainer.call(this)
    this.entryPoint = entryPoint;
    this.maxHeight = maxHeight;
    this.minHeight = minHeight;
    this.gapSize = 300;
    this.topPipe = PIXI.Sprite.fromImage('assets/column.png');
    this.bottomPipe = PIXI.Sprite.fromImage('assets/column.png');
    this.addChild(this.topPipe);
    this.addChild(this.bottomPipe);
    this.adjustGapPosition();
}

/* Not quite sure what this section does??? */
Pipe.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
/* END */

/* Step 7: Make pipe adjust its position */

Pipe.prototype.adjustGapPosition = function(){
    this.gapPosition = this.minHeight + ( Math.random() * (this.maxHeight - this.minHeight) );
    this.topPipe.position.y = this.gapPosition - this.gapSize/2 - this.topPipe.height;
    this.bottomPipe.position.y = this.gapPosition + this.gapSize/2;
}

/* Step 8: Make our pipe update */

Pipe.prototype.update = function( speedX ){
    this.position.x -= speedX;
    if(this.position.x < -200){
        this.position.x += this.entryPoint;
        this.adjustGapPosition();
    }
}


/*

The Game

*/


/* Step 9: Time to put the two sections together! */

var Game = function(){
    this.width = 1286;
    this.height = 640;
    this.gameSpeed = 5;
    this.pipes = [];
    
    this.state = 'playing';
    this.initPixi();
    this.initPipes();
    this.stage.mousedown = this.stage.touchstart = this.onClicked.bind(this);
    this.steve = new Steve();
    
    
    /*IMPORTANT! Trail code goes here */
    this.trail = new Trail( this.steve );
    this.stage.addChild(this.trail);
    
    this.stage.addChild(this.steve);
    this.reset();
    requestAnimationFrame(this.update.bind(this));
}

/* Step 10: Set up Pixi */

Game.prototype.initPixi = function(){
    this.stage = new PIXI.Stage(0x66FF99);
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
    /* Add in missing code line here later */
    
    document.body.appendChild(this.renderer.view);
    this.background = new PIXI.TilingSprite(PIXI.Texture.fromImage('assets/mainBG.jpg'), this.width, this.height);
    this.stage.addChild(this.background);
    this.stage.interactive = true;
    this.stage.hitArea = new PIXI.Rectangle(0, 0, this.width, this.height);
}

/* Step 11: Set up the Pipes */

Game.prototype.initPipes = function() {
    var pipeWidth = 139;
    var pipeGap = 200;
    var totalPipes = 8;
    var size = (pipeWidth + pipeGap) * totalPipes;
    for (var i = 0; i < totalPipes; i++) {
        var pipe = new Pipe( size, 200, this.height - 200 );
        this.stage.addChild(pipe);
        this.pipes.push(pipe);
    };
}

/* Step 12: Call onClicked */

Game.prototype.onClicked = function(){
    if(this.state === 'playing'){
        this.steve.flap();
    }
    else {
        this.reset();
    }
}

/* Step 13: Add some hit testing for 'x' */

Game.prototype.hitTestPipe = function( pipe ){
    var playerHitArea = this.steve;
    if( playerHitArea.x + playerHitArea.width/2 > pipe.position.x &&
        playerHitArea.x - playerHitArea.width/2 < pipe.position.x + pipe.width){
        
/* Step 14: Hit test the 'y' */
        if( playerHitArea.y - playerHitArea.height/2 < pipe.topPipe.position.y + pipe.topPipe.height ||
            playerHitArea.y + playerHitArea.height/2 > pipe.bottomPipe.position.y ){
            
            return true;
        }
    }
    return false;
}

/* Step 15: Game Over ;< */

Game.prototype.gameover = function(){
    this.state = 'gameover';
    this.steve.hit();
}

/* Step 16: The reset function */

Game.prototype.reset = function(){
    this.state = 'playing';
    var pipeWidth = 139;
    var pipeGap = 200;
    var totalPipes = this.pipes.length;
    
    for (var i = 0; i < totalPipes; i++){
        var pipe = this.pipes[i];
        pipe.position.x = ( (pipeWidth + pipeGap) * i ) + 800;
        pipe.adjustGapPosition();
    };
    this.steve.reset();
}

/* Step 17: Get the game ticking over */

Game.prototype.update = function()
{
    if(this.state === 'playing'){
        
        this.background.tilePosition.x -= this.gameSpeed * 0.6;
        this.steve.alpha = 1;

        for (var i = 0; i < this.pipes.length; i++){
            var pipe = this.pipes[i];
            pipe.update( this.gameSpeed );
            var hit = this.hitTestPipe(pipe);
            if(hit){
                this.gameover();
                break;
            }
        };

        if(this.steve.position.y > this.height){
            this.gameover();
        }
    }
    
/* Step 18: Update Steve */
    this.steve.update();
    this.trail.update(  this.gameSpeed * 3);
    this.renderer.render(this.stage);
    requestAnimationFrame(this.update.bind(this));
    
}

/* Load it all up! */

var loader = new PIXI.AssetLoader([
    'assets/mainBG.jpg',
    'assets/column.png',
    'assets/characterFlying_01.png',
    'assets/characterFlying_02.png',
    'assets/characterFlying_03.png',
    'assets/characterBlurTrail.png'
]);

loader.onComplete = function(){
    var game = new Game();
}

loader.load();


























