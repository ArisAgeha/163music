// 存储服务
let AV = require('leancloud-storage');
let { Query, User } = AV;
// 实时消息服务
let { Realtime, TextMessage } = require('leancloud-realtime');

let APP_ID = 'UKsy38Qp4qAcR5plB0iwPjdQ-gzGzoHsz';
let APP_KEY = 'Yj5yGRiqz7DFhswBz2DITdDy';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

module.exports = AV;
// let TestObject = AV.Object.extend('TestAris');
// let testObject = new TestObject();
// testObject.save({
//   words: 'Hello World!'
// }).then(function(object) {
//   alert('LeanCloud Rocks!');
// })
