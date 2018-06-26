// 存储服务
var AV = require('leancloud-storage');
var { Query, User } = AV;
// 实时消息服务
var { Realtime, TextMessage } = require('leancloud-realtime');

var APP_ID = 'UKsy38Qp4qAcR5plB0iwPjdQ-gzGzoHsz';
var APP_KEY = 'Yj5yGRiqz7DFhswBz2DITdDy';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

// var TestObject = AV.Object.extend('TestAris');
// var testObject = new TestObject();
// testObject.save({
//   words: 'Hello World!'
// }).then(function(object) {
//   alert('LeanCloud Rocks!');
// })
