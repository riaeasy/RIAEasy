//>>built

define("dojo/Evented", ["./aspect", "./on"], function (aspect, on) {
    "use strict";
    var after = aspect.after;
    function Evented() {
    }
    Evented.prototype = {on:function (type, listener) {
        return on.parse(this, type, listener, function (target, type) {
            return after(target, "on" + type, listener, true);
        });
    }, emit:function (type, event) {
        var args = [this];
        args.push.apply(args, arguments);
        return on.emit.apply(on, args);
    }};
    return Evented;
});

