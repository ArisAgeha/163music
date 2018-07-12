let $ = require('jquery');
let AV = require('./admin-leancloud.js');
let eventHub = require('./eventHub.js');
let dataHub = require('./dataHub.js');

{
    let view = {
        el: '#listPanel',
        template: '',

        render(collectionElement) {
            collectionElement.addClass('active').siblings().removeClass('active');
            eventHub.emit('switchCollection', collectionElement.text());
            dataHub.set('currentList', collectionElement.text());
        },

        addList(collectionName) {
            let $el = $(this.el);
            let li = $('<li></li>').html(collectionName);
            let musicList = $el.find('.musicList');
            musicList.append(li);
            this.render(musicList.children().eq(0));
        },

        throwErrTips() {
            let tips = $(this.el).find('.dupErrTips');
            tips.addClass('show');
            setTimeout(()=> {
                tips.removeClass('show');
            }, 3000)
        },

        throwFailTips() {
            let tips = $(this.el).find('.failTips');
            tips.addClass('show');
            setTimeout(()=> {
                tips.removeClass('show');
            }, 3000)
        },

        throwSuccessTips() {
            let tips = $(this.el).find('.successTips');
            tips.addClass('show');
            setTimeout(()=> {
                tips.removeClass('show');
            }, 3000)
        }
    }

    let model = {
        collectionList: {},

        async checkNameDuplicate(collectionName) {
            let queryList = new AV.Query('CollectionList');
            return await queryList.find().then(async (list) => {
                let dup = false;
                for (let i = 0; i < list.length; i++) {
                    if (collectionName === list[i].attributes.collectionName) {
                        dup = true;
                        break;
                    }
                }
                if (!dup) {
                    let id = await this.createLeanCloudBucket(collectionName);
                    return id;
                } else {
                    return false;
                }
            })
        },

        render(collection, id) {
            let key = collection.collectionName;
            let val = collection.songList || [];
            val.unshift({'collectionID': id});
            let obj = {};
            obj[key] = val;
            Object.assign(this.collectionList, obj);
            /*
            {
                id: xxx,
                song: {
                    name: songID,
                    name2: songID2,
                    name3: songID3
                }
            }
            */
        },

        async createLeanCloudBucket(collectionName){
            let Collection = AV.Object.extend('CollectionList');
            let collection = new Collection();
            return await collection.save({
                'collectionName': collectionName,
                'songList': []
            }).then(function(object) {
                return object.id
            })
        },

        async setCover(currentListName, text) {
            let queryID = new AV.Query('CollectionList');
            queryID.contains('collectionName', currentListName);
            let id = await queryID.find().then(function(results) {
                console.error(results)
                return results[0].id;
            });
            console.log(currentListName);
            console.log(queryID);
            console.log(id)
            let saveCover = AV.Object.createWithoutData('CollectionList', id);
            await saveCover.save({'coverLink': text});
        }
    }

    let controller = {
        async init(view, model) {
            this.view = view;
            this.model = model;
            dataHub.set('collectionList', this.model.collectionList);
            await this.getList();
            this.bindEvent()
        },

        async getList() {
            this.view.addList('全部歌曲');
            let queryList = new AV.Query('CollectionList');
            await queryList.find().then((list) => {
                for (let i = 0; i < list.length; i++) {
                    let collectionName = list[i].attributes.collectionName;
                    this.view.addList(collectionName);
                    this.model.render(list[i].attributes, list[i].id)
                }
            }, (err) => {
                console.log(err)    
            })
            dataHub.set('loadList', true);
        },

        bindEvent() {
            this.switchCollectionList();
            this.createCollectionList();
            this.setSongID();
            this.removeSongID();
            this.watchSearch();
            this.watchSetCover();
            console.log(this.setSongID)
        },

        switchCollectionList() {
            let $el = $(this.view.el);
            $el.find('.musicList').on('click', 'li', (e) => {
                this.view.render($(e.currentTarget));
            })
        },

        createCollectionList() {
            let $el = $(this.view.el);
            let clcreator = $el.find('.mask > .clCreator-mask');
            $el.find('.createList').on('click', (e) => {
                clcreator.addClass('show').find('input').focus();

                clcreator.find('.cl-cancel').on('click', function() {
                    clcreator.removeClass('show');
                    $(this).unbind();
                })

                clcreator.find('.cl-confirm').on('click', () => {
                    let tipsArea = clcreator.find('.textHolder');
                    let input = clcreator.find('input').val().trim();
                    if (input === '') {
                        tipsArea.text('请输入歌单名');
                    } else {
                        clcreator.removeClass('show');
                        this.addCollectionList(input);
                        clcreator.find('.cl-confirm').unbind();
                    }  
                })
            })
        },

        setSongID() {
            eventHub.on('setSongID', async (data) => {
                let {id, targetListName} = data;
                let targetListData = this.model.collectionList[targetListName]; 
                let collectionID = targetListData[0].collectionID;
                targetListData.push(id);
                let put = targetListData.filter((item) => {
                    console.log(item);
                    console.warn(typeof(item));
                    return (typeof(item) === 'string')
                })
                let songData = AV.Object.createWithoutData('CollectionList', collectionID);
                let result = await songData.save({'songList': put});
            })
        },

        async addCollectionList(collectionName) {
            let id = await this.model.checkNameDuplicate(collectionName);
            if (id) {
                this.view.addList(collectionName);   
                let obj = {
                    'collectionName': collectionName,
                    songList: []
                };
                this.model.render(obj, id);
                eventHub.emit('addCollection', {
                    'collectionName': collectionName,
                    'id': id
                });
            }
            else this.view.throwErrTips();
        },

        removeSongID() {
            eventHub.on('deleteSong', async (data) => {
                let {songID, targetListName} = data;
                let targetListData = this.model.collectionList[targetListName]; 
                let collectionID = targetListData[0].collectionID;
                console.log(songID)
                targetListData.splice(targetListData.indexOf(songID), 1);
                console.log(targetListData)
                let put = targetListData.filter((item) => {
                    return (typeof(item) === 'string')
                })
                let songData = AV.Object.createWithoutData('CollectionList', collectionID);
                await songData.save({'songList': put});
            })
        },

        watchSearch() {
            $(this.view.el).find('.searchList > input').on('input', (e) => {
                let value = $(e.currentTarget).val();
                let lists = $(this.view.el).find('.musicList').find('li');
                lists.removeClass('hidden');
                for (let list of lists) {
                    let $list = $(list);
                    if ($list.text().indexOf(value) < 0) {
                        $list.addClass('hidden');
                    }
                }
            })
        },

        watchSetCover() {
            let $el = $(this.view.el);
            let coverSetter = $el.find('.mask2 .coverSetter-mask'); 
            $el.find('.setCover').on('click', () => {
                let currentList = dataHub.get('currentList');
                if (currentList === '全部歌曲') {
                    this.view.throwFailTips();       
                    return;
                }
                coverSetter.addClass('show');
                coverSetter.find('.textHolder2').text('');
            })
            $el.find('.cs-cancel').on('click', () => {
                coverSetter.removeClass('show');
            })
            $el.find('.cs-confirm').on('click', async () => {
                let text = coverSetter.find('input').val();
                if (text === '') {
                    coverSetter.find('.textHolder2').text('请输入链接！');
                    return;
                } else  {
                    let currentList = dataHub.get('currentList');
                    await this.model.setCover(currentList, text);
                    coverSetter.removeClass('show');
                    this.view.throwSuccessTips();
                }
            })
        }

    }
    controller.init(view, model);
    console.error('ListBanelEnd!');
}
