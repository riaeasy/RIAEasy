//>>built

define("dojox/layout/TableContainer", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "dojo/_base/array", "dojo/dom-prop", "dojo/dom-style", "dijit/_WidgetBase", "dijit/layout/_LayoutWidget"], function (kernel, lang, declare, domClass, domConstruct, arrayUtil, domProp, domStyle, _WidgetBase, _LayoutWidget) {
    kernel.experimental("dojox.layout.TableContainer");
    var TableContainer = declare("dojox.layout.TableContainer", _LayoutWidget, {cols:1, labelWidth:"100", showLabels:true, orientation:"horiz", spacing:1, customClass:"", postCreate:function () {
        this.inherited(arguments);
        this._children = [];
        this.connect(this, "set", function (name, value) {
            if (value && (name == "orientation" || name == "customClass" || name == "cols")) {
                this.layout();
            }
        });
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        if (this._initialized) {
            return;
        }
        var children = this.getChildren();
        if (children.length < 1) {
            return;
        }
        this._initialized = true;
        domClass.add(this.domNode, "dijitTableLayout");
        arrayUtil.forEach(children, function (child) {
            if (!child.started && !child._started) {
                child.startup();
            }
        });
        this.layout();
        this.resize();
    }, resize:function () {
        arrayUtil.forEach(this.getChildren(), function (child) {
            if (typeof child.resize == "function") {
                child.resize();
            }
        });
    }, layout:function () {
        if (!this._initialized) {
            return;
        }
        var children = this.getChildren();
        var childIds = {};
        var _this = this;
        function addCustomClass(node, type, count) {
            if (_this.customClass != "") {
                var clazz = _this.customClass + "-" + (type || node.tagName.toLowerCase());
                domClass.add(node, clazz);
                if (arguments.length > 2) {
                    domClass.add(node, clazz + "-" + count);
                }
            }
        }
        arrayUtil.forEach(this._children, lang.hitch(this, function (child) {
            childIds[child.id] = child;
        }));
        arrayUtil.forEach(children, lang.hitch(this, function (child, index) {
            if (!childIds[child.id]) {
                this._children.push(child);
            }
        }));
        var table = domConstruct.create("table", {"width":"100%", "class":"tableContainer-table tableContainer-table-" + this.orientation, "cellspacing":this.spacing}, this.domNode);
        var tbody = domConstruct.create("tbody");
        table.appendChild(tbody);
        addCustomClass(table, "table", this.orientation);
        var width = Math.floor(100 / this.cols) + "%";
        var labelRow = domConstruct.create("tr", {}, tbody);
        var childRow = (!this.showLabels || this.orientation == "horiz") ? labelRow : domConstruct.create("tr", {}, tbody);
        var maxCols = this.cols * (this.showLabels ? 2 : 1);
        var numCols = 0;
        arrayUtil.forEach(this._children, lang.hitch(this, function (child, index) {
            var colspan = child.colspan || 1;
            if (colspan > 1) {
                colspan = this.showLabels ? Math.min(maxCols - 1, colspan * 2 - 1) : Math.min(maxCols, colspan);
            }
            if (numCols + colspan - 1 + (this.showLabels ? 1 : 0) >= maxCols) {
                numCols = 0;
                labelRow = domConstruct.create("tr", {}, tbody);
                childRow = this.orientation == "horiz" ? labelRow : domConstruct.create("tr", {}, tbody);
            }
            var labelCell;
            if (this.showLabels) {
                labelCell = domConstruct.create("td", {"class":"tableContainer-labelCell"}, labelRow);
                if (child.spanLabel) {
                    domProp.set(labelCell, this.orientation == "vert" ? "rowspan" : "colspan", 2);
                } else {
                    addCustomClass(labelCell, "labelCell");
                    var labelProps = {"for":child.get("id")};
                    var label = domConstruct.create("label", labelProps, labelCell);
                    if (Number(this.labelWidth) > -1 || String(this.labelWidth).indexOf("%") > -1) {
                        domStyle.set(labelCell, "width", String(this.labelWidth).indexOf("%") < 0 ? this.labelWidth + "px" : this.labelWidth);
                    }
                    label.innerHTML = child.get("label") || child.get("title");
                }
            }
            var childCell;
            if (child.spanLabel && labelCell) {
                childCell = labelCell;
            } else {
                childCell = domConstruct.create("td", {"class":"tableContainer-valueCell"}, childRow);
            }
            if (colspan > 1) {
                domProp.set(childCell, "colspan", colspan);
            }
            addCustomClass(childCell, "valueCell", index);
            childCell.appendChild(child.domNode);
            numCols += colspan + (this.showLabels ? 1 : 0);
        }));
        if (this.table) {
            this.table.parentNode.removeChild(this.table);
        }
        arrayUtil.forEach(children, function (child) {
            if (typeof child.layout == "function") {
                child.layout();
            }
        });
        this.table = table;
        this.resize();
    }, destroyDescendants:function (preserveDom) {
        arrayUtil.forEach(this._children, function (child) {
            child.destroyRecursive(preserveDom);
        });
    }, _setSpacingAttr:function (value) {
        this.spacing = value;
        if (this.table) {
            this.table.cellspacing = Number(value);
        }
    }});
    TableContainer.ChildWidgetProperties = {label:"", title:"", spanLabel:false, colspan:1};
    lang.extend(_WidgetBase, TableContainer.ChildWidgetProperties);
    return TableContainer;
});

