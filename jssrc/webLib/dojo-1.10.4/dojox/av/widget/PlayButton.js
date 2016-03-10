//>>built

define("dojox/av/widget/PlayButton", ["dojo", "dijit", "dijit/_Widget", "dijit/_TemplatedMixin"], function (dojo, dijit, _Widget, _TemplatedMixin) {
    return dojo.declare("dojox.av.widget.PlayButton", [_Widget, _TemplatedMixin], {templateString:dojo.cache("dojox.av.widget", "resources/PlayButton.html"), postCreate:function () {
        this.showPlay();
    }, setMedia:function (med) {
        this.media = med;
        dojo.connect(this.media, "onEnd", this, "showPlay");
        dojo.connect(this.media, "onStart", this, "showPause");
    }, onClick:function () {
        if (this._mode == "play") {
            this.onPlay();
        } else {
            this.onPause();
        }
    }, onPlay:function () {
        if (this.media) {
            this.media.play();
        }
        this.showPause();
    }, onPause:function () {
        if (this.media) {
            this.media.pause();
        }
        this.showPlay();
    }, showPlay:function () {
        this._mode = "play";
        dojo.removeClass(this.domNode, "Pause");
        dojo.addClass(this.domNode, "Play");
    }, showPause:function () {
        this._mode = "pause";
        dojo.addClass(this.domNode, "Pause");
        dojo.removeClass(this.domNode, "Play");
    }});
});

