let AV = require('./app-leancloud.js');
let $ = require('jquery');
let eventHub = require('./eventHub.js');

let view = {
    el: '.loginPanel',
}

let model = {
    init() {
        this.userID = '';
    }
}

let controller = {
    init(view, model) {
        this.view = view;
        this.model = model;
        this.model.init();
        this.findCurrentUser();
        this.bindEvent();
    },

    bindEvent() {
        this.watchSignup();
        this.watchLogin();
        this.watchLogout();
    },

    watchSignup() {
        $(this.view.el).find('.signupButton').on('click', async (e) => {
            let hint = $(this.view.el).find('.hint');
            let username = $(this.view.el).find('.login-username-input').val();
            let password = $(this.view.el).find('.login-password-input').val();
            if (username.length === '' || password === '') {
                hint.text('请输入用户名/密码');   
                return;
            } else if (username.length > 12 || password.length > 12){
                hint.text('用户名/密码不能超过12位');
                return;
            }
            let message = await this.signupUser(username, password);
            if (message.id) {
                hint.text('注册成功！');
            } else if (message === 202) {
                hint.text('用户名已存在！');
            }
        })
    },

    async signupUser(username, password) {
        let user = new AV.User();
        return await user.signUp({username: username, password: password}).then(async (data) => {
            let Collection = AV.Object.extend('UserList');
            let collection = new Collection();
            await collection.save({
                'userID': data.id,
                'collectionName': '我喜欢的音乐',
                'songList': [],
                'coverLink': 'http://pbeu96c1d.bkt.clouddn.com/010.png'
            }).then(function(object) {
                return object.id
            })
            return data;
        }, (err) => {
            return err.code;
        })
    },

    watchLogin() {
        $(this.view.el).find('.loginButton').on('click', async () => {
            let hint = $(this.view.el).find('.hint');
            let username = $(this.view.el).find('.login-username-input').val();
            let password = $(this.view.el).find('.login-password-input').val();
            if (username.length === '' || password === '') {
                hint.text('请输入用户名/密码');   
                return;
            } else if (username.length > 12 || password.length > 12){
                hint.text('用户名/密码不能超过12位');
                return;
            }
            let message = await this.login(username, password);
            if (message === 210) {
                hint.text('密码错误！');
            } else if (message === 211) {
                hint.text('用户名不存在！');
            } else if (AV.User.current() !== null) {
                this.showUserPanel();
            } else {
                hint.text('未知错误代码，请重试。')
            }
        })
    },

    async login(username, password) {
        return await AV.User.logIn(username, password).then((data) => {
            return data;
        }, (err) => {
            return err.code;
        })
    },

    findCurrentUser() {
        if (AV.User.current() !== null) {
            this.showUserPanel();
        }
    },

    showUserPanel() {
        eventHub.emit('isLogin');
        $(this.view.el).removeClass('show').siblings().addClass('show');
    },

    watchLogout() {
        eventHub.on('logout', () => {
            $(this.view.el).addClass('show').siblings().removeClass('show');
            $(this.view.el).find('.login-password-input').val('');
        })
    }
}

controller.init(view, model); 
