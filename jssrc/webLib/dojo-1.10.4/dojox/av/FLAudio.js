//>>built

define("dojox/av/FLAudio", ["dojo", "dojox/embed/Flash", "dojox/timing/doLater"], function (dojo, dijit) {
    dojo.experimental("dojox.av.FLVideo");
    return dojo.declare("dojox.av.FLAudio", null, {id:"", initialVolume:0.7, initialPan:0, isDebug:false, statusInterval:200, _swfPath:dojo.moduleUrl("dojox.av", "resources/audio.swf"), allowScriptAccess:"always", allowNetworking:"all", constructor:function (options) {
        dojo.global.swfIsInHTML = function () {
            return true;
        };
        dojo.mixin(this, options || {});
        if (!this.id) {
            this.id = "flaudio_" + new Date().getTime();
        }
        this.domNode = dojo.doc.createElement("div");
        dojo.style(this.domNode, {position:"relative", width:"1px", height:"1px", top:"1px", left:"1px"});
        dojo.body().appendChild(this.domNode);
        this.init();
    }, init:function () {
        this._subs = [];
        this.initialVolume = this._normalizeVolume(this.initialVolume);
        var args = {path:this._swfPath, width:"1px", height:"1px", minimumVersion:9, expressInstall:true, params:{wmode:"transparent", allowScriptAccess:this.allowScriptAccess, allowNetworking:this.allowNetworking}, vars:{id:this.id, autoPlay:this.autoPlay, initialVolume:this.initialVolume, initialPan:this.initialPan, statusInterval:this.statusInterval, isDebug:this.isDebug}};
        this._sub("mediaError", "onError");
        this._sub("filesProgress", "onLoadStatus");
        this._sub("filesAllLoaded", "onAllLoaded");
        this._sub("mediaPosition", "onPlayStatus");
        this._sub("mediaEnd", "onComplete");
        this._sub("mediaMeta", "onID3");
        this._flashObject = new dojox.embed.Flash(args, this.domNode);
        this._flashObject.onError = function (err) {
            console.warn("Flash Error:", err);
        };
        this._flashObject.onLoad = dojo.hitch(this, function (mov) {
            this.flashMedia = mov;
            this.isPlaying = this.autoPlay;
            this.isStopped = !this.autoPlay;
            this.onLoad(this.flashMedia);
        });
    }, load:function (options) {
        if (dojox.timing.doLater(this.flashMedia, this)) {
            return false;
        }
        if (!options.url) {
            throw new Error("An url is required for loading media");
        } else {
            options.url = this._normalizeUrl(options.url);
        }
        this.flashMedia.load(options);
        return options.url;
    }, doPlay:function (options) {
        this.flashMedia.doPlay(options);
    }, pause:function (options) {
        this.flashMedia.pause(options);
    }, stop:function (options) {
        this.flashMedia.doStop(options);
    }, setVolume:function (options) {
        this.flashMedia.setVolume(options);
    }, setPan:function (options) {
        this.flashMedia.setPan(options);
    }, getVolume:function (options) {
        return this.flashMedia.getVolume(options);
    }, getPan:function (options) {
        return this.flashMedia.getPan(options);
    }, getPosition:function (options) {
        return this.flashMedia.getPosition(options);
    }, onError:function (msg) {
        console.warn("SWF ERROR:", msg);
    }, onLoadStatus:function (events) {
    }, onAllLoaded:function () {
    }, onPlayStatus:function (events) {
    }, onComplete:function (events) {
    }, onLoad:function () {
    }, onID3:function (evt) {
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
        if (_url && _url.toLowerCase().indexOf("http") < 0) {
            var loc = window.location.href.split("/");
            loc.pop();
            loc = loc.join("/") + "/";
            _url = loc + _url;
        }
        return _url;
    }});
});

