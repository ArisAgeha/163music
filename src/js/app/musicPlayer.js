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

    addSong(data) {
        let $el = $(this.el);
        let li = this.template.replace('__songName__', data.name).replace('__artist__', data.artist);
        let $li = $(li);
        $(this.el).find('.toplaylistWrapper .toplaylist').append(li);
    },
    
    renderMusicPlayer(currentSongData) {
        let $el = $(this.el);
        let songDetail = $el.find('.songDetail');
        let mp3Wrapper = $el.find('.mp3Wrapper');
        songDetail.find('.cover').css('background-image', currentSongData.cover);
        songDetail.find('.songInformation-text .songName').text(currentSongData.name).siblings().text(currentSongData.artist);
        let audio = $('<audio>').prop('src', currentSongData.link).prop('autoplay', 'true');
        mp3Wrapper.children().remove();
        mp3Wrapper.append(audio);
        $el.find('.playButton').removeClass('show');
        $el.find('.pauseButton').addClass('show');
        $(this.el).find('audio').load(() => {
            console.log(1)
        })
    },

    activeSong(prevOrder, currentOrder) {
        if (prevOrder === currentOrder) return;
        let item = $(this.el).find('.toplaylistWrapper .toplaylist li')
        console.log(item)
        if (item.eq(prevOrder)) item.eq(prevOrder).removeClass('playing');
        if (item.eq(currentOrder)) item.eq(currentOrder).addClass('playing');
    }
}

let model = {
    init() {
        this.toplayList = [];
        this.playOrder = -1;
    }, 

    async getSongData(songID) {
        let query = new AV.Query('SongList');
        let queryData = await query.get(songID).then(async (list) => {
            return list;
        })
        return {
            id: queryData.id,
            ...queryData.attributes
        }
    },

    async getSongsData(IDs) {
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
        this.model.init();
        this.bindEvent();
    },

    bindEvent() {
        this.watchPlaySong();
        this.watchMusicOnload();
    },
    
    async watchPlaySong() {
        await eventHub.on('playSong', async (data) => {
            if (this.model.toplayList[this.model.playOrder]) {
                if (this.model.toplayList[this.model.playOrder].id === data.songID) return;
            }
            let songData = await this.model.getSongData(data.songID);
            this.model.toplayList.splice(this.model.playOrder + 1, 0, songData);
            this.view.addSong(songData);
            this.view.activeSong(this.model.playOrder, this.model.playOrder + 1);
            this.model.playOrder++;
            this.view.renderMusicPlayer(this.model.toplayList[this.model.playOrder]);
        })
    },

    watchMusicOnload() {
    }
}

controller.init(view, model);

