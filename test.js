let sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};

var start = function () {
    // 在这里使用起来就像同步代码那样直观
    console.log('start');
    sleep(3000);
    console.log('end');
};

start();
