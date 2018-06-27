let $ = require('jquery');
let AV = require('./admin-leancloud.js');
{
    let view = {
        el: '#listPanel',
        template: '',

        render(collectionName) {
            let $el = $(this.el);
            let li = $('<li></li>').html(collectionName);
            $el.find('.musicList').prepend(li).children().eq(0).addClass('active').siblings().removeClass('active');
        },

        throwErrTips() {
            console.log('-----')
            let tips = $(this.el).find('.dupErrTips');
            console.log(tips)

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
            return await queryList.find().then((list) => {
                let dup = false;
                for (let i = 0; i < list.length; i++) {
                    if (collectionName === list[i].attributes.collectionName) {
                        dup = true;
                        break;
                    }
                }
                if (!dup) {
                    this.createLeanCloudBucket(collectionName);
                    return true;
                } else {
                    return false;
                }
            })
        },

        render(collection) {
            let key = collection.collectionName;
            let val = collection.songList;
            let obj = {};
            obj[key] = val;
            Object.assign(this.collectionList, obj);
            console.log(this.collectionList)
        },

        createLeanCloudBucket(collectionName){
            let Collection = AV.Object.extend('CollectionList');
            let collection = new Collection();
            collection.save({
                'collectionName': collectionName,
                'songList': []
            }).then(function(object) {
                console.log('储存成功！');
            })
        }
    }

    let controller = {
        init(view, model) {
            this.view = view,
            this.model = model,
            this.getList(),
            this.bindEvent()
        },

        getList() {
            let queryList = new AV.Query('CollectionList');
            queryList.find().then((list) => {
                for (let i = 0; i < list.length; i++) {
                    let collectionName = list[i].attributes.collectionName;
                    this.view.render(collectionName);
                    this.model.render(list[i].attributes)
                }
            }, (err) => {
                console.log(err)    
            })
        },

        bindEvent() {
            // 点击切换歌单列表
            let $el = $(this.view.el);
            $el.find('.musicList').on('click', 'li', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
            })

            let clcreator = $el.find('.mask > .clCreator-mask');
            $el.find('.createList').on('click', (e) => {
                clcreator.addClass('show');

                clcreator.find('.cl-cancel').on('click', function() {
                    clcreator.removeClass('show');
                    $(this).unbind();
                })

                clcreator.find('.cl-confirm').on('click', () => {
                    let tipsArea = clcreator.find('.textHolder');
                    let input = clcreator.find('input').val().trim();
                    console.log(tipsArea);
                    console.log(input)
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

        async addCollectionList(collectionName) {
            let success = await this.model.checkNameDuplicate(collectionName);
            if (success) {
                this.view.render(collectionName);   
                let obj = {
                    'collectionName': collectionName,
                    songList: []
                };
                this.model.render(obj);
            }
            else this.view.throwErrTips();
        }
    }

    controller.init(view, model);
}
