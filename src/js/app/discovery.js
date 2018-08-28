let AV = require('./app-leancloud.js');
let eventHub = require('./eventHub.js');

let view = {
    el: '.discovery-main',
    template: `
    <div class="item">
        <div class="itemCover">
            <img src="__src__">
        </div>
        <div class="itemName">__itemName__</div>
    </div>`,

    render(targetName, data) {
        let item = this.template.replace("__src__", data.src).replace("__itemName__", data.itemName);
        let $item = $(item).prop("id", data.id);
        $(targetName).append($item);
    }
}

let model = {
    async init() {
        this.lastestCollection = [];
        this.lastestSong = [];
        await this.getData();
    },

    async getData() {
        this.lastestCollection = await queryData('CollectionList', 6);
        this.lastestSong = await queryData('SongList', 12);
        
        async function queryData(className, num) {
            let query = new AV.Query(className);
            let now = new Date();
            query.lessThanOrEqualTo('createdAt', now);
            query.descending('createdAt');
            query.limit(num);
            return await query.find().then((list) => {
                return list;
            })
        }
    }
}

let controller = {
    async init(view, model) {
        this.view = view;
        this.model = model;
        await this.model.init();
        this.updateView();
        this.bindEvent();
    },
    
    updateView() {
        for (let item of this.model.lastestCollection) {
            let target = '.discovery-main .recommandList .exhibition'
            let data = {
                id: item.id,
                src: item.attributes.coverLink,
                itemName: item.attributes.collectionName
            }
            if (item.attributes.coverLink === 'undefined' || !item.attributes.coverLink) data.src = 'http://pbeu96c1d.bkt.clouddn.com/014.png';
            this.view.render(target, data);
        }
        for (let item of this.model.lastestSong) {
            let target = '.discovery-main .recommandSongs .exhibition';
            let data = {
                id: item.id,
                src: item.attributes.cover,
                itemName: item.attributes.name
            }
            if (item.attributes.cover === 'undefined') data.src = 'http://pbeu96c1d.bkt.clouddn.com/014.png';  
            this.view.render(target, data);
        }
    },

    bindEvent() {
        this.watchCollection();
        this.watchSongs();
    },

    watchCollection() {
        let viewer = $('.collectionViewer');
        let collection = $(this.view.el).find('.recommandList .exhibition .item');
        collection.on('click touch', (e) => {
            let id = e.currentTarget.id;
            eventHub.emit('showCollectionList', {id: id});
        })
    },

    watchSongs() {
        let song = $(this.view.el).find('.recommandSongs .exhibition .item');
        song.on('click touch', (e) => {
            let songID = e.currentTarget.id;
            eventHub.emit('playSong', {songID: songID});
        })
    }
}

controller.init(view, model);
