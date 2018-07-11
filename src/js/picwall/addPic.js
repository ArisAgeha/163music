let AV = require('./app-leancloud.js');
let $ = require('jquery');
let eventHub = require('./eventHub.js');
let ClipboardJS = require('clipboard');
let clipboard = new ClipboardJS('[data-clipboard-demo]');

let view = {
    el: '.wallWrapper',
    template: `
        <li class='btn'>
            <img src="./img/test/0.jpg" alt="">
        </li>`,

    render(link) {
        let li = $(this.template);
        li.find('img').prop('src', link).attr('data-clipboard-text', link).attr('data-clipboard-action', 'copy').attr('data-clipboard-demo', '');
        let target = $(this.el).find('.wall');
        target.children().eq(0).after(li);
    }
}

let model = {
    async init() {
        return await this.queryData();
    },

    async saveToLeanCloud(coverLink) {
        let Collection = AV.Object.extend('Cover');
        let collection = new Collection();
        return await collection.save({
            'coverLink': coverLink
        });
    },

    async queryData() {
        let query = new AV.Query('Cover');
        return await query.find().then((results) => {
            return results;
        });
    }
}

let controller = {
    async init(view, model) {
        this.view = view;
        this.model = model;
        let data = await this.model.init();
        this.initView(data);
        this.bindEvent();
    },

    initView(data) {
        for (let item of data) {
            this.view.render(item.attributes.coverLink);
        }
    },

    bindEvent() {
        this.watchUploadOver();
        this.watchCopyLink();
    },

    watchUploadOver() {
        eventHub.on('uploadover', async (data) => {
            let coverLink = data.link;
            await this.model.saveToLeanCloud(coverLink);
            this.view.render(coverLink);
        })
    },

    watchCopyLink() {
    }

}

controller.init(view, model);
