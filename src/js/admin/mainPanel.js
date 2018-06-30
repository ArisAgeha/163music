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

        },
    };

    let controller = {
        async init(view, model) {
            this.view = view;
            this.model = model;
            await this.getSongList();
            await this.initView();
            this.bindEvent();
        },

        async getSongList() {
            await this.model.requireSongList();
        },

        async initView() {
            await buildDOM.call(this);
            showCurrentList.call(this);

            async function buildDOM() {
                let loadList = dataHub.get('loadList');
                if (!loadList) {
                    await waitForListLoadEnd();
                }

                async function waitForListLoadEnd() {
                    let sleep = function (time) {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                resolve();
                            }, time);
                        })
                    };

                    let loadList = dataHub.get('loadList');
                    let circle = 0;
                    while(!dataHub.get('loadList')) {
                        await sleep(200);
                        console.warn(++circle);
                    }
                }

                let collectionList = dataHub.get('collectionList');

                for (let key in collectionList) {
                    let tbody = $(`<tbody class=_${key}></tbody>`);
                    let table = $(this.view.el).find('.table');

                    if (collectionList[key]){
                        for(let songID of collectionList[key]) {
                            if (typeof songID === 'object') {
                                tbody.prop('id', songID.collectionID);
                                continue;
                            }

                            let songInfo = this.model.songList[songID];
                            let trString = this.view.template
                                .replace('__name__', songInfo.name)
                                .replace('__artist__', songInfo.artist)
                                .replace('__album__', songInfo.album)
                                .replace('__link__', songInfo.link)
                                .replace('__size__', songInfo.size)
                                .replace('__saveStatus__', '已保存');
                            let tr = $(trString);
                            tr.attr('id', songID);
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
            this.watchUpload();
            this.watchSwitchList();
            this.watchEditor();
            this.watchSelectButton();
            this.watchCheckbox();
            this.watchSaveButton();
            this.watchDeleteButton();
        },

        watchUpload() {
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
                let {collectionName, id} = data;
                let tbody = $(`<tbody class=_${collectionName}></tbody>`);
                tbody.prop('id', id);
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
                e.stopPropagation();
                let target = $(e.currentTarget);
                let currentVal = target.siblings('span').text();
                mask.addClass('show').find('input').val(currentVal);
                mask.find('input').focus();

                mask.on('click.temp', '.cl-confirm', (ee) => {
                    let newVal = mask.find('input').val().trim();
                    mask.removeClass('show');
                    if (newVal !== '' && newVal !== currentVal) {
                        target.siblings('span').text(newVal);
                        let tr = target.parent().parent();
                        if (!tr.hasClass('notlogin')) target.parent().parent().addClass('unsaved').find('.status-td').text('修改未储存');
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

        watchCheckbox() {
            $(this.view.el).find('table').on('click', 'tr', (e) => {
                let checkbox = $(e.currentTarget).find('input');
                let checked = checkbox.prop('checked');
                if (checked) checkbox.prop('checked', '');
                else checkbox.prop('checked', 'checked')
            })
            $(this.view.el).find('table').on('click', 'input', (e) => {
                e.stopPropagation();
            })

        },

        watchSaveButton() {
            $(this.view.el).find('.saveButton').on('click', async () => {
                let currentListName = dataHub.get('currentList');
                let currentList = $('._' + currentListName);
                let checked = currentList.find('.td-checkbox > input').filter(':checked');
                let saveList = checked.parent().parent().filter('.unsaved, .notlogin');
                for (let tr of saveList) {
                    let name = $(tr).find('.name-td > span').text();
                    let artist = $(tr).find('.artist-td > span').text();
                    let album= $(tr).find('.album-td > span').text();
                    let link = $(tr).find('.link-td > span').text();
                    let size = $(tr).find('.size-td > span').text();
                    let id = $(tr).attr('id');
                    let songData = AV.Object.createWithoutData('SongList', id);

                    await songData.save({
                        'name': name,
                        'artist': artist,
                        'album': album,
                        'link': link,
                        'size': size,
                    }).then(async (info) => {
                        $(tr).removeClass('unsaved').removeClass('notlogin').find('.status-td').text('已保存');
                        if (!id) {
                            $(tr).prop['id', info.id];
                            await eventHub.emit('setSongID', {'id': info.id, 'targetListName': currentListName});
                        }
                    })
                }
            })
        },

        watchDeleteButton() {
            $(this.view.el).find('.deleteButton').on('click', async () => {
                let currentListName = dataHub.get('currentList');
                let currentList = $('._' + currentListName);
                let checked = currentList.find('.td-checkbox > input').filter(':checked');
                let toDeleteList = checked.parent().parent();
                let tdlInServer = toDeleteList.not('.notlogin');
                for (let tr of tdlInServer) {
                    let songID = $(tr).attr('id');
                    await eventHub.emit('deleteSong', {'targetListName': currentListName, 'songID': songID});
                }
                toDeleteList.remove();
            })
        }
    };
    model.init();
    controller.init(view, model);
}
