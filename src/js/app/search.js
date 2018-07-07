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
        let searchWrapper = $(this.el).find('.searchWrapper');
        let itemString = template.replace('__songName__', data.songName)
                                    .replace('__artist__', data.artist)
                                    .replace('__album__', data.album);
        let item = $(resultString);
        item.prop('id', data.id);
        searchWrapper.append(item);
    }
}

let model = {
//    async queryData(string) {
//        console.log(string)
//        var query = new AV.SearchQuery('SongList');
//        query.queryString(`name:${string} artist:${string} album:${string}`);
//        return await query.find().then(function(results) {
//            console.log(results)
//            return results;
//        });
//    }
//    async queryData(string) {
//        console.log(string)
//        var query1 = new AV.Query('SongList');
//        var query2 = new AV.Query('SongList');
//        var query3 = new AV.Query('SongList');
//        query1.contains('name', string);
//        query2.contains('artist', string);
//        query3.contains('album', string);
//        let query = new AV.Query.or(query1, query2, query3);
//        return await query.find().then(function(results) {
//            console.log(results)
//            return results;
//        });
//    }
    async queryData(string) {
        console.log(string)
        let query = new AV.Query('SongList');
        query.matches(name, '^About')
        return await query.find().then(function(results) {
            console.log(results)
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
    },

    async watchSearch() {
        let $el = $(this.view.el);
        let button = $el.find('.searchButton');
        button.on('click touch', async () => {
            let value = $el.find('input').val();
            let result = await this.model.queryData(value);
            console.log(result);
        })
    }

}

controller.init();
