//>>built

define("dojox/widget/FeedPortlet", ["dijit", "dojo", "dojox", "dojo/require!dojox/widget/Portlet,dijit/Tooltip,dijit/form/TextBox,dijit/form/Button,dojox/data/GoogleFeedStore"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.widget.FeedPortlet");
    dojo.require("dojox.widget.Portlet");
    dojo.require("dijit.Tooltip");
    dojo.require("dijit.form.TextBox");
    dojo.require("dijit.form.Button");
    dojo.require("dojox.data.GoogleFeedStore");
    dojo.declare("dojox.widget.FeedPortlet", dojox.widget.Portlet, {local:false, maxResults:5, url:"", openNew:true, showFeedTitle:true, postCreate:function () {
        this.inherited(arguments);
        if (this.local && !dojox.data.AtomReadStore) {
            throw Error(this.declaredClass + ": To use local feeds, you must include dojox.data.AtomReadStore on the page.");
        }
    }, onFeedError:function () {
        this.containerNode.innerHTML = "Error accessing the feed.";
    }, addChild:function (child) {
        this.inherited(arguments);
        var url = child.attr("feedPortletUrl");
        if (url) {
            this.set("url", url);
        }
    }, _getTitle:function (item) {
        var t = this.store.getValue(item, "title");
        return this.local ? t.text : t;
    }, _getLink:function (item) {
        var l = this.store.getValue(item, "link");
        return this.local ? l.href : l;
    }, _getContent:function (item) {
        var c = this.store.getValue(item, "summary");
        if (!c) {
            return null;
        }
        if (this.local) {
            c = c.text;
        }
        c = c.split("<script").join("<!--").split("</script>").join("-->");
        c = c.split("<iframe").join("<!--").split("</iframe>").join("-->");
        return c;
    }, _setUrlAttr:function (url) {
        this.url = url;
        if (this._started) {
            this.load();
        }
    }, startup:function () {
        if (this.started || this._started) {
            return;
        }
        this.inherited(arguments);
        if (!this.url || this.url == "") {
            throw new Error(this.id + ": A URL must be specified for the feed portlet");
        }
        if (this.url && this.url != "") {
            this.load();
        }
    }, load:function () {
        if (this._resultList) {
            dojo.destroy(this._resultList);
        }
        var store, query;
        if (this.local) {
            store = new dojox.data.AtomReadStore({url:this.url});
            query = {};
        } else {
            store = new dojox.data.GoogleFeedStore();
            query = {url:this.url};
        }
        var request = {query:query, count:this.maxResults, onComplete:dojo.hitch(this, function (items) {
            if (this.showFeedTitle && store.getFeedValue) {
                var title = this.store.getFeedValue("title");
                if (title) {
                    this.set("title", title.text ? title.text : title);
                }
            }
            this.generateResults(items);
        }), onError:dojo.hitch(this, "onFeedError")};
        this.store = store;
        store.fetch(request);
    }, generateResults:function (items) {
        var store = this.store;
        var timer;
        var ul = (this._resultList = dojo.create("ul", {"class":"dojoxFeedPortletList"}, this.containerNode));
        dojo.forEach(items, dojo.hitch(this, function (item) {
            var li = dojo.create("li", {innerHTML:"<a href=\"" + this._getLink(item) + "\"" + (this.openNew ? " target=\"_blank\"" : "") + ">" + this._getTitle(item) + "</a>"}, ul);
            dojo.connect(li, "onmouseover", dojo.hitch(this, function (evt) {
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(dojo.hitch(this, function () {
                    timer = null;
                    var summary = this._getContent(item);
                    if (!summary) {
                        return;
                    }
                    var content = "<div class=\"dojoxFeedPortletPreview\">" + summary + "</div>";
                    dojo.query("li", ul).forEach(function (item) {
                        if (item != evt.target) {
                            dijit.hideTooltip(item);
                        }
                    });
                    dijit.showTooltip(content, li.firstChild, !this.isLeftToRight());
                }), 500);
            }));
            dojo.connect(li, "onmouseout", function () {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                dijit.hideTooltip(li.firstChild);
            });
        }));
        this.resize();
    }});
    dojo.declare("dojox.widget.ExpandableFeedPortlet", dojox.widget.FeedPortlet, {onlyOpenOne:false, generateResults:function (items) {
        var store = this.store;
        var iconCls = "dojoxPortletToggleIcon";
        var collapsedCls = "dojoxPortletItemCollapsed";
        var expandedCls = "dojoxPortletItemOpen";
        var timer;
        var ul = (this._resultList = dojo.create("ul", {"class":"dojoxFeedPortletExpandableList"}, this.containerNode));
        dojo.forEach(items, dojo.hitch(this, dojo.hitch(this, function (item) {
            var li = dojo.create("li", {"class":collapsedCls}, ul);
            var upper = dojo.create("div", {style:"width: 100%;"}, li);
            var lower = dojo.create("div", {"class":"dojoxPortletItemSummary", innerHTML:this._getContent(item)}, li);
            dojo.create("span", {"class":iconCls, innerHTML:"<img src='" + dojo.config.baseUrl + "/resources/blank.gif'>"}, upper);
            var a = dojo.create("a", {href:this._getLink(item), innerHTML:this._getTitle(item)}, upper);
            if (this.openNew) {
                dojo.attr(a, "target", "_blank");
            }
        })));
        dojo.connect(ul, "onclick", dojo.hitch(this, function (evt) {
            if (dojo.hasClass(evt.target, iconCls) || dojo.hasClass(evt.target.parentNode, iconCls)) {
                dojo.stopEvent(evt);
                var li = evt.target.parentNode;
                while (li.tagName != "LI") {
                    li = li.parentNode;
                }
                if (this.onlyOpenOne) {
                    dojo.query("li", ul).filter(function (item) {
                        return item != li;
                    }).removeClass(expandedCls).addClass(collapsedCls);
                }
                var isExpanded = dojo.hasClass(li, expandedCls);
                dojo.toggleClass(li, expandedCls, !isExpanded);
                dojo.toggleClass(li, collapsedCls, isExpanded);
            }
        }));
    }});
    dojo.declare("dojox.widget.PortletFeedSettings", dojox.widget.PortletSettings, {"class":"dojoxPortletFeedSettings", urls:null, selectedIndex:0, buildRendering:function () {
        var s;
        if (this.urls && this.urls.length > 0) {
            console.log(this.id + " -> creating select with urls ", this.urls);
            s = dojo.create("select");
            if (this.srcNodeRef) {
                dojo.place(s, this.srcNodeRef, "before");
                dojo.destroy(this.srcNodeRef);
            }
            this.srcNodeRef = s;
            dojo.forEach(this.urls, function (url) {
                dojo.create("option", {value:url.url || url, innerHTML:url.label || url}, s);
            });
        }
        if (this.srcNodeRef.tagName == "SELECT") {
            this.text = this.srcNodeRef;
            var div = dojo.create("div", {}, this.srcNodeRef, "before");
            div.appendChild(this.text);
            this.srcNodeRef = div;
            dojo.query("option", this.text).filter("return !item.value;").forEach("item.value = item.innerHTML");
            if (!this.text.value) {
                if (this.content && this.text.options.length == 0) {
                    this.text.appendChild(this.content);
                }
                dojo.attr(s || this.text, "value", this.text.options[this.selectedIndex].value);
            }
        }
        this.inherited(arguments);
    }, _setContentAttr:function () {
    }, postCreate:function () {
        console.log(this.id + " -> postCreate");
        if (!this.text) {
            var text = this.text = new dijit.form.TextBox({});
            dojo.create("span", {innerHTML:"Choose Url: "}, this.domNode);
            this.addChild(text);
        }
        this.addChild(new dijit.form.Button({label:"Load", onClick:dojo.hitch(this, function () {
            this.portlet.attr("url", (this.text.tagName == "SELECT") ? this.text.value : this.text.attr("value"));
            if (this.text.tagName == "SELECT") {
                dojo.some(this.text.options, dojo.hitch(this, function (opt, idx) {
                    if (opt.selected) {
                        this.set("selectedIndex", idx);
                        return true;
                    }
                    return false;
                }));
            }
            this.toggle();
        })}));
        this.addChild(new dijit.form.Button({label:"Cancel", onClick:dojo.hitch(this, "toggle")}));
        this.inherited(arguments);
    }, startup:function () {
        if (this._started) {
            return;
        }
        console.log(this.id + " -> startup");
        this.inherited(arguments);
        if (!this.portlet) {
            throw Error(this.declaredClass + ": A PortletFeedSettings widget cannot exist without a Portlet.");
        }
        if (this.text.tagName == "SELECT") {
            dojo.forEach(this.text.options, dojo.hitch(this, function (opt, index) {
                dojo.attr(opt, "selected", index == this.selectedIndex);
            }));
        }
        var url = this.portlet.attr("url");
        if (url) {
            if (this.text.tagName == "SELECT") {
                if (!this.urls && dojo.query("option[value='" + url + "']", this.text).length < 1) {
                    dojo.place(dojo.create("option", {value:url, innerHTML:url, selected:"true"}), this.text, "first");
                }
            } else {
                this.text.attr("value", url);
            }
        } else {
            this.portlet.attr("url", this.get("feedPortletUrl"));
        }
    }, _getFeedPortletUrlAttr:function () {
        return this.text.value;
    }});
});

