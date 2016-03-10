//>>built

define("dojox/widget/rotator/Controller", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/html", "dojo/_base/event", "dojo/_base/array", "dojo/_base/connect", "dojo/query"], function (declare, lang, html, event, array, connect, query) {
    var _dojoxRotator = "dojoxRotator", _play = _dojoxRotator + "Play", _pause = _dojoxRotator + "Pause", _number = _dojoxRotator + "Number", _tab = _dojoxRotator + "Tab", _selected = _dojoxRotator + "Selected";
    return declare("dojox.widget.rotator.Controller", null, {rotator:null, commands:"prev,play/pause,info,next", constructor:function (params, node) {
        lang.mixin(this, params);
        var r = this.rotator;
        if (r) {
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            var ul = this._domNode = html.create("ul", null, node), icon = " " + _dojoxRotator + "Icon", cb = function (label, css, action) {
                html.create("li", {className:css, innerHTML:"<a href=\"#\"><span>" + label + "</span></a>", onclick:function (e) {
                    event.stop(e);
                    if (r) {
                        r.control.apply(r, action);
                    }
                }}, ul);
            };
            array.forEach(this.commands.split(","), function (b, i) {
                switch (b) {
                  case "prev":
                    cb("Prev", _dojoxRotator + "Prev" + icon, ["prev"]);
                    break;
                  case "play/pause":
                    cb("Play", _play + icon, ["play"]);
                    cb("Pause", _pause + icon, ["pause"]);
                    break;
                  case "info":
                    this._info = html.create("li", {className:_dojoxRotator + "Info", innerHTML:this._buildInfo(r)}, ul);
                    break;
                  case "next":
                    cb("Next", _dojoxRotator + "Next" + icon, ["next"]);
                    break;
                  case "#":
                  case "titles":
                    for (var j = 0; j < r.panes.length; j++) {
                        cb(b == "#" ? j + 1 : r.panes[j].title || "Tab " + (j + 1), (b == "#" ? _number : _tab) + " " + (j == r.idx ? _selected : "") + " " + _dojoxRotator + "Pane" + j, ["go", j]);
                    }
                    break;
                }
            }, this);
            query("li:first-child", ul).addClass(_dojoxRotator + "First");
            query("li:last-child", ul).addClass(_dojoxRotator + "Last");
            this._togglePlay();
            this._con = connect.connect(r, "onUpdate", this, "_onUpdate");
        }
    }, destroy:function () {
        connect.disconnect(this._con);
        html.destroy(this._domNode);
    }, _togglePlay:function (playing) {
        var p = this.rotator.playing;
        query("." + _play, this._domNode).style("display", p ? "none" : "");
        query("." + _pause, this._domNode).style("display", p ? "" : "none");
    }, _buildInfo:function (r) {
        return "<span>" + (r.idx + 1) + " / " + r.panes.length + "</span>";
    }, _onUpdate:function (type) {
        var r = this.rotator;
        switch (type) {
          case "play":
          case "pause":
            this._togglePlay();
            break;
          case "onAfterTransition":
            if (this._info) {
                this._info.innerHTML = this._buildInfo(r);
            }
            var s = function (n) {
                if (r.idx < n.length) {
                    html.addClass(n[r.idx], _selected);
                }
            };
            s(query("." + _number, this._domNode).removeClass(_selected));
            s(query("." + _tab, this._domNode).removeClass(_selected));
            break;
        }
    }});
});

