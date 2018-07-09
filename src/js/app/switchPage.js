let $ = require('jquery');
watchTabs();
watchToplaylistMenu();
watchPlayControllerMenu();
watchReturnButton();

$('body')[0].addEventListener('touchmove', (e)=>{
},{passive:true});

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
            e.stopPropagation();
            let startX = e.originalEvent.changedTouches[0].pageX;
            let startY = e.originalEvent.changedTouches[0].pageY;
            $(e.currentTarget).one('touchend', (ee) => {
                let endX = ee.originalEvent.changedTouches[0].pageX;
                let endY = ee.originalEvent.changedTouches[0].pageY;
                if (startX - endX > 80 && endY - startY < 0.90*(startX - endX)) {
                    $(e.currentTarget).removeClass('show').siblings('.user-main').addClass('show');
                    $('.tabPanel').find('.discovery').removeClass('active').siblings('.user').addClass('active');
                }
            })
        })
        $('main').find('.user-main').on('touchstart', (e) => {
            e.stopPropagation();
            let startX = e.originalEvent.changedTouches[0].pageX;
            let startY = e.originalEvent.changedTouches[0].pageY;
            $(e.currentTarget).one('touchend', (ee) => {
                let endX = ee.originalEvent.changedTouches[0].pageX;
                let endY = ee.originalEvent.changedTouches[0].pageY;
                if (startX - endX > 80 && endY - startY < 0.90*(startX - endX)) {
                    $(e.currentTarget).removeClass('show').siblings('.search-main').addClass('show');
                    $('.tabPanel').find('.user').removeClass('active').siblings('.search').addClass('active');
                } else if (endX - startX > 80 && endY - startY < 0.90*(endX - startX)) {
                    $(e.currentTarget).removeClass('show').siblings('.discovery-main').addClass('show');
                    $('.tabPanel').find('.user').removeClass('active').siblings('.discovery').addClass('active');
                }
            })
        })
        $('main').find('.search-main').on('touchstart', (e) => {
            e.stopPropagation();
            let startX = e.originalEvent.changedTouches[0].pageX;
            let startY = e.originalEvent.changedTouches[0].pageY;
            $(e.currentTarget).one('touchend', (ee) => {
                let endX = ee.originalEvent.changedTouches[0].pageX;
                let endY = ee.originalEvent.changedTouches[0].pageY;
                if (endX - startX > 80 && endY - startY < 0.90*(endX - startX)) {
                    $(e.currentTarget).removeClass('show').siblings('.user-main').addClass('show');
                    $('.tabPanel').find('.search').removeClass('active').siblings('.user').addClass('active');
                } 
            })
        })
    }
}

function watchToplaylistMenu() {
    $('footer').find('.toplaylistButton, .listMenu').on('click', () => {
        $('footer .toplaylistWrapper').addClass('show');
    })

    $('footer .toplaylistWrapper .shadowArea').on('click', (e) => {
        $(e.currentTarget).parent().removeClass('show');
    })
}

function watchPlayControllerMenu() {
    $('footer .songDetail').on('click', () => {
        $('.playController').addClass('show');
    })
}

function watchReturnButton() {
    $('.playController > .head > .returnButton').on('click', () => {
        $('.playController').removeClass('show');
    })
    $('.collectionViewer .collectionHead > svg').on('click', () => {
        $('.collectionViewer').removeClass('show');
    })
}
