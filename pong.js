window.onload = function() {	
	//definidos no final do código
	document.addEventListener("keydown", keyPressed);
	document.addEventListener("keyup", keyReleased)

	var W = 800, H = 400;
	var upArrow = 38, downArrow = 40, wKey = 87, sKey = 83;
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = W;
	canvas.height = H;

	var player = {
		blue: new Player(20, "#00F"),
		red: new Player(W - 40, "#F00")
	};

	function Player(x, color) {
		this.x = x;
		this.y = H/2 - 50;
		this.speed = 0.5;
		this.dy = 0;
		this.w = 20;
		this.h = 100;
		this.color = color;
		this.update = function(){
			this.y += this.dy;
			if(this.y < 0) {
				this.y = 0;
			}
			if(this.y + this.h > H) {
				this.y = H - this.h;
			}
		};

		this.draw = function(){
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.w, this.h);
		};

		this.goUp = function() {
			if(this.dy === 0) {
				this.dy = -8;
			}
			this.dy -= this.speed;
			if(this.dy < -12) {
				this.dy = -12;
			}
		};

		this.goDown = function() {
			if(this.dy === 0) {
				this.dy = 8;
			}
			this.dy += this.speed;
			if(this.dy > 12) {
				this.dy = 12;
			}
		};

		this.stop = function() {
			this.dy = 0
		};
	}

	var ball = {
		x: null,
		y: null,
		size: 20,
		dx: 4,
		dy: 0,
		update: function() {
			this.y += this.dy;
			this.x += this.dx;
			if(this.y < 0) {
				this.y = 0;
				this.dy *= -1;
			}
			if(this.y + this.size > H) {
				this.y = H - this.size;
				this.dy *= -1;
			}
			if(this.x + this.size > W) {
				//blue scores
				this.dx = 4;
				this.dy = 0;
				this.x = 0;
				this.y = (H - this.size)/2;
			}
			if(this.x < 0) {
				//red scores
				this.dx = -4;
				this.dy = 0;
				this.x = W - this.size;
				this.y = (H - this.size)/2;
			}
			this.playerCollision();	
		},
		draw: function() {
			ctx.fillStyle = "#FFF";
			ctx.fillRect(this.x, this.y, this.size, this.size);
		},
		playerCollision: function() {
			if(this.dx < 0) {
				//checks for blue collision
				if(this.x < player.blue.x + player.blue.w) {
					if(this.y + this.size > player.blue.y && this.y < player.blue.y + player.blue.h) {
						this.x = player.blue.x + player.blue.w;
						this.dx *= -1;
						if(player.blue.dy !== 0) {							
							this.dy = player.blue.dy * -1;
						}
						if(this.dx < 12) {
							this.dx += 0.5;
						}
					}
				}
			} else {
				//checks for red collision
				if(this.x + this.size > player.red.x) {
					if(this.y + this.size > player.red.y && this.y < player.red.y + player.red.h) {
						this.x = player.red.x - this.size;
						this.dx *= -1;
						if(player.red.dy !== 0) {
							this.dy = player.red.dy * -1;
						}
						if(this.dx > -12){
							this.dx -= 0.5;
						}
					}
				}
			}
			console.log(ball.dx);
		}
	}

	function init() {
		ball.x = (W - ball.size)/2;
		ball.y = (H - ball.size)/2;
		draw();
		window.requestAnimationFrame(run, canvas);
	}

	function run() {
		update();
		draw();
		window.requestAnimationFrame(run, canvas);
	}

	function update() {
		player.blue.update();
		player.red.update();
		ball.update();
	}

	function draw() {
		ctx.fillStyle = "#000";
		ctx.fillRect(0,0,W,H);
		player.blue.draw();
		player.red.draw();
		ball.draw();
	}

	function keyPressed(key) {
		if(key.which === wKey) {
			//sobe player azul
			player.blue.goUp();
		}
		if(key.which === sKey) {
			//desce player azul
			player.blue.goDown();
		}
		if(key.which === upArrow) {
			//sobe player vermelho
			player.red.goUp();
		}	
		if(key.which === downArrow) {
			//desce player vermelho
			player.red.goDown();
		}
	}

	function keyReleased(key) {
		if(key.which === wKey || key.which === sKey) {
			player.blue.stop();
		}
		if(key.which === upArrow || key.which === downArrow) {
			player.red.stop();
		}		
	}

	init();
};