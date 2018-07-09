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
        let audio = $('<audio>').prop('src', currentSongData.link).prop('autoplay', 'true');
        let playController = $el.find('.playController');

        songDetail.find('.cover').css('background-image', currentSongData.cover);
        songDetail.find('.songInformation-text .songName').text(currentSongData.name).siblings().text(currentSongData.artist);
        mp3Wrapper.children().remove();
        mp3Wrapper.append(audio);
        $el.find('.playButton').removeClass('show');
        $el.find('.pauseButton').addClass('show');

        playController.find('.cover').prop('src', currentSongData.cover);
        playController.find('.songInformation .songName').text(currentSongData.name).siblings().text(currentSongData.artist);
        playController.find('.disc').addClass('playing');
        playController.find('.play').removeClass('show').siblings().addClass('show');

    },

    activeSong(prevOrder, currentOrder) {
        if (prevOrder === currentOrder) return;
        let item = $(this.el).find('.toplaylistWrapper .toplaylist li')
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
        this.watchEmitSong();
        this.watchToggle();
        this.watchSwitchSong();
    },
    
    async watchEmitSong() {
        await eventHub.on('playSong', async (data) => {
            if (this.model.toplayList[this.model.playOrder]) {
                if (this.model.toplayList[this.model.playOrder].id === data.songID) return;
            }
            let songData = await this.model.getSongData(data.songID);
            this.model.toplayList.splice(this.model.playOrder + 1, 0, songData);
            this.view.addSong(songData);
            this.playTargetSong(this.model.playOrder + 1);

            // this.view.activeSong(this.model.playOrder, this.model.playOrder + 1);
            // this.model.playOrder++;
            // this.view.renderMusicPlayer(this.model.toplayList[this.model.playOrder]);
        })
    },

    watchToggle() {
        let $el = $(this.view.el);
        $el.find('.playButton, .play').on('click touch', (e) => {
            $el.find('audio').get(0).play();
            $('.playButton, .play').removeClass('show').siblings().addClass('show');
        })
        $el.find('.pauseButton, .pause').on('click touch', (e) => {
            $el.find('audio').get(0).pause();
            $('.pauseButton, .pause').removeClass('show').siblings().addClass('show');
        })
    },

    watchSwitchSong() {
        let $el = $(this.view.el);
        $el.find('.prevSong').on('click touch', (e) => {
            let prevOrder = this.model.playOrder;
            this.playTargetSong(prevOrder - 1);
        });
        $el.find('.nextSong').on('click touch', (e) => {
            let prevOrder = this.model.playOrder;
            this.playTargetSong(prevOrder + 1);
        });
        $el.find('.toplaylistWrapper .toplaylist').on('click touch', 'li', (e) => {
            let order = $(e.currentTarget).index(); // 测试
            this.playTargetSong(order);
        })
    },

    async playTargetSong(currentOrder) {
        if (currentOrder === -1) currentOrder = this.model.toplayList.length - 1;
        if (currentOrder === this.model.toplayList.length) currentOrder = 0;
        this.view.activeSong(this.model.playOrder, currentOrder);
        this.model.playOrder = currentOrder;
        this.view.renderMusicPlayer(this.model.toplayList[this.model.playOrder]);
        
        let mp3Wrapper = $(this.view.el).find('.mp3Wrapper');
        mp3Wrapper.find('audio').bind('ended', (e) => {
            let prevOrder = this.model.playOrder;
            this.playTargetSong(prevOrder + 1);
        })
    },
}

controller.init(view, model);

