//>>built

define("dojox/io/scriptFrame", ["dojo/main", "dojo/io/script", "dojo/io/iframe"], function (dojo, ioScript, iframe) {
    dojo.deprecated("dojox.io.scriptFrame", "dojo.io.script now supports parallel requests without dojox.io.scriptFrame", "2.0");
    dojo.getObject("io.scriptFrame", true, dojox);
    dojox.io.scriptFrame = {_waiters:{}, _loadedIds:{}, _getWaiters:function (frameId) {
        return this._waiters[frameId] || (this._waiters[frameId] = []);
    }, _fixAttachUrl:function (url) {
    }, _loaded:function (frameId) {
        var waiters = this._getWaiters(frameId);
        this._loadedIds[frameId] = true;
        this._waiters[frameId] = null;
        for (var i = 0; i < waiters.length; i++) {
            var ioArgs = waiters[i];
            ioArgs.frameDoc = iframe.doc(dojo.byId(frameId));
            ioScript.attach(ioArgs.id, ioArgs.url, ioArgs.frameDoc);
        }
    }};
    var oldCanAttach = ioScript._canAttach;
    var scriptFrame = dojox.io.scriptFrame;
    ioScript._canAttach = function (ioArgs) {
        var fId = ioArgs.args.frameDoc;
        if (fId && dojo.isString(fId)) {
            var frame = dojo.byId(fId);
            var waiters = scriptFrame._getWaiters(fId);
            if (!frame) {
                waiters.push(ioArgs);
                iframe.create(fId, dojox._scopeName + ".io.scriptFrame._loaded('" + fId + "');");
            } else {
                if (scriptFrame._loadedIds[fId]) {
                    ioArgs.frameDoc = iframe.doc(frame);
                    this.attach(ioArgs.id, ioArgs.url, ioArgs.frameDoc);
                } else {
                    waiters.push(ioArgs);
                }
            }
            return false;
        } else {
            return oldCanAttach.apply(this, arguments);
        }
    };
    return dojox.io.scriptFrame;
});

