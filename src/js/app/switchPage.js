let $ = require('jquery');
watchTabs();
watchToplaylistMenu();

function watchTabs() {
    watchClickTabs('.discovery');
    watchClickTabs('.user');
    watchClickTabs('.search');
    watchTouchTabs();

    function watchClickTabs(el) {
        $('.tabPanel').find(el).on('click', (e) => {
            $(e.currentTarget).addClass('active').siblings().removeClass('active');
            $('main').find(el + '-main').addClass('show').siblings().removeClass('show');
        })
    }

    function watchTouchTabs() {
        $('main').find('.discovery-main').on('touchstart', (e) => {
            e.preventDefault();
            let startX = e.originalEvent.changedTouches[0].pageX;
            $(e.currentTarget).one('touchend', (ee) => {
                let endX = ee.originalEvent.changedTouches[0].pageX
                if (startX - endX > 100) {
                    $(e.currentTarget).removeClass('show').siblings('.user-main').addClass('show');
                    $('.tabPanel').find('.discovery').removeClass('active').siblings('.user').addClass('active');
                }
            })
        })
        $('main').find('.user-main').on('touchstart', (e) => {
            e.preventDefault();
            let startX = e.originalEvent.changedTouches[0].pageX;
            $(e.currentTarget).one('touchend', (ee) => {
                let endX = ee.originalEvent.changedTouches[0].pageX
                if (startX - endX > 100) {
                    $(e.currentTarget).removeClass('show').siblings('.search-main').addClass('show');
                    $('.tabPanel').find('.user').removeClass('active').siblings('.search').addClass('active');
                } else if (endX - startX > 100) {
                    $(e.currentTarget).removeClass('show').siblings('.discovery-main').addClass('show');
                    $('.tabPanel').find('.user').removeClass('active').siblings('.discovery').addClass('active');
                }
            })
        })
        $('main').find('.search-main').on('touchstart', (e) => {
            e.preventDefault();
            let startX = e.originalEvent.changedTouches[0].pageX;
            $(e.currentTarget).one('touchend', (ee) => {
                let endX = ee.originalEvent.changedTouches[0].pageX
                if (endX - startX > 100) {
                    $(e.currentTarget).removeClass('show').siblings('.user-main').addClass('show');
                    $('.tabPanel').find('.search').removeClass('active').siblings('.user').addClass('active');
                } 
            })
        })
    }
}

function watchToplaylistMenu() {
    $('footer').find('.toplaylistButton').on('click', () => {
        $('footer .toplaylistWrapper').addClass('show');
    })

    $('footer .toplaylistWrapper .shadowArea').on('click', (e) => {
        $(e.currentTarget).parent().removeClass('show');
    })
}