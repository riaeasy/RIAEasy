//>>built

define("dojox/app/module/lifecycle", ["dojo/_base/declare", "dojo/topic"], function (declare, topic) {
    return declare(null, {lifecycle:{UNKNOWN:0, STARTING:1, STARTED:2, STOPPING:3, STOPPED:4}, _status:0, getStatus:function () {
        return this._status;
    }, setStatus:function (newStatus) {
        this._status = newStatus;
        topic.publish("/app/status", newStatus);
    }});
});

