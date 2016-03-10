//>>built

require({cache:{"url:dijit/layout/templates/AccordionButton.html":"<div data-dojo-attach-event='ondijitclick:_onTitleClick' class='dijitAccordionTitle' role=\"presentation\">\n\t<div data-dojo-attach-point='titleNode,focusNode' data-dojo-attach-event='onkeydown:_onTitleKeyDown'\n\t\t\tclass='dijitAccordionTitleFocus' role=\"tab\" aria-expanded=\"false\"\n\t\t><span class='dijitInline dijitAccordionArrow' role=\"presentation\"></span\n\t\t><span class='arrowTextUp' role=\"presentation\">+</span\n\t\t><span class='arrowTextDown' role=\"presentation\">-</span\n\t\t><span role=\"presentation\" class=\"dijitInline dijitIcon\" data-dojo-attach-point=\"iconNode\"></span>\n\t\t<span role=\"presentation\" data-dojo-attach-point='titleTextNode, textDirNode' class='dijitAccordionText'></span>\n\t</div>\n</div>\n"}});
define("dijit/layout/AccordionContainer", ["require", "dojo/_base/array", "dojo/_base/declare", "dojo/_base/fx", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/keys", "dojo/_base/lang", "dojo/sniff", "dojo/topic", "../focus", "../_base/manager", "dojo/ready", "../_Widget", "../_Container", "../_TemplatedMixin", "../_CssStateMixin", "./StackContainer", "./ContentPane", "dojo/text!./templates/AccordionButton.html", "../a11yclick"], function (require, array, declare, fx, dom, domAttr, domClass, domConstruct, domGeometry, keys, lang, has, topic, focus, manager, ready, _Widget, _Container, _TemplatedMixin, _CssStateMixin, StackContainer, ContentPane, template) {
    var AccordionButton = declare("dijit.layout._AccordionButton", [_Widget, _TemplatedMixin, _CssStateMixin], {templateString:template, label:"", _setLabelAttr:{node:"titleTextNode", type:"innerHTML"}, title:"", _setTitleAttr:{node:"titleTextNode", type:"attribute", attribute:"title"}, iconClassAttr:"", _setIconClassAttr:{node:"iconNode", type:"class"}, baseClass:"dijitAccordionTitle", getParent:function () {
        return this.parent;
    }, buildRendering:function () {
        this.inherited(arguments);
        var titleTextNodeId = this.id.replace(" ", "_");
        domAttr.set(this.titleTextNode, "id", titleTextNodeId + "_title");
        this.focusNode.setAttribute("aria-labelledby", domAttr.get(this.titleTextNode, "id"));
        dom.setSelectable(this.domNode, false);
    }, getTitleHeight:function () {
        return domGeometry.getMarginSize(this.domNode).h;
    }, _onTitleClick:function () {
        var parent = this.getParent();
        parent.selectChild(this.contentWidget, true);
        focus.focus(this.focusNode);
    }, _onTitleKeyDown:function (evt) {
        return this.getParent()._onKeyDown(evt, this.contentWidget);
    }, _setSelectedAttr:function (isSelected) {
        this._set("selected", isSelected);
        this.focusNode.setAttribute("aria-expanded", isSelected ? "true" : "false");
        this.focusNode.setAttribute("aria-selected", isSelected ? "true" : "false");
        this.focusNode.setAttribute("tabIndex", isSelected ? "0" : "-1");
    }});
    if (0) {
        AccordionButton.extend({_setLabelAttr:function (label) {
            this._set("label", label);
            domAttr.set(this.titleTextNode, "innerHTML", label);
            this.applyTextDir(this.titleTextNode);
        }, _setTitleAttr:function (title) {
            this._set("title", title);
            domAttr.set(this.titleTextNode, "title", title);
            this.applyTextDir(this.titleTextNode);
        }});
    }
    var AccordionInnerContainer = declare("dijit.layout._AccordionInnerContainer" + (0 ? "_NoBidi" : ""), [_Widget, _CssStateMixin], {baseClass:"dijitAccordionInnerContainer", isLayoutContainer:true, buildRendering:function () {
        this.domNode = domConstruct.place("<div class='" + this.baseClass + "' role='presentation'>", this.contentWidget.domNode, "after");
        var child = this.contentWidget, cls = lang.isString(this.buttonWidget) ? lang.getObject(this.buttonWidget) : this.buttonWidget;
        this.button = child._buttonWidget = (new cls({contentWidget:child, label:child.title, title:child.tooltip, dir:child.dir, lang:child.lang, textDir:child.textDir || this.textDir, iconClass:child.iconClass, id:child.id + "_button", parent:this.parent})).placeAt(this.domNode);
        this.containerNode = domConstruct.place("<div class='dijitAccordionChildWrapper' role='tabpanel' style='display:none'>", this.domNode);
        this.containerNode.setAttribute("aria-labelledby", this.button.id);
        domConstruct.place(this.contentWidget.domNode, this.containerNode);
    }, postCreate:function () {
        this.inherited(arguments);
        var button = this.button, cw = this.contentWidget;
        this._contentWidgetWatches = [cw.watch("title", lang.hitch(this, function (name, oldValue, newValue) {
            button.set("label", newValue);
        })), cw.watch("tooltip", lang.hitch(this, function (name, oldValue, newValue) {
            button.set("title", newValue);
        })), cw.watch("iconClass", lang.hitch(this, function (name, oldValue, newValue) {
            button.set("iconClass", newValue);
        }))];
    }, _setSelectedAttr:function (isSelected) {
        this._set("selected", isSelected);
        this.button.set("selected", isSelected);
        if (isSelected) {
            var cw = this.contentWidget;
            if (cw.onSelected) {
                cw.onSelected();
            }
        }
    }, startup:function () {
        this.contentWidget.startup();
    }, destroy:function () {
        this.button.destroyRecursive();
        array.forEach(this._contentWidgetWatches || [], function (w) {
            w.unwatch();
        });
        delete this.contentWidget._buttonWidget;
        delete this.contentWidget._wrapperWidget;
        this.inherited(arguments);
    }, destroyDescendants:function (preserveDom) {
        this.contentWidget.destroyRecursive(preserveDom);
    }});
    if (0) {
        AccordionInnerContainer = declare("dijit.layout._AccordionInnerContainer", AccordionInnerContainer, {postCreate:function () {
            this.inherited(arguments);
            var button = this.button;
            this._contentWidgetWatches.push(this.contentWidget.watch("textDir", function (name, oldValue, newValue) {
                button.set("textDir", newValue);
            }));
        }});
    }
    var AccordionContainer = declare("dijit.layout.AccordionContainer", StackContainer, {duration:manager.defaultDuration, buttonWidget:AccordionButton, baseClass:"dijitAccordionContainer", buildRendering:function () {
        this.inherited(arguments);
        this.domNode.style.overflow = "hidden";
        this.domNode.setAttribute("role", "tablist");
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        if (this.selectedChildWidget) {
            this.selectedChildWidget._wrapperWidget.set("selected", true);
        }
    }, layout:function () {
        var openPane = this.selectedChildWidget;
        if (!openPane) {
            return;
        }
        var wrapperDomNode = openPane._wrapperWidget.domNode, wrapperDomNodeMargin = domGeometry.getMarginExtents(wrapperDomNode), wrapperDomNodePadBorder = domGeometry.getPadBorderExtents(wrapperDomNode), wrapperContainerNode = openPane._wrapperWidget.containerNode, wrapperContainerNodeMargin = domGeometry.getMarginExtents(wrapperContainerNode), wrapperContainerNodePadBorder = domGeometry.getPadBorderExtents(wrapperContainerNode), mySize = this._contentBox;
        var totalCollapsedHeight = 0;
        array.forEach(this.getChildren(), function (child) {
            if (child != openPane) {
                totalCollapsedHeight += domGeometry.getMarginSize(child._wrapperWidget.domNode).h;
            }
        });
        this._verticalSpace = mySize.h - totalCollapsedHeight - wrapperDomNodeMargin.h - wrapperDomNodePadBorder.h - wrapperContainerNodeMargin.h - wrapperContainerNodePadBorder.h - openPane._buttonWidget.getTitleHeight();
        this._containerContentBox = {h:this._verticalSpace, w:this._contentBox.w - wrapperDomNodeMargin.w - wrapperDomNodePadBorder.w - wrapperContainerNodeMargin.w - wrapperContainerNodePadBorder.w};
        if (openPane) {
            openPane.resize(this._containerContentBox);
        }
    }, _setupChild:function (child) {
        child._wrapperWidget = AccordionInnerContainer({contentWidget:child, buttonWidget:this.buttonWidget, id:child.id + "_wrapper", dir:child.dir, lang:child.lang, textDir:child.textDir || this.textDir, parent:this});
        this.inherited(arguments);
        domConstruct.place(child.domNode, child._wrapper, "replace");
    }, removeChild:function (child) {
        if (child._wrapperWidget) {
            domConstruct.place(child.domNode, child._wrapperWidget.domNode, "after");
            child._wrapperWidget.destroy();
            delete child._wrapperWidget;
        }
        domClass.remove(child.domNode, "dijitHidden");
        this.inherited(arguments);
    }, getChildren:function () {
        return array.map(this.inherited(arguments), function (child) {
            return child.declaredClass == "dijit.layout._AccordionInnerContainer" ? child.contentWidget : child;
        }, this);
    }, destroy:function () {
        if (this._animation) {
            this._animation.stop();
        }
        array.forEach(this.getChildren(), function (child) {
            if (child._wrapperWidget) {
                child._wrapperWidget.destroy();
            } else {
                child.destroyRecursive();
            }
        });
        this.inherited(arguments);
    }, _showChild:function (child) {
        child._wrapperWidget.containerNode.style.display = "block";
        return this.inherited(arguments);
    }, _hideChild:function (child) {
        child._wrapperWidget.containerNode.style.display = "none";
        this.inherited(arguments);
    }, _transition:function (newWidget, oldWidget, animate) {
        if (has("ie") < 8) {
            animate = false;
        }
        if (this._animation) {
            this._animation.stop(true);
            delete this._animation;
        }
        var self = this;
        if (newWidget) {
            newWidget._wrapperWidget.set("selected", true);
            var d = this._showChild(newWidget);
            if (this.doLayout && newWidget.resize) {
                newWidget.resize(this._containerContentBox);
            }
        }
        if (oldWidget) {
            oldWidget._wrapperWidget.set("selected", false);
            if (!animate) {
                this._hideChild(oldWidget);
            }
        }
        if (animate) {
            var newContents = newWidget._wrapperWidget.containerNode, oldContents = oldWidget._wrapperWidget.containerNode;
            var wrapperContainerNode = newWidget._wrapperWidget.containerNode, wrapperContainerNodeMargin = domGeometry.getMarginExtents(wrapperContainerNode), wrapperContainerNodePadBorder = domGeometry.getPadBorderExtents(wrapperContainerNode), animationHeightOverhead = wrapperContainerNodeMargin.h + wrapperContainerNodePadBorder.h;
            oldContents.style.height = (self._verticalSpace - animationHeightOverhead) + "px";
            this._animation = new fx.Animation({node:newContents, duration:this.duration, curve:[1, this._verticalSpace - animationHeightOverhead - 1], onAnimate:function (value) {
                value = Math.floor(value);
                newContents.style.height = value + "px";
                oldContents.style.height = (self._verticalSpace - animationHeightOverhead - value) + "px";
            }, onEnd:function () {
                delete self._animation;
                newContents.style.height = "auto";
                oldWidget._wrapperWidget.containerNode.style.display = "none";
                oldContents.style.height = "auto";
                self._hideChild(oldWidget);
            }});
            this._animation.onStop = this._animation.onEnd;
            this._animation.play();
        }
        return d;
    }, _onKeyDown:function (e, fromTitle) {
        if (this.disabled || e.altKey || !(fromTitle || e.ctrlKey)) {
            return;
        }
        var c = e.keyCode;
        if ((fromTitle && (c == keys.LEFT_ARROW || c == keys.UP_ARROW)) || (e.ctrlKey && c == keys.PAGE_UP)) {
            this._adjacent(false)._buttonWidget._onTitleClick();
            e.stopPropagation();
            e.preventDefault();
        } else {
            if ((fromTitle && (c == keys.RIGHT_ARROW || c == keys.DOWN_ARROW)) || (e.ctrlKey && (c == keys.PAGE_DOWN || c == keys.TAB))) {
                this._adjacent(true)._buttonWidget._onTitleClick();
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }});
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/layout/AccordionPane"];
            require(requires);
        });
    }
    AccordionContainer._InnerContainer = AccordionInnerContainer;
    AccordionContainer._Button = AccordionButton;
    return AccordionContainer;
});

