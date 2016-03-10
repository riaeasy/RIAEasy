//>>built

define("dojox/mdnd/dropMode/DefaultDropMode", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/array", "dojo/dom-geometry", "dojox/mdnd/AreaManager"], function (dojo, declare, array, geom) {
    var ddm = declare("dojox.mdnd.dropMode.DefaultDropMode", null, {_oldXPoint:null, _oldYPoint:null, _oldBehaviour:"up", addArea:function (areas, object) {
        var length = areas.length;
        var position = geom.position(object.node, true);
        object.coords = {"x":position.x, "y":position.y};
        if (length == 0) {
            areas.push(object);
        } else {
            var x = object.coords.x;
            for (var i = 0; i < length; i++) {
                if (x < areas[i].coords.x) {
                    for (var j = length - 1; j >= i; j--) {
                        areas[j + 1] = areas[j];
                    }
                    areas[i] = object;
                    break;
                }
            }
            if (i == length) {
                areas.push(object);
            }
        }
        return areas;
    }, updateAreas:function (areaList) {
        var length = areaList.length;
        if (length > 1) {
            var currentRight, nextLeft;
            for (var i = 0; i < length; i++) {
                var area = areaList[i];
                var nextArea;
                area.coords.x1 = -1;
                area.coords.x2 = -1;
                if (i == 0) {
                    nextArea = areaList[i + 1];
                    this._updateArea(area);
                    this._updateArea(nextArea);
                    currentRight = area.coords.x + area.node.offsetWidth;
                    nextLeft = nextArea.coords.x;
                    area.coords.x2 = currentRight + (nextLeft - currentRight) / 2;
                } else {
                    if (i == length - 1) {
                        area.coords.x1 = areaList[i - 1].coords.x2;
                    } else {
                        nextArea = areaList[i + 1];
                        this._updateArea(nextArea);
                        currentRight = area.coords.x + area.node.offsetWidth;
                        nextLeft = nextArea.coords.x;
                        area.coords.x1 = areaList[i - 1].coords.x2;
                        area.coords.x2 = currentRight + (nextLeft - currentRight) / 2;
                    }
                }
            }
        }
    }, _updateArea:function (area) {
        var position = geom.position(area.node, true);
        area.coords.x = position.x;
        area.coords.y = position.y;
    }, initItems:function (area) {
        array.forEach(area.items, function (obj) {
            var node = obj.item.node;
            var position = geom.position(node, true);
            var y = position.y + position.h / 2;
            obj.y = y;
        });
        area.initItems = true;
    }, refreshItems:function (area, indexItem, size, added) {
        if (indexItem == -1) {
            return;
        } else {
            if (area && size && size.h) {
                var height = size.h;
                if (area.margin) {
                    height += area.margin.t;
                }
                var length = area.items.length;
                for (var i = indexItem; i < length; i++) {
                    var item = area.items[i];
                    if (added) {
                        item.y += height;
                    } else {
                        item.y -= height;
                    }
                }
            }
        }
    }, getDragPoint:function (coords, size, mousePosition) {
        var y = coords.y;
        if (this._oldYPoint) {
            if (y > this._oldYPoint) {
                this._oldBehaviour = "down";
                y += size.h;
            } else {
                if (y <= this._oldYPoint) {
                    this._oldBehaviour = "up";
                }
            }
        }
        this._oldYPoint = y;
        return {"x":coords.x + (size.w / 2), "y":y};
    }, getTargetArea:function (areaList, coords, currentIndexArea) {
        var index = 0;
        var x = coords.x;
        var end = areaList.length;
        if (end > 1) {
            var start = 0, direction = "right", compute = false;
            if (currentIndexArea == -1 || arguments.length < 3) {
                compute = true;
            } else {
                if (this._checkInterval(areaList, currentIndexArea, x)) {
                    index = currentIndexArea;
                } else {
                    if (this._oldXPoint < x) {
                        start = currentIndexArea + 1;
                    } else {
                        start = currentIndexArea - 1;
                        end = 0;
                        direction = "left";
                    }
                    compute = true;
                }
            }
            if (compute) {
                if (direction === "right") {
                    for (var i = start; i < end; i++) {
                        if (this._checkInterval(areaList, i, x)) {
                            index = i;
                            break;
                        }
                    }
                } else {
                    for (var i = start; i >= end; i--) {
                        if (this._checkInterval(areaList, i, x)) {
                            index = i;
                            break;
                        }
                    }
                }
            }
        }
        this._oldXPoint = x;
        return index;
    }, _checkInterval:function (areaList, index, x) {
        var coords = areaList[index].coords;
        if (coords.x1 == -1) {
            if (x <= coords.x2) {
                return true;
            }
        } else {
            if (coords.x2 == -1) {
                if (x > coords.x1) {
                    return true;
                }
            } else {
                if (coords.x1 < x && x <= coords.x2) {
                    return true;
                }
            }
        }
        return false;
    }, getDropIndex:function (targetArea, coords) {
        var length = targetArea.items.length;
        var coordinates = targetArea.coords;
        var y = coords.y;
        if (length > 0) {
            for (var i = 0; i < length; i++) {
                if (y < targetArea.items[i].y) {
                    return i;
                } else {
                    if (i == length - 1) {
                        return -1;
                    }
                }
            }
        }
        return -1;
    }, destroy:function () {
    }});
    dojox.mdnd.areaManager()._dropMode = new dojox.mdnd.dropMode.DefaultDropMode();
    return ddm;
});

