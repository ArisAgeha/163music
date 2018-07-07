let AV = require('./app-leancloud.js');
let $ = require('jquery');
let eventHub = require('./eventHub.js');

let view = {
    el: '.collectionViewer',
    template: `
    <li>
        <div class="songName">about me</div>
        <div class="information">
            <span class="artist">茶理理</span>
            <span class="split"> - </span>
            <span class="album">热歌慢摇</span>
        </div>
    </li>`,

    render(data) {
        let searchWrapper = $(this.el).find('.search-wrapper');
        let itemString = this.template.replace('__songName__', data.songName)
                                    .replace('__artist__', data.artist)
                                    .replace('__album__', data.album);
        let item = $(itemString);
        item.prop('id', data.id);
        // searchWrapper.append(item);
    }
}

let model = {
    async querySong(id) {
        let query = new AV.Query('CollectionList');
        return await query.get(id).then(async (list) => {
            return list;
        })
    }
}

let controller = {
    init(view, model) {
        this.view = view;
        this.model = model;
        this.bindEvent();
    },

    bindEvent() {
        this.watchShowCollectionList();
    },

    watchShowCollectionList() {
        eventHub.on('showCollectionList', async (data) => {
            let $el = $(this.view.el);
            let coverImg = $el.find('.collectionTheme > .cover > img');
            let collectionTitle = $el.find('.collectionTheme > .collectionTitle');
            let collectionList = $el.find('.collectionList .songList');
            let songData = await this.model.querySong(data.id);
            coverImg.prop("src", songData.attributes.coverLink || 'http://pbeu96c1d.bkt.clouddn.com/14.jpg');
            console.log(coverImg)
            for (let item of songData){

            }
        })
    }

    
}

controller.init(view, model);
