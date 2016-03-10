//>>built

define("dojox/av/FLVideo", ["dojo", "dijit", "dijit/_Widget", "dojox/embed/Flash", "dojox/av/_Media"], function (dojo, dijit, _Widget, Flash, _Media) {
    dojo.experimental("dojox.av.FLVideo");
    return dojo.declare("dojox.av.FLVideo", [_Widget, _Media], {_swfPath:dojo.moduleUrl("dojox.av", "resources/video.swf"), constructor:function (options) {
        dojo.global.swfIsInHTML = function () {
            return true;
        };
    }, postCreate:function () {
        this._subs = [];
        this._cons = [];
        this.mediaUrl = this._normalizeUrl(this.mediaUrl);
        this.initialVolume = this._normalizeVolume(this.initialVolume);
        var args = {path:this._swfPath, width:"100%", height:"100%", minimumVersion:9, expressInstall:true, params:{allowFullScreen:this.allowFullScreen, wmode:this.wmode, allowScriptAccess:this.allowScriptAccess, allowNetworking:this.allowNetworking}, vars:{videoUrl:this.mediaUrl, id:this.id, autoPlay:this.autoPlay, volume:this.initialVolume, isDebug:this.isDebug}};
        this._sub("stageClick", "onClick");
        this._sub("stageSized", "onSwfSized");
        this._sub("mediaStatus", "onPlayerStatus");
        this._sub("mediaMeta", "onMetaData");
        this._sub("mediaError", "onError");
        this._sub("mediaStart", "onStart");
        this._sub("mediaEnd", "onEnd");
        this._flashObject = new dojox.embed.Flash(args, this.domNode);
        this._flashObject.onError = function (err) {
            console.error("Flash Error:", err);
        };
        this._flashObject.onLoad = dojo.hitch(this, function (mov) {
            this.flashMedia = mov;
            this.isPlaying = this.autoPlay;
            this.isStopped = !this.autoPlay;
            this.onLoad(this.flashMedia);
            this._initStatus();
            this._update();
        });
        this.inherited(arguments);
    }, play:function (newUrl) {
        this.isPlaying = true;
        this.isStopped = false;
        this.flashMedia.doPlay(this._normalizeUrl(newUrl));
    }, pause:function () {
        this.isPlaying = false;
        this.isStopped = false;
        if (this.onPaused) {
            this.onPaused();
        }
        this.flashMedia.pause();
    }, seek:function (time) {
        this.flashMedia.seek(time);
    }, volume:function (vol) {
        if (vol) {
            if (!this.flashMedia) {
                this.initialVolume = vol;
            }
            this.flashMedia.setVolume(this._normalizeVolume(vol));
        }
        if (!this.flashMedia || !this.flashMedia.doGetVolume) {
            return this.initialVolume;
        }
        return this.flashMedia.getVolume();
    }, _checkBuffer:function (time, bufferLength) {
        if (this.percentDownloaded == 100) {
            if (this.isBuffering) {
                this.onBuffer(false);
                this.flashMedia.doPlay();
            }
            return;
        }
        if (!this.isBuffering && bufferLength < 0.1) {
            this.onBuffer(true);
            this.flashMedia.pause();
            return;
        }
        var timePercentLoad = this.percentDownloaded * 0.01 * this.duration;
        if (!this.isBuffering && time + this.minBufferTime * 0.001 > timePercentLoad) {
            this.onBuffer(true);
            this.flashMedia.pause();
        } else {
            if (this.isBuffering && time + this.bufferTime * 0.001 <= timePercentLoad) {
                this.onBuffer(false);
                this.flashMedia.doPlay();
            }
        }
    }, _update:function () {
        var time = Math.min(this.getTime() || 0, this.duration);
        var dObj = this.flashMedia.getLoaded();
        this.percentDownloaded = Math.ceil(dObj.bytesLoaded / dObj.bytesTotal * 100);
        this.onDownloaded(this.percentDownloaded);
        this.onPosition(time);
        if (this.duration) {
            this._checkBuffer(time, dObj.buffer);
        }
        this._updateHandle = setTimeout(dojo.hitch(this, "_update"), this.updateTime);
    }, destroy:function () {
        clearTimeout(this._updateHandle);
        dojo.disconnect(this._positionHandle);
        this.inherited(arguments);
    }});
});

