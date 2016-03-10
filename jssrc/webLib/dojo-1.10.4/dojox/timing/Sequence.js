//>>built

define("dojox/timing/Sequence", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "./_base"], function (dojo) {
    dojo.experimental("dojox.timing.Sequence");
    return dojo.declare("dojox.timing.Sequence", null, {_goOnPause:0, _running:false, constructor:function () {
        this._defsResolved = [];
    }, go:function (defs, doneFunction) {
        this._running = true;
        dojo.forEach(defs, function (cur) {
            if (cur.repeat > 1) {
                var repeat = cur.repeat;
                for (var j = 0; j < repeat; j++) {
                    cur.repeat = 1;
                    this._defsResolved.push(cur);
                }
            } else {
                this._defsResolved.push(cur);
            }
        }, this);
        var last = defs[defs.length - 1];
        if (doneFunction) {
            this._defsResolved.push({func:doneFunction});
        }
        this._defsResolved.push({func:[this.stop, this]});
        this._curId = 0;
        this._go();
    }, _go:function () {
        if (!this._running) {
            return;
        }
        var cur = this._defsResolved[this._curId];
        this._curId += 1;
        function resolveAndCallFunc(func) {
            var ret = null;
            if (dojo.isArray(func)) {
                if (func.length > 2) {
                    ret = func[0].apply(func[1], func.slice(2));
                } else {
                    ret = func[0].apply(func[1]);
                }
            } else {
                ret = func();
            }
            return ret;
        }
        if (this._curId >= this._defsResolved.length) {
            resolveAndCallFunc(cur.func);
            return;
        }
        if (cur.pauseAfter) {
            if (resolveAndCallFunc(cur.func) !== false) {
                setTimeout(dojo.hitch(this, "_go"), cur.pauseAfter);
            } else {
                this._goOnPause = cur.pauseAfter;
            }
        } else {
            if (cur.pauseBefore) {
                var x = dojo.hitch(this, function () {
                    if (resolveAndCallFunc(cur.func) !== false) {
                        this._go();
                    }
                });
                setTimeout(x, cur.pauseBefore);
            } else {
                if (resolveAndCallFunc(cur.func) !== false) {
                    this._go();
                }
            }
        }
    }, goOn:function () {
        if (this._goOnPause) {
            setTimeout(dojo.hitch(this, "_go"), this._goOnPause);
            this._goOnPause = 0;
        } else {
            this._go();
        }
    }, stop:function () {
        this._running = false;
    }});
});

