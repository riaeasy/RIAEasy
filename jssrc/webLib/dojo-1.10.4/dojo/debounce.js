//>>built

define("dojo/debounce", [], function () {
    return function (cb, wait) {
        var timer;
        return function () {
            if (timer) {
                clearTimeout(timer);
            }
            var self = this;
            var a = arguments;
            timer = setTimeout(function () {
                cb.apply(self, a);
            }, wait);
        };
    };
});

