;(function (win) {
    var doc = win.document;
    var docEl = doc.documentElement;
    var tid;

    function init() {
        //设置root字体尺寸
        docEl.style.fontSize = docEl.clientWidth / (750 / 100) + 'px';
    }

    //初始化
    //init();

    //屏幕尺寸变化
    win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(init, 300);
    }, false);
}(window));

;(function () {
    $(function() {

        // 自动加链接
        $('[data-href]').on('click', function() {
            location.href = $(this).data('href');
        });
    });

    $.fn.prevAll = function(selector){
        var prevEls = [];
        var el = this[0];
        if(!el) return $([]);
        while (el.previousElementSibling) {
            var prev = el.previousElementSibling;
            if (selector) {
                if($(prev).is(selector)) prevEls.push(prev);
            }
            else prevEls.push(prev);
            el = prev;
        }
        return $(prevEls);
    };

    $.fn.nextAll = function (selector) {
        var nextEls = [];
        var el = this[0];
        if (!el) return $([]);
        while (el.nextElementSibling) {
            var next = el.nextElementSibling;
            if (selector) {
                if($(next).is(selector)) nextEls.push(next);
            }
            else nextEls.push(next);
            el = next;
        }
        return $(nextEls);
    };
}());