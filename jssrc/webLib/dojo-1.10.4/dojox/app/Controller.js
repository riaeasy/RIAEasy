//>>built

define("dojox/app/Controller", ["dojo/_base/lang", "dojo/_base/declare", "dojo/on"], function (lang, declare, on) {
    return declare("dojox.app.Controller", null, {constructor:function (app, events) {
        this.events = this.events || events;
        this._boundEvents = [];
        this.app = app;
    }, bind:function (evented, event, handler) {
        if (arguments.length == 0) {
            if (this.events) {
                for (var item in this.events) {
                    if (item.charAt(0) !== "_") {
                        this.bind(this.app, item, lang.hitch(this, this.events[item]));
                    }
                }
            }
        } else {
            var signal = on(evented, event, handler);
            this._boundEvents.push({"event":event, "evented":evented, "signal":signal});
        }
        return this;
    }, unbind:function (evented, event) {
        var len = this._boundEvents.length;
        for (var i = 0; i < len; i++) {
            if ((this._boundEvents[i]["event"] == event) && (this._boundEvents[i]["evented"] == evented)) {
                this._boundEvents[i]["signal"].remove();
                this._boundEvents.splice(i, 1);
                return;
            }
        }
        console.warn("event '" + event + "' not bind on ", evented);
        return this;
    }});
});

