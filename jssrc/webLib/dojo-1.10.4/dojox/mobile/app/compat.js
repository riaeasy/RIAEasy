//>>built

define("dojox/mobile/app/compat", ["dijit", "dojo", "dojox", "dojo/require!dojox/mobile/compat"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.mobile.app.compat");
    dojo.require("dojox.mobile.compat");
    dojo.extend(dojox.mobile.app.AlertDialog, {_doTransition:function (dir) {
        console.log("in _doTransition and this = ", this);
        var h = dojo.marginBox(this.domNode.firstChild).h;
        var bodyHeight = this.controller.getWindowSize().h;
        var high = bodyHeight - h;
        var low = bodyHeight;
        var anim1 = dojo.fx.slideTo({node:this.domNode, duration:400, top:{start:dir < 0 ? high : low, end:dir < 0 ? low : high}});
        var anim2 = dojo[dir < 0 ? "fadeOut" : "fadeIn"]({node:this.mask, duration:400});
        var anim = dojo.fx.combine([anim1, anim2]);
        var _this = this;
        dojo.connect(anim, "onEnd", this, function () {
            if (dir < 0) {
                _this.domNode.style.display = "none";
                dojo.destroy(_this.domNode);
                dojo.destroy(_this.mask);
            }
        });
        anim.play();
    }});
    dojo.extend(dojox.mobile.app.List, {deleteRow:function () {
        console.log("deleteRow in compat mode", row);
        var row = this._selectedRow;
        dojo.style(row, {visibility:"hidden", minHeight:"0px"});
        dojo.removeClass(row, "hold");
        var height = dojo.contentBox(row).h;
        dojo.animateProperty({node:row, duration:800, properties:{height:{start:height, end:1}, paddingTop:{end:0}, paddingBottom:{end:0}}, onEnd:this._postDeleteAnim}).play();
    }});
    if (dojox.mobile.app.ImageView && !dojo.create("canvas").getContext) {
        dojo.extend(dojox.mobile.app.ImageView, {buildRendering:function () {
            this.domNode.innerHTML = "ImageView widget is not supported on this browser." + "Please try again with a modern browser, e.g. " + "Safari, Chrome or Firefox";
            this.canvas = {};
        }, postCreate:function () {
        }});
    }
    if (dojox.mobile.app.ImageThumbView) {
        dojo.extend(dojox.mobile.app.ImageThumbView, {place:function (node, x, y) {
            dojo.style(node, {top:y + "px", left:x + "px", visibility:"visible"});
        }});
    }
});

