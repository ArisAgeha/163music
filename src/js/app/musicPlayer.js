let $ = require('jquery');
let AV = require('./app-leancloud.js');
let eventHub = require('./eventHub.js');

let view = {
    el: 'footer',
    template: 
    `<li>
        <div class="songInformation">
            <span class="playingHint">
                <svg class="icon" aria-hidden="true">
                    <use xlink:href="#icon-playingicon"></use>
                </svg>
            </span>
            <span class="toplay-songName">__songName__</span>
            <span class="split"> - </span>
            <span class="toplay-artist">__artist__</span>
        </div>
        <span class="toplay-deleteButton">
            <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-delete"></use>
            </svg>
        </span>
    </li>`,

    renderList(data) {
        $el = $(this.view.el);
        
    },
    
    renderMusicPlayer(data) {
        $el = $(this.view.el);
    },

    activeList() {
        
    }
}

let model = {
    
}

let controller = {
    init(view, model) {
        this.view = view;
        this.model = model;
        this.bindEvent();
    },

    bindEvent() {
        
    }
}

controller.init(view, model);

