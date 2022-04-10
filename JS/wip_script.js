window.addEventListener('load', function(){                                     // Program wont start before everything is loaded (with anonymous function(), so it doesnt interfere with code)
    const canvas = document.getElementById('canvas1'); 
    const ctx = canvas.getContext('2d');                                        // canvas-context 2D
    canvas.width = 640;
    canvas.height = 320;
    let enemies = [];
    let score = 0;
    let gameOver = false;

    class InputHandler {
        constructor(){                                                          // Contructor for the InputHandler
            this.keys = [];                                                     // Array to save the pressed keys 
            window.addEventListener('keydown', e => {                           // => arrow function for "lexical scoping", if you instantiate "this." in new brackets it wont remember that its referring to the constructor
                switch(e.key){
                    case 'ArrowDown':
                    case 'ArrowUp':
                    case 'ArrowLeft':
                    case 'ArrowRight':
                        if (this.keys.indexOf(e.key) === -1){
                            this.keys.push(e.key);
                            console.log(e.key, this.keys)
                            break;
                        }
                }
            });
                /*if( e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight' 
                    && this.keys.indexOf(e.key) === -1){                        // checks for specific keys and if the keys arent in the array yet (-1 means not in the array)
                    this.keys.push(e.key)                                       // Push pressed Key into array
                }
                console.log(e.key, this.keys);                                  // console.log to see if the array is working
            }); */
            window.addEventListener('keyup', e => {                             // => arrow function for "lexical scoping", if you instantiate "this." in new brackets it wont remember that its referring to the constructor
                if( e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'){                                     // checks for specific key
                    this.keys.splice(this.keys.indexOf(e.key), 1);              // finds index of the released key with indexOf(e.key) and removes 1 object (the released key) with splice
                }
                console.log(e.key, this.keys);                                  // console.log to see if the array is working
            }); 
        }
    }

    class Player {
        constructor(gameWidth, gameHeight){                                     // constructor for Player
            this.gameWidth = gameWidth;                                         
            this.gameHeight = gameHeight;
            this.width = 32;
            this.height = 34;
            this.x = 0;
            this.y = this.gameHeight - this.height;                             // setting the frame of the player on the bottom left
            this.image = document.getElementById('playerImage');
            this.frameX = 0;                                                    // 0*X coord on spritesheet, so the first sprite
            this.maxFrame = 10;                                                 // idle animation has 11 frames
            this.frameY = 0;                                                    // 0*Y coord on spritesheet
            this.speed = 0;                                                     // how fast the character is moving on the X coord
            this.vy = 0;                                                        // velocity y for jumping           
            this.weight = 1;                                                    // influences how fast the character falls again
            this.fps = 20;                                                      // how many fps we want
            this.frameTimer = 0;                                                // keeping track of the time between animations
            this.frameInterval = 1000/this.fps;                                 // 1000 ms / 20 = 50 => frames update every 50ms
        }

        draw(context) {
            //context.fillStyle = 'white';
            //context.fillRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x , this.y, this.width, this.height); // drawing image from source this.image, with source sx sy swidth sheight into destinationx y w h
        }

        update(input, deltaTime, enemies, terrain){                                               // function to update player
            // collision detection enemy
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width/2) - (this.x + this.width/2);         // distance x (+ width/2 because the x coordinate is the top left corner)
                const dy = (enemy.y + enemy.height/2) - (this.y + this.height/2);                                          // distance y 
                const distance = Math.sqrt(dx * dx + dy * dy);                          // hypotenuse
                if (distance < enemy.width/2 + this.width/2) {                          // checks if hyptenuse is smaller than radius + radius => collision
                    gameOver = true;
                }
            })
            // collision detection terrain

            if(this.y + this.height <= terrain.y && this.y + this.height + this.vy >= terrain.y //bottom of character above terrain && velocity negative
                && this.x + this.width >= terrain.x && this.x <= terrain.x + terrain.width ) {
                this.vy = 0;
                this.frameY = 0;
                this.maxFrame = 0;
            }

            // animation
            if(this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            //controls
            if (input.keys.indexOf('ArrowRight') > -1) {                        // if right arrow is in the array set speed to 2.5
                this.speed = 2.5;
                if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {                    
                    this.vy -= 17;
                }
            } else if (input.keys.indexOf('ArrowLeft') > -1) {                  // if left arrow is pressed, set speed to -2.5
                this.speed = -2.5;
                if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {                    
                    this.vy -= 17;
                }
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {            
                this.vy -= 17;
            } else {
                this.speed = 0;
            }
            // horizontal
            this.x += this.speed;                                               // adding speed to x, positive is right, negative is left
            if (this.x < 0) this.x = 0;                                         //setting boundaries to left (x = 0)
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;  //setting boundaries to right (x = gamewidth - characterwidth)
            // vertical
            this.y += this.vy;                                                  // when arrowup is pressed, y gets decreased by velocity
            if (!this.onGround()){                                              // checks if character is not on ground
                console.log('not on ground')
                this.vy += this.weight;                                         // adds weight so character falls down again if not on ground
                if(this.vy < 0 ) {this.frameY = 6;} else if(this.vy > 0) {this.frameY = 5;}; // jump and fall animation
                this.maxFrame = 0;                                              // fall and jump only have one frame
            } else {
                this.vy = 0;                                                    // if character is on ground, velocity is 0
                this.frameY = 0;                                                // on ground = idle animation
                this.maxFrame = 10;
            }
            if(this.speed !== 0 && this.onGround() && this.vy === 0) {this.frameY = 1; this.maxFrame = 11;}
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height; // boundaries so character doesnt fall through floor
        }
        onGround(){
            return this.y >= this.gameHeight - this.height;                     // true if character is on the ground 
        }

        
    }

    class Background {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 640;
            this.height = 320;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y)
        }

    }

    class Enemy {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 32;
            this.height = 34;
            this.image = document.getElementById('enemyImage'+randomIntFromInterval(1,2));
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 12;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            this.speed = randomIntFromInterval(1, 4);
            this.markedForDel = false;
        }

        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height)
        }

        update(deltaTime) {
            //animation
            if (this.frameTimer > this.frameInterval) { 
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            //movement
            this.x -= this.speed;
            // deletion
            if (this.x < 0 - this.width) {this.markedForDel = true; score++;};
            
        }
    }

    class Terrain {
        constructor(gameWidth, gameHeight) {
            this.gamewidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 100;
            this.height = 10;
            this.x = 200;
            this.y = 200;
        }

        draw(context) {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }


    function displayStatusText(context){
        context.fillStyle = 'black';
        context.font = '15px Helvetica';
        context.fillText('Score ' + score, 40, 30);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('Game Over!', canvas.width/2, canvas.height/2);
        }
    }

    function handleEnemies(deltaTime){
        if(enemyTimer > enemyInterval){
            enemies.push(new Enemy(canvas.width, canvas.height)); 
            enemyTimer = 0;  
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        })
        enemies = enemies.filter(enemy => !enemy.markedForDel)

    }

    function randomIntFromInterval(min, max) {                                  // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function handleStart(){
        enemies= [];
        score = 0;
        gameOver = false;
        animate(0);
    }

    const input = new InputHandler();                                           // new InputHandler 
    const player = new Player(canvas.width, canvas.height);                     // new Player
    const background = new Background(canvas.width, canvas.height);             // new Background
    const terrain = new Terrain(canvas.width, canvas.height);

    let lastTime = 0;                                                           // using let to declare the variable lastTime for the following function
    let enemyTimer = 0;
    let enemyInterval = 1000 * randomIntFromInterval(1,4);

    function animate(timeStamp) {                                               // animation loop 
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        background.draw(ctx);
        terrain.draw(ctx);
        handleEnemies(deltaTime);
        player.draw(ctx);
        player.update(input, deltaTime, enemies, terrain);
        displayStatusText(ctx);
        if (!gameOver) {
            requestAnimationFrame(animate);
        } else {document.addEventListener("keydown", handleStart, {once: true})}
    }
    animate(0);

}); 