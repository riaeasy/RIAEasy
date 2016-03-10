//>>built

define("dojox/mobile/TransitionEvent", ["dojo/_base/declare", "dojo/on"], function (declare, on) {
    return declare("dojox.mobile.TransitionEvent", null, {constructor:function (target, transitionOptions, triggerEvent) {
        this.transitionOptions = transitionOptions;
        this.target = target;
        this.triggerEvent = triggerEvent || null;
    }, dispatch:function () {
        var opts = {bubbles:true, cancelable:true, detail:this.transitionOptions, triggerEvent:this.triggerEvent};
        var evt = on.emit(this.target, "startTransition", opts);
    }});
});

