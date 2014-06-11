window.onload = function() {	
	//definidos no final do código
	document.addEventListener("keydown", keyPressed);
	document.addEventListener("keyup", keyReleased)

	//0: menu; 1: player vs player; 2: player vs computer; 3: co-op 4: Player vs Wall; 5: Watch the Chaos
	var gameMode = 0;
	var W = 800, H = 400;
	var upArrow = 38, downArrow = 40, wKey = 87, sKey = 83, enterKey = 13, escKey = 27;
	var blueScore = 0, redScore = 0, computerScore = 0, coopScore = 0, wallScore = 0, chaosScore = 0;
	var player = {};
	var balls;
	var powerUp;
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	canvas.width = W;
	canvas.height = H;

	var menu = {
		selected: 0,
		pvp: {
			txt: "Player vs Player",
			draw: function() {
				var width = ctx.measureText(this.txt).width;
				var x = W/2 - width/2;
				var y = 90;
				ctx.fillText(this.txt, x, y);
				if(menu.selected === 0) {
					ctx.fillRect(x, y+10, width, 2);
				}
			}			
		},
		pvc: {
			txt: "Player vs Computer",
			draw: function() {
				var width = ctx.measureText(this.txt).width;
				var x = W/2 - width/2;
				var y = 150;
				ctx.fillText(this.txt, x, y);
				if(menu.selected === 1) {
					ctx.fillRect(x, y+10, width, 2);
				}
			}
		},
		coop: {
			txt: "Co-Op",
			draw: function() {
				var width = ctx.measureText(this.txt).width;
				var x = W/2 - width/2;
				var y = 210;
				ctx.fillText(this.txt, x, y);
				if(menu.selected === 2) {
					ctx.fillRect(x, y+10, width, 2);
				}
			}
		},
		pvw: {
			txt: "Player vs Wall",
			draw: function() {
				var width = ctx.measureText(this.txt).width;
				var x = W/2 - width/2;
				var y = 270;
				ctx.fillText(this.txt, x, y);
				if(menu.selected === 3) {
					ctx.fillRect(x, y+10, width, 2);
				}
			}
		},
		wtc : {
			txt: "Watch the Chaos!",
			draw: function() {
				var width = ctx.measureText(this.txt).width;
				var x = W/2 - width/2;
				var y = 330;
				ctx.fillText(this.txt, x, y);
				if(menu.selected === 4) {
					ctx.fillRect(x, y+10, width, 2);
				}
			}
		},
		font: "30px Helvetica",
		draw: function() {
			ctx.fillStyle = "#FFF";
			ctx.font = this.font;
			this.pvp.draw();
			this.pvc.draw();
			this.coop.draw();
			this.pvw.draw();
			this.wtc.draw();
		},
		selectUp: function() {
			this.selected--;
			if(this.selected < 0) {
				this.selected = 4;
			}
		},
		selectDown: function() {
			this.selected++;
			if(this.selected > 4) {
				this.selected = 0;
			}
		}, 
		chooseGameMode: function() {
			powerUp = new PowerUp();
			if(this.selected === 0) {
				startPvP();
			} else if(this.selected === 1) {
				this.selected = 0;
				startPvC();
			} else if(this.selected === 2) {
				this.selected = 0;
				startCoOp();
			} else if(this.selected === 3){
				this.selected = 0;
				startPvW();
			} else {
				this.selected = 0;
				startWtC();
			}
		}
	};

	var middleWall = {
		w: 10,
		h: H,
		x: (W - 10) / 2,
		y: 0,
		active: false,
		color: "#F0F",
		hits: 4,
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
			} else if(this.hits === 1) {
				this.color = "#202";
			}else {
				this.active = false;
			}
		},
		activate: function() {
			this.active = true;
			this.color = "#F0F";
			this.hits = 4;				
		}
	}

	function PowerUp() {
		//0 - create a ball, 1 - create a wall, 2 - increase ball size
		this.x = Math.floor(Math.random() * (W - 120)) + 60;
		this.y = Math.floor(Math.random() * (H - 120)) + 60;
		this.size = 20;
		this.visible = true;
		this.type = Math.floor(Math.random() * 3);
		this.color = function() {
			if(this.type === 0) {
				return"#00FFFF";
			} else if(this.type === 1) {
				return "#FF00FF";
			} else if(this.type === 2) {
				return "#FFFF00";
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
			this.visible = false;
			if(this.type === 0) {
				var color = Math.floor(Math.random() * 4095/*FFF*/).toString(16);
				balls.push(new Ball(ball.x, ball.y, ball.dx < 0 ? -4 : 4, ball.dy*-1, color));
			} else if(this.type === 1) {
				middleWall.activate();
			} else if(this.type === 2) {
				if(ball.size < 120) {
					ball.size += 20;
				}
			}
			this.randomize();
		};
		this.randomize = function() {
			this.x = Math.floor(Math.random() * (W - 120)) + 60;
			this.y = Math.floor(Math.random() * (H - 120)) + 60;
			this.type = Math.floor(Math.random() * 3);
		}
	}

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

	function Ball(x, y, dx, dy, color) {
		this.x = x;
		this.y = y;
		this.size = 20;
		this.dx = dx;
		this.dy = dy;
		this.color = color === undefined ? "#FFF" : color;
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
						//blue scores
						blueScore++;
					} else if(gameMode === 2) {
						//computer scores
							computerScore++;
					} else {
						wallScore = 0;
						coopScore = 0;
					}
				}
				this.dx = 4;
				this.dy = 0;
				this.x = 0;
				this.size = 20;
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
					if(gameMode === 1 || gameMode === 2){
						redScore++;
					} else {
						coopScore = 0;
					}
					this.dx = -4;
					this.dy = 0;
					this.x = W - this.size;
					this.size = 20;
					this.y = (H - this.size)/2;
				}
			}
			this.checkCollision();	
		}
		this.draw = function() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.size, this.size);
		};
		this.reset = function() {
			this.x = (W - this.size)/2;
			this.y = (H - this.size)/2;
			this.dy = 0;
			this.dx = 4;
			this.size = 20;
		};
		this.checkCollision = function() {
			this.powerUpCollision();
			this.middleWallCollision();
			if(gameMode === 1) {
				if(this.dx < 0) {
					//checks for blue collision
					this.blueCollision();
				} else {
					//checks for red collision
					this.redCollision();
				}
			} else if(gameMode === 2) {
				if(this.dx < 0) {
					//checks for computer collision
					this.computerCollision();
				} else {
					//checks for red collision
					this.redCollision();
				}
			} else if(gameMode === 3) {
				if(this.dx < 0) {
					this.blueCollision();
				} else {
					this.redCollision();
				}
			} else if(gameMode === 4) {
				if(this.dx < 0) {
					this.leftWallCollision();
				} else {
					this.redCollision();
				}
			} else if(gameMode === 5){
				if(this.dx < 0) {
					this.leftWallCollision();
				} else {
					this.rightWallCollision();
				}
			}
		};
		this.redCollision = function() {
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
					if(gameMode === 3 && this.dy !== 0) {
						coopScore++;
					}
					if(this.size > 20) {
						this.size -= 10;
					}
				}
			}
		};
		this.blueCollision = function() {
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
					if(gameMode === 3 && this.dy !== 0) {
						coopScore++;
					}
					if(this.size > 20) {
						this.size -= 10;
					}
				}
			}
		};
		this.computerCollision = function() {
			if(this.x < computer.x + computer.w) {
				if(this.y + this.size > computer.y && this.y < computer.y + computer.h) {
					this.x = computer.x + computer.w;
					this.dx *= -1;
					if(computer.dy !== 0) {							
						this.dy = computer.dy * -1;
					}
					if(this.dx < 12) {
						this.dx += 0.5;
					}
					if(this.size > 20) {
						this.size -= 10;
					}
				}
			}
		};
		this.leftWallCollision = function() {
			if(this.x < leftWall.x + leftWall.w) {
				this.x = leftWall.x + leftWall.w;
				this.dx *= -1;
				if(this.dy !== 0) {
					gameMode === 4 ? wallScore++ : chaosScore++;
				}
				if(this.dx < 12) {
					this.dx += 0.5;
				}
				if(this.size > 20) {
					this.size -= 10;
				}
				leftWall.color = this.color;
			}
		};
		this.powerUpCollision = function() {
			if(powerUp.visible) {
				if(!(this.x+this.size < powerUp.x 
					|| powerUp.x + powerUp.size < this.x 
					|| this.y + this.size < powerUp.y 
					|| powerUp.y + powerUp.size < this.y)) {
					powerUp.activate(this);
				}
			}
		};
		this.middleWallCollision = function() {
			if(middleWall.active) {
				if(this.x > middleWall.x) {
					if(this.x < middleWall.x + middleWall.w) {
						this.dx *= -1;
						middleWall.getHit();
						if(this.size > 20) {
							this.size -= 10;
						}
					}
				} else {
					if(this.x + this.size > middleWall.x) {
						this.dx *= -1;
						middleWall.getHit();
						if(this.size > 20) {
							this.size -= 10;
						}
					}
				}
			}
		};
		this.rightWallCollision = function() {
			if(this.x + this.size > rightWall.x) {
				this.x = rightWall.x - this.size;
				this.dx *= -1;
				if(this.dy !== 0) {
					chaosScore++;
				}
				if(this.dx > -12) {
					this.dx -= 0.5;
				}
				if(this.size > 20) {
					this.size -= 10;
				}
				rightWall.color = this.color;
			}
		};
	}

	var computer = {
		x: 20,
		y: H/2 - 50,
		speed: 8,
		dy: 0,
		w: 20,
		h: 100,
		color: "#FFF",
		update: function(){
			//find closest ball
			var closest = 0;
			for (var i = 0; i < balls.length; i++) {
				if(balls[i].x < balls[closest].x || balls[closest].dx > 0) {
					closest = i;
				}
			}
			console.log(closest);
			if(balls[closest].y < this.y) {
				if(balls[closest].dy !== 0) {
					this.y += balls[closest].dy*0.9;
				} else {
					this.y -= this.speed;
				}
			}
			if(balls[closest].y + balls[closest].size > this.y + this.h) {
				if(balls[closest].dy !== 0){
					this.y += balls[closest].dy*0.9;
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
		}
	};

	var leftWall = {
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

	var rightWall = {
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

	function init() {
		balls = [new Ball((W-20)/2, (H-20)/2, 4, 0)];
		draw();
		window.requestAnimationFrame(run, canvas);
	}

	function run() {
		update();
		draw();
		window.requestAnimationFrame(run, canvas);
	}

	function update() {
		if(gameMode === 1){
			updatePvP();
		} else if(gameMode === 2) {
			updatePvC();
		} else if(gameMode === 3) {
			updateCoOp();
		} else if(gameMode === 4){
			updatePvW();
		} else if(gameMode === 5){
			updateWtC();
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
		} else if(gameMode === 1) {
			drawPvP();
			powerUp.draw();
		} else if(gameMode === 2) {
			drawPvC();
			powerUp.draw();
		} else if(gameMode === 3) {
			drawCoOp();
			powerUp.draw();
		} else if(gameMode === 4){
			drawPvW();
			powerUp.draw();
		} else {
			drawWtC();
			powerUp.draw();
		}
	}

	function drawScenario() {
		ctx.fillStyle = "#000";
		ctx.fillRect(0,0,W,H);
	}

	function drawMenu() {
		menu.draw();
	}

	function drawPvP() {
		ctx.font="40px Helvetica";
		ctx.fillStyle = player.blue.color;
		ctx.fillText(blueScore, player.blue.x, 40);
		ctx.fillStyle = player.red.color;
		ctx.fillText(redScore, player.red.x, 40);
		player.blue.draw();
		player.red.draw();
		for(var i = 0; i < balls.length; i++) {
			balls[i].draw();
		}
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

	function drawCoOp() {
		ctx.font="40px Helvetica";
		ctx.fillStyle = "#FFF";
		var width = ctx.measureText(coopScore).width;
		var x = W/2 - width/2;
		var y = 40;
		ctx.fillText(coopScore, x, y);
		player.blue.draw();
		player.red.draw();
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
		console.log(balls.length);
	}

	function startPvP() {
		gameMode = 1;
		player.blue = new Player(20, "#00F");
		player.red = new Player(W - 40, "#F00");
		balls = [new Ball((W-20)/2, (H-20)/2, 4, 0)];
	}

	function startPvC() {
		gameMode = 2;
		player.red = new Player(W - 40, "#F00");
		computer.reset();
		balls = [new Ball((W-20)/2, (H-20)/2, 4, 0)];
	}

	function startCoOp() {
		gameMode = 3;
		player.blue = new Player(20, "#00F");
		player.red = new Player(W - 40, "#F00");
		balls = [new Ball((W-20)/2, (H-20)/2, 4, 0)];
	}

	function startPvW() {
		gameMode = 4;
		player.red = new Player(W - 40, "#F00");
		balls = [new Ball((W-20)/2, (H-20)/2, 4, 0)];
	}

	function startWtC() {
		gameMode = 5;
		balls = [new Ball((W-20)/2, (H-20)/2, 4, 8)];		
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

	function goMenu() {
		gameMode = 0;
		blueScore = 0;
		redScore = 0;
		computerScore = 0;
		wallScore = 0;
		coopScore = 0;
		middleWall.active = false;
	}

	init();
};