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
            this.bindEvent() 
        },

        bindEvent() {
            let $el = $(this.view.el);
            $el.find('.musicList').on('click', 'li', (e) => {
                $(e.currentTarget).addClass('active').siblings().removeClass('active');
            })
        },

        async addCollectionList(collectionName) {
            let success = await this.model.checkNameDuplicate(collectionName);
            console.log('success'+ success)
            if (success) this.view.render(collectionName);
            else console.log('nope!!!!!!')
        }
    }

    controller.init(view, model);
    controller.addCollectionList('test11222')
}
