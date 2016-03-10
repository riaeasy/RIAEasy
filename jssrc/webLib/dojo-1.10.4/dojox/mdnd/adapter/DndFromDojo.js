//>>built

define("dojox/mdnd/adapter/DndFromDojo", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/connect", "dojo/_base/array", "dojo/dom-class", "dojo/_base/window", "dojox/mdnd/AreaManager", "dojo/dnd/Manager"], function (dojo, declare, connect, array, domClass, win, AreaManager, Manager) {
    var dfd = declare("dojox.mdnd.adapter.DndFromDojo", null, {dropIndicatorSize:{"w":0, "h":50}, dropIndicatorSize:{"w":0, "h":50}, _areaManager:null, _dojoManager:null, _currentArea:null, _oldArea:null, _moveHandler:null, _subscribeHandler:null, constructor:function () {
        this._areaManager = dojox.mdnd.areaManager();
        this._dojoManager = Manager.manager();
        this._currentArea = null;
        this._moveHandler = null;
        this.subscribeDnd();
    }, subscribeDnd:function () {
        this._subscribeHandler = [connect.subscribe("/dnd/start", this, "onDragStart"), connect.subscribe("/dnd/drop/before", this, "onDrop"), connect.subscribe("/dnd/cancel", this, "onDropCancel"), connect.subscribe("/dnd/source/over", this, "onDndSource")];
    }, unsubscribeDnd:function () {
        array.forEach(this._subscribeHandler, connect.unsubscribe);
    }, _getHoverArea:function (coords) {
        var x = coords.x;
        var y = coords.y;
        this._oldArea = this._currentArea;
        this._currentArea = null;
        var areas = this._areaManager._areaList;
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            var startX = area.coords.x;
            var endX = startX + area.node.offsetWidth;
            var startY = area.coords.y;
            var endY = startY + area.node.offsetHeight;
            if (startX <= x && x <= endX && startY <= y && y <= endY) {
                this._areaManager._oldIndexArea = this._areaManager._currentIndexArea;
                this._areaManager._currentIndexArea = i;
                this._currentArea = area.node;
                break;
            }
        }
        if (this._currentArea != this._oldArea) {
            if (this._currentArea == null) {
                this.onDragExit();
            } else {
                if (this._oldArea == null) {
                    this.onDragEnter();
                } else {
                    this.onDragExit();
                    this.onDragEnter();
                }
            }
        }
    }, onDragStart:function (source, nodes, copy) {
        this._dragNode = nodes[0];
        this._copy = copy;
        this._source = source;
        this._outSourceHandler = connect.connect(this._dojoManager, "outSource", this, function () {
            if (this._moveHandler == null) {
                this._moveHandler = connect.connect(dojo.doc, "mousemove", this, "onMouseMove");
            }
        });
    }, onMouseMove:function (e) {
        var coords = {"x":e.pageX, "y":e.pageY};
        this._getHoverArea(coords);
        if (this._currentArea && this._areaManager._accept) {
            if (this._areaManager._dropIndicator.node.style.visibility == "hidden") {
                this._areaManager._dropIndicator.node.style.visibility = "";
                domClass.add(this._dojoManager.avatar.node, "dojoDndAvatarCanDrop");
            }
            this._areaManager.placeDropIndicator(coords, this.dropIndicatorSize);
        }
    }, onDragEnter:function () {
        var _dndType = this._dragNode.getAttribute("dndType");
        var type = (_dndType) ? _dndType.split(/\s*,\s*/) : ["text"];
        this._areaManager._isAccepted(type, this._areaManager._areaList[this._areaManager._currentIndexArea].accept);
        if (this._dojoManager.avatar) {
            if (this._areaManager._accept) {
                domClass.add(this._dojoManager.avatar.node, "dojoDndAvatarCanDrop");
            } else {
                domClass.remove(this._dojoManager.avatar.node, "dojoDndAvatarCanDrop");
            }
        }
    }, onDragExit:function () {
        this._areaManager._accept = false;
        if (this._dojoManager.avatar) {
            domClass.remove(this._dojoManager.avatar.node, "dojoDndAvatarCanDrop");
        }
        if (this._currentArea == null) {
            this._areaManager._dropMode.refreshItems(this._areaManager._areaList[this._areaManager._oldIndexArea], this._areaManager._oldDropIndex, this.dropIndicatorSize, false);
            this._areaManager._resetAfterDrop();
        } else {
            this._areaManager._dropIndicator.remove();
        }
    }, isAccepted:function (node, accept) {
        var type = (node.getAttribute("dndType")) ? node.getAttribute("dndType") : "text";
        if (type && type in accept) {
            return true;
        } else {
            return false;
        }
    }, onDndSource:function (source) {
        if (this._currentArea == null) {
            return;
        }
        if (source) {
            var accept = false;
            if (this._dojoManager.target == source) {
                accept = true;
            } else {
                accept = this.isAccepted(this._dragNode, source.accept);
            }
            if (accept) {
                connect.disconnect(this._moveHandler);
                this._currentArea = this._moveHandler = null;
                var dropIndicator = this._areaManager._dropIndicator.node;
                if (dropIndicator && dropIndicator.parentNode !== null && dropIndicator.parentNode.nodeType == 1) {
                    dropIndicator.style.visibility = "hidden";
                }
            } else {
                this._resetAvatar();
            }
        } else {
            if (!this._moveHandler) {
                this._moveHandler = connect.connect(dojo.doc, "mousemove", this, "onMouseMove");
            }
            this._resetAvatar();
        }
    }, _resetAvatar:function () {
        if (this._dojoManager.avatar) {
            if (this._areaManager._accept) {
                domClass.add(this._dojoManager.avatar.node, "dojoDndAvatarCanDrop");
            } else {
                domClass.remove(this._dojoManager.avatar.node, "dojoDndAvatarCanDrop");
            }
        }
    }, onDropCancel:function () {
        if (this._currentArea == null) {
            this._areaManager._resetAfterDrop();
            connect.disconnect(this._moveHandler);
            connect.disconnect(this._outSourceHandler);
            this._currentArea = this._moveHandler = this._outSourceHandler = null;
        } else {
            if (this._areaManager._accept) {
                this.onDrop(this._source, [this._dragNode], this._copy, this._currentArea);
            } else {
                this._currentArea = null;
                connect.disconnect(this._outSourceHandler);
                connect.disconnect(this._moveHandler);
                this._moveHandler = this._outSourceHandler = null;
            }
        }
    }, onDrop:function (source, nodes, copy) {
        connect.disconnect(this._moveHandler);
        connect.disconnect(this._outSourceHandler);
        this._moveHandler = this._outSourceHandler = null;
        if (this._currentArea) {
            var dropIndex = this._areaManager._currentDropIndex;
            connect.publish("/dnd/drop/after", [source, nodes, copy, this._currentArea, dropIndex]);
            this._currentArea = null;
        }
        if (this._areaManager._dropIndicator.node.style.visibility == "hidden") {
            this._areaManager._dropIndicator.node.style.visibility = "";
        }
        this._areaManager._resetAfterDrop();
    }});
    dojox.mdnd.adapter._dndFromDojo = null;
    dojox.mdnd.adapter._dndFromDojo = new dojox.mdnd.adapter.DndFromDojo();
    return dfd;
});

