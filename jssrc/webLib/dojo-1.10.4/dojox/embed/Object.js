//>>built

define("dojox/embed/Object", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/dom-geometry", "dijit/_Widget", "./Flash", "./Quicktime"], function (dojo, declare, domGeometry, _Widget, Flash, Quicktime) {
    dojo.experimental("dojox.embed.Object");
    return declare("dojox.embed.Object", _Widget, {width:0, height:0, src:"", movie:null, params:null, reFlash:/\.swf|\.flv/gi, reQtMovie:/\.3gp|\.avi|\.m4v|\.mov|\.mp4|\.mpg|\.mpeg|\.qt/gi, reQtAudio:/\.aiff|\.aif|\.m4a|\.m4b|\.m4p|\.midi|\.mid|\.mp3|\.mpa|\.wav/gi, postCreate:function () {
        if (!this.width || !this.height) {
            var box = domGeometry.getMarginBox(this.domNode);
            this.width = box.w, this.height = box.h;
        }
        var em = Flash;
        if (this.src.match(this.reQtMovie) || this.src.match(this.reQtAudio)) {
            em = Quicktime;
        }
        if (!this.params) {
            this.params = {};
            if (this.domNode.hasAttributes()) {
                var ignore = {dojoType:"", width:"", height:"", "class":"", style:"", id:"", src:""};
                var attrs = this.domNode.attributes;
                for (var i = 0, l = attrs.length; i < l; i++) {
                    if (!ignore[attrs[i].name]) {
                        this.params[attrs[i].name] = attrs[i].value;
                    }
                }
            }
        }
        var kwArgs = {path:this.src, width:this.width, height:this.height, params:this.params};
        this.movie = new (em)(kwArgs, this.domNode);
    }});
});

