//>>built

define("dojox/treemap/TreeMap", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/Color", "dojo/touch", "dojo/when", "dojo/on", "dojo/query", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-class", "dojo/dom-style", "./_utils", "dijit/_WidgetBase", "dojox/widget/_Invalidating", "dojox/widget/Selection", "dojo/_base/sniff", "dojo/uacss"], function (arr, lang, declare, event, Color, touch, when, on, query, domConstruct, domGeom, domClass, domStyle, utils, _WidgetBase, _Invalidating, Selection, has) {
    return declare("dojox.treemap.TreeMap", [_WidgetBase, _Invalidating, Selection], {baseClass:"dojoxTreeMap", store:null, query:{}, queryOptions:null, itemToRenderer:null, _dataChanged:false, rootItem:null, _rootItemChanged:false, tooltipAttr:"", areaAttr:"", _areaChanged:false, labelAttr:"label", labelThreshold:NaN, colorAttr:"", colorModel:null, _coloringChanged:false, groupAttrs:[], groupFuncs:null, _groupFuncs:null, _groupingChanged:false, constructor:function () {
        this.itemToRenderer = {};
        this.invalidatingProperties = ["colorModel", "groupAttrs", "groupFuncs", "areaAttr", "areaFunc", "labelAttr", "labelFunc", "labelThreshold", "tooltipAttr", "tooltipFunc", "colorAttr", "colorFunc", "rootItem"];
    }, getIdentity:function (item) {
        return item.__treeID ? item.__treeID : this.store.getIdentity(item);
    }, resize:function (box) {
        if (box) {
            domGeom.setMarginBox(this.domNode, box);
            this.invalidateRendering();
        }
    }, postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, "mouseover", lang.hitch(this, this._onMouseOver)));
        this.own(on(this.domNode, "mouseout", lang.hitch(this, this._onMouseOut)));
        this.own(on(this.domNode, touch.release, lang.hitch(this, this._onMouseUp)));
        this.domNode.setAttribute("role", "presentation");
        this.domNode.setAttribute("aria-label", "treemap");
    }, buildRendering:function () {
        this.inherited(arguments);
        this.refreshRendering();
    }, refreshRendering:function () {
        var forceCreate = false;
        if (this._dataChanged) {
            this._dataChanged = false;
            this._groupingChanged = true;
            this._coloringChanged = true;
        }
        if (this._groupingChanged) {
            this._groupingChanged = false;
            this._set("rootItem", null);
            this._updateTreeMapHierarchy();
            forceCreate = true;
        }
        if (this._rootItemChanged) {
            this._rootItemChanged = false;
            forceCreate = true;
        }
        if (this._coloringChanged) {
            this._coloringChanged = false;
            if (this.colorModel != null && this._data != null && this.colorModel.initialize) {
                this.colorModel.initialize(this._data, lang.hitch(this, function (item) {
                    return this.colorFunc(item, this.store);
                }));
            }
        }
        if (this._areaChanged) {
            this._areaChanged = false;
            this._removeAreaForGroup();
        }
        if (this.domNode == undefined || this._items == null) {
            return;
        }
        if (forceCreate) {
            domConstruct.empty(this.domNode);
        }
        var rootItem = this.rootItem, rootParentItem;
        if (rootItem != null) {
            var rootItemRenderer = this._getRenderer(rootItem);
            if (rootItemRenderer) {
                if (this._isLeaf(rootItem)) {
                    rootItem = rootItemRenderer.parentItem;
                }
                rootParentItem = rootItemRenderer.parentItem;
            }
        }
        var box = domGeom.getMarginBox(this.domNode);
        if (rootItem != null) {
            this._buildRenderer(this.domNode, rootParentItem, rootItem, {x:box.l, y:box.t, w:box.w, h:box.h}, 0, forceCreate);
        } else {
            this._buildChildrenRenderers(this.domNode, rootItem ? rootItem : {__treeRoot:true, children:this._items}, 0, forceCreate, box);
        }
    }, _setRootItemAttr:function (value) {
        this._rootItemChanged = true;
        this._set("rootItem", value);
    }, _setStoreAttr:function (value) {
        var r;
        if (this._observeHandler) {
            this._observeHandler.remove();
            this._observeHandler = null;
        }
        if (value != null) {
            var results = value.query(this.query, this.queryOptions);
            if (results.observe) {
                this._observeHandler = results.observe(lang.hitch(this, this._updateItem), true);
            }
            r = when(results, lang.hitch(this, this._initItems));
        } else {
            r = this._initItems([]);
        }
        this._set("store", value);
        return r;
    }, _initItems:function (items) {
        this._dataChanged = true;
        this._data = items;
        this.invalidateRendering();
        return items;
    }, _updateItem:function (item, previousIndex, newIndex) {
        if (previousIndex != -1) {
            if (newIndex != previousIndex) {
                this._data.splice(previousIndex, 1);
            } else {
                this._data[newIndex] = item;
            }
        } else {
            if (newIndex != -1) {
                this._data.splice(newIndex, 0, item);
            }
        }
        this._dataChanged = true;
        this.invalidateRendering();
    }, _setGroupAttrsAttr:function (value) {
        this._groupingChanged = true;
        if (this.groupFuncs == null) {
            if (value != null) {
                this._groupFuncs = arr.map(value, function (attr) {
                    return function (item) {
                        return item[attr];
                    };
                });
            } else {
                this._groupFuncs = null;
            }
        }
        this._set("groupAttrs", value);
    }, _setGroupFuncsAttr:function (value) {
        this._groupingChanged = true;
        this._set("groupFuncs", this._groupFuncs = value);
        if (value == null && this.groupAttrs != null) {
            this._groupFuncs = arr.map(this.groupAttrs, function (attr) {
                return function (item) {
                    return item[attr];
                };
            });
        }
    }, _setAreaAttrAttr:function (value) {
        this._areaChanged = true;
        this._set("areaAttr", value);
    }, areaFunc:function (item, store) {
        return (this.areaAttr && this.areaAttr.length > 0) ? parseFloat(item[this.areaAttr]) : 1;
    }, _setAreaFuncAttr:function (value) {
        this._areaChanged = true;
        this._set("areaFunc", value);
    }, labelFunc:function (item, store) {
        var label = (this.labelAttr && this.labelAttr.length > 0) ? item[this.labelAttr] : null;
        return label ? label.toString() : null;
    }, tooltipFunc:function (item, store) {
        var tooltip = (this.tooltipAttr && this.tooltipAttr.length > 0) ? item[this.tooltipAttr] : null;
        return tooltip ? tooltip.toString() : null;
    }, _setColorModelAttr:function (value) {
        this._coloringChanged = true;
        this._set("colorModel", value);
    }, _setColorAttrAttr:function (value) {
        this._coloringChanged = true;
        this._set("colorAttr", value);
    }, colorFunc:function (item, store) {
        var color = (this.colorAttr && this.colorAttr.length > 0) ? item[this.colorAttr] : 0;
        if (color == null) {
            color = 0;
        }
        return parseFloat(color);
    }, _setColorFuncAttr:function (value) {
        this._coloringChanged = true;
        this._set("colorFunc", value);
    }, createRenderer:function (item, level, kind) {
        var div = domConstruct.create("div");
        if (kind != "header") {
            domStyle.set(div, "overflow", "hidden");
            domStyle.set(div, "position", "absolute");
        }
        return div;
    }, styleRenderer:function (renderer, item, level, kind) {
        switch (kind) {
          case "leaf":
            domStyle.set(renderer, "background", this.getColorForItem(item).toHex());
          case "header":
            var label = this.getLabelForItem(item);
            if (label && (isNaN(this.labelThreshold) || level < this.labelThreshold)) {
                renderer.innerHTML = label;
            } else {
                domConstruct.empty(renderer);
            }
            break;
          default:
        }
    }, _updateTreeMapHierarchy:function () {
        if (this._data == null) {
            return;
        }
        if (this._groupFuncs != null && this._groupFuncs.length > 0) {
            this._items = utils.group(this._data, this._groupFuncs, lang.hitch(this, this._getAreaForItem)).children;
        } else {
            this._items = this._data;
        }
    }, _removeAreaForGroup:function (item) {
        var children;
        if (item != null) {
            if (item.__treeValue) {
                delete item.__treeValue;
                children = item.children;
            } else {
                return;
            }
        } else {
            children = this._items;
        }
        if (children) {
            for (var i = 0; i < children.length; ++i) {
                this._removeAreaForGroup(children[i]);
            }
        }
    }, _getAreaForItem:function (item) {
        var area = this.areaFunc(item, this.store);
        return isNaN(area) ? 0 : area;
    }, _computeAreaForItem:function (item) {
        var value;
        if (item.__treeID) {
            value = item.__treeValue;
            if (!value) {
                value = 0;
                var children = item.children;
                for (var i = 0; i < children.length; ++i) {
                    value += this._computeAreaForItem(children[i]);
                }
                item.__treeValue = value;
            }
        } else {
            value = this._getAreaForItem(item);
        }
        return value;
    }, getColorForItem:function (item) {
        var value = this.colorFunc(item, this.store);
        if (this.colorModel != null) {
            return this.colorModel.getColor(value);
        } else {
            return new Color(value);
        }
    }, getLabelForItem:function (item) {
        return item.__treeName ? item.__treeName : this.labelFunc(item, this.store);
    }, _buildChildrenRenderers:function (domNode, item, level, forceCreate, delta, anim) {
        var children = item.children;
        var box = domGeom.getMarginBox(domNode);
        var solution = utils.solve(children, box.w, box.h, lang.hitch(this, this._computeAreaForItem), !this.isLeftToRight());
        var rectangles = solution.rectangles;
        if (delta) {
            rectangles = arr.map(rectangles, function (item) {
                item.x += delta.l;
                item.y += delta.t;
                return item;
            });
        }
        var rectangle;
        for (var j = 0; j < children.length; ++j) {
            rectangle = rectangles[j];
            this._buildRenderer(domNode, item, children[j], rectangle, level, forceCreate, anim);
        }
    }, _isLeaf:function (item) {
        return !item.children;
    }, _isRoot:function (item) {
        return item.__treeRoot;
    }, _getRenderer:function (item, anim, parent) {
        if (anim) {
            for (var i = 0; i < parent.children.length; ++i) {
                if (parent.children[i].item == item) {
                    return parent.children[i];
                }
            }
        }
        return this.itemToRenderer[this.getIdentity(item)];
    }, _buildRenderer:function (container, parent, child, rect, level, forceCreate, anim) {
        var isLeaf = this._isLeaf(child);
        var renderer = !forceCreate ? this._getRenderer(child, anim, container) : null;
        renderer = isLeaf ? this._updateLeafRenderer(renderer, child, level) : this._updateGroupRenderer(renderer, child, level);
        if (forceCreate) {
            renderer.level = level;
            renderer.item = child;
            renderer.parentItem = parent;
            this.itemToRenderer[this.getIdentity(child)] = renderer;
            this.updateRenderers(child);
        }
        var x = Math.floor(rect.x);
        var y = Math.floor(rect.y);
        var w = Math.floor(rect.x + rect.w + 1e-11) - x;
        var h = Math.floor(rect.y + rect.h + 1e-11) - y;
        if (forceCreate) {
            domConstruct.place(renderer, container);
        }
        domGeom.setMarginBox(renderer, {l:x, t:y, w:w, h:h});
        if (!isLeaf) {
            var box = domGeom.getContentBox(renderer);
            this._layoutGroupContent(renderer, box.w, box.h, level + 1, forceCreate, anim);
        }
        this.onRendererUpdated({renderer:renderer, item:child, kind:isLeaf ? "leaf" : "group", level:level});
    }, _layoutGroupContent:function (renderer, width, height, level, forceCreate, anim) {
        var header = query(".dojoxTreeMapHeader", renderer)[0];
        var content = query(".dojoxTreeMapGroupContent", renderer)[0];
        if (header == null || content == null) {
            return;
        }
        var box = domGeom.getMarginBox(header);
        if (box.h > height) {
            box.h = height;
            domStyle.set(content, "display", "none");
        } else {
            domStyle.set(content, "display", "block");
            domGeom.setMarginBox(content, {l:0, t:box.h, w:width, h:(height - box.h)});
            this._buildChildrenRenderers(content, renderer.item, level, forceCreate, null, anim);
        }
        domGeom.setMarginBox(header, {l:0, t:0, w:width, h:box.h});
    }, _updateGroupRenderer:function (renderer, item, level) {
        var forceCreate = renderer == null;
        if (renderer == null) {
            renderer = this.createRenderer("div", level, "group");
            domClass.add(renderer, "dojoxTreeMapGroup");
        }
        this.styleRenderer(renderer, item, level, "group");
        var header = query(".dojoxTreeMapHeader", renderer)[0];
        header = this._updateHeaderRenderer(header, item, level);
        if (forceCreate) {
            domConstruct.place(header, renderer);
        }
        var content = query(".dojoxTreeMapGroupContent", renderer)[0];
        content = this._updateGroupContentRenderer(content, item, level);
        if (forceCreate) {
            domConstruct.place(content, renderer);
        }
        return renderer;
    }, _updateHeaderRenderer:function (renderer, item, level) {
        if (renderer == null) {
            renderer = this.createRenderer(item, level, "header");
            domClass.add(renderer, "dojoxTreeMapHeader");
            domClass.add(renderer, "dojoxTreeMapHeader_" + level);
        }
        this.styleRenderer(renderer, item, level, "header");
        return renderer;
    }, _updateLeafRenderer:function (renderer, item, level) {
        if (renderer == null) {
            renderer = this.createRenderer(item, level, "leaf");
            domClass.add(renderer, "dojoxTreeMapLeaf");
            domClass.add(renderer, "dojoxTreeMapLeaf_" + level);
        }
        this.styleRenderer(renderer, item, level, "leaf");
        var tooltip = this.tooltipFunc(item, this.store);
        if (tooltip) {
            renderer.title = tooltip;
        }
        return renderer;
    }, _updateGroupContentRenderer:function (renderer, item, level) {
        if (renderer == null) {
            renderer = this.createRenderer(item, level, "content");
            domClass.add(renderer, "dojoxTreeMapGroupContent");
            domClass.add(renderer, "dojoxTreeMapGroupContent_" + level);
        }
        this.styleRenderer(renderer, item, level, "content");
        return renderer;
    }, _getRendererFromTarget:function (target) {
        var renderer = target;
        while (renderer != this.domNode && !renderer.item) {
            renderer = renderer.parentNode;
        }
        return renderer;
    }, _onMouseOver:function (e) {
        var renderer = this._getRendererFromTarget(e.target);
        if (renderer.item) {
            var item = renderer.item;
            this._hoveredItem = item;
            this.updateRenderers(item);
            this.onItemRollOver({renderer:renderer, item:item, triggerEvent:e});
        }
    }, _onMouseOut:function (e) {
        var renderer = this._getRendererFromTarget(e.target);
        if (renderer.item) {
            var item = renderer.item;
            this._hoveredItem = null;
            this.updateRenderers(item);
            this.onItemRollOut({renderer:renderer, item:item, triggerEvent:e});
        }
    }, _onMouseUp:function (e) {
        var renderer = this._getRendererFromTarget(e.target);
        if (renderer.item) {
            this.selectFromEvent(e, renderer.item, renderer, true);
        }
    }, onRendererUpdated:function () {
    }, onItemRollOver:function () {
    }, onItemRollOut:function () {
    }, updateRenderers:function (items) {
        if (!items) {
            return;
        }
        if (!lang.isArray(items)) {
            items = [items];
        }
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var renderer = this._getRenderer(item);
            if (!renderer) {
                continue;
            }
            var selected = this.isItemSelected(item);
            var ie = has("ie");
            var div;
            if (selected) {
                domClass.add(renderer, "dojoxTreeMapSelected");
                if (ie && (has("quirks") || ie < 9)) {
                    div = renderer.previousSibling;
                    var rStyle = domStyle.get(renderer);
                    if (!div || !domClass.contains(div, "dojoxTreeMapIEHack")) {
                        div = this.createRenderer(item, -10, "group");
                        domClass.add(div, "dojoxTreeMapIEHack");
                        domClass.add(div, "dojoxTreeMapSelected");
                        domStyle.set(div, {position:"absolute", overflow:"hidden"});
                        domConstruct.place(div, renderer, "before");
                    }
                    var bWidth = 2 * parseInt(domStyle.get(div, "border-width"));
                    if (this._isLeaf(item)) {
                        bWidth -= 1;
                    } else {
                        bWidth += 1;
                    }
                    if (rStyle["left"] != "auto") {
                        domStyle.set(div, {left:(parseInt(rStyle["left"]) + 1) + "px", top:(parseInt(rStyle["top"]) + 1) + "px", width:(parseInt(rStyle["width"]) - bWidth) + "px", height:(parseInt(rStyle["height"]) - bWidth) + "px"});
                    }
                }
            } else {
                if (ie && (has("quirks") || ie < 9)) {
                    div = renderer.previousSibling;
                    if (div && domClass.contains(div, "dojoxTreeMapIEHack")) {
                        div.parentNode.removeChild(div);
                    }
                }
                domClass.remove(renderer, "dojoxTreeMapSelected");
            }
            if (this._hoveredItem == item) {
                domClass.add(renderer, "dojoxTreeMapHovered");
            } else {
                domClass.remove(renderer, "dojoxTreeMapHovered");
            }
            if (selected || this._hoveredItem == item) {
                domStyle.set(renderer, "zIndex", 20);
            } else {
                domStyle.set(renderer, "zIndex", (has("ie") <= 7) ? 0 : "auto");
            }
        }
    }});
});

