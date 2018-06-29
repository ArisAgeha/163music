let $ = require('jquery');
let AV = require('./admin-leancloud.js');
let eventHub = require('./eventHub.js');
let dataHub = require('./dataHub.js');

{
    let view = {
        el: '.mainPanel',
        template: `<tr>
        <td class="td-checkbox"><input type="checkbox"></td>
        <td class="name-td"><span>__name__</span></td>
        <td class="artist-td"><span>__artist__</span></td>
        <td class="album-td"><span>__album__</span></td>
        <td class="link-td"><span>__link__</span></td>
        <td class="size-td"><span>__size__</span></td>
        <td class="status-td">__saveStatus__</th>
        </tr>`
    };
    
    let model = {
        init() {
            console.error('mainPanel init start!');
            this.songList = {};
        },

        async requireSongList() {
            let queryList = new AV.Query('SongList');
            await queryList.find().then((list) => {
                for (let i = 0; i < list.length; i++) {
                    let obj = {...list[i].attributes};
                    let id = list[i].id;
                    this.songList[id] = obj;
                }
            }, (err) => {
                console.log(err)    
            })

            function sleep(numberMillis) {
                var now = new Date();
                var exitTime = now.getTime() + numberMillis;
                while (true) {
                    now = new Date();
                    if (now.getTime() > exitTime) return;
                }
            }
        },
    };

    let controller = {
        async init(view, model) {
            this.view = view;
            this.model = model;
            await this.getSongList();
            this.initView();
            this.bindEvent();
        },

        async getSongList() {
            await this.model.requireSongList();
        },

        initView() {
            buildDOM.call(this);
            showCurrentList.call(this);

            function buildDOM() {
                let collectionList = dataHub.get('collectionList');

                for (let key in collectionList) {
                    let tbody = $(`<tbody class=_${key}></tbody>`);
                    let table = $(this.view.el).find('.table');

                    for(let songID of collectionList[key]) {
                        let songInfo = this.model.songList[songID];
                        let trString = this.view.template
                            .replace('__name__', songInfo.name)
                            .replace('__artist__', songInfo.artist)
                            .replace('__album__', songInfo.album)
                            .replace('__link__', songInfo.link)
                            .replace('__size__', songInfo.size)
                            .replace('__saveStatus__', '已保存');
                        let tr = $(trString);
                        tbody.append(tr);
                    }
                    table.append(tbody);
                }
            }

            function showCurrentList() {
                let currentList = dataHub.get('currentList');
                $(this.view.el).find('._' + `${currentList}`).addClass('show').siblings().removeClass('show');
            }
        },
        
        bindEvent() {
            this.watchAddList();
            this.watchSwitchList();
            this.watchEditor();
            eventHub.on('uploadstart', (data) => {
                initSongView.call(this, data);
            });
            eventHub.on('uploadover', (data) => {
                completeSongView.call(this, data);
            });

            function initSongView(data) {
                let currentListName = dataHub.get('currentList');
                let currentList = $(this.view.el).find('._' + currentListName);
                let trString = this.view.template
                    .replace('__name__', data.name)
                    .replace('__artist__', data.artist)
                    .replace('__size__', data.size)
                    .replace('__saveStatus__', data.saveStatus);
                let tr = $(trString);
                tr.addClass('uploading');
                tr.addClass(data.id);
                currentList.prepend(tr);
            }

            function completeSongView(data) {
                let target = $(this.view.el).find('.' + data.id)
                target.removeClass('uploading').addClass('notlogin');
                target.find('.link-td > span').text(data.link);
                target.find('.status-td').text('待储存');
                target.find('.album-td > span').text('未知专辑');
            }
        },

        watchAddList() {
            eventHub.on('addCollection', (data) => {
                let tbody = $(`<tbody class=_${data}></tbody>`);
                let table = $(this.view.el).find('.table');
                table.append(tbody);
            })
        },

        watchSwitchList() {
            eventHub.on('switchCollection', (data) => {
                let $el = $(this.view.el);
                $el.find('._' + `${data}`).addClass('show').siblings().removeClass('show');
            })
        },

        watchEditor() {
            let table = $(this.view.el).find('table');
            let mask = $(this.view.el).find('.clCreator-mask');
            table.on('mouseenter', 'tr',(e) => {
                $(e.currentTarget).find('.name-td, .artist-td, .album-td').addClass('show');
            });
            table.on('mouseleave', 'tr',(e) => {
                $(e.currentTarget).find('.name-td, .artist-td, .album-td').removeClass('show');
            });
            table.on('click', '.name-td, .artist-td, .album-td', (e) => {
                let tempVal = $(e.currentTarget).children().text();
                let target = $(e.currentTarget);
                mask.addClass('show').find('input').val(tempVal);
                mask.find('input').focus();

                mask.on('click.temp', '.cl-confirm', (e) => {
                    let tempVal = mask.find('input').val().trim();
                    mask.removeClass('show');
                    if (tempVal !== '') {
                        target.find('span').text(tempVal);
                        target.parent().addClass('unsaved').find('.status-td').text('修改未储存');
                        mask.unbind('click.temp');
                    }
                })

                mask.on('click.temp', '.cl-cancel', (e) => {
                    mask.removeClass('show');
                    mask.unbind('click.temp');
                })

            });
            
        }

    };
    model.init();
    controller.init(view, model);
}
