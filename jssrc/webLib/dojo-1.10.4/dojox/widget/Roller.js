//>>built

define("dojox/widget/Roller", ["dojo", "dijit", "dijit/_Widget"], function (dojo, dijit) {
    var Roller = dojo.declare("dojox.widget.Roller", dijit._Widget, {delay:2000, autoStart:true, itemSelector:"> li", durationIn:400, durationOut:275, _idx:-1, postCreate:function () {
        if (!this["items"]) {
            this.items = [];
        }
        dojo.addClass(this.domNode, "dojoxRoller");
        dojo.query(this.itemSelector, this.domNode).forEach(function (item, i) {
            this.items.push(item.innerHTML);
            if (i == 0) {
                this._roller = item;
                this._idx = 0;
            } else {
                dojo.destroy(item);
            }
        }, this);
        if (!this._roller) {
            this._roller = dojo.create("li", null, this.domNode);
        }
        this.makeAnims();
        if (this.autoStart) {
            this.start();
        }
    }, makeAnims:function () {
        var n = this.domNode;
        dojo.mixin(this, {_anim:{"in":dojo.fadeIn({node:n, duration:this.durationIn}), "out":dojo.fadeOut({node:n, duration:this.durationOut})}});
        this._setupConnects();
    }, _setupConnects:function () {
        var anim = this._anim;
        this.connect(anim["out"], "onEnd", function () {
            this._setIndex(this._idx + 1);
            anim["in"].play(15);
        });
        this.connect(anim["in"], "onEnd", function () {
            this._timeout = setTimeout(dojo.hitch(this, "_run"), this.delay);
        });
    }, start:function () {
        if (!this.rolling) {
            this.rolling = true;
            this._run();
        }
    }, _run:function () {
        this._anim["out"].gotoPercent(0, true);
    }, stop:function () {
        this.rolling = false;
        var m = this._anim, t = this._timeout;
        if (t) {
            clearTimeout(t);
        }
        m["in"].stop();
        m["out"].stop();
    }, _setIndex:function (i) {
        var l = this.items.length - 1;
        if (i < 0) {
            i = l;
        }
        if (i > l) {
            i = 0;
        }
        this._roller.innerHTML = this.items[i] || "error!";
        this._idx = i;
    }});
    Roller.RollerSlide = dojo.declare("dojox.widget.RollerSlide", dojox.widget.Roller, {durationOut:175, makeAnims:function () {
        var n = this.domNode, pos = "position", props = {top:{end:0, start:25}, opacity:1};
        dojo.style(n, pos, "relative");
        dojo.style(this._roller, pos, "absolute");
        dojo.mixin(this, {_anim:{"in":dojo.animateProperty({node:n, duration:this.durationIn, properties:props}), "out":dojo.fadeOut({node:n, duration:this.durationOut})}});
        this._setupConnects();
    }});
    Roller._Hover = dojo.declare("dojox.widget._RollerHover", null, {postCreate:function () {
        this.inherited(arguments);
        this.connect(this.domNode, "onmouseenter", "stop");
        this.connect(this.domNode, "onmouseleave", "start");
    }});
    return Roller;
});

