//>>built

define("dojo/request/notify", ["../Evented", "../_base/lang", "./util"], function (Evented, lang, util) {
    var pubCount = 0, slice = [].slice;
    var hub = lang.mixin(new Evented, {onsend:function (data) {
        if (!pubCount) {
            this.emit("start");
        }
        pubCount++;
    }, _onload:function (data) {
        this.emit("done", data);
    }, _onerror:function (data) {
        this.emit("done", data);
    }, _ondone:function (data) {
        if (--pubCount <= 0) {
            pubCount = 0;
            this.emit("stop");
        }
    }, emit:function (type, event) {
        var result = Evented.prototype.emit.apply(this, arguments);
        if (this["_on" + type]) {
            this["_on" + type].apply(this, slice.call(arguments, 1));
        }
        return result;
    }});
    function notify(type, listener) {
        return hub.on(type, listener);
    }
    notify.emit = function (type, event, cancel) {
        return hub.emit(type, event, cancel);
    };
    return util.notify = notify;
});

