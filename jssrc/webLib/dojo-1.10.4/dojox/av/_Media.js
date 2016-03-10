//>>built

define("dojox/av/_Media", ["dojo"], function (dojo) {
    dojo.experimental("dojox.av.FLVideo");
    return dojo.declare("dojox.av._Media", null, {mediaUrl:"", initialVolume:1, autoPlay:false, bufferTime:2000, minBufferTime:300, updateTime:100, id:"", isDebug:false, percentDownloaded:0, _flashObject:null, flashMedia:null, allowScriptAccess:"always", allowNetworking:"all", wmode:"transparent", allowFullScreen:true, _initStatus:function () {
        this.status = "ready";
        this._positionHandle = dojo.connect(this, "onPosition", this, "_figureStatus");
    }, getTime:function () {
        return this.flashMedia.getTime();
    }, onLoad:function (mov) {
    }, onDownloaded:function (percent) {
    }, onClick:function (evt) {
    }, onSwfSized:function (data) {
    }, onMetaData:function (data, evt) {
        console.warn("onMeta", data);
        this.duration = data.duration;
    }, onPosition:function (time) {
    }, onStart:function (data) {
    }, onPlay:function (data) {
    }, onPause:function (data) {
    }, onEnd:function (data) {
    }, onStop:function () {
    }, onBuffer:function (isBuffering) {
        this.isBuffering = isBuffering;
    }, onError:function (data, url) {
        console.warn("ERROR-" + data.type.toUpperCase() + ":", data.info.code, " - URL:", url);
    }, onStatus:function (data) {
    }, onPlayerStatus:function (data) {
    }, onResize:function () {
    }, _figureStatus:function () {
        var pos = this.getTime();
        if (this.status == "stopping") {
            this.status = "stopped";
            this.onStop(this._eventFactory());
        } else {
            if (this.status == "ending" && pos == this._prevPos) {
                this.status = "ended";
                this.onEnd(this._eventFactory());
            } else {
                if (this.duration && pos > this.duration - 0.5) {
                    this.status = "ending";
                } else {
                    if (pos === 0) {
                        if (this.status == "ready") {
                        } else {
                            this.status = "stopped";
                            if (this._prevStatus != "stopped") {
                                this.onStop(this._eventFactory());
                            }
                        }
                    } else {
                        if (this.status == "ready") {
                            this.status = "started";
                            this.onStart(this._eventFactory());
                            this.onPlay(this._eventFactory());
                        } else {
                            if (this.isBuffering) {
                                this.status = "buffering";
                            } else {
                                if (this.status == "started" || (this.status == "playing" && pos != this._prevPos)) {
                                    this.status = "playing";
                                } else {
                                    if (!this.isStopped && this.status == "playing" && pos == this._prevPos) {
                                        this.status = "paused";
                                        console.warn("pause", pos, this._prevPos);
                                        if (this.status != this._prevStatus) {
                                            this.onPause(this._eventFactory());
                                        }
                                    } else {
                                        if ((this.status == "paused" || this.status == "stopped") && pos != this._prevPos) {
                                            this.status = "started";
                                            this.onPlay(this._eventFactory());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this._prevPos = pos;
        this._prevStatus = this.status;
        this.onStatus(this.status);
    }, _eventFactory:function () {
        var evt = {status:this.status};
        return evt;
    }, _sub:function (topic, method) {
        dojo.subscribe(this.id + "/" + topic, this, method);
    }, _normalizeVolume:function (vol) {
        if (vol > 1) {
            while (vol > 1) {
                vol *= 0.1;
            }
        }
        return vol;
    }, _normalizeUrl:function (_url) {
        console.log("  url:", _url);
        if (_url && (_url.toLowerCase().indexOf("http") < 0 || _url.indexOf("/") == 0)) {
            var loc = window.location.href.split("/");
            loc.pop();
            loc = loc.join("/") + "/";
            console.log("  loc:", loc);
            _url = loc + _url;
        }
        return _url;
    }, destroy:function () {
        if (!this.flashMedia) {
            this._cons.push(dojo.connect(this, "onLoad", this, "destroy"));
            return;
        }
        dojo.forEach(this._subs, function (s) {
            dojo.unsubscribe(s);
        });
        dojo.forEach(this._cons, function (c) {
            dojo.disconnect(c);
        });
        this._flashObject.destroy();
    }});
});

