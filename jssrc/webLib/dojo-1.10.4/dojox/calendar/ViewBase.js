//>>built

define("dojox/calendar/ViewBase", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/window", "dojo/_base/event", "dojo/_base/html", "dojo/sniff", "dojo/query", "dojo/dom", "dojo/dom-style", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/on", "dojo/date", "dojo/date/locale", "dojo/when", "dijit/_WidgetBase", "dojox/widget/_Invalidating", "dojox/widget/Selection", "dojox/calendar/time", "./StoreMixin", "./StoreManager", "./RendererManager"], function (declare, lang, arr, win, event, html, has, query, dom, domStyle, domClass, domConstruct, domGeometry, on, date, locale, when, _WidgetBase, _Invalidating, Selection, timeUtil, StoreMixin, StoreManager, RendererManager) {
    return declare("dojox.calendar.ViewBase", [_WidgetBase, StoreMixin, _Invalidating, Selection], {datePackage:date, _calendar:"gregorian", viewKind:null, _layoutStep:1, _layoutUnit:"day", resizeCursor:"n-resize", formatItemTimeFunc:null, _cssDays:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], _getFormatItemTimeFuncAttr:function () {
        if (this.formatItemTimeFunc) {
            return this.formatItemTimeFunc;
        }
        if (this.owner != null) {
            return this.owner.get("formatItemTimeFunc");
        }
    }, _viewHandles:null, doubleTapDelay:300, constructor:function (args) {
        args = args || {};
        this._calendar = args.datePackage ? args.datePackage.substr(args.datePackage.lastIndexOf(".") + 1) : this._calendar;
        this.dateModule = args.datePackage ? lang.getObject(args.datePackage, false) : date;
        this.dateClassObj = this.dateModule.Date || Date;
        this.dateLocaleModule = args.datePackage ? lang.getObject(args.datePackage + ".locale", false) : locale;
        this._viewHandles = [];
        this.storeManager = new StoreManager({owner:this, _ownerItemsProperty:"items"});
        this.storeManager.on("layoutInvalidated", lang.hitch(this, this._refreshItemsRendering));
        this.storeManager.on("dataLoaded", lang.hitch(this, function (items) {
            this.set("items", items);
        }));
        this.rendererManager = new RendererManager({owner:this});
        this.rendererManager.on("rendererCreated", lang.hitch(this, this._onRendererCreated));
        this.rendererManager.on("rendererReused", lang.hitch(this, this._onRendererReused));
        this.rendererManager.on("rendererRecycled", lang.hitch(this, this._onRendererRecycled));
        this.rendererManager.on("rendererDestroyed", lang.hitch(this, this._onRendererDestroyed));
        this.rendererManager.on("layoutInvalidated", lang.hitch(this, this._refreshItemsRendering));
        this.rendererManager.on("renderersInvalidated", lang.hitch(this, function (item) {
            this.updateRenderers(item);
        }));
        this.decorationStoreManager = new StoreManager({owner:this, _ownerItemsProperty:"decorationItems"});
        this.decorationStoreManager.on("layoutInvalidated", lang.hitch(this, this._refreshDecorationItemsRendering));
        this.decorationStoreManager.on("dataLoaded", lang.hitch(this, function (items) {
            this.set("decorationItems", items);
        }));
        this.decorationRendererManager = new RendererManager({owner:this});
    }, destroy:function (preserveDom) {
        this.rendererManager.destroy();
        this.decorationRendererManager.destroy();
        while (this._viewHandles.length > 0) {
            this._viewHandles.pop().remove();
        }
        this.inherited(arguments);
    }, resize:function (changeSize) {
        if (changeSize) {
            domGeometry.setMarginBox(this.domNode, changeSize);
        }
    }, beforeActivate:function () {
    }, afterActivate:function () {
    }, beforeDeactivate:function () {
    }, afterDeactivate:function () {
    }, _getTopOwner:function () {
        var p = this;
        while (p.owner != undefined) {
            p = p.owner;
        }
        return p;
    }, _createRenderData:function () {
    }, _validateProperties:function () {
    }, _setText:function (node, text, allowHTML) {
        if (text != null) {
            if (!allowHTML && node.hasChildNodes()) {
                node.childNodes[0].childNodes[0].nodeValue = text;
            } else {
                while (node.hasChildNodes()) {
                    node.removeChild(node.lastChild);
                }
                var tNode = win.doc.createElement("span");
                if (0) {
                    this.applyTextDir(tNode, text);
                }
                if (allowHTML) {
                    tNode.innerHTML = text;
                } else {
                    tNode.appendChild(win.doc.createTextNode(text));
                }
                node.appendChild(tNode);
            }
        }
    }, isAscendantHasClass:function (node, ancestor, className) {
        while (node != ancestor && node != document) {
            if (domClass.contains(node, className)) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }, isWeekEnd:function (date) {
        return locale.isWeekend(date);
    }, getWeekNumberLabel:function (date) {
        if (date.toGregorian) {
            date = date.toGregorian();
        }
        return locale.format(date, {selector:"date", datePattern:"w"});
    }, addAndFloor:function (date, unit, steps) {
        var d = this.dateModule.add(date, unit, steps);
        if (d.getHours() == 23) {
            d = this.dateModule.add(d, "hour", 2);
        } else {
            d = timeUtil.floorToDay(d, true, this.dateClassObj);
        }
        return d;
    }, floorToDay:function (date, reuse) {
        return timeUtil.floorToDay(date, reuse, this.dateClassObj);
    }, floorToMonth:function (date, reuse) {
        return timeUtil.floorToMonth(date, reuse, this.dateClassObj);
    }, floorDate:function (date, unit, steps, reuse) {
        return timeUtil.floor(date, unit, steps, reuse, this.dateClassObj);
    }, isToday:function (date) {
        return timeUtil.isToday(date, this.dateClassObj);
    }, isStartOfDay:function (d) {
        return timeUtil.isStartOfDay(d, this.dateClassObj, this.dateModule);
    }, isOverlapping:function (renderData, start1, end1, start2, end2, includeLimits) {
        return timeUtil.isOverlapping(renderData, start1, end1, start2, end2, includeLimits);
    }, computeRangeOverlap:function (renderData, start1, end1, start2, end2, includeLimits) {
        var cal = renderData.dateModule;
        if (start1 == null || start2 == null || end1 == null || end2 == null) {
            return null;
        }
        var comp1 = cal.compare(start1, end2);
        var comp2 = cal.compare(start2, end1);
        if (includeLimits) {
            if (comp1 == 0 || comp1 == 1 || comp2 == 0 || comp2 == 1) {
                return null;
            }
        } else {
            if (comp1 == 1 || comp2 == 1) {
                return null;
            }
        }
        return [this.newDate(cal.compare(start1, start2) > 0 ? start1 : start2, renderData), this.newDate(cal.compare(end1, end2) > 0 ? end2 : end1, renderData)];
    }, isSameDay:function (date1, date2) {
        if (date1 == null || date2 == null) {
            return false;
        }
        return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
    }, computeProjectionOnDate:function (renderData, refDate, date, max) {
        var cal = renderData.dateModule;
        var minH = renderData.minHours;
        var maxH = renderData.maxHours;
        if (max <= 0 || cal.compare(date, refDate) == -1) {
            return 0;
        }
        var gt = function (d) {
            return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
        };
        var referenceDate = this.floorToDay(refDate, false, renderData);
        if (date.getDate() != referenceDate.getDate()) {
            if (date.getMonth() == referenceDate.getMonth()) {
                if (date.getDate() < referenceDate.getDate()) {
                    return 0;
                } else {
                    if (date.getDate() > referenceDate.getDate() && maxH < 24) {
                        return max;
                    }
                }
            } else {
                if (date.getFullYear() == referenceDate.getFullYear()) {
                    if (date.getMonth() < referenceDate.getMonth()) {
                        return 0;
                    } else {
                        if (date.getMonth() > referenceDate.getMonth()) {
                            return max;
                        }
                    }
                } else {
                    if (date.getFullYear() < referenceDate.getFullYear()) {
                        return 0;
                    } else {
                        if (date.getFullYear() > referenceDate.getFullYear()) {
                            return max;
                        }
                    }
                }
            }
        }
        var res;
        var ONE_DAY = 86400;
        if (this.isSameDay(refDate, date) || maxH > 24) {
            var d = lang.clone(refDate);
            var minTime = 0;
            if (minH != null && minH != 0) {
                d.setHours(minH);
                minTime = gt(d);
            }
            d = lang.clone(refDate);
            d.setHours(maxH);
            var maxTime;
            if (maxH == null || maxH == 24) {
                maxTime = ONE_DAY;
            } else {
                if (maxH > 24) {
                    maxTime = ONE_DAY + gt(d);
                } else {
                    maxTime = gt(d);
                }
            }
            var delta = 0;
            if (maxH > 24 && refDate.getDate() != date.getDate()) {
                delta = ONE_DAY + gt(date);
            } else {
                delta = gt(date);
            }
            if (delta < minTime) {
                return 0;
            }
            if (delta > maxTime) {
                return max;
            }
            delta -= minTime;
            res = (max * delta) / (maxTime - minTime);
        } else {
            if (date.getDate() < refDate.getDate() && date.getMonth() == refDate.getMonth()) {
                return 0;
            }
            var d2 = this.floorToDay(date);
            var dp1 = renderData.dateModule.add(refDate, "day", 1);
            dp1 = this.floorToDay(dp1, false, renderData);
            if (cal.compare(d2, refDate) == 1 && cal.compare(d2, dp1) == 0 || cal.compare(d2, dp1) == 1) {
                res = max;
            } else {
                res = 0;
            }
        }
        return res;
    }, getTime:function (e, x, y, touchIndex) {
        return null;
    }, getSubColumn:function (e, x, y, touchIndex) {
        return null;
    }, getSubColumnIndex:function (value) {
        if (this.subColumns) {
            for (var i = 0; i < this.subColumns.length; i++) {
                if (this.subColumns[i] == value) {
                    return i;
                }
            }
        }
        return -1;
    }, newDate:function (obj) {
        return timeUtil.newDate(obj, this.dateClassObj);
    }, _isItemInView:function (item) {
        var rd = this.renderData;
        var cal = rd.dateModule;
        if (cal.compare(item.startTime, rd.startTime) == -1) {
            return false;
        }
        return cal.compare(item.endTime, rd.endTime) != 1;
    }, _ensureItemInView:function (item) {
        var rd = this.renderData;
        var cal = rd.dateModule;
        var duration = Math.abs(cal.difference(item.startTime, item.endTime, "millisecond"));
        var fixed = false;
        if (cal.compare(item.startTime, rd.startTime) == -1) {
            item.startTime = rd.startTime;
            item.endTime = cal.add(item.startTime, "millisecond", duration);
            fixed = true;
        } else {
            if (cal.compare(item.endTime, rd.endTime) == 1) {
                item.endTime = rd.endTime;
                item.startTime = cal.add(item.endTime, "millisecond", -duration);
                fixed = true;
            }
        }
        return fixed;
    }, scrollable:true, autoScroll:true, _autoScroll:function (gx, gy, orientation) {
        return false;
    }, scrollMethod:"auto", _setScrollMethodAttr:function (value) {
        if (this.scrollMethod != value) {
            this.scrollMethod = value;
            if (this._domScroll !== undefined) {
                if (this._domScroll) {
                    domStyle.set(this.sheetContainer, this._cssPrefix + "transform", "translateY(0px)");
                } else {
                    this.scrollContainer.scrollTop = 0;
                }
            }
            delete this._domScroll;
            var pos = this._getScrollPosition();
            delete this._scrollPos;
            this._setScrollPosition(pos);
        }
    }, _startAutoScroll:function (step) {
        var sp = this._scrollProps;
        if (!sp) {
            sp = this._scrollProps = {};
        }
        sp.scrollStep = step;
        if (!sp.isScrolling) {
            sp.isScrolling = true;
            sp.scrollTimer = setInterval(lang.hitch(this, this._onScrollTimer_tick), 10);
        }
    }, _stopAutoScroll:function () {
        var sp = this._scrollProps;
        if (sp && sp.isScrolling) {
            clearInterval(sp.scrollTimer);
            sp.scrollTimer = null;
        }
        this._scrollProps = null;
    }, _onScrollTimer_tick:function (pos) {
    }, _scrollPos:0, _hscrollPos:0, getCSSPrefix:function () {
        if (has("ie")) {
            return "-ms-";
        }
        if (has("webkit")) {
            return "-webkit-";
        }
        if (has("mozilla")) {
            return "-moz-";
        }
        if (has("opera")) {
            return "-o-";
        }
        return "";
    }, _hScrollNodes:null, _setScrollPositionBase:function (pos, vertical) {
        if (vertical && this._scrollPos == pos || !vertical && this._hScrollPos == pos) {
            return;
        }
        if (this._domScroll === undefined) {
            var sm = this.get("scrollMethod");
            if (sm === "auto") {
                this._domScroll = !has("ios") && !has("android") && !has("webkit");
            } else {
                this._domScroll = sm === "dom";
            }
        }
        var max = 0;
        if (vertical) {
            var containerSize = domGeometry.getMarginBox(this.scrollContainer);
            var sheetSize = domGeometry.getMarginBox(this.sheetContainer);
            max = sheetSize.h - containerSize.h;
        } else {
            var gridSize = domGeometry.getMarginBox(this.grid);
            var gridTableSize = domGeometry.getMarginBox(this.gridTable);
            max = gridTableSize.w - gridSize.w;
        }
        if (pos < 0) {
            pos = 0;
        } else {
            if (pos > max) {
                pos = max;
            }
        }
        if (vertical) {
            this._scrollPos = pos;
        } else {
            this._hScrollPos = pos;
        }
        var rtl = !this.isLeftToRight();
        if (this._domScroll) {
            if (vertical) {
                this.scrollContainer.scrollTop = pos;
            } else {
                arr.forEach(this._hScrollNodes, function (elt) {
                    domStyle.set(elt, "left", ((rtl ? 1 : -1) * pos) + "px");
                }, this);
            }
        } else {
            if (!this._cssPrefix) {
                this._cssPrefix = this.getCSSPrefix();
            }
            var cssProp = this._cssPrefix + "transform";
            if (vertical) {
                domStyle.set(this.sheetContainer, cssProp, "translateY(-" + pos + "px)");
            } else {
                var css = "translateX(" + (rtl ? "" : "-") + pos + "px)";
                arr.forEach(this._hScrollNodes, function (elt) {
                    domStyle.set(elt, cssProp, css);
                }, this);
            }
        }
    }, _setScrollPosition:function (pos) {
        this._setScrollPositionBase(pos, true);
    }, _getScrollPosition:function () {
        return this._scrollPos;
    }, _setHScrollPosition:function (pos) {
        this._setScrollPositionBase(pos, false);
    }, _setHScrollPositionImpl:function (pos, useDom, cssProperty) {
        var css = useDom ? null : "translateX(-" + pos + "px)";
        arr.forEach(this._hScrollNodes, function (elt) {
            if (useDom) {
                elt.scrollLeft = pos;
                domStyle.set(elt, "left", (-pos) + "px");
            } else {
                domStyle.set(elt, cssProp, css);
            }
        }, this);
    }, _hScrollPos:0, _getHScrollPosition:function () {
        return this._hScrollPos;
    }, scrollView:function (dir) {
    }, ensureVisibility:function (start, end, margin, visibilityTarget, duration) {
    }, _getStoreAttr:function () {
        if (this.owner) {
            return this.owner.get("store");
        }
        return this.store;
    }, _setItemsAttr:function (value) {
        this._set("items", value);
        this.displayedItemsInvalidated = true;
    }, _refreshItemsRendering:function () {
        var rd = this.renderData;
        this._computeVisibleItems(rd);
        this._layoutRenderers(rd);
    }, _refreshDecorationItemsRendering:function () {
        var rd = this.renderData;
        this._computeVisibleItems(rd);
        this._layoutDecorationRenderers(rd);
    }, invalidateLayout:function () {
        this._layoutRenderers(this.renderData);
        this._layoutDecorationRenderers(this.renderData);
    }, _setDecorationItemsAttr:function (value) {
        this._set("decorationItems", value);
        this.displayedDecorationItemsInvalidated = true;
    }, _getDecorationStoreAttr:function () {
        if (this.owner) {
            return this.owner.get("decorationStore");
        }
        return this.decorationStore;
    }, _setDecorationStoreAttr:function (value) {
        this.decorationStore = value;
        this.decorationStoreManager.set("store", value);
    }, computeOverlapping:function (layoutItems, func) {
        if (layoutItems.length == 0) {
            return {numLanes:0, addedPassRes:[1]};
        }
        var lanes = [];
        for (var i = 0; i < layoutItems.length; i++) {
            var layoutItem = layoutItems[i];
            this._layoutPass1(layoutItem, lanes);
        }
        var addedPassRes = null;
        if (func) {
            addedPassRes = lang.hitch(this, func)(lanes);
        }
        return {numLanes:lanes.length, addedPassRes:addedPassRes};
    }, _layoutPass1:function (layoutItem, lanes) {
        var stop = true;
        for (var i = 0; i < lanes.length; i++) {
            var lane = lanes[i];
            stop = false;
            for (var j = 0; j < lane.length && !stop; j++) {
                if (lane[j].start < layoutItem.end && layoutItem.start < lane[j].end) {
                    stop = true;
                    lane[j].extent = 1;
                }
            }
            if (!stop) {
                layoutItem.lane = i;
                layoutItem.extent = -1;
                lane.push(layoutItem);
                return;
            }
        }
        lanes.push([layoutItem]);
        layoutItem.lane = lanes.length - 1;
        layoutItem.extent = -1;
    }, _layoutInterval:function (renderData, index, start, end, items) {
    }, layoutPriorityFunction:null, _sortItemsFunction:function (a, b) {
        var res = this.dateModule.compare(a.startTime, b.startTime);
        if (res == 0) {
            res = -1 * this.dateModule.compare(a.endTime, b.endTime);
        }
        return res;
    }, _layoutRenderers:function (renderData) {
        this._layoutRenderersImpl(renderData, this.rendererManager, renderData.items, "dataItems");
    }, _layoutDecorationRenderers:function (renderData) {
        this._layoutRenderersImpl(renderData, this.decorationRendererManager, renderData.decorationItems, "decorationItems");
    }, _layoutRenderersImpl:function (renderData, rendererManager, items, itemType) {
        if (!items) {
            return;
        }
        rendererManager.recycleItemRenderers();
        var cal = renderData.dateModule;
        var startDate = this.newDate(renderData.startTime);
        var startTime = lang.clone(startDate);
        var endDate;
        var items = items.concat();
        var itemsTemp = [], events;
        var processing = {};
        var index = 0;
        while (cal.compare(startDate, renderData.endTime) == -1 && items.length > 0) {
            endDate = this.addAndFloor(startDate, this._layoutUnit, this._layoutStep);
            var endTime = lang.clone(endDate);
            if (renderData.minHours) {
                startTime.setHours(renderData.minHours);
            }
            if (renderData.maxHours != undefined && renderData.maxHours != 24) {
                if (renderData.maxHours < 24) {
                    endTime = cal.add(endDate, "day", -1);
                }
                endTime = this.floorToDay(endTime, true, renderData);
                endTime.setHours(renderData.maxHours - (renderData.maxHours < 24 ? 0 : 24));
            }
            events = arr.filter(items, function (item) {
                var r = this.isOverlapping(renderData, item.startTime, item.endTime, startTime, endTime);
                if (r) {
                    processing[item.id] = true;
                    itemsTemp.push(item);
                } else {
                    if (processing[item.id]) {
                        delete processing[item.id];
                    } else {
                        itemsTemp.push(item);
                    }
                }
                return r;
            }, this);
            items = itemsTemp;
            itemsTemp = [];
            if (events.length > 0) {
                events.sort(lang.hitch(this, this.layoutPriorityFunction ? this.layoutPriorityFunction : this._sortItemsFunction));
                this._layoutInterval(renderData, index, startTime, endTime, events, itemType);
            }
            startDate = endDate;
            startTime = lang.clone(startDate);
            index++;
        }
        this._onRenderersLayoutDone(this);
    }, _recycleItemRenderers:function (remove) {
        this.rendererManager.recycleItemRenderers(remove);
    }, getRenderers:function (item) {
        return this.rendererManager.getRenderers(item);
    }, itemToRendererKindFunc:null, _itemToRendererKind:function (item) {
        if (this.itemToRendererKindFunc) {
            return this.itemToRendererKindFunc(item);
        }
        return this._defaultItemToRendererKindFunc(item);
    }, _defaultItemToRendererKindFunc:function (item) {
        return null;
    }, _createRenderer:function (item, kind, rendererClass, cssClass) {
        return this.rendererManager.createRenderer(item, kind, rendererClass, cssClass);
    }, _onRendererCreated:function (e) {
        if (e.source == this) {
            this.onRendererCreated(e);
        }
        if (this.owner != null) {
            this.owner._onRendererCreated(e);
        }
    }, onRendererCreated:function (e) {
    }, _onRendererRecycled:function (e) {
        if (e.source == this) {
            this.onRendererRecycled(e);
        }
        if (this.owner != null) {
            this.owner._onRendererRecycled(e);
        }
    }, onRendererRecycled:function (e) {
    }, _onRendererReused:function (e) {
        if (e.source == this) {
            this.onRendererReused(e);
        }
        if (this.owner != null) {
            this.owner._onRendererReused(e);
        }
    }, onRendererReused:function (e) {
    }, _onRendererDestroyed:function (e) {
        if (e.source == this) {
            this.onRendererDestroyed(e);
        }
        if (this.owner != null) {
            this.owner._onRendererDestroyed(e);
        }
    }, onRendererDestroyed:function (e) {
    }, _onRenderersLayoutDone:function (view) {
        this.onRenderersLayoutDone(view);
        if (this.owner != null) {
            this.owner._onRenderersLayoutDone(view);
        }
    }, onRenderersLayoutDone:function (view) {
    }, _recycleRenderer:function (renderer, remove) {
        this.rendererManager.recycleRenderer(renderer, remove);
    }, _destroyRenderer:function (renderer) {
        this.rendererManager.destroyRenderer(renderer);
    }, _destroyRenderersByKind:function (kind) {
        this.rendererManager.destroyRenderersByKind(kind);
    }, _updateEditingCapabilities:function (item, renderer) {
        var moveEnabled = this.isItemMoveEnabled(item, renderer.rendererKind);
        var resizeEnabled = this.isItemResizeEnabled(item, renderer.rendererKind);
        var changed = false;
        if (moveEnabled != renderer.get("moveEnabled")) {
            renderer.set("moveEnabled", moveEnabled);
            changed = true;
        }
        if (resizeEnabled != renderer.get("resizeEnabled")) {
            renderer.set("resizeEnabled", resizeEnabled);
            changed = true;
        }
        if (changed) {
            renderer.updateRendering();
        }
    }, updateRenderers:function (obj, stateOnly) {
        if (obj == null) {
            return;
        }
        var items = lang.isArray(obj) ? obj : [obj];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item == null || item.id == null) {
                continue;
            }
            var list = this.rendererManager.itemToRenderer[item.id];
            if (list == null) {
                continue;
            }
            var selected = this.isItemSelected(item);
            var hovered = this.isItemHovered(item);
            var edited = this.isItemBeingEdited(item);
            var focused = this.showFocus ? this.isItemFocused(item) : false;
            for (var j = 0; j < list.length; j++) {
                var renderer = list[j].renderer;
                renderer.set("hovered", hovered);
                renderer.set("selected", selected);
                renderer.set("edited", edited);
                renderer.set("focused", focused);
                renderer.set("storeState", this.getItemStoreState(item));
                this.applyRendererZIndex(item, list[j], hovered, selected, edited, focused);
                if (!stateOnly) {
                    renderer.set("item", item);
                    if (renderer.updateRendering) {
                        renderer.updateRendering();
                    }
                }
            }
        }
    }, applyRendererZIndex:function (item, renderer, hovered, selected, edited, focused) {
        domStyle.set(renderer.container, {"zIndex":edited || selected ? 20 : item.lane == undefined ? 0 : item.lane});
    }, getIdentity:function (item) {
        return this.owner ? this.owner.getIdentity(item) : item.id;
    }, _setHoveredItem:function (item, renderer) {
        if (this.owner) {
            this.owner._setHoveredItem(item, renderer);
            return;
        }
        if (this.hoveredItem && item && this.hoveredItem.id != item.id || item == null || this.hoveredItem == null) {
            var old = this.hoveredItem;
            this.hoveredItem = item;
            this.updateRenderers([old, this.hoveredItem], true);
            if (item && renderer) {
                this._updateEditingCapabilities(item._item ? item._item : item, renderer);
            }
        }
    }, hoveredItem:null, isItemHovered:function (item) {
        if (this._isEditing && this._edProps) {
            return item.id == this._edProps.editedItem.id;
        }
        return this.owner ? this.owner.isItemHovered(item) : this.hoveredItem != null && this.hoveredItem.id == item.id;
    }, isItemFocused:function (item) {
        return this._isItemFocused ? this._isItemFocused(item) : false;
    }, _setSelectionModeAttr:function (value) {
        if (this.owner) {
            this.owner.set("selectionMode", value);
        } else {
            this.inherited(arguments);
        }
    }, _getSelectionModeAttr:function (value) {
        if (this.owner) {
            return this.owner.get("selectionMode");
        }
        return this.inherited(arguments);
    }, _setSelectedItemAttr:function (value) {
        if (this.owner) {
            this.owner.set("selectedItem", value);
        } else {
            this.inherited(arguments);
        }
    }, _getSelectedItemAttr:function (value) {
        if (this.owner) {
            return this.owner.get("selectedItem");
        }
        return this.selectedItem;
    }, _setSelectedItemsAttr:function (value) {
        if (this.owner) {
            this.owner.set("selectedItems", value);
        } else {
            this.inherited(arguments);
        }
    }, _getSelectedItemsAttr:function () {
        if (this.owner) {
            return this.owner.get("selectedItems");
        }
        return this.inherited(arguments);
    }, isItemSelected:function (item) {
        if (this.owner) {
            return this.owner.isItemSelected(item);
        }
        return this.inherited(arguments);
    }, selectFromEvent:function (e, item, renderer, dispatch) {
        if (this.owner) {
            this.owner.selectFromEvent(e, item, renderer, dispatch);
        } else {
            this.inherited(arguments);
        }
    }, setItemSelected:function (item, value) {
        if (this.owner) {
            this.owner.setItemSelected(item, value);
        } else {
            this.inherited(arguments);
        }
    }, createItemFunc:null, _getCreateItemFuncAttr:function () {
        if (this.owner) {
            return this.owner.get("createItemFunc");
        }
        return this.createItemFunc;
    }, createOnGridClick:false, _getCreateOnGridClickAttr:function () {
        if (this.owner) {
            return this.owner.get("createOnGridClick");
        }
        return this.createOnGridClick;
    }, _gridMouseDown:false, _tempIdCount:0, _tempItemsMap:null, _onGridMouseDown:function (e) {
        this._gridMouseDown = true;
        this.showFocus = false;
        if (this._isEditing) {
            this._endItemEditing("mouse", false);
        }
        this._doEndItemEditing(this.owner, "mouse");
        this.set("focusedItem", null);
        this.selectFromEvent(e, null, null, true);
        if (this._setTabIndexAttr) {
            this[this._setTabIndexAttr].focus();
        }
        if (this._onRendererHandleMouseDown) {
            var f = this.get("createItemFunc");
            if (!f) {
                return;
            }
            var newItem = this._createdEvent = f(this, this.getTime(e), e, this.getSubColumn(e));
            var store = this.get("store");
            if (!newItem || store == null) {
                return;
            }
            if (store.getIdentity(newItem) == undefined) {
                var id = "_tempId_" + (this._tempIdCount++);
                newItem[store.idProperty] = id;
                if (this._tempItemsMap == null) {
                    this._tempItemsMap = {};
                }
                this._tempItemsMap[id] = true;
            }
            var newRenderItem = this.itemToRenderItem(newItem, store);
            newRenderItem._item = newItem;
            this._setItemStoreState(newItem, "unstored");
            var owner = this._getTopOwner();
            var items = owner.get("items");
            owner.set("items", items ? items.concat([newRenderItem]) : [newRenderItem]);
            this._refreshItemsRendering();
            var renderers = this.getRenderers(newItem);
            if (renderers && renderers.length > 0) {
                var renderer = renderers[0];
                if (renderer) {
                    this._onRendererHandleMouseDown(e, renderer.renderer, "resizeEnd");
                    this._startItemEditing(newRenderItem, "mouse");
                }
            }
        }
    }, _onGridMouseMove:function (e) {
    }, _onGridMouseUp:function (e) {
    }, _onGridTouchStart:function (e) {
        var p = this._edProps;
        this._gridProps = {event:e, fromItem:this.isAscendantHasClass(e.target, this.eventContainer, "dojoxCalendarEvent")};
        if (this._isEditing) {
            if (this._gridProps) {
                this._gridProps.editingOnStart = true;
            }
            lang.mixin(p, this._getTouchesOnRenderers(e, p.editedItem));
            if (p.touchesLen == 0) {
                if (p && p.endEditingTimer) {
                    clearTimeout(p.endEditingTimer);
                    p.endEditingTimer = null;
                }
                this._endItemEditing("touch", false);
            }
        }
        this._doEndItemEditing(this.owner, "touch");
        event.stop(e);
    }, _doEndItemEditing:function (obj, eventSource) {
        if (obj && obj._isEditing) {
            var p = obj._edProps;
            if (p && p.endEditingTimer) {
                clearTimeout(p.endEditingTimer);
                p.endEditingTimer = null;
            }
            obj._endItemEditing(eventSource, false);
        }
    }, _onGridTouchEnd:function (e) {
    }, _onGridTouchMove:function (e) {
    }, __fixEvt:function (e) {
        return e;
    }, _dispatchCalendarEvt:function (e, name) {
        e = this.__fixEvt(e);
        this[name](e);
        if (this.owner) {
            this.owner[name](e);
        }
        return e;
    }, _onGridClick:function (e) {
        if (!e.triggerEvent) {
            e = {date:this.getTime(e), triggerEvent:e};
        }
        this._dispatchCalendarEvt(e, "onGridClick");
    }, onGridClick:function (e) {
    }, _onGridDoubleClick:function (e) {
        if (!e.triggerEvent) {
            e = {date:this.getTime(e), triggerEvent:e};
        }
        this._dispatchCalendarEvt(e, "onGridDoubleClick");
    }, onGridDoubleClick:function (e) {
    }, _onItemClick:function (e) {
        this._dispatchCalendarEvt(e, "onItemClick");
    }, onItemClick:function (e) {
    }, _onItemDoubleClick:function (e) {
        this._dispatchCalendarEvt(e, "onItemDoubleClick");
    }, onItemDoubleClick:function (e) {
    }, _onItemContextMenu:function (e) {
        this._dispatchCalendarEvt(e, "onItemContextMenu");
    }, onItemContextMenu:function (e) {
    }, _getStartEndRenderers:function (item) {
        var list = this.rendererManager.itemToRenderer[item.id];
        if (list == null) {
            return null;
        }
        if (list.length == 1) {
            var node = list[0].renderer;
            return [node, node];
        }
        var rd = this.renderData;
        var resizeStartFound = false;
        var resizeEndFound = false;
        var res = [];
        for (var i = 0; i < list.length; i++) {
            var ir = list[i].renderer;
            if (!resizeStartFound) {
                resizeStartFound = rd.dateModule.compare(ir.item.range[0], ir.item.startTime) == 0;
                res[0] = ir;
            }
            if (!resizeEndFound) {
                resizeEndFound = rd.dateModule.compare(ir.item.range[1], ir.item.endTime) == 0;
                res[1] = ir;
            }
            if (resizeStartFound && resizeEndFound) {
                break;
            }
        }
        return res;
    }, editable:true, moveEnabled:true, resizeEnabled:true, isItemEditable:function (item, rendererKind) {
        return this.getItemStoreState(item) != "storing" && this.editable && (this.owner ? this.owner.isItemEditable(item, rendererKind) : true);
    }, isItemMoveEnabled:function (item, rendererKind) {
        return this.isItemEditable(item, rendererKind) && this.moveEnabled && (this.owner ? this.owner.isItemMoveEnabled(item, rendererKind) : true);
    }, isItemResizeEnabled:function (item, rendererKind) {
        return this.isItemEditable(item, rendererKind) && this.resizeEnabled && (this.owner ? this.owner.isItemResizeEnabled(item, rendererKind) : true);
    }, _isEditing:false, isItemBeingEdited:function (item) {
        return this._isEditing && this._edProps && this._edProps.editedItem && this._edProps.editedItem.id == item.id;
    }, _setEditingProperties:function (props) {
        this._edProps = props;
    }, _startItemEditing:function (item, eventSource) {
        this._isEditing = true;
        this._getTopOwner()._isEditing = true;
        var p = this._edProps;
        p.editedItem = item;
        p.storeItem = item._item;
        p.eventSource = eventSource;
        p.secItem = this._secondarySheet ? this._findRenderItem(item.id, this._secondarySheet.renderData.items) : null;
        p.ownerItem = this.owner ? this._findRenderItem(item.id, this.items) : null;
        if (!p.liveLayout) {
            p.editSaveStartTime = item.startTime;
            p.editSaveEndTime = item.endTime;
            p.editItemToRenderer = this.rendererManager.itemToRenderer;
            p.editItems = this.renderData.items;
            p.editRendererList = this.rendererManager.rendererList;
            this.renderData.items = [p.editedItem];
            var id = p.editedItem.id;
            this.rendererManager.itemToRenderer = {};
            this.rendererManager.rendererList = [];
            var list = p.editItemToRenderer[id];
            p.editRendererIndices = [];
            arr.forEach(list, lang.hitch(this, function (ir, i) {
                if (this.rendererManager.itemToRenderer[id] == null) {
                    this.rendererManager.itemToRenderer[id] = [ir];
                } else {
                    this.rendererManager.itemToRenderer[id].push(ir);
                }
                this.rendererManager.rendererList.push(ir);
            }));
            p.editRendererList = arr.filter(p.editRendererList, function (ir) {
                return ir != null && ir.renderer.item.id != id;
            });
            delete p.editItemToRenderer[id];
        }
        this._layoutRenderers(this.renderData);
        this._onItemEditBegin({item:item, storeItem:p.storeItem, eventSource:eventSource});
    }, _onItemEditBegin:function (e) {
        this._editStartTimeSave = this.newDate(e.item.startTime);
        this._editEndTimeSave = this.newDate(e.item.endTime);
        this._dispatchCalendarEvt(e, "onItemEditBegin");
    }, onItemEditBegin:function (e) {
    }, _endItemEditing:function (eventSource, canceled) {
        if (this._editingGesture) {
            this._endItemEditingGesture(eventSource);
        }
        this._isEditing = false;
        this._getTopOwner()._isEditing = false;
        var p = this._edProps;
        arr.forEach(p.handles, function (handle) {
            handle.remove();
        });
        if (!p.liveLayout) {
            this.renderData.items = p.editItems;
            this.rendererManager.rendererList = p.editRendererList.concat(this.rendererManager.rendererList);
            lang.mixin(this.rendererManager.itemToRenderer, p.editItemToRenderer);
        }
        this._onItemEditEnd(lang.mixin(this._createItemEditEvent(), {item:p.editedItem, storeItem:p.storeItem, eventSource:eventSource, completed:!canceled}));
        this._layoutRenderers(this.renderData);
        this._edProps = null;
    }, _onItemEditEnd:function (e) {
        this._dispatchCalendarEvt(e, "onItemEditEnd");
        if (!e.isDefaultPrevented()) {
            var store = this.get("store");
            var storeItem = this.renderItemToItem(e.item, store);
            var s = this._getItemStoreStateObj(e.item);
            if (s != null && s.state == "unstored") {
                if (e.completed) {
                    storeItem = lang.mixin(s.item, storeItem);
                    this._setItemStoreState(storeItem, "storing");
                    var oldID = store.getIdentity(storeItem);
                    var options = null;
                    if (this._tempItemsMap && this._tempItemsMap[oldID]) {
                        options = {temporaryId:oldID};
                        delete this._tempItemsMap[oldID];
                        delete storeItem[store.idProperty];
                    }
                    when(store.add(storeItem, options), lang.hitch(this, function (res) {
                        var id;
                        if (lang.isObject(res)) {
                            id = store.getIdentity(res);
                        } else {
                            id = res;
                        }
                        if (id != oldID) {
                            this._removeRenderItem(oldID);
                        }
                    }));
                } else {
                    this._removeRenderItem(s.id);
                }
            } else {
                if (e.completed) {
                    this._setItemStoreState(storeItem, "storing");
                    store.put(storeItem);
                } else {
                    e.item.startTime = this._editStartTimeSave;
                    e.item.endTime = this._editEndTimeSave;
                }
            }
        }
    }, _removeRenderItem:function (id) {
        var owner = this._getTopOwner();
        var items = owner.get("items");
        var l = items.length;
        var found = false;
        for (var i = l - 1; i >= 0; i--) {
            if (items[i].id == id) {
                items.splice(i, 1);
                found = true;
                break;
            }
        }
        this._cleanItemStoreState(id);
        if (found) {
            owner.set("items", items);
            this.invalidateLayout();
        }
    }, onItemEditEnd:function (e) {
    }, _createItemEditEvent:function () {
        var e = {cancelable:true, bubbles:false, __defaultPrevent:false};
        e.preventDefault = function () {
            this.__defaultPrevented = true;
        };
        e.isDefaultPrevented = function () {
            return this.__defaultPrevented;
        };
        return e;
    }, _startItemEditingGesture:function (dates, editKind, eventSource, e) {
        var p = this._edProps;
        if (!p || p.editedItem == null) {
            return;
        }
        this._editingGesture = true;
        var item = p.editedItem;
        p.editKind = editKind;
        this._onItemEditBeginGesture(this.__fixEvt(lang.mixin(this._createItemEditEvent(), {item:item, storeItem:p.storeItem, startTime:item.startTime, endTime:item.endTime, editKind:editKind, rendererKind:p.rendererKind, triggerEvent:e, dates:dates, eventSource:eventSource})));
        p.itemBeginDispatched = true;
    }, _onItemEditBeginGesture:function (e) {
        var p = this._edProps;
        var item = p.editedItem;
        var dates = e.dates;
        p.editingTimeFrom = [];
        p.editingTimeFrom[0] = dates[0];
        p.editingItemRefTime = [];
        p.editingItemRefTime[0] = this.newDate(p.editKind == "resizeEnd" ? item.endTime : item.startTime);
        if (p.editKind == "resizeBoth") {
            p.editingTimeFrom[1] = dates[1];
            p.editingItemRefTime[1] = this.newDate(item.endTime);
        }
        var cal = this.renderData.dateModule;
        p.inViewOnce = this._isItemInView(item);
        if (p.rendererKind == "label" || this.roundToDay) {
            p._itemEditBeginSave = this.newDate(item.startTime);
            p._itemEditEndSave = this.newDate(item.endTime);
        }
        p._initDuration = cal.difference(item.startTime, item.endTime, item.allDay ? "day" : "millisecond");
        this._dispatchCalendarEvt(e, "onItemEditBeginGesture");
        if (!e.isDefaultPrevented()) {
            if (e.eventSource == "mouse") {
                var cursor = e.editKind == "move" ? "move" : this.resizeCursor;
                p.editLayer = domConstruct.create("div", {style:"position: absolute; left:0; right:0; bottom:0; top:0; z-index:30; tabIndex:-1; background-image:url('" + this._blankGif + "'); cursor: " + cursor, onresizestart:function (e) {
                    return false;
                }, onselectstart:function (e) {
                    return false;
                }}, this.domNode);
                p.editLayer.focus();
            }
        }
    }, onItemEditBeginGesture:function (e) {
    }, _waDojoxAddIssue:function (d, unit, steps) {
        var cal = this.renderData.dateModule;
        if (this._calendar != "gregorian" && steps < 0) {
            var gd = d.toGregorian();
            gd = date.add(gd, unit, steps);
            return new this.renderData.dateClassObj(gd);
        } else {
            return cal.add(d, unit, steps);
        }
    }, _computeItemEditingTimes:function (item, editKind, rendererKind, times, eventSource) {
        var cal = this.renderData.dateModule;
        var p = this._edProps;
        if (editKind == "move") {
            var diff = cal.difference(p.editingTimeFrom[0], times[0], "millisecond");
            times[0] = this._waDojoxAddIssue(p.editingItemRefTime[0], "millisecond", diff);
        }
        return times;
    }, _moveOrResizeItemGesture:function (dates, eventSource, e, subColumn) {
        if (!this._isEditing || dates[0] == null) {
            return;
        }
        var p = this._edProps;
        var item = p.editedItem;
        var rd = this.renderData;
        var cal = rd.dateModule;
        var editKind = p.editKind;
        var newTimes = [dates[0]];
        if (editKind == "resizeBoth") {
            newTimes[1] = dates[1];
        }
        newTimes = this._computeItemEditingTimes(item, p.editKind, p.rendererKind, newTimes, eventSource);
        var newTime = newTimes[0];
        var moveOrResizeDone = false;
        var oldStart = lang.clone(item.startTime);
        var oldEnd = lang.clone(item.endTime);
        var oldSubColumn = item.subColumn;
        var allowSwap = p.eventSource == "keyboard" ? false : this.allowStartEndSwap;
        if (editKind == "move") {
            if (subColumn != null && item.subColumn != subColumn && this.allowSubColumnMove) {
                item.subColumn = subColumn;
                var store = this.get("store");
                var storeItem = this.renderItemToItem(item, store);
                lang.mixin(item, this.itemToRenderItem(storeItem, store));
                moveOrResizeDone = true;
            }
            if (cal.compare(item.startTime, newTime) != 0) {
                var duration = cal.difference(item.startTime, item.endTime, "millisecond");
                item.startTime = this.newDate(newTime);
                item.endTime = cal.add(item.startTime, "millisecond", duration);
                moveOrResizeDone = true;
            }
        } else {
            if (editKind == "resizeStart") {
                if (cal.compare(item.startTime, newTime) != 0) {
                    if (cal.compare(item.endTime, newTime) != -1) {
                        item.startTime = this.newDate(newTime);
                    } else {
                        if (allowSwap) {
                            item.startTime = this.newDate(item.endTime);
                            item.endTime = this.newDate(newTime);
                            p.editKind = editKind = "resizeEnd";
                            if (eventSource == "touch") {
                                p.resizeEndTouchIndex = p.resizeStartTouchIndex;
                                p.resizeStartTouchIndex = -1;
                            }
                        } else {
                            item.startTime = this.newDate(item.endTime);
                            item.startTime.setHours(newTime.getHours());
                            item.startTime.setMinutes(newTime.getMinutes());
                            item.startTime.setSeconds(newTime.getSeconds());
                        }
                    }
                    moveOrResizeDone = true;
                }
            } else {
                if (editKind == "resizeEnd") {
                    if (cal.compare(item.endTime, newTime) != 0) {
                        if (cal.compare(item.startTime, newTime) != 1) {
                            item.endTime = this.newDate(newTime);
                        } else {
                            if (allowSwap) {
                                item.endTime = this.newDate(item.startTime);
                                item.startTime = this.newDate(newTime);
                                p.editKind = editKind = "resizeStart";
                                if (eventSource == "touch") {
                                    p.resizeStartTouchIndex = p.resizeEndTouchIndex;
                                    p.resizeEndTouchIndex = -1;
                                }
                            } else {
                                item.endTime = this.newDate(item.startTime);
                                item.endTime.setHours(newTime.getHours());
                                item.endTime.setMinutes(newTime.getMinutes());
                                item.endTime.setSeconds(newTime.getSeconds());
                            }
                        }
                        moveOrResizeDone = true;
                    }
                } else {
                    if (editKind == "resizeBoth") {
                        moveOrResizeDone = true;
                        var start = this.newDate(newTime);
                        var end = this.newDate(newTimes[1]);
                        if (cal.compare(start, end) != -1) {
                            if (allowSwap) {
                                var t = start;
                                start = end;
                                end = t;
                            } else {
                                moveOrResizeDone = false;
                            }
                        }
                        if (moveOrResizeDone) {
                            item.startTime = start;
                            item.endTime = end;
                        }
                    } else {
                        return false;
                    }
                }
            }
        }
        if (!moveOrResizeDone) {
            return false;
        }
        var evt = lang.mixin(this._createItemEditEvent(), {item:item, storeItem:p.storeItem, startTime:item.startTime, endTime:item.endTime, editKind:editKind, rendererKind:p.rendererKind, triggerEvent:e, eventSource:eventSource});
        if (editKind == "move") {
            this._onItemEditMoveGesture(evt);
        } else {
            this._onItemEditResizeGesture(evt);
        }
        if (cal.compare(item.startTime, item.endTime) == 1) {
            var tmp = item.startTime;
            item.startTime = item.endTime;
            item.endTime = tmp;
        }
        moveOrResizeDone = oldSubColumn != item.subColumn || cal.compare(oldStart, item.startTime) != 0 || cal.compare(oldEnd, item.endTime) != 0;
        if (!moveOrResizeDone) {
            return false;
        }
        this._layoutRenderers(this.renderData);
        if (p.liveLayout && p.secItem != null) {
            p.secItem.startTime = item.startTime;
            p.secItem.endTime = item.endTime;
            this._secondarySheet._layoutRenderers(this._secondarySheet.renderData);
        } else {
            if (p.ownerItem != null && this.owner.liveLayout) {
                p.ownerItem.startTime = item.startTime;
                p.ownerItem.endTime = item.endTime;
                this.owner._layoutRenderers(this.owner.renderData);
            }
        }
        return true;
    }, _findRenderItem:function (id, list) {
        list = list || this.renderData.items;
        for (var i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return list[i];
            }
        }
        return null;
    }, _onItemEditMoveGesture:function (e) {
        this._dispatchCalendarEvt(e, "onItemEditMoveGesture");
        if (!e.isDefaultPrevented()) {
            var p = e.source._edProps;
            var rd = this.renderData;
            var cal = rd.dateModule;
            var newStartTime, newEndTime;
            if (p.rendererKind == "label" || (this.roundToDay && !e.item.allDay)) {
                newStartTime = this.floorToDay(e.item.startTime, false, rd);
                newStartTime.setHours(p._itemEditBeginSave.getHours());
                newStartTime.setMinutes(p._itemEditBeginSave.getMinutes());
                newEndTime = cal.add(newStartTime, "millisecond", p._initDuration);
            } else {
                if (e.item.allDay) {
                    newStartTime = this.floorToDay(e.item.startTime, true);
                    newEndTime = cal.add(newStartTime, "day", p._initDuration);
                } else {
                    newStartTime = this.floorDate(e.item.startTime, this.snapUnit, this.snapSteps);
                    newEndTime = cal.add(newStartTime, "millisecond", p._initDuration);
                }
            }
            e.item.startTime = newStartTime;
            e.item.endTime = newEndTime;
            if (!p.inViewOnce) {
                p.inViewOnce = this._isItemInView(e.item);
            }
            if (p.inViewOnce && this.stayInView) {
                this._ensureItemInView(e.item);
            }
        }
    }, _DAY_IN_MILLISECONDS:24 * 60 * 60 * 1000, onItemEditMoveGesture:function (e) {
    }, _onItemEditResizeGesture:function (e) {
        this._dispatchCalendarEvt(e, "onItemEditResizeGesture");
        if (!e.isDefaultPrevented()) {
            var p = e.source._edProps;
            var rd = this.renderData;
            var cal = rd.dateModule;
            var newStartTime = e.item.startTime;
            var newEndTime = e.item.endTime;
            if (e.editKind == "resizeStart") {
                if (e.item.allDay) {
                    newStartTime = this.floorToDay(e.item.startTime, false, this.renderData);
                } else {
                    if (this.roundToDay) {
                        newStartTime = this.floorToDay(e.item.startTime, false, rd);
                        newStartTime.setHours(p._itemEditBeginSave.getHours());
                        newStartTime.setMinutes(p._itemEditBeginSave.getMinutes());
                    } else {
                        newStartTime = this.floorDate(e.item.startTime, this.snapUnit, this.snapSteps);
                    }
                }
            } else {
                if (e.editKind == "resizeEnd") {
                    if (e.item.allDay) {
                        if (!this.isStartOfDay(e.item.endTime)) {
                            newEndTime = this.floorToDay(e.item.endTime, false, this.renderData);
                            newEndTime = cal.add(newEndTime, "day", 1);
                        }
                    } else {
                        if (this.roundToDay) {
                            newEndTime = this.floorToDay(e.item.endTime, false, rd);
                            newEndTime.setHours(p._itemEditEndSave.getHours());
                            newEndTime.setMinutes(p._itemEditEndSave.getMinutes());
                        } else {
                            newEndTime = this.floorDate(e.item.endTime, this.snapUnit, this.snapSteps);
                            if (e.eventSource == "mouse") {
                                newEndTime = cal.add(newEndTime, this.snapUnit, this.snapSteps);
                            }
                        }
                    }
                } else {
                    newStartTime = this.floorDate(e.item.startTime, this.snapUnit, this.snapSteps);
                    newEndTime = this.floorDate(e.item.endTime, this.snapUnit, this.snapSteps);
                    newEndTime = cal.add(newEndTime, this.snapUnit, this.snapSteps);
                }
            }
            e.item.startTime = newStartTime;
            e.item.endTime = newEndTime;
            var minimalDay = e.item.allDay || p._initDuration >= this._DAY_IN_MILLISECONDS && !this.allowResizeLessThan24H;
            this.ensureMinimalDuration(this.renderData, e.item, minimalDay ? "day" : this.minDurationUnit, minimalDay ? 1 : this.minDurationSteps, e.editKind);
            if (!p.inViewOnce) {
                p.inViewOnce = this._isItemInView(e.item);
            }
            if (p.inViewOnce && this.stayInView) {
                this._ensureItemInView(e.item);
            }
        }
    }, onItemEditResizeGesture:function (e) {
    }, _endItemEditingGesture:function (eventSource, e) {
        if (!this._isEditing) {
            return;
        }
        this._editingGesture = false;
        var p = this._edProps;
        var item = p.editedItem;
        p.itemBeginDispatched = false;
        this._onItemEditEndGesture(lang.mixin(this._createItemEditEvent(), {item:item, storeItem:p.storeItem, startTime:item.startTime, endTime:item.endTime, editKind:p.editKind, rendererKind:p.rendererKind, triggerEvent:e, eventSource:eventSource}));
    }, _onItemEditEndGesture:function (e) {
        var p = this._edProps;
        delete p._itemEditBeginSave;
        delete p._itemEditEndSave;
        this._dispatchCalendarEvt(e, "onItemEditEndGesture");
        if (!e.isDefaultPrevented()) {
            if (p.editLayer) {
                if (has("ie")) {
                    p.editLayer.style.cursor = "default";
                }
                setTimeout(lang.hitch(this, function () {
                    if (this.domNode) {
                        this.domNode.focus();
                        p.editLayer.parentNode.removeChild(p.editLayer);
                        p.editLayer = null;
                    }
                }), 10);
            }
        }
    }, onItemEditEndGesture:function (e) {
    }, ensureMinimalDuration:function (renderData, item, unit, steps, editKind) {
        var minTime;
        var cal = renderData.dateModule;
        if (editKind == "resizeStart") {
            minTime = cal.add(item.endTime, unit, -steps);
            if (cal.compare(item.startTime, minTime) == 1) {
                item.startTime = minTime;
            }
        } else {
            minTime = cal.add(item.startTime, unit, steps);
            if (cal.compare(item.endTime, minTime) == -1) {
                item.endTime = minTime;
            }
        }
    }, doubleTapDelay:300, snapUnit:"minute", snapSteps:15, minDurationUnit:"hour", minDurationSteps:1, liveLayout:false, stayInView:true, allowStartEndSwap:true, allowResizeLessThan24H:false, allowSubColumnMove:true});
});

