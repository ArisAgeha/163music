let $ = require('jquery');
let AV = require('./admin-leancloud.js');
let eventHub = require('./eventHub.js');
let dataHub = require('./dataHub.js');

{
    let view = {
        el: '.mainPanel',
        template: `<tr>
        <td class="td-checkbox"><input type="checkbox"></td>
        <td class="name-td"><span>__name__</span><i>&#xe636</i></td>
        <td class="artist-td"><span>__artist__</span><i>&#xe636</i></td>
        <td class="album-td"><span>__album__</span><i>&#xe636</i></td>
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

        requireSongList() {
            let queryList = new AV.Query('SongList');
            queryList.find().then((list) => {
                for (let i = 0; i < list.length; i++) {
                    let obj = {...list[i].attributes};
                    let id = list[i].id;
                    this.songList[id] = obj;
                }
            }, (err) => {
                console.log(err)    
            })

        },
    };

    let controller = {
        async init(view, model) {
            this.view = view;
            this.model = model;
            this.getSongList();
            await this.initView();
            this.bindEvent();
        },

        getSongList() {
            this.model.requireSongList();
        },

        async initView() {
            await buildDOM.call(this);
            showCurrentList.call(this);

            async function buildDOM() {
                let loadList = dataHub.get('loadList');
                if (!loadList) {
                    await waitForListLoadEnd();
                }
                console.warn('---')

                async function waitForListLoadEnd() {
                    let sleep = function (time) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve();
                            }, time);
                        })
                    };

                    let loadList = dataHub.get('loadList');
                    console.error(loadList);
                    let circle = 0;
                    while(!dataHub.get('loadList')) {
                        await sleep(200);
                        console.warn(++circle);
                    }
                }


                let collectionList = dataHub.get('collectionList');
                console.error(collectionList);

                for (let key in collectionList) {
                    let tbody = $(`<tbody class=_${key}></tbody>`);
                    let table = $(this.view.el).find('.table');

                    if (collectionList[key]){
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
            this.watchSelectButton();
            this.watchSaveButton();
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

            table.on('click', '.name-td > i, .artist-td > i, .album-td > i', (e) => {
                let tempVal = $(e.currentTarget).children().text();
                let target = $(e.currentTarget);
                mask.addClass('show').find('input').val(tempVal);
                mask.find('input').focus();

                mask.on('click.temp', '.cl-confirm', (e) => {
                    let tempVal = mask.find('input').val().trim();
                    let currentVal = target.find('span').text();
                    mask.removeClass('show');
                    if (tempVal !== '' && tempVal !== currentVal) {
                        target.find('span').text(tempVal);
                        target.parent().addClass('unsaved').find('.status-td').text('修改未储存');
                    }
                    mask.unbind('click.temp');
                })

                mask.on('click.temp', '.cl-cancel', (e) => {
                    mask.removeClass('show');
                    mask.unbind('click.temp');
                })

            });

        },

        watchSelectButton() {
            $(this.view.el).find('.selectAll').on('click', (e) => {
                let currentListName = dataHub.get('currentList');
                let currentList = $('._' + currentListName);

                let checkbox = currentList.find('.td-checkbox > input');
                let checked = checkbox.filter(':checked');
                if (checkbox.length === checked.length) {
                    checked.prop('checked', '');
                } else {
                    checkbox.prop('checked', 'checked');
                }
            }) 
        },

        watchSaveButton() {
            $(this.view.el).find('.saveButton').on('click', () => {
                let currentListName = dataHub.get('currentList');
                let currentList = $('._' + currentListName);
                let checked = currentList.find('.td-checkbox > input').filter(':checked');
                console.error(checked)
                
            })
        }
    };
    model.init();
    controller.init(view, model);
}
