let app = getApp();

var gameGlobalData = {
	margin: 0,
	space: 0,
	end: 0,
}

var drawCanvas = function(context, width=450){
	var margin = gameGlobalData.margin = 15;
	var space = gameGlobalData.space = (width-margin*2)/14;
	var end = gameGlobalData.end = width - margin;
	context.setFillStyle("#f7d88d");
	context.setStrokeStyle("#999999");
	context.rect(0,0,gameGlobalData.canvasW,gameGlobalData.canvasW);
	context.fill();
	context.stroke();
	for(var i=0;i<15;i++) {
		context.moveTo(margin + i*space,margin);
		context.lineTo(margin + i*space, end);
		context.stroke();
		context.moveTo(margin,margin + i*space);
		context.lineTo(end,margin + i*space);
		context.stroke();
	}

}

var oneStep = function(i,j,me,context) {
	drawCanvas(context, gameGlobalData.canvasW);
	drawAll(context);
	console.log(context);
	chessPath(i,j,me,context);
	wx.drawCanvas({
		canvasId: 'firstCanvas',
		actions: context.getActions()
	});
}

var chessPath = function(i,j,me,context) {
	context.beginPath();
	context.arc( gameGlobalData.margin+i*gameGlobalData.space,gameGlobalData.margin+j*gameGlobalData.space,gameGlobalData.space/2-3,0,2*Math.PI);
	context.closePath();
	if(me) {
		color = '#0A0A0A';
	} else {
		color = '#f9f9f9';
	}
	context.setFillStyle(color);
	context.fill();
}

var drawAll = function(context){
	for(var i=0;i<15;i++) {
		for(var j=0;j<15;j++) {
			if(chess[[i,j]] == 1) {
				//画路径
				chessPath(i,j,true,context);
			} else if(chess[[i,j]] == 2) {
				chessPath(i,j,false,context);
			}
		}
	}
}

//AI 算法
var me = true;
var chess = {};

var over = false;
// 赢法数组
var wins = [];

//赢法的统计数组
var myWin = [];
var computerWin = [];

for(var i=0;i<15;i++) {
	wins[i] = [];
	for(var j=0;j<15;j++) {
		wins[i][j] = [];
		chess[[i,j]] = 0;
	}
}

var count = 0;
//横线赢法
for(var i=0;i<15;i++) {
	for(var j=0;j<11;j++) {
		for(var k=0;k<5;k++) {
			wins[i][j+k][count] = true;
		}
		count++;
	}
}

//竖线赢法
for(var i=0;i<15;i++) {
	for(var j=0;j<11;j++) {
		for(var k=0;k<5;k++) {
			wins[j+k][i][count] = true;
		}
		count++;
	}
}

//斜线赢法
for(var i=0;i<11;i++) {
	for(var j=0;j<11;j++) {
		for(var k=0;k<5;k++) {
			wins[i+k][j+k][count] = true;
		}
		count++;
	}
}

//反斜线赢法
for(var i=0;i<11;i++) {
	for(var j=14;j>3;j--) {
		for(var k=0;k<5;k++) {
			wins[i+k][j-k][count] = true;
		}
		count++;
	}
}

console.log(count);
for(var i=0;i<count;i++) {
	myWin[i] = 0;
	computerWin[i] = 0;
}


Page({
	data: {
		userInfo: app.globalData.userInfo,
		deviceMsg: {},
		modalHidden: true,
		gameTxt:'',
	},
	onLoad(options){
		var that = this;
		wx.getSystemInfo({
			success(res){
				that.setData({
					deviceMsg: res
				})
			}
		});
	},
	onReady() {
		this.context = wx.createContext();
		// wx.chooseImage({
		// 	success: function(res) {
		// 		this.context.drawImage(res.tempFilePaths[0], 0, 0, 350, 350);
		// 		wx.drawCanvas({
		// 			canvasId: 'firstCanvas',
		// 			actions: this.context.getActions()
		// 		})
		// 	}
		// })
		// console.log(this.data.deviceMsg.windowWidth);
		var deviceW = this.data.deviceMsg.windowWidth;
		gameGlobalData.canvasW = deviceW*700/750;
		drawCanvas(this.context,gameGlobalData.canvasW);
		console.log(this.context);
		// this.context.drawImage('./images/bg.jpg', 0, 0);
		wx.drawCanvas({
			canvasId: 'firstCanvas',
			actions: this.context.getActions()
		});
		//调用wx.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为

	},
	modalChange(){
		this.setData({
			modalHidden: true
		})
	},
	reload(){
		wx.redirectTo({
			"url": "/pages/game/game"
		});
	},
	go(event){
		if(over) {
			return ;
		}
		if(!me) {
			return ;
		}
		var px = event.touches[0].pageX;
		var py = event.touches[0].pageY;

		var domX = event.currentTarget.offsetLeft;
		var domY = event.currentTarget.offsetTop;

		var x = px - domX;
		var y = py - domY;
		var i = Math.floor(x/gameGlobalData.space);
		var j = Math.floor(y/gameGlobalData.space);

		if(chess[[i,j]] == 0) {
			oneStep(i,j,me,this.context);
				chess[[i,j]] = 1;
			for(var k=0;k<count;k++) {
				if(wins[i][j][k]) {
					//某点在I,J坐标上拥有赢法、即可为有解
					myWin[k]++;
					computerWin[k] = 6;
					if(myWin[k] == 5) {
						console.log('you win');
						this.setData({
							modalHidden: false,
							gameTxt: '电脑都能赢，你没有女朋友吧？'
						});
						over = true;
					}
				}
			}
			if(!over) {
				me = !me;
				console.info(me);
				computerAI(this.context,this);
			}
		}
	}
});

var computerAI = function(context, that) {
	console.log(that);

	var myScore = [];
	var computerScore = [];
	var max = 0;
	var u=0,v=0;
	for(var i=0;i<15;i++) {
		myScore[i] = [];
		computerScore[i] = [];
		for(var j=0;j<15;j++) {
			myScore[i][j] = 0;
			computerScore[i][j] = 0;
		}
	}

	for(var i=0;i<15;i++) {
		for(var j=0;j<15;j++) {
			if(chess[[i,j]] == 0) {
				for(var k=0;k<count;k++) {
					if(wins[i][j][k]) {
						if(myWin[k] == 1) {
							myScore[i][j] += 200;
						} else if(myWin[k] == 2) {
							myScore[i][j] += 400;
						} else if(myWin[k] == 3) {
							myScore[i][j] += 2000;
						} else if(myWin[k] == 4) {
							myScore[i][j] += 10000;
						}
						if(computerWin[k] == 1) {
							computerScore[i][j] += 220;
						} else if(computerWin[k] == 2) {
							computerScore[i][j] += 420;
						} else if(computerWin[k] == 3) {
							computerScore[i][j] += 2100;
						} else if(computerWin[k] == 4) {
							computerScore[i][j] += 20000;
						}
					}
				}
				if(myScore[i][j] > max) {
					max = myScore[i][j];
					u = i;
					v = j;
				} else if(myScore[i][j] == max) {
					if(computerScore[i][j] > computerScore[u][v]) {
						u = i;
						v = j;
					}
				}
				if(computerScore[i][j] > max) {
					max = computerScore[i][j];
					u = i;
					v = j;
				} else if(computerScore[i][j] == max) {
					if(myScore[i][j] > myScore[u][v]) {
						u = i;
						v = j;
					}
				}
			}
		}
	}
	oneStep(u,v,false,context);
	chess[[u,v]] = 2;
	//遍历是否赢
	for(var k=0;k<count;k++) {
		if(wins[u][v][k]) {
			//某点在I,J坐标上拥有赢法、即可为有解
			computerWin[k]++;
			myWin[k] = 6;
			if(computerWin[k] == 5) {
				console.info('computer win');
				that.setData({
					modalHidden: false,
					gameTxt: '电脑都打不过？你这样能有女朋友？'
				});
				over = true;
			}
		}
	}
	if(!over) {
		me = !me;
	}
}


