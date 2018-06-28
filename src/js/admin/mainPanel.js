let $ = require('jquery');
let AV = require('./admin-leancloud.js');
let eventHub = require('./eventHub.js');

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
    
    let model = {};

    let controller = {
        init(view, model) {
            this.view = view;
            this.model = model;
            this.bindEvent();
        },
        
        bindEvent() {
            this.watchSwitchCollectionList();
        },

        watchSwitchCollectionList() {
            eventHub.on('switchCollection', (data) => {
                let $el = $(this.view.el);
                $el.find('._' + `${data}`).addClass('show').siblings().removeClass('show');
            })
        }
    };

    controller.init(view, model);
}
