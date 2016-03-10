//>>built

define("dojox/wire/Wire", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/_base"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.Wire");
    dojo.require("dojox.wire._base");
    dojo.declare("dojox.wire.Wire", null, {_wireClass:"dojox.wire.Wire", constructor:function (args) {
        dojo.mixin(this, args);
        if (this.converter) {
            if (dojo.isString(this.converter)) {
                var convertObject = dojo.getObject(this.converter);
                if (dojo.isFunction(convertObject)) {
                    try {
                        var testObj = new convertObject();
                        if (testObj && !dojo.isFunction(testObj["convert"])) {
                            this.converter = {convert:convertObject};
                        } else {
                            this.converter = testObj;
                        }
                    }
                    catch (e) {
                    }
                } else {
                    if (dojo.isObject(convertObject)) {
                        if (dojo.isFunction(convertObject["convert"])) {
                            this.converter = convertObject;
                        }
                    }
                }
                if (dojo.isString(this.converter)) {
                    var converterClass = dojox.wire._getClass(this.converter);
                    if (converterClass) {
                        this.converter = new converterClass();
                    } else {
                        this.converter = undefined;
                    }
                }
            } else {
                if (dojo.isFunction(this.converter)) {
                    this.converter = {convert:this.converter};
                }
            }
        }
    }, getValue:function (defaultObject) {
        var object = undefined;
        if (dojox.wire.isWire(this.object)) {
            object = this.object.getValue(defaultObject);
        } else {
            object = (this.object || defaultObject);
        }
        if (this.property) {
            var list = this.property.split(".");
            for (var i in list) {
                if (!object) {
                    return object;
                }
                object = this._getPropertyValue(object, list[i]);
            }
        }
        var value = undefined;
        if (this._getValue) {
            value = this._getValue(object);
        } else {
            value = object;
        }
        if (value) {
            if (this.type) {
                if (this.type == "string") {
                    value = value.toString();
                } else {
                    if (this.type == "number") {
                        value = parseInt(value, 10);
                    } else {
                        if (this.type == "boolean") {
                            value = (value != "false");
                        } else {
                            if (this.type == "array") {
                                if (!dojo.isArray(value)) {
                                    value = [value];
                                }
                            }
                        }
                    }
                }
            }
            if (this.converter && this.converter.convert) {
                value = this.converter.convert(value, this);
            }
        }
        return value;
    }, setValue:function (value, defaultObject) {
        var object = undefined;
        if (dojox.wire.isWire(this.object)) {
            object = this.object.getValue(defaultObject);
        } else {
            object = (this.object || defaultObject);
        }
        var property = undefined;
        var o;
        if (this.property) {
            if (!object) {
                if (dojox.wire.isWire(this.object)) {
                    object = {};
                    this.object.setValue(object, defaultObject);
                } else {
                    throw new Error(this._wireClass + ".setValue(): invalid object");
                }
            }
            var list = this.property.split(".");
            var last = list.length - 1;
            for (var i = 0; i < last; i++) {
                var p = list[i];
                o = this._getPropertyValue(object, p);
                if (!o) {
                    o = {};
                    this._setPropertyValue(object, p, o);
                }
                object = o;
            }
            property = list[last];
        }
        if (this._setValue) {
            if (property) {
                o = this._getPropertyValue(object, property);
                if (!o) {
                    o = {};
                    this._setPropertyValue(object, property, o);
                }
                object = o;
            }
            var newObject = this._setValue(object, value);
            if (!object && newObject) {
                if (dojox.wire.isWire(this.object)) {
                    this.object.setValue(newObject, defaultObject);
                } else {
                    throw new Error(this._wireClass + ".setValue(): invalid object");
                }
            }
        } else {
            if (property) {
                this._setPropertyValue(object, property, value);
            } else {
                if (dojox.wire.isWire(this.object)) {
                    this.object.setValue(value, defaultObject);
                } else {
                    throw new Error(this._wireClass + ".setValue(): invalid property");
                }
            }
        }
    }, _getPropertyValue:function (object, property) {
        var value = undefined;
        var i1 = property.indexOf("[");
        if (i1 >= 0) {
            var i2 = property.indexOf("]");
            var index = property.substring(i1 + 1, i2);
            var array = null;
            if (i1 === 0) {
                array = object;
            } else {
                property = property.substring(0, i1);
                array = this._getPropertyValue(object, property);
                if (array && !dojo.isArray(array)) {
                    array = [array];
                }
            }
            if (array) {
                value = array[index];
            }
        } else {
            if (object.getPropertyValue) {
                value = object.getPropertyValue(property);
            } else {
                var getter = "get" + property.charAt(0).toUpperCase() + property.substring(1);
                if (this._useGet(object)) {
                    value = object.get(property);
                } else {
                    if (this._useAttr(object)) {
                        value = object.attr(property);
                    } else {
                        if (object[getter]) {
                            value = object[getter]();
                        } else {
                            value = object[property];
                        }
                    }
                }
            }
        }
        return value;
    }, _setPropertyValue:function (object, property, value) {
        var i1 = property.indexOf("[");
        if (i1 >= 0) {
            var i2 = property.indexOf("]");
            var index = property.substring(i1 + 1, i2);
            var array = null;
            if (i1 === 0) {
                array = object;
            } else {
                property = property.substring(0, i1);
                array = this._getPropertyValue(object, property);
                if (!array) {
                    array = [];
                    this._setPropertyValue(object, property, array);
                }
            }
            array[index] = value;
        } else {
            if (object.setPropertyValue) {
                object.setPropertyValue(property, value);
            } else {
                var setter = "set" + property.charAt(0).toUpperCase() + property.substring(1);
                if (this._useSet(object)) {
                    object.set(property, value);
                } else {
                    if (this._useAttr(object)) {
                        object.attr(property, value);
                    } else {
                        if (object[setter]) {
                            object[setter](value);
                        } else {
                            object[property] = value;
                        }
                    }
                }
            }
        }
    }, _useGet:function (object) {
        var useGet = false;
        if (dojo.isFunction(object.get)) {
            useGet = true;
        }
        return useGet;
    }, _useSet:function (object) {
        var useSet = false;
        if (dojo.isFunction(object.set)) {
            useSet = true;
        }
        return useSet;
    }, _useAttr:function (object) {
        var useAttr = false;
        if (dojo.isFunction(object.attr)) {
            useAttr = true;
        }
        return useAttr;
    }});
});

