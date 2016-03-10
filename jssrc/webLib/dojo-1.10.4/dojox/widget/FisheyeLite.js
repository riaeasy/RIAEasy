//>>built

define("dojox/widget/FisheyeLite", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/on", "dojo/query", "dojo/dom-style", "dojo/_base/fx", "dijit/_WidgetBase", "dojo/fx/easing"], function (kernel, declare, lang, on, query, domStyle, fx, _WidgetBase, easing) {
    lang.getObject("widget", true, dojox);
    kernel.experimental("dojox/widget/FisheyeLite");
    return dojo.declare("dojox.widget.FisheyeLite", [_WidgetBase], {durationIn:350, easeIn:easing.backOut, durationOut:1420, easeOut:easing.elasticOut, properties:null, units:"px", constructor:function (props, node) {
        this.properties = props.properties || {fontSize:2.75};
    }, postCreate:function () {
        this.inherited(arguments);
        this._target = query(".fisheyeTarget", this.domNode)[0] || this.domNode;
        this._makeAnims();
        this.connect(this.domNode, "onmouseover", "show");
        this.connect(this.domNode, "onmouseout", "hide");
        this.connect(this._target, "onclick", "onClick");
    }, show:function () {
        this._runningOut.stop();
        this._runningIn.play();
    }, hide:function () {
        this._runningIn.stop();
        this._runningOut.play();
    }, _makeAnims:function () {
        var _in = {}, _out = {}, cs = domStyle.getComputedStyle(this._target);
        for (var p in this.properties) {
            var prop = this.properties[p], deep = lang.isObject(prop), v = parseFloat(cs[p]);
            _out[p] = {end:v, units:this.units};
            _in[p] = deep ? prop : {end:prop * v, units:this.units};
        }
        this._runningIn = fx.animateProperty({node:this._target, easing:this.easeIn, duration:this.durationIn, properties:_in});
        this._runningOut = fx.animateProperty({node:this._target, duration:this.durationOut, easing:this.easeOut, properties:_out});
        this.connect(this._runningIn, "onEnd", lang.hitch(this, "onSelected", this));
    }, onClick:function (e) {
    }, onSelected:function (e) {
    }});
});

