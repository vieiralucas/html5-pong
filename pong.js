window.onload = function() {	
	//definidos no final do código
	document.addEventListener("keydown", keyPressed);
	document.addEventListener("keyup", keyReleased)

	//0: menu; 1: player vs player; 2: player vs computer; 3: co-op 4: Player vs Wall;
	var gameMode = 0;
	var W = 800, H = 400;
	var upArrow = 38, downArrow = 40, wKey = 87, sKey = 83, enterKey = 13, escKey = 27;
	var blueScore = 0, redScore = 0, computerScore = 0, coopScore = 0, wallScore = 0;
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
				var y = 150;
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
				var y = 210;
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
				var y = 270;
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
				var y = 330;
				ctx.fillText(this.txt, x, y);
				if(menu.selected === 3) {
					ctx.fillRect(x, y+10, width, 2);
				}
			}
		}, 
		font: "30px Helvetica",
		update: function() {

		},
		draw: function() {
			ctx.fillStyle = "#FFF";
			ctx.font = this.font;
			this.pvp.draw();
			this.pvc.draw();
			this.coop.draw();
			this.pvw.draw();
		},
		selectUp: function() {
			this.selected--;
			if(this.selected < 0) {
				this.selected = 3;
			}
		},
		selectDown: function() {
			this.selected++;
			if(this.selected > 3) {
				this.selected = 0;
			}
		}, 
		chooseGameMode: function() {
			if(this.selected === 0) {
				startPvP();
			} else if(this.selected === 1) {
				this.selected = 0;
				startPvC();
			} else if(this.selected === 2) {
				this.selected = 0;
				startCoOp();
			} else {
				this.selected = 0;
				startPvW();
			}
		}
	};

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
				this.dx = 4;
				this.dy = 0;
				this.x = 0;
				this.y = (H - this.size)/2;
			}
			if(this.x < 0) {
				//red scores
				if(gameMode === 1 || gameMode === 2){
					redScore++;
				} else {
					coopScore = 0;
				}
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
		reset: function() {
			this.x = (W - ball.size)/2;
			this.y = (H - ball.size)/2;
			this.dy = 0;
			this.dx = 4;
		},
		playerCollision: function() {
			if(gameMode === 1) {
				if(this.dx < 0) {
					//checks for blue collision
					this.blueCollision();
				} else {
					//checks for red collision
					this.redCollision();
				}
			} else if(gameMode === 2) {
				console.log('colisao gamemode 2');
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
					this.wallCollision();
				} else {
					this.redCollision();
				}
			}
		},
		redCollision: function() {
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
				}
			}
		},
		blueCollision: function() {
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
				}
			}
		},
		computerCollision: function() {
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
				}
			}	
		},
		wallCollision: function() {
			if(this.x < wall.x + wall.w) {
				this.x = wall.x + wall.w;
				this.dx *= -1;
				if(this.dy !== 0) {
					wallScore++;
				}
			}
		}
	};

	var computer = {
		x: 20,
		y: H/2 - 50,
		speed: 8,
		dy: 0,
		w: 20,
		h: 100,
		color: "#FFF",
		update: function(){
			console.log(ball.y);
			if(ball.y < this.y) {
				if(ball.dy !== 0) {
					this.y += ball.dy*0.9;
				} else {
					this.y -= this.speed;
				}
			}
			if(ball.y + ball.size > this.y + this.h) {
				if(ball.dy !== 0){
					this.y += ball.dy*0.9;
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

	var wall = {
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
		if(gameMode === 1){
			updatePvP();
		} else if(gameMode === 2) {
			updatePvC();
		} else if(gameMode === 3) {
			updateCoOp();
		} else {
			updatePvW();
		}
	}

	function updatePvP() {
		player.blue.update();
		player.red.update();
		ball.update();
	}

	function updatePvC() {
		computer.update();
		player.red.update();
		ball.update();
	}

	function updateCoOp() {
		player.blue.update();
		player.red.update();
		ball.update();
	}

	function updatePvW() {
		player.red.update();
		ball.update();
	}

	function draw() {
		//0: menu; 1: player vs player; 2: player vs computer; 3: co-op 4: Player vs Wall;
		drawScenario();
		if(gameMode === 0) {
			drawMenu();
		} else if(gameMode === 1) {
			drawPvP();
		} else if(gameMode === 2) {
			drawPvC();
		} else if(gameMode === 3) {
			drawCoOp();
		} else {
			drawPvW();
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
		ball.draw();
	}

	function drawPvC() {
		ctx.font="40px Helvetica";
		ctx.fillStyle = computer.color;
		ctx.fillText(computerScore, computer.x, 40);
		ctx.fillStyle = player.red.color;
		ctx.fillText(redScore, player.red.x, 40);
		player.red.draw();
		computer.draw();
		ball.draw();
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
		ball.draw();	
	}

	function drawPvW() {
		ctx.font="40px Helvetica";
		ctx.fillStyle = "#FFF";
		var width = ctx.measureText(wallScore).width;
		var x = W/2 - width/2;
		var y = 40;
		ctx.fillText(wallScore, x, y);
		player.red.draw();
		wall.draw();
		ball.draw();
	}

	function startPvP() {
		gameMode = 1;
		player.blue = new Player(20, "#00F");
		player.red = new Player(W - 40, "#F00");
		ball.reset();
	}

	function startPvC() {
		gameMode = 2;
		player.red = new Player(W - 40, "#F00");
		computer.reset();
		ball.reset();
	}

	function startCoOp() {
		gameMode = 3;
		player.ble = new Player(20, "#00F");
		player.red = new Player(W - 40, "#F00");
		ball.reset();
		console.log('test');
	}

	function startPvW() {
		gameMode = 4;
		player.red = new Player(W - 40, "#F00");
		console.log('test');
	}

	function keyPressed(key) {
		console.log(key.which);
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

	function keyReleased(key) {
		if(key.which === wKey || key.which === sKey) {
			player.blue.stop();
		}
		if(key.which === upArrow || key.which === downArrow) {
			player.red.stop();
		}		
	}

	function goMenu() {
		gameMode = 0;
		blueScore = 0;
		redScore = 0;
		computerScore = 0;
		wallScore = 0;
		coopScore = 0;
	}

	init();
};