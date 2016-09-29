let app = getApp();

Page({
	data: {
		userInfo: {},
		motto: '开始游戏',
	},
	onLoad(){
		app.getUserInfo((userInfo)=>{
			this.setData({
				userInfo: userInfo,
			});
		});
	},
	startGame: function(){
		console.log('start');
		wx.navigateTo({
		      "url": "/pages/game/game"
		});
	}

})
