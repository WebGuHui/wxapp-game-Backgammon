//logs.js
var app = getApp();
var util = require('../../utils/util.js')
Page({
  data: {
    logs: []
  },
  onLoad: function (option) {
    console.log(option);
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(function (log) {
        return util.formatTime(new Date(log))
      })
    })
  }
})
