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

    let model = {}

    let controller = {}
}
