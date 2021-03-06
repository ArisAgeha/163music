let AV = require('./app-leancloud.js');
let eventHub = require('./eventHub.js');
let dataHub = require('./dataHub.js');

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
    template2: `
		<li class="createUserList">
			<div class="cover"><img src="__coverLink__" alt=""></div>
			<div class="collectionTitle">__collectionName__</div>
		</li>`,

    addSong(data, playOrder) {
        let $el = $(this.el);
        let li = this.template.replace('__songName__', data.name).replace('__artist__', data.artist);
        let $li = $(li);
        if (playOrder === -1) {
            $(this.el).find('.toplaylistWrapper .toplaylist').append(li);
        } else {
            $(this.el).find('.toplaylistWrapper .toplaylist li').eq(playOrder).after(li);
        }
    },
    
    renderMusicPlayer(currentSongData) {
        let $el = $(this.el);
        let songDetail = $el.find('.songDetail');
        let mp3Wrapper = $el.find('.mp3Wrapper');
        let audio = $('<audio>').prop('src', currentSongData.link);
        let playController = $el.find('.playController');

        songDetail.find('.cover').css('background-image', `url('${currentSongData.cover}')`);
        songDetail.find('.songInformation-text .songName').text(currentSongData.name).siblings().text(currentSongData.artist);
        mp3Wrapper.children().remove();
        mp3Wrapper.append(audio);
        $el.find('.playButton').removeClass('show');
        $el.find('.pauseButton').addClass('show');
        mp3Wrapper.find('audio').get(0).play();

        playController.find('.background').css('background-image', `url("${currentSongData.cover}")`);
        playController.find('.cover').prop('src', currentSongData.cover);
        playController.find('.songInformation .songName').text(currentSongData.name).siblings().text(currentSongData.artist);
        playController.find('.disc').addClass('playing');
        playController.find('.play').removeClass('show').siblings().addClass('show');
    },

    activeSong(prevOrder, currentOrder) {
        let item = $(this.el).find('.toplaylistWrapper .toplaylist li')
        if (item.eq(prevOrder)) item.eq(prevOrder).removeClass('playing');
        if (item.eq(currentOrder)) item.eq(currentOrder).addClass('playing');
    },

    renderAddToList(data) {
        let $el = $(this.el);
        let target = $el.find('.playController .addToCollectionPanel  .userList');
        let li = this.template2.replace('__collectionName__', data.collectionName)
                                .replace('__coverLink__', data.coverLink);
        let $li = $(li).prop('id', data.id);
        target.append($li)
    }
}

let model = {
    init() {
        this.toplayList = [];
        this.playOrder = -1;
        this.csID = '';
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
        this.watchRemoveButton();
        this.watchProgressBar();
        this.watchCollectSong();
        this.watchAddToCollectPanel();
    },
    
    async watchEmitSong() {
        await eventHub.on('playSong', async (data) => {
            if (this.model.toplayList[this.model.playOrder]) {
                if (this.model.toplayList[this.model.playOrder].id === data.songID) return;
            }
            let songData = await this.model.getSongData(data.songID);
            this.model.toplayList.splice(this.model.playOrder + 1, 0, songData);
            this.view.addSong(songData, this.model.playOrder);
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
            // $el.find('.disc').addClass('.playing');
            $el.find('.disc').css('animation-play-state', 'running');
        });
        $el.find('.pauseButton, .pause').on('click touch', (e) => {
            $el.find('audio').get(0).pause();
            $('.pauseButton, .pause').removeClass('show').siblings().addClass('show');
            // $el.find('.disc').removeClass('playing');
            $el.find('.disc').css('animation-play-state', 'paused');
        });
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
        if (this.model.toplayList.length === 0) return;
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

    watchRemoveButton() {
        let $el = $(this.view.el);
        $el.find('.toplaylistWrapper .toplaylist').on('click touch', '.toplay-deleteButton', (e) => {
            e.stopPropagation();
            let li = $(e.currentTarget).parent();
            let targetOrder = li.index();
            let currentOrder = this.model.playOrder;
            this.model.toplayList.splice(targetOrder, 1);
            li.remove();
            if (targetOrder < currentOrder) {
                this.model.playOrder--;
            } else if (this.model.toplayList.length === 0) {
                this.model.playOrder--;
            } else if (targetOrder === currentOrder){
                this.playTargetSong(targetOrder);
            }
        })
    },

    watchProgressBar() {
        let $el = $(this.view.el);
        let totalBar = $el.find('.totalBar');
        let progressBar = $el.find('.currentBar');
        let mp3Wrapper = $el.find('.mp3Wrapper');
        
        setInterval(() => {
            let audio = mp3Wrapper.find('audio').get(0);
            if (!audio) return;
            let progress = audio.currentTime / audio.duration;
            let percent = (progress * 100).toFixed(2) + '%';
            progressBar.css('width', percent);
        }, 750)

        totalBar.on('click', (e) => {
            let audio = mp3Wrapper.find('audio').get(0);
            let width = totalBar.outerWidth();
            let x = e.offsetX;
            let progress = x / width;
            let percent = (progress * 100).toFixed(2) + '%';
            progressBar.css('width', percent);
            audio.currentTime = audio.duration * progress
        });
    },

    watchCollectSong() {
        let $el = $(this.view.el);
        let cb = $el.find('.playController .controlPanel .addToCollection');
        cb.on('click', () => {
            let currentSongData = this.model.toplayList[this.model.playOrder];
            if (!currentSongData) return;
            this.model.csID = currentSongData.id;
            let userListData = dataHub.get('userData');
            if (userListData.length === 0) return;
            this.showAddToCollectPanel(userListData);
        })
    },

    showAddToCollectPanel(userListData) {
        $(this.view.el).find('.addToCollectionPanel .userList li:gt(0)').remove();
        for (let item in userListData) {
            let data = {
                id: item,
                collectionName: userListData[item].collectionName,
                coverLink: userListData[item].coverLink
            }
            this.view.renderAddToList(data);
        }
        $(this.view.el).find('.addToCollectionPanel').addClass('show');
    },

    watchAddToCollectPanel() {
        this.watchSwitchPage();
        this.watchAdd();
        this.watchSubmit();
    },

    watchSwitchPage() {
        let $el = $(this.view.el);
        $el.find('.userListWrapper').on('click', (e) => {
            e.stopPropagation();
        })

        $el.find('.addToCollectionPanel').on('click', (e) => {
            $(e.currentTarget).removeClass('show');
        })

        $el.find('.createUserList').on('click', (e) => {
            $el.find('.newUserListPanel').addClass('show');
        })

        $el.find('.newUserListPanel').on('click', (e) => {
            $(e.currentTarget).removeClass('show');
        })
    },

    watchSubmit() {
        let $el = $(this.view.el);
        let menu = $el.find('.newUserListPanel .userListWrapper');
        let hint = menu.find('.errorHint');
        menu.find('.submitButton').on('click', (e) => {
            let collectionName = $el.find('input').val()
            if (!collectionName) {
                hint.text('请输入歌单名！');   
            } else if (collectionName.length > 24) {
                hint.text('歌单名字不能超过24个字符！');       
            } else {
                eventHub.emit('addUserList', {songID: this.model.csID, collectionName: collectionName});
                $el.find('.newUserListPanel').removeClass('show');
                $el.find('.addToCollectionPanel').removeClass('show');
            }
        })
    },

    watchAdd() {
        let $el = $(this.view.el);
        let menu = $el.find('.addToCollectionPanel');
        menu.find('.userList').on('click', 'li:gt(0)', (e) => {
            let id = $(e.currentTarget).prop('id');
            let songID = this.model.csID;
            eventHub.emit('addSongToList', {songID: songID, listID: id});
            $el.find('.addToCollectionPanel').removeClass('show');
        })
    }
}

controller.init(view, model);

