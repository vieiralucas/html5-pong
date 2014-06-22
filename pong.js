window.onload = function(){
	var canvas = document.getElementById("pong-canvas");
	var running;
	var isFullScreen = false;
	var animation;
	//definidos no final do código
	document.addEventListener("keydown", keyPressed);
	document.addEventListener("keyup", keyReleased)
	document.addEventListener('touchstart', touchStart);	
	document.addEventListener('touchend', touchEnd);	
	canvas.addEventListener("fullscreenchange", fullscreenchange, false);		 
	canvas.addEventListener("mozfullscreenchange", fullscreenchange, false);		 
	canvas.addEventListener("webkitfullscreenchange", fullscreenchange, false);		
	canvas.addEventListener("msfullscreenchange", fullscreenchange, false);
	//0: menu; 1: player vs computer; 2: Player vs Wall; 3: Watch the Chaos
	var gameMode, frames, seconds;
	var W = window.innerWidth/2, H = window.innerHeight/2;
	var upArrow = 38, downArrow = 40, wKey = 87, sKey = 83, enterKey = 13, escKey = 27;
	var blueScore, redScore, computerScore, coopScore, wallScore, chaosScore;
	var player = {};
	var balls = [];
	var powerUps = [];
	var ctx = canvas.getContext("2d");
	canvas.width = W;
	canvas.height = H;
	function PowerUp() {
		//0 - create a ball, 1 - create a wall, 2 - increase ball size, 3 - increase paddle size
		this.x = Math.floor(Math.random() * (W - 120)) + 60;
		this.y = Math.floor(Math.random() * (H - 120)) + 60;
		this.size = 20;
		this.visible = true;
		this.type = Math.floor(Math.random() * 4);
		this.color = function() {
			if(this.type === 0) {
				return"#00FFFF";
			} else if(this.type === 1) {
				return "#FF00FF";
			} else if(this.type === 2) {
				return "#FFFF00";
			} else if(this.type == 3) {
				return "#FFF";
			}
		};
		this.draw = function() {
			if(this.visible) {
				ctx.fillStyle = this.color();
				ctx.fillRect(this.x, this.y, 20, 20);
			} else {
				this.visible = true;
			}
		};
		this.activate = function(ball) {
			if(this.type === 0) {
				var color = "#"+Math.floor(Math.random() * 4095/*FFF*/).toString(16);
				balls.push(new Ball(ball.x, ball.y, ball.dx < 0 ? -4 : 4, ball.dy*-1, color));
			} else if(this.type === 1) {
				middleWall.activate();
			} else if(this.type === 2) {
				if(ball.size < 120) {
					ball.size += 20;
				}
			} else if(this.type === 3) {
				if(ball.lastHit === 1) {
					player.red.increaseSize();
				} else if(ball.lastHit === 2) {
					computer.increaseSize();
				}
			}
			for (var i = 0; i < powerUps.length; i++) {
				if(powerUps[i] === this) {
					powerUps.splice(i, 1);
					break;
				}
			}
		};
		this.randomize = function() {
			this.x = Math.floor(Math.random() * (W - 120)) + 60;
			this.y = Math.floor(Math.random() * (H - 120)) + 60;
			this.type = Math.floor(Math.random() * 4);
		}
	}

	function Player(x, color) {
		this.x = x;
		this.y = H/2 - H/8;
		this.speed = 0.5;
		this.dy = 0;
		this.w = W/60;
		this.h = H/4;
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
		this.increaseSize = function() {
			this.h *= 2;
			if(this.h > H) {
				this.h = H;
			}
		};
		this.decreaseSize = function() {
			this.h /= 1.25;
			if(this.h < H/4) {
				this.h = H/4;
			}
		}
	}

	function Ball(x, y, dx, dy, color) {
		this.x = x;
		this.y = y;
		this.size = H/40;
		this.dx = dx;
		this.dy = dy;
		this.color = color === undefined ? "#FFF" : color;
		//0 - wall, 1 - player, 2 - computer
		this.lastHit = 0;
		this.update = function() {
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
				if(balls.length > 1) {
					for (var i = 0; i < balls.length; i++) {
						if(balls[i] === this) {
							balls.splice(i, 1);
						}
					}
				}else {
					middleWall.active = false;
					if(gameMode === 1) {
						//computer scores
						computerScore++;
					} else if(gameMode === 2) {
						//player lost
						wallScore = 0;
					}
				}
				this.dx = W/200;
				this.dy = 0;
				this.x = 0;
				this.size = H/40;
				this.y = (H - this.size)/2;
			}
			if(this.x < 0) {
				if(balls.length > 1) {
					for (var i = 0; i < balls.length; i++) {
						if(balls[i] === this) {
							balls.splice(i, 1);
						}
					}
				} else {
					//red scores
					if(gameMode === 1){
						redScore++;
					}
					this.dx = -4;
					this.dy = 0;
					this.size = H/40;
					this.x = W - this.size;
					this.y = (H - this.size)/2;
				}
			}
			this.checkCollision();	
		}
		this.draw = function() {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
			ctx.fill();
		};
		this.reset = function() {
			this.x = (W - this.size)/2;
			this.y = (H - this.size)/2;
			this.dy = 0;
			this.dx = 4;
			this.size = H/40;
		};
		this.decreaseSize = function() {
			this.size /= 1.25;
			if(this.size < H/40) {
				this.size = H/40;
			}
		};
		this.checkCollision = function() {
			this.powerUpCollision();
			this.middleWallCollision();
			if(gameMode === 1) {
				if(this.dx < 0) {
					//checks for computer collision
					this.computerCollision();
				} else {
					//checks for red collision
					this.redCollision();
				}
			} else if(gameMode === 2) {
				if(this.dx < 0) {
					//checks for left wall collision
					this.leftWallCollision();
				} else {
					//checks for red collision
					this.redCollision();
				}
			} else if(gameMode === 3) {
				if(this.dx < 0) {
					//checks for left wall collision
					this.leftWallCollision();
				} else {
					//checks for right wall collision
					this.rightWallCollision();
				}
			}
		};
		this.redCollision = function() {
			if(AABBIntersect(this.x - this.size, this.y - this.size, this.size*2, this.size*2, player.red.x, player.red.y, player.red.w, player.red.h)) {
				this.x = player.red.x - this.size;
				this.dx *= -1;
				if(player.red.dy !== 0) {
					this.dy = player.red.dy * -1;
				}
				if(this.dx > -12){
					this.dx -= 0.5;
				}
				if(gameMode === 3 && this.dy !== 0) {
					coopScore++;
				}
				this.decreaseSize();
				player.red.decreaseSize();
				this.lastHit = 1;
			}
		};
		this.computerCollision = function() {
			if(AABBIntersect(this.x - this.size, this.y - this.size, this.size*2, this.size*2, computer.x, computer.y, computer.w, computer.h)) {
				this.x = computer.x + computer.w;
				this.dx *= -1;
				if(computer.dy !== 0) {							
					this.dy = computer.dy * -1;
				}
				if(this.dx < 12) {
					this.dx += 0.5;
				}
				this.decreaseSize();
				computer.decreaseSize();
				this.lastHit = 2;
			}
		};
		this.leftWallCollision = function() {
			if(AABBIntersect(this.x - this.size, this.y - this.size, this.size*2, this.size*2, leftWall.x, leftWall.y, leftWall.w, leftWall.h)) {
				this.x = leftWall.x + leftWall.w;
				this.dx *= -1;
				if(this.dy !== 0) {
					gameMode === 2 ? wallScore++ : chaosScore++;
				}
				if(this.dx < 12) {
					this.dx += 0.5;
				}
				this.decreaseSize();
				leftWall.color = this.color;
			}
		};
		this.powerUpCollision = function() {
			for (var i = 0; i < powerUps.length; i++) {
				var powerUp = powerUps[i];
				if(AABBIntersect(this.x - this.size, this.y - this.size, this.size*2, this.size*2, powerUp.x, powerUp.y, powerUp.size, powerUp.size)) {
					powerUp.activate(this);
				}
			}
		};
		this.middleWallCollision = function() {
			if(middleWall.active) {
				if(AABBIntersect(this.x - this.size, this.y - this.size, this.size*2, this.size*2, middleWall.x, middleWall.y, middleWall.w, middleWall.h)) {
					this.dx *= -1;
					middleWall.getHit();
					this.decreaseSize();
				}
			}
		};
		this.rightWallCollision = function() {
			if(AABBIntersect(this.x - this.size, this.y - this.size, this.size*2, this.size*2, rightWall.x, rightWall.y, rightWall.w, rightWall.h)) {
				this.x = rightWall.x - this.size;
				this.dx *= -1;
				if(this.dy !== 0) {
					chaosScore++;
				}
				if(this.dx > -12) {
					this.dx -= 0.5;
				}
				this.decreaseSize();
				rightWall.color = this.color;
			}
		};
	}
	var menu = {};

	var computer = {};

	var leftWall = {};

	var rightWall = {};

	var middleWall = {};

	function init() {
		player = {};
		balls = [];
		powerUps = [];
		gameMode = 0, frames = 0, seconds = 0, blueScore = 0, redScore = 0, computerScore = 0,coopScore = 0, wallScore = 0, chaosScore = 0;
		menu = {
			selected: -1,
			font: H/20 + "px Helvetica",
			pvc: {
				txt: "Player vs Computer",
				draw: function() {
					var startHeight = H/2;
					var width = ctx.measureText(this.txt).width;
					var x = W/2 - width/2;
					var y = startHeight;
					ctx.fillStyle = "#FFF";
					if(menu.selected === 0) {
						ctx.fillStyle = "#F00";
					}
					ctx.fillText(this.txt, x, y);
				}
			},
			pvw: {
				txt: "Player vs Wall",
				draw: function() {
					var startHeight = H/2;
					var width = ctx.measureText(this.txt).width;
					var x = W/2 - width/2;
					var y = startHeight + startHeight/3;
					ctx.fillStyle = "#FFF";
					if(menu.selected === 1) {
						ctx.fillStyle = "#F00";
					}
					ctx.fillText(this.txt, x, y);
				}
			},
			wtc : {
				txt: "Watch the Chaos!",
				draw: function() {
					var startHeight = H/2;
					var width = ctx.measureText(this.txt).width;
					var x = W/2 - width/2;
					var y = startHeight + startHeight/3*2;
					ctx.fillStyle = "#FFF";
					if(menu.selected === 2) {
						ctx.fillStyle = "#F00";
					}
					ctx.fillText(this.txt, x, y);
				}
			},
			draw: function() {
				ctx.fillStyle = "#FFF";
				ctx.font = this.font;
				this.pvc.draw();
				this.pvw.draw();
				this.wtc.draw();
			},
			selectUp: function() {
				this.selected--;
				if(this.selected < 0) {
					this.selected = 2;
				}
			},
			selectDown: function() {
				this.selected++;
				if(this.selected > 2) {
					this.selected = 0;
				}
			}, 
			chooseGameMode: function() {
				powerUps.push(new PowerUp());
				if(this.selected === 0) {
					this.selected = 0;
					startPvC();
				} else if(this.selected === 1) {
					this.selected = 0;
					startPvW();
				} else if(this.selected === 2) {
					this.selected = 0;
					startWtC();
				}
			},
			handleTouch: function(evt) {
				var touch = {
					x: evt.clientX, 
					y: evt.clientY
				};
				if(this.touchPvC(touch)) {
					this.selected = 0;
				} else if(this.touchPvW(touch)) {
					this.selected = 1;
				} else if(this.touchWtC(touch)) {
					this.selected = 2;
				}
			},
			touchPvC: function(touch) {
				var w = ctx.measureText(this.pvc.txt).width;
				var x = W/2 - w/2;
				var y = H/2;
				var h = H/20;
				if(AABBIntersect(touch.x, touch.y, 1, 1,
					x, y, w, h)) {
					return true;
			}
			return false;
		},
		touchPvW: function(touch) {
			var w = ctx.measureText(this.pvw.txt).width;
			var x = W/2 - w/2;
			var y = H/2 + H/2/3;
			var h = H/20;
			if(AABBIntersect(touch.x, touch.y, 1, 1,
				x, y, w, h)) {
				return true;
		}
		return false;
	},
	touchWtC: function(touch) {
		var w = ctx.measureText(this.pvw.txt).width;
		var x = W/2 - w/2;
		var y = H/2 + H/2/3*2;
		var h = H/20;
		if(AABBIntersect(touch.x, touch.y, 1, 1,
			x, y, w, h)) {
			return true;
	}
	return false;
	}
	};
	middleWall = {
	w: 10,
	h: H,
	x: (W - 10) / 2,
	y: 0,
	active: false,
	color: "#F0F",
	hits: 3,
	draw: function() {
	if(this.active) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.w, this.h);
	}
	},
	getHit: function() {
	if(this.hits >= 0) {
		this.hits--;
	}
	if(this.hits === 3) {
		this.color = "#808";
	} else if(this.hits === 2) {
		this.color = "#404";
	} else {
		this.active = false;
	}
	},
	activate: function() {
	this.active = true;
	this.color = "#F0F";
	this.hits = 4;				
	}
	};
	computer = {
	x: W/60,
	y: H/2 - H/4,
	speed: 8,
	dy: 0,
	w: W/60,
	h: H/4,
	color: "#FFF",
	update: function(){
				//find closest ball
				var closest = 0;
				for (var i = 0; i < balls.length; i++) {
					if(balls[i].x < balls[closest].x || balls[closest].dx > 0) {
						closest = i;
					}
				}
				if((balls[closest].y+balls[closest].size)/2 < (this.y + this.h)/2) {
					if(balls[closest].dy !== 0) {
						this.y += balls[closest].dy*0.7;
					} else {
						this.y -= this.speed;
					}
				}
				if((balls[closest].y+balls[closest].size)/2 > (this.y + this.h)/2) {
					if(balls[closest].dy !== 0){
						this.y += balls[closest].dy*0.7;
					} else {
						this.y += this.speed;
					}
				}
				if(this.y < 0) {
					this.y = 0;
				}
				if(this.y + this.h > H) {
					this.y = H - this.h;
				}
			},
			draw: function(){
				ctx.fillStyle = this.color;
				ctx.fillRect(this.x, this.y, this.w, this.h);
			},
			reset: function() {
				this.x = 20;
				this.y = H/2 - 50;
			},
			increaseSize: function() {
				this.h *= 2;
				if(this.h > H) {
					this.h = H;
				}
			},
			decreaseSize: function() {
				this.h /= 1.25;
				if(this.h < H/4) {
					this.h = H/4;
				}
			}
		};
		leftWall = {
			x: 20,
			y: 0,
			w: 20,
			h: H,
			color: "#FFF",
			draw: function() {
				ctx.fillStyle = this.color;
				ctx.fillRect(this.x, this.y, this.w, this.h);
			}
		};
		rightWall = {
			x: W - 40,
			y: 0,
			w: 20,
			h: H,
			color: "#FFF",
			draw: function() {
				ctx.fillStyle = this.color;
				ctx.fillRect(this.x, this.y, this.w, this.h);
			}
		};
		draw();
		running = true;
		run();
	}

	function run() {
		frames++;
		update();
		draw();
		if(running){
			animation = window.requestAnimationFrame(run, canvas);
		}
	}

	function update() {
		if(gameMode !== 0) {
			if(gameMode === 1){
				updatePvC();
			} else if(gameMode === 2) {
				updatePvW();
			} else if(gameMode === 3) {
				updateWtC();
			}
			if(frames % 60 === 0) {
				seconds++;
				if(seconds % 4 === 0) {
					powerUps.push(new PowerUp());
				}
			}
			if(balls.length > 0) {
				console.log(balls.length);
				console.log(balls[0].dx);
			}
		}
	}

	function updatePvP() {
		player.blue.update();
		player.red.update();
		for(var i = 0; i < balls.length; i++) {
			balls[i].update();
		}
	}

	function updatePvC() {
		computer.update();
		player.red.update();
		for(var i = 0; i < balls.length; i++) {
			balls[i].update();
		}
	}

	function updateCoOp() {
		player.blue.update();
		player.red.update();
		for(var i = 0; i < balls.length; i++) {
			balls[i].update();
		}
	}

	function updatePvW() {
		player.red.update();
		for(var i = 0; i < balls.length; i++) {
			balls[i].update();
		}
	}

	function updateWtC() {
		for(var i = 0; i < balls.length; i++) {
			balls[i].update();
		}	
	}

	function draw() {
		//0: menu; 1: player vs player; 2: player vs computer; 3: co-op 4: Player vs Wall;
		drawScenario();
		middleWall.draw();
		if(gameMode === 0) {
			drawMenu();
		} else {
			if(gameMode === 1) {
				drawPvC();
			} else if(gameMode === 2) {
				drawPvW();
			} else if(gameMode === 3) {
				drawWtC();
			}
			for (var i = 0; i < powerUps.length; i++) {
				powerUps[i].draw();
			}
		}
	}

	function drawScenario() {
		ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
		ctx.fillRect(0,0,W,H);
	}

	function clearScreen() {
		ctx.fillStyle = "#000";
		ctx.fillRect(0,0,W,H);	
	}	

	function drawMenu() {
		clearScreen();
		menu.draw();
	}

	function drawPvC() {
		ctx.font="40px Helvetica";
		ctx.fillStyle = computer.color;
		ctx.fillText(computerScore, computer.x, 40);
		ctx.fillStyle = player.red.color;
		ctx.fillText(redScore, player.red.x, 40);
		player.red.draw();
		computer.draw();
		for(var i = 0; i < balls.length; i++) {
			balls[i].draw();
		}
	}

	function drawPvW() {
		ctx.font="40px Helvetica";
		ctx.fillStyle = "#FFF";
		var width = ctx.measureText(wallScore).width;
		var x = W/2 - width/2;
		var y = 40;
		ctx.fillText(wallScore, x, y);
		player.red.draw();
		leftWall.draw();
		for(var i = 0; i < balls.length; i++) {
			balls[i].draw();
		}
	}

	function drawWtC() {
		leftWall.draw();
		rightWall.draw();
		for(var i = 0; i < balls.length; i++) {
			balls[i].draw();
		}
		ctx.font="40px Helvetica";
		var width = ctx.measureText(chaosScore).width;
		var x = W/2 - width/2;
		var y = H/8;
		ctx.fillStyle = "#F00";
		ctx.fillText(chaosScore, x, y);
	}

	function startPvC() {
		gameMode = 1;
		player.red = new Player(W - W/30, "#F00");
		computer.reset();
		balls = [new Ball((W-20)/2, (H-20)/2, W/200, 0)];
		clearScreen();
	}

	function startPvW() {
		gameMode = 2;
		player.red = new Player(W - W/30, "#F00");
		balls = [new Ball((W-20)/2, (H-20)/2, W/200, 0)];
		clearScreen();
	}

	function startWtC() {
		gameMode = 3;
		balls = [new Ball((W-20)/2, (H-20)/2, W/200, 8)];		
		clearScreen();
	}

	function keyPressed(key) {
		if(gameMode === 0) {
			menuKeyPressed(key);
		}
		if(gameMode === 1) {
			pvpKeyPressed(key);
		}
		if(gameMode === 2) {
			pvcKeyPressed(key);
		}
		if(gameMode === 3) {
			coopKeyPressed(key);
		}
		if(gameMode === 4) {
			pvwKeyPressed(key);
		}
		if(gameMode === 5) {
			wtcKeyPressed(key);
		}

	}

	function menuKeyPressed(key) {
		if(key.which === wKey || key.which === upArrow) {
			menu.selectUp();
		} else if(key.which === sKey || key.which === downArrow) {
			menu.selectDown();
		} else if(key.which === enterKey) {
			menu.chooseGameMode();
		}
	}

	function pvpKeyPressed(key) {
		if(key.which === wKey) {
			//sobe player azul
			player.blue.goUp();
		} else if(key.which === sKey) {
			//desce player azul
			player.blue.goDown();
		} else if(key.which === upArrow) {
			//sobe player vermelho
			player.red.goUp();
		} else if(key.which === downArrow) {
			//desce player vermelho
			player.red.goDown();
		} else if(key.which === escKey) {
			goMenu();
		}
	}

	function pvcKeyPressed(key) {
		if(key.which === upArrow) {
			//sobe player vermelho
			player.red.goUp();
		} else if(key.which === downArrow) {
			//desce player vermelho
			player.red.goDown();
		} else if(key.which === escKey) {
			goMenu();
		}
	}

	function coopKeyPressed(key) {
		if(key.which === wKey) {
			//sobe player azul
			player.blue.goUp();
		} else if(key.which === sKey) {
			//desce player azul
			player.blue.goDown();
		} else if(key.which === upArrow) {
			//sobe player vermelho
			player.red.goUp();
		} else if(key.which === downArrow) {
			//desce player vermelho
			player.red.goDown();
		} else if(key.which === escKey) {
			goMenu();
		}	
	}

	function pvwKeyPressed(key) {
		if(key.which === upArrow) {
			//sobe player vermelho
			player.red.goUp();
		} else if(key.which === downArrow) {
			//desce player vermelho
			player.red.goDown();
		} else if(key.which === escKey) {
			goMenu();
		}
	}

	function wtcKeyPressed(key) {
		if(key.which === escKey) {
			goMenu();
		}
	}

	function keyReleased(key) {
		if(gameMode === 1 || gameMode === 3) {
			if(key.which === wKey || key.which === sKey) {
				player.blue.stop();
			}
		}
		if(gameMode !== 0) {
			if(key.which === upArrow || key.which === downArrow) {
				player.red.stop();
			}		
		}
	}

	function touchStart(evt) {
		if(gameMode === 0) {
			menu.handleTouch(evt.touches[0]);
		}	
	}

	function touchEnd(evt) {
		if(gameMode === 0 && menu.selected !== -1) {
			menu.chooseGameMode();
		}
	}

	function goMenu() {
		gameMode = 0;
		blueScore = 0;
		redScore = 0;
		computerScore = 0;
		wallScore = 0;
		coopScore = 0;
		chaosScore = 0;
		middleWall.active = false;
	}

	function AABBIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
		return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
	}
	window.ondevicemotion = function(evt) {
		if(gameMode === 1 || gameMode === 2) {
			var dy = evt.accelerationIncludingGravity.y;
			player.red.dy = dy*H/100;	
		}
	};
	function fullscreenchange() {
		isFullScreen = !isFullScreen;
		if(isFullScreen) {
			W = window.innerWidth;
			H = window.innerHeight;
			canvas.width = W;
			canvas.height = H;
			window.cancelAnimationFrame(animation);
			init();	
		} else {
			W = window.innerWidth/2;
			H = window.innerHeight/2;
			canvas.width = W;
			canvas.height = H;
			window.cancelAnimationFrame(animation);
			init();	
		}
	}
	init();
};
function fullScreen() {
	var canvas = document.getElementById('pong-canvas');
	if (canvas.requestFullscreen) {
		canvas.requestFullscreen();
	} else if (canvas.msRequestFullscreen) {
		canvas.msRequestFullscreen();
	} else if (canvas.mozRequestFullScreen) {
		canvas.mozRequestFullScreen();
	} else if (canvas.webkitRequestFullscreen) {
		canvas.webkitRequestFullscreen();
	} else {
		return;
	}
}