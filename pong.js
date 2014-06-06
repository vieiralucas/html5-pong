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
		this.baseSpeed = 8;
		this.speed = 2;
		this.dy = 0;
		this.w = 20;
		this.h = 100;
		this.color = color;
		this.update = function(){
			this.y += this.dy;
		};

		this.draw = function(){
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.w, this.h);
		};

		this.goUp = function() {
			if(this.dy === 0) {
				this.dy = this.baseSpeed*-1;
				return;
			}
			if(this.dy > -16) {
				this.dy -= this.speed;
			}
		};

		this.goDown = function() {
			if(this.dy === 0) {
				this.dy = this.baseSpeed;
				return;
			}
			if(this.dy < 16) {
				this.dy += this.speed;
			}
		};

		this.stop = function() {
			this.dy = 0
		}
	}

	var ball = {
		x: null,
		y: null,
		size: 20,
		dx: 0,
		dy: 8,
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
		},

		draw: function() {
			ctx.fillStyle = "#FFF";
			ctx.fillRect(this.x, this.y, this.size, this.size);
		}
	}

	function init() {
		ball.x = (W - ball.size)/2;
		ball.y = (H - ball.size)/2;
		draw();
		window.requestAnimationFrame(run, canvas);
	}

	function run() {
		console.log(player.blue.dy + " - " + player.red.dy);
		update();
		draw();
		window.requestAnimationFrame(run, canvas);
	}

	function update() {
		player.blue.update();
		player.red.update();
		/*for(var i = 0; i < players.length; i++) {
			players[i].update();
		}*/
		ball.update();
	}

	function draw() {
		ctx.fillStyle = "#000";
		ctx.fillRect(0,0,W,H);
		player.blue.draw();
		player.red.draw();
		/*for(var i = 0; i < players.length; i++) {
			players[i].draw();
		}*/
		ball.draw();
	}

	function keyPressed(key) {
		if(key.which === wKey) {
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
			//sobe player vermelho
			player.red.stop();
		}		
	}

	init();
};