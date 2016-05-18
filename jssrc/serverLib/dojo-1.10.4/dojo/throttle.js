//>>built

define("dojo/throttle", [], function () {
    return function (cb, wait) {
        var canrun = true;
        return function () {
            if (!canrun) {
                return;
            }
            canrun = false;
            cb.apply(this, arguments);
            setTimeout(function () {
                canrun = true;
            }, wait);
        };
    };
});

