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

        createLeanCloudBucket(collectionName){
            let Collection = AV.Object.extend('CollectionList');
            let collection = new Collection();
            collection.save({
                'collectionName': collectionName,
                'songListt': []
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
                }
            })
        },

        bindEvent() {
            let $el = $(this.view.el);
            $el.find('.musicList').on('click', 'li', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
            })
        },

        async addCollectionList(collectionName) {
            let success = await this.model.checkNameDuplicate(collectionName);
            if (success) this.view.render(collectionName);
            else this.view.throwErrTips();
        }
    }

    controller.init(view, model);
    controller.addCollectionList('testlisttt')
}
