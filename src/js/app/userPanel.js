let AV = require('./app-leancloud.js');
let $ = require('jquery');
let eventHub = require('./eventHub.js');

let view = {
    el: '.userPanel',
    template: `
        <li>
            <div class="collectionInformation">
                <div class="cover"><img src="__coverLink__" alt=""></div>
                <div class="collectionTitle">__collectionName__</div>
            </div>
            <div class="deleteCollection">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-delete1"></use>
                </svg>
            </div>
        </li>`,

    render(data, id) {
        let liString = this.template.replace('__coverLink__', data.coverLink)
                                    .replace('__collectionName__', data.collectionName);
        let li = $(liString);
        li.prop('id', id);
        $(this.el).find('.myCollection').append(li);
    }
}

let model = {
    init() {
        this.userData = {};
    },

    async queryInitData() {
        let query = new AV.Query('UserList');
        query.contains('UserID', AV.User.current().id);
        return await query.find().then(function(results) {
            return results;
        });
    }
}

let controller = {
    init(view, model) {
        this.view = view;
        this.model = model;
        this.model.init();
        this.bindEvent();
    },

    async bindEvent(){
        await this.initUser();
    },

    async initUser() {
        await eventHub.on('isLogin', async () => {
            let data = await this.model.queryInitData();
            console.log(data);
            for (let userListData of data) {
                let localData = {
                    ...userListData.attributes,
                }
                this.model.userData[userListData.id] = localData;
                console.log(this.model.userData);
                this.view.render(localData, userListData.id);
            }
        })
        
    }
}

controller.init(view, model);
