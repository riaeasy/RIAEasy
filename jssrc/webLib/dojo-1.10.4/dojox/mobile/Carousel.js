//>>built

define("dojox/mobile/Carousel", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", "dojo/sniff", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dijit/registry", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "./lazyLoadUtils", "./CarouselItem", "./PageIndicator", "./SwapView", "require", "require", "dojo/i18n!dojox/mobile/nls/messages"], function (array, connect, declare, event, lang, has, domClass, domConstruct, domStyle, registry, Contained, Container, WidgetBase, lazyLoadUtils, CarouselItem, PageIndicator, SwapView, require, BidiCarousel, messages) {
    var Carousel = declare(0 ? "dojox.mobile.NonBidiCarousel" : "dojox.mobile.Carousel", [WidgetBase, Container, Contained], {numVisible:2, itemWidth:0, title:"", pageIndicator:true, navButton:false, height:"", selectable:true, baseClass:"mblCarousel", buildRendering:function () {
        this.containerNode = domConstruct.create("div", {className:"mblCarouselPages", id:this.id + "_pages"});
        this.inherited(arguments);
        var i, len;
        if (this.srcNodeRef) {
            for (i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++) {
                this.containerNode.appendChild(this.srcNodeRef.firstChild);
            }
        }
        this.headerNode = domConstruct.create("div", {className:"mblCarouselHeaderBar"}, this.domNode);
        if (this.navButton) {
            this.btnContainerNode = domConstruct.create("div", {className:"mblCarouselBtnContainer"}, this.headerNode);
            domStyle.set(this.btnContainerNode, "float", "right");
            this.prevBtnNode = domConstruct.create("button", {className:"mblCarouselBtn", title:messages["CarouselPrevious"], innerHTML:"&lt;", "aria-controls":this.containerNode.id}, this.btnContainerNode);
            this.nextBtnNode = domConstruct.create("button", {className:"mblCarouselBtn", title:messages["CarouselNext"], innerHTML:"&gt;", "aria-controls":this.containerNode.id}, this.btnContainerNode);
            this._prevHandle = this.connect(this.prevBtnNode, "onclick", "onPrevBtnClick");
            this._nextHandle = this.connect(this.nextBtnNode, "onclick", "onNextBtnClick");
        }
        if (this.pageIndicator) {
            if (!this.title) {
                this.title = "&nbsp;";
            }
            this.piw = new PageIndicator();
            this.headerNode.appendChild(this.piw.domNode);
        }
        this.titleNode = domConstruct.create("div", {className:"mblCarouselTitle"}, this.headerNode);
        this.domNode.appendChild(this.containerNode);
        this.subscribe("/dojox/mobile/viewChanged", "handleViewChanged");
        this.connect(this.domNode, "onclick", "_onClick");
        this.connect(this.domNode, "onkeydown", "_onClick");
        this._dragstartHandle = this.connect(this.domNode, "ondragstart", event.stop);
        this.selectedItemIndex = -1;
        this.items = [];
    }, startup:function () {
        if (this._started) {
            return;
        }
        var h;
        if (this.height === "inherit") {
            if (this.domNode.offsetParent) {
                h = this.domNode.offsetParent.offsetHeight + "px";
            }
        } else {
            if (this.height) {
                h = this.height;
            }
        }
        if (h) {
            this.domNode.style.height = h;
        }
        if (this.store) {
            if (!this.setStore) {
                throw new Error("Use StoreCarousel or DataCarousel instead of Carousel.");
            }
            var store = this.store;
            this.store = null;
            this.setStore(store, this.query, this.queryOptions);
        } else {
            this.resizeItems();
        }
        this.inherited(arguments);
        this.currentView = array.filter(this.getChildren(), function (view) {
            return view.isVisible();
        })[0];
    }, resizeItems:function () {
        var idx = 0, i, len;
        var h = this.domNode.offsetHeight - (this.headerNode ? this.headerNode.offsetHeight : 0);
        var m = (has("ie") < 10) ? 5 / this.numVisible - 1 : 5 / this.numVisible;
        var node, item;
        array.forEach(this.getChildren(), function (view) {
            if (!(view instanceof SwapView)) {
                return;
            }
            if (!(view.lazy)) {
                view._instantiated = true;
            }
            var ch = view.containerNode.childNodes;
            for (i = 0, len = ch.length; i < len; i++) {
                node = ch[i];
                if (node.nodeType !== 1) {
                    continue;
                }
                item = this.items[idx] || {};
                domStyle.set(node, {width:item.width || (90 / this.numVisible + "%"), height:item.height || h + "px", margin:"0 " + (item.margin || m + "%")});
                domClass.add(node, "mblCarouselSlot");
                idx++;
            }
        }, this);
        if (this.piw) {
            this.piw.refId = this.containerNode.firstChild;
            this.piw.reset();
        }
    }, resize:function () {
        if (!this.itemWidth) {
            return;
        }
        var num = Math.floor(this.domNode.offsetWidth / this.itemWidth);
        if (num === this.numVisible) {
            return;
        }
        this.selectedItemIndex = this.getIndexByItemWidget(this.selectedItem);
        this.numVisible = num;
        if (this.items.length > 0) {
            this.onComplete(this.items);
            this.select(this.selectedItemIndex);
        }
    }, fillPages:function () {
        array.forEach(this.getChildren(), function (child, i) {
            var s = "";
            var j;
            for (j = 0; j < this.numVisible; j++) {
                var type, props = "", mixins;
                var idx = i * this.numVisible + j;
                var item = {};
                if (idx < this.items.length) {
                    item = this.items[idx];
                    type = this.store.getValue(item, "type");
                    if (type) {
                        props = this.store.getValue(item, "props");
                        mixins = this.store.getValue(item, "mixins");
                    } else {
                        type = "dojox.mobile.CarouselItem";
                        array.forEach(["alt", "src", "headerText", "footerText"], function (p) {
                            var v = this.store.getValue(item, p);
                            if (v !== undefined) {
                                if (props) {
                                    props += ",";
                                }
                                props += p + ":\"" + v + "\"";
                            }
                        }, this);
                    }
                } else {
                    type = "dojox.mobile.CarouselItem";
                    props = "src:\"" + require.toUrl("dojo/resources/blank.gif") + "\"" + ", className:\"mblCarouselItemBlank\"";
                }
                s += "<div data-dojo-type=\"" + type + "\"";
                if (props) {
                    s += " data-dojo-props='" + props + "'";
                }
                if (mixins) {
                    s += " data-dojo-mixins='" + mixins + "'";
                }
                s += "></div>";
            }
            child.containerNode.innerHTML = s;
        }, this);
    }, onComplete:function (items) {
        array.forEach(this.getChildren(), function (child) {
            if (child instanceof SwapView) {
                child.destroyRecursive();
            }
        });
        this.selectedItem = null;
        this.items = items;
        var nPages = Math.ceil(items.length / this.numVisible), i, h = this.domNode.offsetHeight - this.headerNode.offsetHeight, idx = this.selectedItemIndex === -1 ? 0 : this.selectedItemIndex, pg = Math.floor(idx / this.numVisible);
        for (i = 0; i < nPages; i++) {
            var w = new SwapView({height:h + "px", lazy:true});
            this.addChild(w);
            if (i === pg) {
                w.show();
                this.currentView = w;
            } else {
                w.hide();
            }
        }
        this.fillPages();
        this.resizeItems();
        var children = this.getChildren();
        var from = pg - 1 < 0 ? 0 : pg - 1;
        var to = pg + 1 > nPages - 1 ? nPages - 1 : pg + 1;
        for (i = from; i <= to; i++) {
            this.instantiateView(children[i]);
        }
    }, onError:function () {
    }, onUpdate:function () {
    }, onDelete:function () {
    }, onSet:function (item, attribute, oldValue, newValue) {
    }, onNew:function (newItem, parentInfo) {
    }, onStoreClose:function (request) {
    }, getParentView:function (node) {
        var w;
        for (w = registry.getEnclosingWidget(node); w; w = w.getParent()) {
            if (w.getParent() instanceof SwapView) {
                return w;
            }
        }
        return null;
    }, getIndexByItemWidget:function (w) {
        if (!w) {
            return -1;
        }
        var view = w.getParent();
        return array.indexOf(this.getChildren(), view) * this.numVisible + array.indexOf(view.getChildren(), w);
    }, getItemWidgetByIndex:function (index) {
        if (index === -1) {
            return null;
        }
        var view = this.getChildren()[Math.floor(index / this.numVisible)];
        return view.getChildren()[index % this.numVisible];
    }, onPrevBtnClick:function () {
        if (this.currentView) {
            this.currentView.goTo(-1);
        }
    }, onNextBtnClick:function () {
        if (this.currentView) {
            this.currentView.goTo(1);
        }
    }, _onClick:function (e) {
        if (this.onClick(e) === false) {
            return;
        }
        if (e && e.type === "keydown") {
            if (e.keyCode === 39) {
                this.onNextBtnClick();
            } else {
                if (e.keyCode === 37) {
                    this.onPrevBtnClick();
                } else {
                    if (e.keyCode !== 13) {
                        return;
                    }
                }
            }
        }
        var w;
        for (w = registry.getEnclosingWidget(e.target); ; w = w.getParent()) {
            if (!w) {
                return;
            }
            if (w.getParent() instanceof SwapView) {
                break;
            }
        }
        this.select(w);
        var idx = this.getIndexByItemWidget(w);
        connect.publish("/dojox/mobile/carouselSelect", [this, w, this.items[idx], idx]);
    }, select:function (itemWidget) {
        if (typeof (itemWidget) === "number") {
            itemWidget = this.getItemWidgetByIndex(itemWidget);
        }
        if (this.selectable) {
            if (this.selectedItem) {
                this.selectedItem.set("selected", false);
                domClass.remove(this.selectedItem.domNode, "mblCarouselSlotSelected");
            }
            if (itemWidget) {
                itemWidget.set("selected", true);
                domClass.add(itemWidget.domNode, "mblCarouselSlotSelected");
            }
            this.selectedItem = itemWidget;
        }
    }, onClick:function () {
    }, instantiateView:function (view) {
        if (view && !view._instantiated) {
            var isHidden = (domStyle.get(view.domNode, "display") === "none");
            if (isHidden) {
                domStyle.set(view.domNode, {visibility:"hidden", display:""});
            }
            lazyLoadUtils.instantiateLazyWidgets(view.containerNode, null, function (root) {
                if (isHidden) {
                    domStyle.set(view.domNode, {visibility:"visible", display:"none"});
                }
            });
            view._instantiated = true;
        }
    }, handleViewChanged:function (view) {
        if (view.getParent() !== this) {
            return;
        }
        if (this.currentView.nextView(this.currentView.domNode) === view) {
            this.instantiateView(view.nextView(view.domNode));
        } else {
            this.instantiateView(view.previousView(view.domNode));
        }
        this.currentView = view;
    }, _setTitleAttr:function (title) {
        this.titleNode.innerHTML = this._cv ? this._cv(title) : title;
        this._set("title", title);
    }});
    Carousel.ChildSwapViewProperties = {lazy:false};
    lang.extend(SwapView, Carousel.ChildSwapViewProperties);
    return 0 ? declare("dojox.mobile.Carousel", [Carousel, BidiCarousel]) : Carousel;
});

