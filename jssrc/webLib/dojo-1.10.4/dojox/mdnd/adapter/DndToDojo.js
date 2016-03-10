//>>built

define("dojox/mdnd/adapter/DndToDojo", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/array", "dojo/dom-class", "dojo/dom-style", "dojo/dom-geometry", "dojo/topic", "dojo/_base/window", "dojox/mdnd/PureSource", "dojox/mdnd/LazyManager"], function (dojo, declare, connect, array, domClass, domStyle, geom, topic, win) {
    var dtd = declare("dojox.mdnd.adapter.DndToDojo", null, {_dojoList:null, _currentDojoArea:null, _dojoxManager:null, _dragStartHandler:null, _dropHandler:null, _moveHandler:null, _moveUpHandler:null, _draggedNode:null, constructor:function () {
        this._dojoList = [];
        this._currentDojoArea = null;
        this._dojoxManager = dojox.mdnd.areaManager();
        this._dragStartHandler = connect.subscribe("/dojox/mdnd/drag/start", this, function (node, sourceArea, sourceDropIndex) {
            this._draggedNode = node;
            this._moveHandler = connect.connect(dojo.doc, "onmousemove", this, "onMouseMove");
        });
        this._dropHandler = connect.subscribe("/dojox/mdnd/drop", this, function (node, targetArea, indexChild) {
            if (this._currentDojoArea) {
                connect.publish("/dojox/mdnd/adapter/dndToDojo/cancel", [this._currentDojoArea.node, this._currentDojoArea.type, this._draggedNode, this.accept]);
            }
            this._draggedNode = null;
            this._currentDojoArea = null;
            connect.disconnect(this._moveHandler);
        });
    }, _getIndexDojoArea:function (area) {
        if (area) {
            for (var i = 0, l = this._dojoList.length; i < l; i++) {
                if (this._dojoList[i].node === area) {
                    return i;
                }
            }
        }
        return -1;
    }, _initCoordinates:function (area) {
        if (area) {
            var position = geom.position(area, true), coords = {};
            coords.x = position.x;
            coords.y = position.y;
            coords.x1 = position.x + position.w;
            coords.y1 = position.y + position.h;
            return coords;
        }
        return null;
    }, register:function (area, type, dojoTarget) {
        if (this._getIndexDojoArea(area) == -1) {
            var coords = this._initCoordinates(area), object = {"node":area, "type":type, "dojo":(dojoTarget) ? dojoTarget : false, "coords":coords};
            this._dojoList.push(object);
            if (dojoTarget && !this._lazyManager) {
                this._lazyManager = new dojox.mdnd.LazyManager();
            }
        }
    }, unregisterByNode:function (area) {
        var index = this._getIndexDojoArea(area);
        if (index != -1) {
            this._dojoList.splice(index, 1);
        }
    }, unregisterByType:function (type) {
        if (type) {
            var tempList = [];
            array.forEach(this._dojoList, function (item, i) {
                if (item.type != type) {
                    tempList.push(item);
                }
            });
            this._dojoList = tempList;
        }
    }, unregister:function () {
        this._dojoList = [];
    }, refresh:function () {
        var dojoList = this._dojoList;
        this.unregister();
        array.forEach(dojoList, function (dojo) {
            dojo.coords = this._initCoordinates(dojo.node);
        }, this);
        this._dojoList = dojoList;
    }, refreshByType:function (type) {
        var dojoList = this._dojoList;
        this.unregister();
        array.forEach(dojoList, function (dojo) {
            if (dojo.type == type) {
                dojo.coords = this._initCoordinates(dojo.node);
            }
        }, this);
        this._dojoList = dojoList;
    }, _getHoverDojoArea:function (coords) {
        this._oldDojoArea = this._currentDojoArea;
        this._currentDojoArea = null;
        var x = coords.x;
        var y = coords.y;
        var length = this._dojoList.length;
        for (var i = 0; i < length; i++) {
            var dojoArea = this._dojoList[i];
            var coordinates = dojoArea.coords;
            if (coordinates.x <= x && x <= coordinates.x1 && coordinates.y <= y && y <= coordinates.y1) {
                this._currentDojoArea = dojoArea;
                break;
            }
        }
    }, onMouseMove:function (e) {
        var coords = {"x":e.pageX, "y":e.pageY};
        this._getHoverDojoArea(coords);
        if (this._currentDojoArea != this._oldDojoArea) {
            if (this._currentDojoArea == null) {
                this.onDragExit(e);
            } else {
                if (this._oldDojoArea == null) {
                    this.onDragEnter(e);
                } else {
                    this.onDragExit(e);
                    this.onDragEnter(e);
                }
            }
        }
    }, isAccepted:function (draggedNode, target) {
        return true;
    }, onDragEnter:function (e) {
        if (this._currentDojoArea.dojo) {
            connect.disconnect(this._dojoxManager._dragItem.handlers.pop());
            connect.disconnect(this._dojoxManager._dragItem.handlers.pop());
            connect.disconnect(this._dojoxManager._dragItem.item.events.pop());
            win.body().removeChild(this._dojoxManager._cover);
            win.body().removeChild(this._dojoxManager._cover2);
            var node = this._dojoxManager._dragItem.item.node;
            if (dojox.mdnd.adapter._dndFromDojo) {
                dojox.mdnd.adapter._dndFromDojo.unsubscribeDnd();
            }
            domStyle.set(node, {"position":"relative", "top":"0", "left":"0"});
            this._lazyManager.startDrag(e, node);
            var handle = connect.connect(this._lazyManager.manager, "overSource", this, function () {
                connect.disconnect(handle);
                if (this._lazyManager.manager.canDropFlag) {
                    this._dojoxManager._dropIndicator.node.style.display = "none";
                }
            });
            this.cancelHandler = connect.subscribe("/dnd/cancel", this, function () {
                var moveableItem = this._dojoxManager._dragItem.item;
                moveableItem.events = [connect.connect(moveableItem.handle, "onmousedown", moveableItem, "onMouseDown")];
                win.body().appendChild(this._dojoxManager._cover);
                win.body().appendChild(this._dojoxManager._cover2);
                this._dojoxManager._cover.appendChild(moveableItem.node);
                var objectArea = this._dojoxManager._areaList[this._dojoxManager._sourceIndexArea];
                var dropIndex = this._dojoxManager._sourceDropIndex;
                var nodeRef = null;
                if (dropIndex != objectArea.items.length && dropIndex != -1) {
                    nodeRef = objectArea.items[this._dojoxManager._sourceDropIndex].item.node;
                }
                if (this._dojoxManager._dropIndicator.node.style.display == "none") {
                    this._dojoxManager._dropIndicator.node.style.display == "";
                }
                this._dojoxManager._dragItem.handlers.push(connect.connect(this._dojoxManager._dragItem.item, "onDrag", this._dojoxManager, "onDrag"));
                this._dojoxManager._dragItem.handlers.push(connect.connect(this._dojoxManager._dragItem.item, "onDragEnd", this._dojoxManager, "onDrop"));
                this._draggedNode.style.display = "";
                this._dojoxManager.onDrop(this._draggedNode);
                connect.unsubscribe(this.cancelHandler);
                connect.unsubscribe(this.dropHandler);
                if (dojox.mdnd.adapter._dndFromDojo) {
                    dojox.mdnd.adapter._dndFromDojo.subscribeDnd();
                }
            });
            this.dropHandler = connect.subscribe("/dnd/drop/before", this, function (params) {
                connect.unsubscribe(this.cancelHandler);
                connect.unsubscribe(this.dropHandler);
                this.onDrop();
            });
        } else {
            this.accept = this.isAccepted(this._dojoxManager._dragItem.item.node, this._currentDojoArea);
            if (this.accept) {
                connect.disconnect(this._dojoxManager._dragItem.handlers.pop());
                connect.disconnect(this._dojoxManager._dragItem.handlers.pop());
                this._dojoxManager._dropIndicator.node.style.display = "none";
                if (!this._moveUpHandler) {
                    this._moveUpHandler = connect.connect(dojo.doc, "onmouseup", this, "onDrop");
                }
            }
        }
        connect.publish("/dojox/mdnd/adapter/dndToDojo/over", [this._currentDojoArea.node, this._currentDojoArea.type, this._draggedNode, this.accept]);
    }, onDragExit:function (e) {
        if (this._oldDojoArea.dojo) {
            connect.unsubscribe(this.cancelHandler);
            connect.unsubscribe(this.dropHandler);
            var moveableItem = this._dojoxManager._dragItem.item;
            this._dojoxManager._dragItem.item.events.push(connect.connect(moveableItem.node.ownerDocument, "onmousemove", moveableItem, "onMove"));
            win.body().appendChild(this._dojoxManager._cover);
            win.body().appendChild(this._dojoxManager._cover2);
            this._dojoxManager._cover.appendChild(moveableItem.node);
            var style = moveableItem.node.style;
            style.position = "absolute";
            style.left = (moveableItem.offsetDrag.l + e.pageX) + "px";
            style.top = (moveableItem.offsetDrag.t + e.pageX) + "px";
            style.display = "";
            this._lazyManager.cancelDrag();
            if (dojox.mdnd.adapter._dndFromDojo) {
                dojox.mdnd.adapter._dndFromDojo.subscribeDnd();
            }
            if (this._dojoxManager._dropIndicator.node.style.display == "none") {
                this._dojoxManager._dropIndicator.node.style.display = "";
            }
            this._dojoxManager._dragItem.handlers.push(connect.connect(this._dojoxManager._dragItem.item, "onDrag", this._dojoxManager, "onDrag"));
            this._dojoxManager._dragItem.handlers.push(connect.connect(this._dojoxManager._dragItem.item, "onDragEnd", this._dojoxManager, "onDrop"));
            this._dojoxManager._dragItem.item.onMove(e);
        } else {
            if (this.accept) {
                if (this._moveUpHandler) {
                    connect.disconnect(this._moveUpHandler);
                    this._moveUpHandler = null;
                }
                if (this._dojoxManager._dropIndicator.node.style.display == "none") {
                    this._dojoxManager._dropIndicator.node.style.display = "";
                }
                this._dojoxManager._dragItem.handlers.push(connect.connect(this._dojoxManager._dragItem.item, "onDrag", this._dojoxManager, "onDrag"));
                this._dojoxManager._dragItem.handlers.push(connect.connect(this._dojoxManager._dragItem.item, "onDragEnd", this._dojoxManager, "onDrop"));
                this._dojoxManager._dragItem.item.onMove(e);
            }
        }
        connect.publish("/dojox/mdnd/adapter/dndToDojo/out", [this._oldDojoArea.node, this._oldDojoArea.type, this._draggedNode, this.accept]);
    }, onDrop:function (e) {
        if (this._currentDojoArea.dojo) {
            if (dojox.mdnd.adapter._dndFromDojo) {
                dojox.mdnd.adapter._dndFromDojo.subscribeDnd();
            }
        }
        if (this._dojoxManager._dropIndicator.node.style.display == "none") {
            this._dojoxManager._dropIndicator.node.style.display = "";
        }
        if (this._dojoxManager._cover.parentNode && this._dojoxManager._cover.parentNode.nodeType == 1) {
            win.body().removeChild(this._dojoxManager._cover);
            win.body().removeChild(this._dojoxManager._cover2);
        }
        if (this._draggedNode.parentNode == this._dojoxManager._cover) {
            this._dojoxManager._cover.removeChild(this._draggedNode);
        }
        connect.disconnect(this._moveHandler);
        connect.disconnect(this._moveUpHandler);
        this._moveHandler = this._moveUpHandler = null;
        connect.publish("/dojox/mdnd/adapter/dndToDojo/drop", [this._draggedNode, this._currentDojoArea.node, this._currentDojoArea.type]);
        domClass.remove(this._draggedNode, "dragNode");
        var style = this._draggedNode.style;
        style.position = "relative";
        style.left = "0";
        style.top = "0";
        style.width = "auto";
        array.forEach(this._dojoxManager._dragItem.handlers, connect.disconnect);
        this._dojoxManager._deleteMoveableItem(this._dojoxManager._dragItem);
        this._draggedNode = null;
        this._currentDojoArea = null;
        this._dojoxManager._resetAfterDrop();
    }});
    dojox.mdnd.adapter._dndToDojo = null;
    dojox.mdnd.adapter.dndToDojo = function () {
        if (!dojox.mdnd.adapter._dndToDojo) {
            dojox.mdnd.adapter._dndToDojo = new dojox.mdnd.adapter.DndToDojo();
        }
        return dojox.mdnd.adapter._dndToDojo;
    };
    return dtd;
});

