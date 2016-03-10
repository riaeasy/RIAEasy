//>>built

define("dojo/topic", ["./Evented"], function (Evented) {
    var hub = new Evented;
    return {publish:function (topic, event) {
        return hub.emit.apply(hub, arguments);
    }, subscribe:function (topic, listener) {
        return hub.on.apply(hub, arguments);
    }};
});

