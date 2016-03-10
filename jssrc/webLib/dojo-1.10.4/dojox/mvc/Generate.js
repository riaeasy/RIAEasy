//>>built

define("dojox/mvc/Generate", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "./_Container", "./at", "./Group", "dijit/form/TextBox"], function (array, lang, declare, Container, at) {
    return declare("dojox.mvc.Generate", [Container], {_counter:0, _defaultWidgetMapping:{"String":"dijit/form/TextBox"}, _defaultClassMapping:{"Label":"generate-label-cell", "String":"generate-dijit-cell", "Heading":"generate-heading", "Row":"row"}, _defaultIdNameMapping:{"String":"textbox_t"}, children:null, _relTargetProp:"children", startup:function () {
        this.inherited(arguments);
        this._setChildrenAttr(this.children);
    }, _setChildrenAttr:function (value) {
        var children = this.children;
        this._set("children", value);
        if (this.binding != value) {
            this.set("ref", value);
        }
        if (this._started && (!this._builtOnce || children != value)) {
            this._builtOnce = true;
            this._buildContained(value);
        }
    }, _buildContained:function (children) {
        if (!children) {
            return;
        }
        this._destroyBody();
        this._counter = 0;
        this.srcNodeRef.innerHTML = this._generateBody(children);
        this._createBody();
    }, _generateBody:function (children, hideHeading) {
        if (children === void 0) {
            return "";
        }
        var body = [];
        var isStatefulModel = lang.isFunction(children.toPlainObject);
        function generateElement(value, prop) {
            if (isStatefulModel ? (value && lang.isFunction(value.toPlainObject)) : !lang.isFunction(value)) {
                if (lang.isArray(value)) {
                    body.push(this._generateRepeat(value, prop));
                } else {
                    if (isStatefulModel ? value.value : ((value == null || {}.toString.call(value) != "[object Object]") && (!(value || {}).set || !(value || {}).watch))) {
                        body.push(this._generateTextBox(prop, isStatefulModel));
                    } else {
                        body.push(this._generateGroup(value, prop, hideHeading));
                    }
                }
            }
        }
        if (lang.isArray(children)) {
            array.forEach(children, generateElement, this);
        } else {
            for (var s in children) {
                if (children.hasOwnProperty(s)) {
                    generateElement.call(this, children[s], s);
                }
            }
        }
        return body.join("");
    }, _generateRepeat:function (children, repeatHeading) {
        var headingClass = (this.classMapping && this.classMapping["Heading"]) ? this.classMapping["Heading"] : this._defaultClassMapping["Heading"];
        return "<div data-dojo-type=\"dojox/mvc/Group\" data-dojo-props=\"target: at('rel:', '" + repeatHeading + "')\" + id=\"" + this.id + "_r" + this._counter++ + "\">" + "<div class=\"" + headingClass + "\">" + repeatHeading + "</div>" + this._generateBody(children, true) + "</div>";
    }, _generateGroup:function (model, groupHeading, hideHeading) {
        var html = ["<div data-dojo-type=\"dojox/mvc/Group\" data-dojo-props=\"target: at('rel:', '" + groupHeading + "')\" + id=\"" + this.id + "_g" + this._counter++ + "\">"];
        if (!hideHeading) {
            var headingClass = (this.classMapping && this.classMapping["Heading"]) ? this.classMapping["Heading"] : this._defaultClassMapping["Heading"];
            html.push("<div class=\"" + headingClass + "\">" + groupHeading + "</div>");
        }
        html.push(this._generateBody(model) + "</div>");
        return html.join("");
    }, _generateTextBox:function (prop, referToValue) {
        var idname = this.idNameMapping ? this.idNameMapping["String"] : this._defaultIdNameMapping["String"];
        idname = idname + this._counter++;
        var widClass = this.widgetMapping ? this.widgetMapping["String"] : this._defaultWidgetMapping["String"];
        var labelClass = (this.classMapping && this.classMapping["Label"]) ? this.classMapping["Label"] : this._defaultClassMapping["Label"];
        var stringClass = (this.classMapping && this.classMapping["String"]) ? this.classMapping["String"] : this._defaultClassMapping["String"];
        var rowClass = (this.classMapping && this.classMapping["Row"]) ? this.classMapping["Row"] : this._defaultClassMapping["Row"];
        var bindingSyntax = "value: at('rel:" + (referToValue && prop || "") + "', '" + (referToValue ? "value" : prop) + "')";
        return "<div class=\"" + rowClass + "\">" + "<label class=\"" + labelClass + "\">" + prop + ":</label>" + "<input class=\"" + stringClass + "\" data-dojo-type=\"" + widClass + "\"" + " data-dojo-props=\"name: '" + idname + "', " + bindingSyntax + "\" id=\"" + idname + "\"></input>" + "</div>";
    }});
});

