//>>built

define("dojox/highlight/widget/Code", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/query", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-construct", "dojo/request/xhr", "dijit/_Widget", "dijit/_Templated", "dojox/highlight"], function (declare, lang, array, query, domClass, domAttr, domConstruct, xhr, _Widget, _Templated) {
    return declare("dojox.highlight.widget.Code", [_Widget, _Templated], {url:"", range:null, style:"", listType:"1", lang:"", templateString:"<div class=\"formatted\" style=\"${style}\">" + "<div class=\"titleBar\"></div>" + "<ol type=\"${listType}\" dojoAttachPoint=\"codeList\" class=\"numbers\"></ol>" + "<div style=\"display:none\" dojoAttachPoint=\"containerNode\"></div>" + "</div>", postCreate:function () {
        this.inherited(arguments);
        if (this.url) {
            xhr(this.url, {}).then(lang.hitch(this, "_populate"), lang.hitch(this, "_loadError"));
        } else {
            this._populate(this.containerNode.innerHTML);
        }
    }, _populate:function (data) {
        this.containerNode.innerHTML = "<pre><code class='" + this.lang + "'>" + data.replace(/\</g, "&lt;") + "</code></pre>";
        query("pre > code", this.containerNode).forEach(dojox.highlight.init);
        var lines = this.containerNode.innerHTML.split("\n");
        array.forEach(lines, function (line, i) {
            var li = domConstruct.create("li");
            domClass.add(li, (i % 2 !== 0 ? "even" : "odd"));
            line = "<pre><code>" + line + "&nbsp;</code></pre>";
            line = line.replace(/\t/g, " &nbsp; ");
            li.innerHTML = line;
            this.codeList.appendChild(li);
        }, this);
        this._lines = query("li", this.codeList);
        this._updateView();
    }, setRange:function (range) {
        if (range instanceof Array) {
            this.range = range;
            this._updateView();
        }
    }, _updateView:function () {
        if (this.range) {
            var r = this.range;
            this._lines.style({display:"none"}).filter(function (n, i) {
                return (i + 1 >= r[0] && i + 1 <= r[1]);
            }).style({display:""});
            domAttr.set(this.codeList, "start", r[0]);
        }
    }, _loadError:function (error) {
        console.warn("loading: ", this.url, " FAILED", error);
    }});
});

