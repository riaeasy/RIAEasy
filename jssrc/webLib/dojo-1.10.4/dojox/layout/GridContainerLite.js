//>>built

require({cache:{"url:dojox/layout/resources/GridContainer.html":"<div id=\"${id}\" class=\"gridContainer\" dojoAttachPoint=\"containerNode\" tabIndex=\"0\" dojoAttachEvent=\"onkeypress:_selectFocus\">\n\t<div dojoAttachPoint=\"gridContainerDiv\">\n\t\t<table class=\"gridContainerTable\" dojoAttachPoint=\"gridContainerTable\" cellspacing=\"0\" cellpadding=\"0\">\n\t\t\t<tbody>\n\t\t\t\t<tr dojoAttachPoint=\"gridNode\" >\n\t\t\t\t\t\n\t\t\t\t</tr>\n\t\t\t</tbody>\n\t\t</table>\n\t</div>\n</div>"}});
define("dojox/layout/GridContainerLite", ["dojo/_base/kernel", "dojo/text!./resources/GridContainer.html", "dojo/_base/declare", "dojo/query", "dojo/_base/sniff", "dojo/dom-class", "dojo/dom-style", "dojo/dom-geometry", "dojo/dom-construct", "dojo/dom-attr", "dojo/_base/array", "dojo/_base/lang", "dojo/_base/event", "dojo/keys", "dojo/topic", "dijit/registry", "dijit/focus", "dijit/_base/focus", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/layout/_LayoutWidget", "dojo/_base/NodeList", "dojox/mdnd/AreaManager", "dojox/mdnd/DropIndicator", "dojox/mdnd/dropMode/OverDropMode", "dojox/mdnd/AutoScroll"], function (dojo, template, declare, query, has, domClass, domStyle, geom, domConstruct, domAttr, array, lang, events, keys, topic, registry, focus, baseFocus, _WidgetBase, _TemplatedMixin, _LayoutWidget, NodeList) {
    var gcl = declare("dojox.layout.GridContainerLite", [_LayoutWidget, _TemplatedMixin], {autoRefresh:true, templateString:template, dragHandleClass:"dojoxDragHandle", nbZones:1, doLayout:true, isAutoOrganized:true, acceptTypes:[], colWidths:"", constructor:function (props, node) {
        this.acceptTypes = (props || {}).acceptTypes || ["text"];
        this._disabled = true;
    }, postCreate:function () {
        this.inherited(arguments);
        this._grid = [];
        this._createCells();
        this.subscribe("/dojox/mdnd/drop", "resizeChildAfterDrop");
        this.subscribe("/dojox/mdnd/drag/start", "resizeChildAfterDragStart");
        this._dragManager = dojox.mdnd.areaManager();
        this._dragManager.autoRefresh = this.autoRefresh;
        this._dragManager.dragHandleClass = this.dragHandleClass;
        if (this.doLayout) {
            this._border = {h:has("ie") ? geom.getBorderExtents(this.gridContainerTable).h : 0, w:(has("ie") == 6) ? 1 : 0};
        } else {
            domStyle.set(this.domNode, "overflowY", "hidden");
            domStyle.set(this.gridContainerTable, "height", "auto");
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        if (this.isAutoOrganized) {
            this._organizeChildren();
        } else {
            this._organizeChildrenManually();
        }
        array.forEach(this.getChildren(), function (child) {
            child.startup();
        });
        if (this._isShown()) {
            this.enableDnd();
        }
        this.inherited(arguments);
    }, resizeChildAfterDrop:function (node, targetArea, indexChild) {
        if (this._disabled) {
            return false;
        }
        if (registry.getEnclosingWidget(targetArea.node) == this) {
            var widget = registry.byNode(node);
            if (widget.resize && lang.isFunction(widget.resize)) {
                widget.resize();
            }
            widget.set("column", node.parentNode.cellIndex);
            if (this.doLayout) {
                var domNodeHeight = this._contentBox.h, divHeight = geom.getContentBox(this.gridContainerDiv).h;
                if (divHeight >= domNodeHeight) {
                    domStyle.set(this.gridContainerTable, "height", (domNodeHeight - this._border.h) + "px");
                }
            }
            return true;
        }
        return false;
    }, resizeChildAfterDragStart:function (node, sourceArea, indexChild) {
        if (this._disabled) {
            return false;
        }
        if (registry.getEnclosingWidget(sourceArea.node) == this) {
            this._draggedNode = node;
            if (this.doLayout) {
                geom.setMarginBox(this.gridContainerTable, {h:geom.getContentBox(this.gridContainerDiv).h - this._border.h});
            }
            return true;
        }
        return false;
    }, getChildren:function () {
        var children = new NodeList();
        array.forEach(this._grid, function (dropZone) {
            query("> [widgetId]", dropZone.node).map(registry.byNode).forEach(function (item) {
                children.push(item);
            });
        });
        return children;
    }, _isShown:function () {
        if ("open" in this) {
            return this.open;
        } else {
            var node = this.domNode;
            return (node.style.display != "none") && (node.style.visibility != "hidden") && !domClass.contains(node, "dijitHidden");
        }
    }, layout:function () {
        if (this.doLayout) {
            var contentBox = this._contentBox;
            geom.setMarginBox(this.gridContainerTable, {h:contentBox.h - this._border.h});
            geom.setContentSize(this.domNode, {w:contentBox.w - this._border.w});
        }
        array.forEach(this.getChildren(), function (widget) {
            if (widget.resize && lang.isFunction(widget.resize)) {
                widget.resize();
            }
        });
    }, onShow:function () {
        if (this._disabled) {
            this.enableDnd();
        }
    }, onHide:function () {
        if (!this._disabled) {
            this.disableDnd();
        }
    }, _createCells:function () {
        if (this.nbZones === 0) {
            this.nbZones = 1;
        }
        var accept = this.acceptTypes.join(","), i = 0;
        var widths = this._computeColWidth();
        while (i < this.nbZones) {
            this._grid.push({node:domConstruct.create("td", {"class":"gridContainerZone", accept:accept, id:this.id + "_dz" + i, style:{"width":widths[i] + "%"}}, this.gridNode)});
            i++;
        }
    }, _getZonesAttr:function () {
        return query(".gridContainerZone", this.containerNode);
    }, enableDnd:function () {
        var m = this._dragManager;
        array.forEach(this._grid, function (dropZone) {
            m.registerByNode(dropZone.node);
        });
        m._dropMode.updateAreas(m._areaList);
        this._disabled = false;
    }, disableDnd:function () {
        var m = this._dragManager;
        array.forEach(this._grid, function (dropZone) {
            m.unregister(dropZone.node);
        });
        m._dropMode.updateAreas(m._areaList);
        this._disabled = true;
    }, _organizeChildren:function () {
        var children = dojox.layout.GridContainerLite.superclass.getChildren.call(this);
        var numZones = this.nbZones, numPerZone = Math.floor(children.length / numZones), mod = children.length % numZones, i = 0;
        for (var z = 0; z < numZones; z++) {
            for (var r = 0; r < numPerZone; r++) {
                this._insertChild(children[i], z);
                i++;
            }
            if (mod > 0) {
                try {
                    this._insertChild(children[i], z);
                    i++;
                }
                catch (e) {
                    console.error("Unable to insert child in GridContainer", e);
                }
                mod--;
            } else {
                if (numPerZone === 0) {
                    break;
                }
            }
        }
    }, _organizeChildrenManually:function () {
        var children = dojox.layout.GridContainerLite.superclass.getChildren.call(this), length = children.length, child;
        for (var i = 0; i < length; i++) {
            child = children[i];
            try {
                this._insertChild(child, child.column - 1);
            }
            catch (e) {
                console.error("Unable to insert child in GridContainer", e);
            }
        }
    }, _insertChild:function (child, column, p) {
        var zone = this._grid[column].node, length = zone.childNodes.length;
        if (typeof p === "undefined" || p > length) {
            p = length;
        }
        if (this._disabled) {
            domConstruct.place(child.domNode, zone, p);
            domAttr.set(child.domNode, "tabIndex", "0");
        } else {
            if (!child.dragRestriction) {
                this._dragManager.addDragItem(zone, child.domNode, p, true);
            } else {
                domConstruct.place(child.domNode, zone, p);
                domAttr.set(child.domNode, "tabIndex", "0");
            }
        }
        child.set("column", column);
        return child;
    }, removeChild:function (widget) {
        if (this._disabled) {
            this.inherited(arguments);
        } else {
            this._dragManager.removeDragItem(widget.domNode.parentNode, widget.domNode);
        }
    }, addService:function (child, column, p) {
        kernel.deprecated("addService is deprecated.", "Please use  instead.", "Future");
        this.addChild(child, column, p);
    }, addChild:function (child, column, p) {
        child.domNode.id = child.id;
        dojox.layout.GridContainerLite.superclass.addChild.call(this, child, 0);
        if (column < 0 || column === undefined) {
            column = 0;
        }
        if (p <= 0) {
            p = 0;
        }
        try {
            return this._insertChild(child, column, p);
        }
        catch (e) {
            console.error("Unable to insert child in GridContainer", e);
        }
        return null;
    }, _setColWidthsAttr:function (value) {
        this.colWidths = lang.isString(value) ? value.split(",") : (lang.isArray(value) ? value : [value]);
        if (this._started) {
            this._updateColumnsWidth();
        }
    }, _updateColumnsWidth:function (manager) {
        var length = this._grid.length;
        var widths = this._computeColWidth();
        for (var i = 0; i < length; i++) {
            this._grid[i].node.style.width = widths[i] + "%";
        }
    }, _computeColWidth:function () {
        var origWidths = this.colWidths || [];
        var widths = [];
        var colWidth;
        var widthSum = 0;
        var i;
        for (i = 0; i < this.nbZones; i++) {
            if (widths.length < origWidths.length) {
                widthSum += origWidths[i] * 1;
                widths.push(origWidths[i]);
            } else {
                if (!colWidth) {
                    colWidth = (100 - widthSum) / (this.nbZones - i);
                    if (colWidth < 0) {
                        colWidth = 100 / this.nbZones;
                    }
                }
                widths.push(colWidth);
                widthSum += colWidth * 1;
            }
        }
        if (widthSum > 100) {
            var divisor = 100 / widthSum;
            for (i = 0; i < widths.length; i++) {
                widths[i] *= divisor;
            }
        }
        return widths;
    }, _selectFocus:function (event) {
        if (this._disabled) {
            return;
        }
        var key = event.keyCode, k = keys, zone = null, cFocus = baseFocus.getFocus(), focusNode = cFocus.node, m = this._dragManager, found, i, j, r, children, area, widget;
        if (focusNode == this.containerNode) {
            area = this.gridNode.childNodes;
            switch (key) {
              case k.DOWN_ARROW:
              case k.RIGHT_ARROW:
                found = false;
                for (i = 0; i < area.length; i++) {
                    children = area[i].childNodes;
                    for (j = 0; j < children.length; j++) {
                        zone = children[j];
                        if (zone !== null && zone.style.display != "none") {
                            focus.focus(zone);
                            events.stop(event);
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
                break;
              case k.UP_ARROW:
              case k.LEFT_ARROW:
                area = this.gridNode.childNodes;
                found = false;
                for (i = area.length - 1; i >= 0; i--) {
                    children = area[i].childNodes;
                    for (j = children.length; j >= 0; j--) {
                        zone = children[j];
                        if (zone !== null && zone.style.display != "none") {
                            focus.focus(zone);
                            events.stop(event);
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
                break;
            }
        } else {
            if (focusNode.parentNode.parentNode == this.gridNode) {
                var child = (key == k.UP_ARROW || key == k.LEFT_ARROW) ? "lastChild" : "firstChild";
                var pos = (key == k.UP_ARROW || key == k.LEFT_ARROW) ? "previousSibling" : "nextSibling";
                switch (key) {
                  case k.UP_ARROW:
                  case k.DOWN_ARROW:
                    events.stop(event);
                    found = false;
                    var focusTemp = focusNode;
                    while (!found) {
                        children = focusTemp.parentNode.childNodes;
                        var num = 0;
                        for (i = 0; i < children.length; i++) {
                            if (children[i].style.display != "none") {
                                num++;
                            }
                            if (num > 1) {
                                break;
                            }
                        }
                        if (num == 1) {
                            return;
                        }
                        if (focusTemp[pos] === null) {
                            zone = focusTemp.parentNode[child];
                        } else {
                            zone = focusTemp[pos];
                        }
                        if (zone.style.display === "none") {
                            focusTemp = zone;
                        } else {
                            found = true;
                        }
                    }
                    if (event.shiftKey) {
                        var parent = focusNode.parentNode;
                        for (i = 0; i < this.gridNode.childNodes.length; i++) {
                            if (parent == this.gridNode.childNodes[i]) {
                                break;
                            }
                        }
                        children = this.gridNode.childNodes[i].childNodes;
                        for (j = 0; j < children.length; j++) {
                            if (zone == children[j]) {
                                break;
                            }
                        }
                        if (has("mozilla") || has("webkit")) {
                            i--;
                        }
                        widget = registry.byNode(focusNode);
                        if (!widget.dragRestriction) {
                            r = m.removeDragItem(parent, focusNode);
                            this.addChild(widget, i, j);
                            domAttr.set(focusNode, "tabIndex", "0");
                            focus.focus(focusNode);
                        } else {
                            topic.publish("/dojox/layout/gridContainer/moveRestriction", this);
                        }
                    } else {
                        focus.focus(zone);
                    }
                    break;
                  case k.RIGHT_ARROW:
                  case k.LEFT_ARROW:
                    events.stop(event);
                    if (event.shiftKey) {
                        var z = 0;
                        if (focusNode.parentNode[pos] === null) {
                            if (has("ie") && key == k.LEFT_ARROW) {
                                z = this.gridNode.childNodes.length - 1;
                            }
                        } else {
                            if (focusNode.parentNode[pos].nodeType == 3) {
                                z = this.gridNode.childNodes.length - 2;
                            } else {
                                for (i = 0; i < this.gridNode.childNodes.length; i++) {
                                    if (focusNode.parentNode[pos] == this.gridNode.childNodes[i]) {
                                        break;
                                    }
                                    z++;
                                }
                                if (has("mozilla") || has("webkit")) {
                                    z--;
                                }
                            }
                        }
                        widget = registry.byNode(focusNode);
                        var _dndType = focusNode.getAttribute("dndtype");
                        if (_dndType === null) {
                            if (widget && widget.dndType) {
                                _dndType = widget.dndType.split(/\s*,\s*/);
                            } else {
                                _dndType = ["text"];
                            }
                        } else {
                            _dndType = _dndType.split(/\s*,\s*/);
                        }
                        var accept = false;
                        for (i = 0; i < this.acceptTypes.length; i++) {
                            for (j = 0; j < _dndType.length; j++) {
                                if (_dndType[j] == this.acceptTypes[i]) {
                                    accept = true;
                                    break;
                                }
                            }
                        }
                        if (accept && !widget.dragRestriction) {
                            var parentSource = focusNode.parentNode, place = 0;
                            if (k.LEFT_ARROW == key) {
                                var t = z;
                                if (has("mozilla") || has("webkit")) {
                                    t = z + 1;
                                }
                                place = this.gridNode.childNodes[t].childNodes.length;
                            }
                            r = m.removeDragItem(parentSource, focusNode);
                            this.addChild(widget, z, place);
                            domAttr.set(r, "tabIndex", "0");
                            focus.focus(r);
                        } else {
                            topic.publish("/dojox/layout/gridContainer/moveRestriction", this);
                        }
                    } else {
                        var node = focusNode.parentNode;
                        while (zone === null) {
                            if (node[pos] !== null && node[pos].nodeType !== 3) {
                                node = node[pos];
                            } else {
                                if (pos === "previousSibling") {
                                    node = node.parentNode.childNodes[node.parentNode.childNodes.length - 1];
                                } else {
                                    node = node.parentNode.childNodes[has("ie") ? 0 : 1];
                                }
                            }
                            zone = node[child];
                            if (zone && zone.style.display == "none") {
                                children = zone.parentNode.childNodes;
                                var childToSelect = null;
                                if (pos == "previousSibling") {
                                    for (i = children.length - 1; i >= 0; i--) {
                                        if (children[i].style.display != "none") {
                                            childToSelect = children[i];
                                            break;
                                        }
                                    }
                                } else {
                                    for (i = 0; i < children.length; i++) {
                                        if (children[i].style.display != "none") {
                                            childToSelect = children[i];
                                            break;
                                        }
                                    }
                                }
                                if (!childToSelect) {
                                    focusNode = zone;
                                    node = focusNode.parentNode;
                                    zone = null;
                                } else {
                                    zone = childToSelect;
                                }
                            }
                        }
                        focus.focus(zone);
                    }
                    break;
                }
            }
        }
    }, destroy:function () {
        var m = this._dragManager;
        array.forEach(this._grid, function (dropZone) {
            m.unregister(dropZone.node);
        });
        this.inherited(arguments);
    }});
    gcl.ChildWidgetProperties = {column:"1", dragRestriction:false};
    lang.extend(_WidgetBase, gcl.ChildWidgetProperties);
    return gcl;
});

