//>>built

define("dojox/wire/ml/Data", ["dijit", "dojo", "dojox", "dojo/require!dijit/_Widget,dijit/_Container,dojox/wire/ml/util"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.Data");
    dojo.require("dijit._Widget");
    dojo.require("dijit._Container");
    dojo.require("dojox.wire.ml.util");
    dojo.declare("dojox.wire.ml.Data", [dijit._Widget, dijit._Container], {startup:function () {
        this._initializeProperties();
    }, _initializeProperties:function (reset) {
        if (!this._properties || reset) {
            this._properties = {};
        }
        var children = this.getChildren();
        for (var i in children) {
            var child = children[i];
            if ((child instanceof dojox.wire.ml.DataProperty) && child.name) {
                this.setPropertyValue(child.name, child.getValue());
            }
        }
    }, getPropertyValue:function (property) {
        return this._properties[property];
    }, setPropertyValue:function (property, value) {
        this._properties[property] = value;
    }});
    dojo.declare("dojox.wire.ml.DataProperty", [dijit._Widget, dijit._Container], {name:"", type:"", value:"", _getValueAttr:function () {
        return this.getValue();
    }, getValue:function () {
        var value = this.value;
        if (this.type) {
            if (this.type == "number") {
                value = parseInt(value);
            } else {
                if (this.type == "boolean") {
                    value = (value == "true");
                } else {
                    if (this.type == "array") {
                        value = [];
                        var children = this.getChildren();
                        for (var i in children) {
                            var child = children[i];
                            if (child instanceof dojox.wire.ml.DataProperty) {
                                value.push(child.getValue());
                            }
                        }
                    } else {
                        if (this.type == "object") {
                            value = {};
                            var children = this.getChildren();
                            for (var i in children) {
                                var child = children[i];
                                if ((child instanceof dojox.wire.ml.DataProperty) && child.name) {
                                    value[child.name] = child.getValue();
                                }
                            }
                        } else {
                            if (this.type == "element") {
                                value = new dojox.wire.ml.XmlElement(value);
                                var children = this.getChildren();
                                for (var i in children) {
                                    var child = children[i];
                                    if ((child instanceof dojox.wire.ml.DataProperty) && child.name) {
                                        value.setPropertyValue(child.name, child.getValue());
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return value;
    }});
});

