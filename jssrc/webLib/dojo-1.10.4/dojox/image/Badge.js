//>>built

define("dojox/image/Badge", ["dojo", "dijit", "dojox/main", "dijit/_Widget", "dijit/_TemplatedMixin", "dojo/fx/easing"], function (dojo, dijit, dojox, _Widget, _TemplatedMixin) {
    dojo.experimental("dojox.image.Badge");
    dojo.getObject("image", true, dojox);
    return dojo.declare("dojox.image.Badge", [_Widget, _TemplatedMixin], {baseClass:"dojoxBadge", templateString:"<div class=\"dojoxBadge\" dojoAttachPoint=\"containerNode\"></div>", children:"div.dojoxBadgeImage", rows:4, cols:5, cellSize:50, cellMargin:1, delay:2000, threads:1, easing:"dojo.fx.easing.backOut", startup:function () {
        if (this._started) {
            return;
        }
        if (dojo.isString(this.easing)) {
            this.easing = dojo.getObject(this.easing);
        }
        this.inherited(arguments);
        this._init();
    }, _init:function () {
        var _row = 0, _w = this.cellSize;
        dojo.style(this.domNode, {width:_w * this.cols + "px", height:_w * this.rows + "px"});
        this._nl = dojo.query(this.children, this.containerNode).forEach(function (n, _idx) {
            var _col = _idx % this.cols, t = _row * _w, l = _col * _w, m = this.cellMargin * 2;
            dojo.style(n, {top:t + "px", left:l + "px", width:_w - m + "px", height:_w - m + "px"});
            if (_col == this.cols - 1) {
                _row++;
            }
            dojo.addClass(n, this.baseClass + "Image");
        }, this);
        var l = this._nl.length;
        while (this.threads--) {
            var s = Math.floor(Math.random() * l);
            setTimeout(dojo.hitch(this, "_enbiggen", {target:this._nl[s]}), this.delay * this.threads);
        }
    }, _getCell:function (n) {
        var _pos = this._nl.indexOf(n);
        if (_pos >= 0) {
            var _col = _pos % this.cols;
            var _row = Math.floor(_pos / this.cols);
            return {x:_col, y:_row, n:this._nl[_pos], io:_pos};
        } else {
            return undefined;
        }
    }, _getImage:function () {
        return "url('')";
    }, _enbiggen:function (e) {
        var _pos = this._getCell(e.target || e);
        if (_pos) {
            var m = this.cellMargin, _cc = (this.cellSize * 2) - (m * 2), props = {height:_cc, width:_cc};
            var _tehDecider = function () {
                return Math.round(Math.random());
            };
            if (_pos.x == this.cols - 1 || (_pos.x > 0 && _tehDecider())) {
                props.left = this.cellSize * (_pos.x - m);
            }
            if (_pos.y == this.rows - 1 || (_pos.y > 0 && _tehDecider())) {
                props.top = this.cellSize * (_pos.y - m);
            }
            var bc = this.baseClass;
            dojo.addClass(_pos.n, bc + "Top");
            dojo.addClass(_pos.n, bc + "Seen");
            dojo.animateProperty({node:_pos.n, properties:props, onEnd:dojo.hitch(this, "_loadUnder", _pos, props), easing:this.easing}).play();
        }
    }, _loadUnder:function (info, props) {
        var idx = info.io;
        var nodes = [];
        var isLeft = (props.left >= 0);
        var isUp = (props.top >= 0);
        var c = this.cols, e = idx + (isLeft ? -1 : 1), f = idx + (isUp ? -c : c), g = (isUp ? (isLeft ? e - c : f + 1) : (isLeft ? f - 1 : e + c)), bc = this.baseClass;
        dojo.forEach([e, f, g], function (x) {
            var n = this._nl[x];
            if (n) {
                if (dojo.hasClass(n, bc + "Seen")) {
                    dojo.removeClass(n, bc + "Seen");
                }
            }
        }, this);
        setTimeout(dojo.hitch(this, "_disenbiggen", info, props), this.delay * 1.25);
    }, _disenbiggen:function (info, props) {
        if (props.top >= 0) {
            props.top += this.cellSize;
        }
        if (props.left >= 0) {
            props.left += this.cellSize;
        }
        var _cc = this.cellSize - (this.cellMargin * 2);
        dojo.animateProperty({node:info.n, properties:dojo.mixin(props, {width:_cc, height:_cc}), onEnd:dojo.hitch(this, "_cycle", info, props)}).play(5);
    }, _cycle:function (info, props) {
        var bc = this.baseClass;
        dojo.removeClass(info.n, bc + "Top");
        var ns = this._nl.filter(function (n) {
            return !dojo.hasClass(n, bc + "Seen");
        });
        var c = ns[Math.floor(Math.random() * ns.length)];
        setTimeout(dojo.hitch(this, "_enbiggen", {target:c}), this.delay / 2);
    }});
});

