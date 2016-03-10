//>>built

define("dojox/drawing/annotations/Label", ["exports", "dojo/_base/lang", "../util/oo", "../stencil/Text"], function (exports, lang, oo, Text) {
    exports.Label = oo.declare(Text, function (options) {
        this.master = options.stencil;
        this.labelPosition = options.labelPosition || "BR";
        if (lang.isFunction(this.labelPosition)) {
            this.setLabel = this.setLabelCustom;
        }
        this.setLabel(options.text || "");
        this.connect(this.master, "onTransform", this, "setLabel");
        this.connect(this.master, "destroy", this, "destroy");
        if (this.style.labelSameColor) {
            this.connect(this.master, "attr", this, "beforeAttr");
        }
    }, {_align:"start", drawingType:"label", setLabelCustom:function (text) {
        var d = lang.hitch(this.master, this.labelPosition)();
        this.setData({x:d.x, y:d.y, width:d.w || this.style.text.minWidth, height:d.h || this._lineHeight});
        if (text && !text.split) {
            text = this.getText();
        }
        this.render(this.typesetter(text));
    }, setLabel:function (text) {
        var x, y, box = this.master.getBounds();
        if (/B/.test(this.labelPosition)) {
            y = box.y2 - this._lineHeight;
        } else {
            y = box.y1;
        }
        if (/R/.test(this.labelPosition)) {
            x = box.x2;
        } else {
            y = box.y1;
            this._align = "end";
        }
        if (!this.labelWidth || (text && text.split && text != this.getText())) {
            this.setData({x:x, y:y, height:this._lineHeight, width:this.style.text.minWidth});
            this.labelWidth = this.style.text.minWidth;
            this.render(this.typesetter(text));
        } else {
            this.setData({x:x, y:y, height:this.data.height, width:this.data.width});
            this.render();
        }
    }, beforeAttr:function (key, value) {
        if (value !== undefined) {
            var k = key;
            key = {};
            key[k] = value;
        }
        delete key.x;
        delete key.y;
        delete key.width;
        delete key.height;
        this.attr(key);
        !this.created && this.render();
    }});
});

