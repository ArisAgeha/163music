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
    init() {
        this.result = [];
    }
}
