let $ = require('jquery');
{
    let view = {
        el: '#listPanel',
        template: '',

        addCollection(collectionName) {
            let $el = $(this.el);
            let li = $('<li></li>').html(collectionName);
            $el.find('.musicList').prepend(li).children().eq(0).addClass('active').siblings().removeClass('active');
        }
    }

    let model = {
    
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
        }
    }

    controller.init(view, model);
}
