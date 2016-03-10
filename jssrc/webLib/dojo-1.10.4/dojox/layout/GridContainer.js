//>>built

define("dojox/layout/GridContainer", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/connect", "dojo/_base/sniff", "dojo/dom-class", "dojo/dom-style", "dojo/dom-geometry", "dojo/dom-construct", "dojo/_base/lang", "dojo/_base/window", "dojo/ready", "dojox/layout/GridContainerLite"], function (dojo, declare, array, connect, has, domClass, domStyle, geom, domConstruct, lang, win, ready, GridContainerLite) {
    return declare("dojox.layout.GridContainer", GridContainerLite, {hasResizableColumns:true, liveResizeColumns:false, minColWidth:20, minChildWidth:150, mode:"right", isRightFixed:false, isLeftFixed:false, startup:function () {
        this.inherited(arguments);
        if (this.hasResizableColumns) {
            for (var i = 0; i < this._grid.length - 1; i++) {
                this._createGrip(i);
            }
            if (!this.getParent()) {
                ready(lang.hitch(this, "_placeGrips"));
            }
        }
    }, resizeChildAfterDrop:function (node, targetArea, indexChild) {
        if (this.inherited(arguments)) {
            this._placeGrips();
        }
    }, onShow:function () {
        this.inherited(arguments);
        this._placeGrips();
    }, resize:function () {
        this.inherited(arguments);
        if (this._isShown() && this.hasResizableColumns) {
            this._placeGrips();
        }
    }, _createGrip:function (index) {
        var dropZone = this._grid[index], grip = domConstruct.create("div", {"class":"gridContainerGrip"}, this.domNode);
        dropZone.grip = grip;
        dropZone.gripHandler = [this.connect(grip, "onmouseover", function (e) {
            var gridContainerGripShow = false;
            for (var i = 0; i < this._grid.length - 1; i++) {
                if (domClass.contains(this._grid[i].grip, "gridContainerGripShow")) {
                    gridContainerGripShow = true;
                    break;
                }
            }
            if (!gridContainerGripShow) {
                domClass.replace(e.target, "gridContainerGripShow", "gridContainerGrip");
            }
        })[0], this.connect(grip, "onmouseout", function (e) {
            if (!this._isResized) {
                domClass.replace(e.target, "gridContainerGrip", "gridContainerGripShow");
            }
        })[0], this.connect(grip, "onmousedown", "_resizeColumnOn")[0], this.connect(grip, "ondblclick", "_onGripDbClick")[0]];
    }, _placeGrips:function () {
        var gripWidth, height, left = 0, grip;
        array.forEach(this._grid, function (dropZone) {
            if (dropZone.grip) {
                grip = dropZone.grip;
                if (!gripWidth) {
                    gripWidth = grip.offsetWidth / 2;
                }
                left += geom.getMarginBox(dropZone.node).w;
                domStyle.set(grip, "left", (left - gripWidth) + "px");
                if (!height) {
                    height = geom.getContentBox(this.gridNode).h;
                }
                if (height > 0) {
                    domStyle.set(grip, "height", height + "px");
                }
            }
        }, this);
    }, _onGripDbClick:function () {
        this._updateColumnsWidth(this._dragManager);
        this.resize();
    }, _resizeColumnOn:function (e) {
        this._activeGrip = e.target;
        this._initX = e.pageX;
        e.preventDefault();
        win.body().style.cursor = "ew-resize";
        this._isResized = true;
        var tabSize = [];
        var grid;
        var i;
        for (i = 0; i < this._grid.length; i++) {
            tabSize[i] = geom.getContentBox(this._grid[i].node).w;
        }
        this._oldTabSize = tabSize;
        for (i = 0; i < this._grid.length; i++) {
            grid = this._grid[i];
            if (this._activeGrip == grid.grip) {
                this._currentColumn = grid.node;
                this._currentColumnWidth = tabSize[i];
                this._nextColumn = this._grid[i + 1].node;
                this._nextColumnWidth = tabSize[i + 1];
            }
            grid.node.style.width = tabSize[i] + "px";
        }
        var calculateChildMinWidth = function (childNodes, minChild) {
            var width = 0;
            var childMinWidth = 0;
            array.forEach(childNodes, function (child) {
                if (child.nodeType == 1) {
                    var objectStyle = domStyle.getComputedStyle(child);
                    var minWidth = (has("ie")) ? minChild : parseInt(objectStyle.minWidth);
                    childMinWidth = minWidth + parseInt(objectStyle.marginLeft) + parseInt(objectStyle.marginRight);
                    if (width < childMinWidth) {
                        width = childMinWidth;
                    }
                }
            });
            return width;
        };
        var currentColumnMinWidth = calculateChildMinWidth(this._currentColumn.childNodes, this.minChildWidth);
        var nextColumnMinWidth = calculateChildMinWidth(this._nextColumn.childNodes, this.minChildWidth);
        var minPix = Math.round((geom.getMarginBox(this.gridContainerTable).w * this.minColWidth) / 100);
        this._currentMinCol = currentColumnMinWidth;
        this._nextMinCol = nextColumnMinWidth;
        if (minPix > this._currentMinCol) {
            this._currentMinCol = minPix;
        }
        if (minPix > this._nextMinCol) {
            this._nextMinCol = minPix;
        }
        this._connectResizeColumnMove = connect.connect(win.doc, "onmousemove", this, "_resizeColumnMove");
        this._connectOnGripMouseUp = connect.connect(win.doc, "onmouseup", this, "_onGripMouseUp");
    }, _onGripMouseUp:function () {
        win.body().style.cursor = "default";
        connect.disconnect(this._connectResizeColumnMove);
        connect.disconnect(this._connectOnGripMouseUp);
        this._connectOnGripMouseUp = this._connectResizeColumnMove = null;
        if (this._activeGrip) {
            domClass.replace(this._activeGrip, "gridContainerGrip", "gridContainerGripShow");
        }
        this._isResized = false;
    }, _resizeColumnMove:function (e) {
        e.preventDefault();
        if (!this._connectResizeColumnOff) {
            connect.disconnect(this._connectOnGripMouseUp);
            this._connectOnGripMouseUp = null;
            this._connectResizeColumnOff = connect.connect(win.doc, "onmouseup", this, "_resizeColumnOff");
        }
        var d = e.pageX - this._initX;
        if (d == 0) {
            return;
        }
        if (!(this._currentColumnWidth + d < this._currentMinCol || this._nextColumnWidth - d < this._nextMinCol)) {
            this._currentColumnWidth += d;
            this._nextColumnWidth -= d;
            this._initX = e.pageX;
            this._activeGrip.style.left = parseInt(this._activeGrip.style.left) + d + "px";
            if (this.liveResizeColumns) {
                this._currentColumn.style["width"] = this._currentColumnWidth + "px";
                this._nextColumn.style["width"] = this._nextColumnWidth + "px";
                this.resize();
            }
        }
    }, _resizeColumnOff:function (e) {
        win.body().style.cursor = "default";
        connect.disconnect(this._connectResizeColumnMove);
        connect.disconnect(this._connectResizeColumnOff);
        this._connectResizeColumnOff = this._connectResizeColumnMove = null;
        if (!this.liveResizeColumns) {
            this._currentColumn.style["width"] = this._currentColumnWidth + "px";
            this._nextColumn.style["width"] = this._nextColumnWidth + "px";
        }
        var tabSize = [], testSize = [], tabWidth = this.gridContainerTable.clientWidth, node, update = false, i;
        for (i = 0; i < this._grid.length; i++) {
            node = this._grid[i].node;
            if (has("ie")) {
                tabSize[i] = geom.getMarginBox(node).w;
                testSize[i] = geom.getContentBox(node).w;
            } else {
                tabSize[i] = geom.getContentBox(node).w;
                testSize = tabSize;
            }
        }
        for (i = 0; i < testSize.length; i++) {
            if (testSize[i] != this._oldTabSize[i]) {
                update = true;
                break;
            }
        }
        if (update) {
            var mul = has("ie") ? 100 : 10000;
            for (i = 0; i < this._grid.length; i++) {
                this._grid[i].node.style.width = Math.round((100 * mul * tabSize[i]) / tabWidth) / mul + "%";
            }
            this.resize();
        }
        if (this._activeGrip) {
            domClass.replace(this._activeGrip, "gridContainerGrip", "gridContainerGripShow");
        }
        this._isResized = false;
    }, setColumns:function (nbColumns) {
        var z, j;
        if (nbColumns > 0) {
            var length = this._grid.length, delta = length - nbColumns;
            if (delta > 0) {
                var count = [], zone, start, end, nbChildren;
                if (this.mode == "right") {
                    end = (this.isLeftFixed && length > 0) ? 1 : 0;
                    start = (this.isRightFixed) ? length - 2 : length - 1;
                    for (z = start; z >= end; z--) {
                        nbChildren = 0;
                        zone = this._grid[z].node;
                        for (j = 0; j < zone.childNodes.length; j++) {
                            if (zone.childNodes[j].nodeType == 1 && !(zone.childNodes[j].id == "")) {
                                nbChildren++;
                                break;
                            }
                        }
                        if (nbChildren == 0) {
                            count[count.length] = z;
                        }
                        if (count.length >= delta) {
                            this._deleteColumn(count);
                            break;
                        }
                    }
                    if (count.length < delta) {
                        connect.publish("/dojox/layout/gridContainer/noEmptyColumn", [this]);
                    }
                } else {
                    start = (this.isLeftFixed && length > 0) ? 1 : 0;
                    end = (this.isRightFixed) ? length - 1 : length;
                    for (z = start; z < end; z++) {
                        nbChildren = 0;
                        zone = this._grid[z].node;
                        for (j = 0; j < zone.childNodes.length; j++) {
                            if (zone.childNodes[j].nodeType == 1 && !(zone.childNodes[j].id == "")) {
                                nbChildren++;
                                break;
                            }
                        }
                        if (nbChildren == 0) {
                            count[count.length] = z;
                        }
                        if (count.length >= delta) {
                            this._deleteColumn(count);
                            break;
                        }
                    }
                    if (count.length < delta) {
                        connect.publish("/dojox/layout/gridContainer/noEmptyColumn", [this]);
                    }
                }
            } else {
                if (delta < 0) {
                    this._addColumn(Math.abs(delta));
                }
            }
            if (this.hasResizableColumns) {
                this._placeGrips();
            }
        }
    }, _addColumn:function (nbColumns) {
        var grid = this._grid, dropZone, node, index, length, isRightMode = (this.mode == "right"), accept = this.acceptTypes.join(","), m = this._dragManager;
        if (this.hasResizableColumns && ((!this.isRightFixed && isRightMode) || (this.isLeftFixed && !isRightMode && this.nbZones == 1))) {
            this._createGrip(grid.length - 1);
        }
        for (var i = 0; i < nbColumns; i++) {
            node = domConstruct.create("td", {"class":"gridContainerZone dojoxDndArea", "accept":accept, "id":this.id + "_dz" + this.nbZones});
            length = grid.length;
            if (isRightMode) {
                if (this.isRightFixed) {
                    index = length - 1;
                    grid.splice(index, 0, {"node":grid[index].node.parentNode.insertBefore(node, grid[index].node)});
                } else {
                    index = length;
                    grid.push({"node":this.gridNode.appendChild(node)});
                }
            } else {
                if (this.isLeftFixed) {
                    index = (length == 1) ? 0 : 1;
                    this._grid.splice(1, 0, {"node":this._grid[index].node.parentNode.appendChild(node, this._grid[index].node)});
                    index = 1;
                } else {
                    index = length - this.nbZones;
                    this._grid.splice(index, 0, {"node":grid[index].node.parentNode.insertBefore(node, grid[index].node)});
                }
            }
            if (this.hasResizableColumns) {
                if ((!isRightMode && this.nbZones != 1) || (!isRightMode && this.nbZones == 1 && !this.isLeftFixed) || (isRightMode && i < nbColumns - 1) || (isRightMode && i == nbColumns - 1 && this.isRightFixed)) {
                    this._createGrip(index);
                }
            }
            m.registerByNode(grid[index].node);
            this.nbZones++;
        }
        this._updateColumnsWidth(m);
    }, _deleteColumn:function (indices) {
        var child, grid, index, nbDelZones = 0, length = indices.length, m = this._dragManager;
        for (var i = 0; i < length; i++) {
            index = (this.mode == "right") ? indices[i] : indices[i] - nbDelZones;
            grid = this._grid[index];
            if (this.hasResizableColumns && grid.grip) {
                array.forEach(grid.gripHandler, function (handler) {
                    connect.disconnect(handler);
                });
                domConstruct.destroy(this.domNode.removeChild(grid.grip));
                grid.grip = null;
            }
            m.unregister(grid.node);
            domConstruct.destroy(this.gridNode.removeChild(grid.node));
            this._grid.splice(index, 1);
            this.nbZones--;
            nbDelZones++;
        }
        var lastGrid = this._grid[this.nbZones - 1];
        if (lastGrid.grip) {
            array.forEach(lastGrid.gripHandler, connect.disconnect);
            domConstruct.destroy(this.domNode.removeChild(lastGrid.grip));
            lastGrid.grip = null;
        }
        this._updateColumnsWidth(m);
    }, _updateColumnsWidth:function (manager) {
        this.inherited(arguments);
        manager._dropMode.updateAreas(manager._areaList);
    }, destroy:function () {
        connect.unsubscribe(this._dropHandler);
        this.inherited(arguments);
    }});
});

