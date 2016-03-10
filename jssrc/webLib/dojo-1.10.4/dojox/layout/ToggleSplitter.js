//>>built

define("dojox/layout/ToggleSplitter", ["dojo", "dijit", "dijit/layout/BorderContainer"], function (dojo, dijit) {
    dojo.experimental("dojox.layout.ToggleSplitter");
    var ToggleSplitter = dojo.declare("dojox.layout.ToggleSplitter", dijit.layout._Splitter, {container:null, child:null, region:null, state:"full", _closedSize:"0", baseClass:"dojoxToggleSplitter", templateString:"<div class=\"dijitSplitter dojoxToggleSplitter\" dojoAttachEvent=\"onkeypress:_onKeyPress,onmousedown:_startDrag,onmouseenter:_onMouse,onmouseleave:_onMouse\">" + "<div dojoAttachPoint=\"toggleNode\" class=\"dijitSplitterThumb dojoxToggleSplitterIcon\" tabIndex=\"0\" role=\"separator\" " + "dojoAttachEvent=\"onmousedown:_onToggleNodeMouseDown,onclick:_toggle,onmouseenter:_onToggleNodeMouseMove,onmouseleave:_onToggleNodeMouseMove,onfocus:_onToggleNodeMouseMove,onblur:_onToggleNodeMouseMove\">" + "<span class=\"dojoxToggleSplitterA11y\" dojoAttachPoint=\"a11yText\"></span></div>" + "</div>", postCreate:function () {
        this.inherited(arguments);
        var region = this.region;
        dojo.addClass(this.domNode, this.baseClass + region.charAt(0).toUpperCase() + region.substring(1));
    }, startup:function () {
        this.inherited(arguments);
        var parentPane = this.child, paneNode = this.child.domNode, intPaneSize = dojo.style(paneNode, (this.horizontal ? "height" : "width"));
        this.domNode.setAttribute("aria-controls", paneNode.id);
        dojo.forEach(["toggleSplitterState", "toggleSplitterFullSize", "toggleSplitterCollapsedSize"], function (name) {
            var pname = name.substring("toggleSplitter".length);
            pname = pname.charAt(0).toLowerCase() + pname.substring(1);
            if (name in this.child) {
                this[pname] = this.child[name];
            }
        }, this);
        if (!this.fullSize) {
            this.fullSize = this.state == "full" ? intPaneSize + "px" : "75px";
        }
        this._openStyleProps = this._getStyleProps(paneNode, "full");
        this._started = true;
        this.set("state", this.state);
        return this;
    }, _onKeyPress:function (evt) {
        if (this.state == "full") {
            this.inherited(arguments);
        }
        if (evt.charCode == dojo.keys.SPACE || evt.keyCode == dojo.keys.ENTER) {
            this._toggle(evt);
            dojo.stopEvent(evt);
        }
    }, _onToggleNodeMouseDown:function (evt) {
        dojo.stopEvent(evt);
        this.toggleNode.focus();
    }, _startDrag:function (e) {
        if (this.state == "full") {
            this.inherited(arguments);
        }
    }, _stopDrag:function (e) {
        this.inherited(arguments);
        this.toggleNode.blur();
    }, _toggle:function (evt) {
        var state;
        switch (this.state) {
          case "full":
            state = this.collapsedSize ? "collapsed" : "closed";
            break;
          case "collapsed":
            state = "closed";
            break;
          default:
            state = "full";
        }
        this.set("state", state);
    }, _onToggleNodeMouseMove:function (evt) {
        var baseClass = this.baseClass, toggleNode = this.toggleNode, on = this.state == "full" || this.state == "collapsed", leave = evt.type == "mouseout" || evt.type == "blur";
        dojo.toggleClass(toggleNode, baseClass + "IconOpen", leave && on);
        dojo.toggleClass(toggleNode, baseClass + "IconOpenHover", !leave && on);
        dojo.toggleClass(toggleNode, baseClass + "IconClosed", leave && !on);
        dojo.toggleClass(toggleNode, baseClass + "IconClosedHover", !leave && !on);
    }, _handleOnChange:function (preState) {
        var paneNode = this.child.domNode, openProps, paneStyle, dim = this.horizontal ? "height" : "width";
        if (this.state == "full") {
            var styleProps = dojo.mixin({display:"block", overflow:"auto", visibility:"visible"}, this._openStyleProps);
            styleProps[dim] = (this._openStyleProps && this._openStyleProps[dim]) ? this._openStyleProps[dim] : this.fullSize;
            dojo.style(this.domNode, "cursor", "");
            dojo.style(paneNode, styleProps);
        } else {
            if (this.state == "collapsed") {
                paneStyle = dojo.getComputedStyle(paneNode);
                openProps = this._getStyleProps(paneNode, "full", paneStyle);
                this._openStyleProps = openProps;
                dojo.style(this.domNode, "cursor", "auto");
                dojo.style(paneNode, dim, this.collapsedSize);
            } else {
                if (!this.collapsedSize) {
                    paneStyle = dojo.getComputedStyle(paneNode);
                    openProps = this._getStyleProps(paneNode, "full", paneStyle);
                    this._openStyleProps = openProps;
                }
                var closedProps = this._getStyleProps(paneNode, "closed", paneStyle);
                dojo.style(this.domNode, "cursor", "auto");
                dojo.style(paneNode, closedProps);
            }
        }
        this._setStateClass();
        if (this.container._started) {
            this.container._layoutChildren(this.region);
        }
    }, _getStyleProps:function (paneNode, state, paneStyle) {
        if (!paneStyle) {
            paneStyle = dojo.getComputedStyle(paneNode);
        }
        var styleProps = {}, dim = this.horizontal ? "height" : "width";
        styleProps["overflow"] = (state != "closed") ? paneStyle["overflow"] : "hidden";
        styleProps["visibility"] = (state != "closed") ? paneStyle["visibility"] : "hidden";
        styleProps[dim] = (state != "closed") ? paneNode.style[dim] || paneStyle[dim] : this._closedSize;
        var edgeNames = ["Top", "Right", "Bottom", "Left"];
        dojo.forEach(["padding", "margin", "border"], function (pname) {
            for (var i = 0; i < edgeNames.length; i++) {
                var fullName = pname + edgeNames[i];
                if (pname == "border") {
                    fullName += "Width";
                }
                if (undefined !== paneStyle[fullName]) {
                    styleProps[fullName] = (state != "closed") ? paneStyle[fullName] : 0;
                }
            }
        });
        return styleProps;
    }, _setStateClass:function () {
        var arrow = "&#9652", region = this.region.toLowerCase(), baseClass = this.baseClass, toggleNode = this.toggleNode, on = this.state == "full" || this.state == "collapsed", focused = this.focused;
        dojo.toggleClass(toggleNode, baseClass + "IconOpen", on && !focused);
        dojo.toggleClass(toggleNode, baseClass + "IconClosed", !on && !focused);
        dojo.toggleClass(toggleNode, baseClass + "IconOpenHover", on && focused);
        dojo.toggleClass(toggleNode, baseClass + "IconClosedHover", !on && focused);
        if (region == "top" && on || region == "bottom" && !on) {
            arrow = "&#9650";
        } else {
            if (region == "top" && !on || region == "bottom" && on) {
                arrow = "&#9660";
            } else {
                if (region == "right" && on || region == "left" && !on) {
                    arrow = "&#9654";
                } else {
                    if (region == "right" && !on || region == "left" && on) {
                        arrow = "&#9664";
                    }
                }
            }
        }
        this.a11yText.innerHTML = arrow;
    }, _setStateAttr:function (state) {
        if (!this._started) {
            return;
        }
        var preState = this.state;
        this.state = state;
        this._handleOnChange(preState);
        var evtName;
        switch (state) {
          case "full":
            this.domNode.setAttribute("aria-expanded", true);
            evtName = "onOpen";
            break;
          case "collapsed":
            this.domNode.setAttribute("aria-expanded", true);
            evtName = "onCollapsed";
            break;
          default:
            this.domNode.setAttribute("aria-expanded", false);
            evtName = "onClosed";
        }
        this[evtName](this.child);
    }, onOpen:function (pane) {
    }, onCollapsed:function (pane) {
    }, onClosed:function (pane) {
    }});
    dojo.extend(dijit._Widget, {toggleSplitterState:"full", toggleSplitterFullSize:"", toggleSplitterCollapsedSize:""});
    return ToggleSplitter;
});

