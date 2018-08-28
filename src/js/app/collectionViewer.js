let AV = require('./app-leancloud.js');
let eventHub = require('./eventHub.js');

let view = {
    el: '.collectionViewer',
    template: `
    <li>
        <div class="songName">__songName__</div>
        <div class="information">
            <span class="artist">__artist__</span>
            <span class="split"> - </span>
            <span class="album">__album__</span>
        </div>
    </li>`,

    render(data) {
        let target = $(this.el).find('.collectionList .songList');
        let itemString = this.template.replace('__songName__', data.songName)
                                    .replace('__artist__', data.artist)
                                    .replace('__album__', data.album);
        let item = $(itemString);
        item.prop('id', data.id);
        target.append(item);
    }
}

let model = {
    async queryListData(id) {
        let query = new AV.Query('CollectionList');
        return await query.get(id).then(async (list) => {
            return list;
        })
    },

    async queryUserListData(id) {
        let query = new AV.Query('UserList');
        return await query.get(id).then(async (list) => {
            return list;
        })
    },

    async querySongs(IDs) {
        let query = new AV.Query('SongList');
        query.containedIn('objectId', IDs);
        return await query.find().then(function(results) {
            return results;
        });
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
        this.watchPlaySong();
    },

    watchShowCollectionList() {
        eventHub.on('showCollectionList', async (data) => {
            let $el = $(this.view.el);
            let coverImg = $el.find('.collectionTheme > .cover > img');
            let bgCover = $el.find('.collectionTheme .background');
            let collectionTitle = $el.find('.collectionTheme > .collectionTitle');
            let collectionList = $el.find('.collectionList .songList');
            let listData;
            if (!data.user) {
                listData = await this.model.queryListData(data.id);
            } else {
                listData = await this.model.queryUserListData(data.id);
            }
            listData.attributes.coverLink = listData.attributes.coverLink || 'http://pbeu96c1d.bkt.clouddn.com/014.png'

            coverImg.prop("src", listData.attributes.coverLink);
            bgCover.css('background-image', `url("${listData.attributes.coverLink}")` || "url('http://pbeu96c1d.bkt.clouddn.com/014.png')");
            collectionTitle.text(listData.attributes.collectionName);

            let IDs = [];
            for (let item of listData.attributes.songList) {
                IDs.push(item);
            }
            let songs = await this.model.querySongs(IDs);
            collectionList.find('li').remove();
            for (let item of songs) {
                let data = {
                    songName: item.attributes.name,
                    artist: item.attributes.artist,
                    album: item.attributes.album,
                    id: item.id
                }
                this.view.render(data);
            }
            $el.addClass('show');
        })
    },

    watchPlaySong() {
        $(this.view.el).find('ol').on('click', 'li', (e) => {
            let songID = e.currentTarget.id;
            eventHub.emit('playSong', {songID: songID});
        });

        $(this.view.el).find('.playAllButton, .playAllText').on('click', () => {
            let data = [];
            let $songs = $(this.view.el).find('ol > li');
            for (let item of $songs) {
                data.push(item.id);
            }
            eventHub.emit('playAllSongs', data);
        });
    }

}

controller.init(view, model);
