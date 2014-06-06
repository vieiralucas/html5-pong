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



/*
var WIDTH = 700, HEIGHT = 600, pi = Math.pi;
var upArrow = 38, downArrow = 40;
var canvas, ctx, keystate;
var player, ai, ball;

player = {
	x: null,
	y: null,
	width: 20,
	height: 100,
	update: function(){
		if(keystate[upArrow]) this.y -= 7;
		if(keystate[downArrow]) this.y += 7;
	},
	draw: function(){
		ctx.setFillColor('#FFF');
		ctx.fillRect(this.x, this.y, this.width, this.height)
	}
};

ai = {
	x: null,
	y: null,
	width: 20,
	height: 100,
	update: function(){

	},
	draw: function(){
		ctx.setFillColor('#FFF');
		ctx.fillRect(this.x, this.y, this.width, this.height)
	}
};

ball = {
	dy: 0,
	dx: -8,
	x: null,
	y: null,
	side: 20,
	update: function(){
		this.y += this.dy;
		this.x += this.dx;
		if(this.y > HEIGHT - this.side) {
			this.dy *= -1;
		}
		if(this.y < 0) {
			this.dy *= -1;	
		}

		var intersectsBall = function(ax, ay, aw, ah, bx, by, bw, bh) {
			return ax < bx+bw && ay < by+bh && bx < ax+aw &&by < ay+ah;
		};

		var pdle = this.dx < 0 ? player : ai;
		console.log(pdle.x);
		if(intersectsBall(pdle.x, pdle.y, pdle.width, pdle.height, this.x, this.y, this.side,this.side)) {
			this.dx *= -1;
		}
	},
	draw: function(){
		ctx.setFillColor('#FFF');
		ctx.fillRect(this.x, this.y, this.side, this.side);
	}
};

function main() {
	canvas = document.createElement("canvas");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);

	keystate = {};

	document.addEventListener("keydown", function(evt){
		keystate[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt){
		delete keystate[evt.keyCode];
	});

	init();

	var loop = function() {
		update();
		draw();

		window.requestAnimationFrame(loop, canvas);
	};
	window.requestAnimationFrame(loop, canvas);
}
function init() {
	player.x = player.width;
	player.y = (HEIGHT - player.height) / 2;

	ai.x = WIDTH - 2*ai.width;
	ai.y = (HEIGHT - ai.height) / 2;

	ball.x = (WIDTH - ball.side)/2;
	ball.y = (HEIGHT - ball.side)/2;
}

function update() {
	ball.update();
	player.update();
	ai.update();
}

function draw() {
	ctx.setFillColor('#000');
	ctx.fillRect(0,0,WIDTH,HEIGHT);
	ball.draw();
	player.draw();
	ai.draw();
}*/