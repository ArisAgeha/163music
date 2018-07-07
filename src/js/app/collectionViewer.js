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
        searchWrapper.append(item);
    }
}

let model = {
    async queryCollectionList(id) {
        let query = new AV.Query('CollectionList');
        return await query.get(id).then(async (list) => {

        })
    }
}

let controller = {
    init() {
        this.view = view,
        this.model = model
        this.bindEvent();
    },

    bindEvent() {
        this.watchShowCollectionList();
    },

    watchShowCollectionList() {
        eventHub.on('showCollectionList', async function(data) {
            let collectionList = await this.model.queryCollectionList(data.id);
        })
    }

    
}

controller.init(view, model);
