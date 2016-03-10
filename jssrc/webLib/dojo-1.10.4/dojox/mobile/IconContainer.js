//>>built

define("dojox/mobile/IconContainer", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-construct", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "./IconItem", "./Heading", "./View"], function (array, declare, lang, win, domConstruct, Contained, Container, WidgetBase, IconItem, Heading, View) {
    return declare("dojox.mobile.IconContainer", [WidgetBase, Container, Contained], {defaultIcon:"", transition:"below", pressedIconOpacity:0.4, iconBase:"", iconPos:"", back:"Home", label:"My Application", single:false, editable:false, tag:"ul", baseClass:"mblIconContainer", editableMixinClass:"dojox/mobile/_EditableIconMixin", iconItemPaneContainerClass:"dojox/mobile/Container", iconItemPaneContainerProps:null, iconItemPaneClass:"dojox/mobile/_IconItemPane", iconItemPaneProps:null, buildRendering:function () {
        this.domNode = this.containerNode = this.srcNodeRef || domConstruct.create(this.tag);
        this._terminator = domConstruct.create(this.tag === "ul" ? "li" : "div", {className:"mblIconItemTerminator"}, this.domNode);
        this.inherited(arguments);
    }, postCreate:function () {
        if (this.editable && !this.startEdit) {
            require([this.editableMixinClass], lang.hitch(this, function (module) {
                declare.safeMixin(this, new module());
                this.set("editable", this.editable);
            }));
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        require([this.iconItemPaneContainerClass], lang.hitch(this, function (module) {
            this.paneContainerWidget = new module(this.iconItemPaneContainerProps);
            if (this.transition === "below") {
                domConstruct.place(this.paneContainerWidget.domNode, this.domNode, "after");
            } else {
                var view = this.appView = new View({id:this.id + "_mblApplView"});
                var _this = this;
                view.onAfterTransitionIn = function (moveTo, dir, transition, context, method) {
                    _this._opening._open_1();
                };
                view.domNode.style.visibility = "hidden";
                var heading = view._heading = new Heading({back:this._cv ? this._cv(this.back) : this.back, label:this._cv ? this._cv(this.label) : this.label, moveTo:this.domNode.parentNode.id, transition:this.transition == "zoomIn" ? "zoomOut" : this.transition});
                view.addChild(heading);
                view.addChild(this.paneContainerWidget);
                var target;
                for (var w = this.getParent(); w; w = w.getParent()) {
                    if (w instanceof View) {
                        target = w.domNode.parentNode;
                        break;
                    }
                }
                if (!target) {
                    target = win.body();
                }
                target.appendChild(view.domNode);
                view.startup();
            }
        }));
        this.inherited(arguments);
    }, closeAll:function () {
        array.forEach(this.getChildren(), function (w) {
            w.close(true);
        }, this);
    }, addChild:function (widget, insertIndex) {
        this.inherited(arguments);
        if (this._started && widget.paneWidget && !widget.paneWidget.getParent()) {
            this.paneContainerWidget.addChild(widget.paneWidget, insertIndex);
        }
        this.domNode.appendChild(this._terminator);
    }, removeChild:function (widget) {
        var index = (typeof widget == "number") ? widget : widget.getIndexInParent();
        this.paneContainerWidget.removeChild(index);
        this.inherited(arguments);
    }, _setLabelAttr:function (text) {
        if (!this.appView) {
            return;
        }
        this.label = text;
        var s = this._cv ? this._cv(text) : text;
        this.appView._heading.set("label", s);
    }});
});

