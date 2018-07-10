let AV = require('./app-leancloud.js');
let $ = require('jquery');
let eventHub = require('./eventHub.js');
let dataHub = require('./dataHub.js');

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
        let target = $(this.el).find('.myCollection');
        if (!target.children()[0]) li.find('.deleteCollection').remove();
        target.append(li);
    }
}

let model = {
    init() {
        this.userData = {};
        dataHub.set('userData', this.userData)
    },

    async queryInitData() {
        let query = new AV.Query('UserList');
        query.contains('userID', AV.User.current().id);
        return await query.find().then(function(results) {
            return results;
        });
    },

    async addUserListData(data) {
        let Collection = AV.Object.extend('UserList');
        let collection = new Collection();
        return await collection.save({
            'userID': data.userID,
            'collectionName': data.collectionName,
            'songList': data.songList,
            'coverLink': data.coverLink
        }).then(function(object) {
            return object.id
        })
    },

    async modifyUserListData(data) {
        let Collection = AV.Object.extend('UserList');
        let collection = new Collection();
        return await collection.save({
            'songList': data.songList,
        }).then(function(object) {
            return object.id
        })
    },

    async getCoverLink(id) {
        let query = new AV.Query('SongList');
        return await query.get(id).then((list) => {
            return list.attributes.cover;
        })
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
        this.watchShowCollectionList();
        this.watchAddUserList();
        this.watchAddSongToList();
    },

    async initUser() {
        await eventHub.on('isLogin', async () => {
            $(this.view.el).find('.myCollection').children().remove();
            let data = await this.model.queryInitData();
            for (let userListData of data) {
                let localData = {
                    ...userListData.attributes,
                }
                this.model.userData[userListData.id] = localData;
                this.view.render(localData, userListData.id);
            }
        })
        
    },

    watchShowCollectionList() {
        console.log(this.model.userData);
        $(this.view.el).find('.myCollection').on('click', 'li', (e) => {
            let id = $(e.currentTarget).prop('id');
            eventHub.emit('showCollectionList', {id: id, user: true});
        })
    },

    watchAddUserList() {
        eventHub.on('addUserList', async (data) => {
            let songID = data.songID;
            let songCoverLink = await this.model.getCoverLink();

            let collectionName = data.collectionName;
            let coverLink = 'undefined';
            let userID = AV.User.current();
            let extractedData = {
                collectionName: collectionName,
                coverLink: songCoverLink,
                userID: userID,
                songList: [songID]
            }
            let newListID = await this.model.addUserListData(extractedData);
            eventHub.emit('isLogin');
        })
    },

    watchAddSongToList() {
        eventHub.on('addSongToList', async (data) => {
            let songID = data.songID;
            let targetListID = data.listID;
            this.model.userData.targetListID.songList.push(songID);
            await this.model.modifyUserListData(this.model.userData.targetListID);
        })
    }
}

controller.init(view, model);
