let $ = require('jquery');
let AV = require('./app-leancloud.js');
let eventHub = require('./eventHub.js');

let view = {
    el: '.search-main',
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
    async queryData(string) {
        let regExp = new RegExp(string, "i");
        let query1 = new AV.Query('SongList');
        let query2 = new AV.Query('SongList');
        let query3 = new AV.Query('SongList');
        query1.matches("name", regExp);
        query2.matches("artist", regExp);
        query3.matches("album", regExp);
        let query = new AV.Query.or(query1, query2, query3)

        return await query.find().then(function(results) {
            return results;
        });
    }
}

let controller = {
    init() {
        this.view = view;
        this.model = model;
        this.bindEvent();
    },

    bindEvent() {
        this.watchSearch();
        this.watchPlaySong();
    },

    async watchSearch() {
        let $el = $(this.view.el);
        let button = $el.find('.searchButton');
        button.on('click touch', async () => {
            await search.call(this);
        });
        $el.find('input').bind('keypress', async (e) => {
            if (e.keyCode === 13){
                await search.call(this);
            }
        });

        async function search() {
            let value = $el.find('input').val();
            let result = await this.model.queryData(value);
            if (!value) return;
            console.log(result);
            $el.find('ol > li').remove();
            for (let item of result) {
                let data = {
                    id: item.id,
                    songName: item.attributes.name,
                    artist: item.attributes.artist,
                    album: item.attributes.album
                }
                this.view.render(data);
            }
        }
    },

    watchPlaySong() {
        $(this.view.el).find('.search-wrapper').on('click', 'li', (e) => {
            let songID = e.currentTarget.id;
            eventHub.emit('playSong', {songID: songID});
        })
    }
}

controller.init();
