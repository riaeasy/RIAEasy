//>>built

define("dijit/layout/SplitContainer", ["dojo/_base/array", "dojo/cookie", "dojo/_base/declare", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/event", "dojo/_base/kernel", "dojo/_base/lang", "dojo/on", "dojo/sniff", "../registry", "../_WidgetBase", "./_LayoutWidget"], function (array, cookie, declare, dom, domClass, domConstruct, domGeometry, domStyle, event, kernel, lang, on, has, registry, _WidgetBase, _LayoutWidget) {
    var SplitContainer = declare("dijit.layout.SplitContainer", _LayoutWidget, {constructor:function () {
        kernel.deprecated("dijit.layout.SplitContainer is deprecated", "use BorderContainer with splitter instead", 2);
    }, activeSizing:false, sizerWidth:7, orientation:"horizontal", persist:true, baseClass:"dijitSplitContainer", postMixInProperties:function () {
        this.inherited("postMixInProperties", arguments);
        this.isHorizontal = (this.orientation == "horizontal");
    }, postCreate:function () {
        this.inherited(arguments);
        this.sizers = [];
        if (has("mozilla")) {
            this.domNode.style.overflow = "-moz-scrollbars-none";
        }
        if (typeof this.sizerWidth == "object") {
            try {
                this.sizerWidth = parseInt(this.sizerWidth.toString());
            }
            catch (e) {
                this.sizerWidth = 7;
            }
        }
        var sizer = this.ownerDocument.createElement("div");
        this.virtualSizer = sizer;
        sizer.style.position = "relative";
        sizer.style.zIndex = 10;
        sizer.className = this.isHorizontal ? "dijitSplitContainerVirtualSizerH" : "dijitSplitContainerVirtualSizerV";
        this.domNode.appendChild(sizer);
        dom.setSelectable(sizer, false);
    }, destroy:function () {
        delete this.virtualSizer;
        if (this._ownconnects) {
            var h;
            while (h = this._ownconnects.pop()) {
                h.remove();
            }
        }
        this.inherited(arguments);
    }, startup:function () {
        if (this._started) {
            return;
        }
        array.forEach(this.getChildren(), function (child, i, children) {
            this._setupChild(child);
            if (i < children.length - 1) {
                this._addSizer();
            }
        }, this);
        if (this.persist) {
            this._restoreState();
        }
        this.inherited(arguments);
    }, _setupChild:function (child) {
        this.inherited(arguments);
        child.domNode.style.position = "absolute";
        domClass.add(child.domNode, "dijitSplitPane");
    }, _onSizerMouseDown:function (e) {
        if (e.target.id) {
            for (var i = 0; i < this.sizers.length; i++) {
                if (this.sizers[i].id == e.target.id) {
                    break;
                }
            }
            if (i < this.sizers.length) {
                this.beginSizing(e, i);
            }
        }
    }, _addSizer:function (index) {
        index = index === undefined ? this.sizers.length : index;
        var sizer = this.ownerDocument.createElement("div");
        sizer.id = registry.getUniqueId("dijit_layout_SplitterContainer_Splitter");
        this.sizers.splice(index, 0, sizer);
        this.domNode.appendChild(sizer);
        sizer.className = this.isHorizontal ? "dijitSplitContainerSizerH" : "dijitSplitContainerSizerV";
        var thumb = this.ownerDocument.createElement("div");
        thumb.className = "thumb";
        sizer.appendChild(thumb);
        this.connect(sizer, "onmousedown", "_onSizerMouseDown");
        dom.setSelectable(sizer, false);
    }, removeChild:function (widget) {
        if (this.sizers.length) {
            var i = array.indexOf(this.getChildren(), widget);
            if (i != -1) {
                if (i == this.sizers.length) {
                    i--;
                }
                domConstruct.destroy(this.sizers[i]);
                this.sizers.splice(i, 1);
            }
        }
        this.inherited(arguments);
        if (this._started) {
            this.layout();
        }
    }, addChild:function (child, insertIndex) {
        if (typeof insertIndex == "undefined" || insertIndex == "last") {
            insertIndex = this.getChildren().length;
        }
        this.inherited(arguments, [child, insertIndex]);
        if (this._started) {
            var children = this.getChildren();
            if (children.length > 1) {
                this._addSizer(insertIndex);
            }
            this.layout();
        }
    }, layout:function () {
        this.paneWidth = this._contentBox.w;
        this.paneHeight = this._contentBox.h;
        var children = this.getChildren();
        if (!children.length) {
            return;
        }
        var space = this.isHorizontal ? this.paneWidth : this.paneHeight;
        if (children.length > 1) {
            space -= this.sizerWidth * (children.length - 1);
        }
        var outOf = 0;
        array.forEach(children, function (child) {
            outOf += child.sizeShare;
        });
        var pixPerUnit = space / outOf;
        var totalSize = 0;
        array.forEach(children.slice(0, children.length - 1), function (child) {
            var size = Math.round(pixPerUnit * child.sizeShare);
            child.sizeActual = size;
            totalSize += size;
        });
        children[children.length - 1].sizeActual = space - totalSize;
        this._checkSizes();
        var pos = 0;
        var size = children[0].sizeActual;
        this._movePanel(children[0], pos, size);
        children[0].position = pos;
        pos += size;
        if (!this.sizers) {
            return;
        }
        array.some(children.slice(1), function (child, i) {
            if (!this.sizers[i]) {
                return true;
            }
            this._moveSlider(this.sizers[i], pos, this.sizerWidth);
            this.sizers[i].position = pos;
            pos += this.sizerWidth;
            size = child.sizeActual;
            this._movePanel(child, pos, size);
            child.position = pos;
            pos += size;
        }, this);
    }, _movePanel:function (panel, pos, size) {
        var box;
        if (this.isHorizontal) {
            panel.domNode.style.left = pos + "px";
            panel.domNode.style.top = 0;
            box = {w:size, h:this.paneHeight};
            if (panel.resize) {
                panel.resize(box);
            } else {
                domGeometry.setMarginBox(panel.domNode, box);
            }
        } else {
            panel.domNode.style.left = 0;
            panel.domNode.style.top = pos + "px";
            box = {w:this.paneWidth, h:size};
            if (panel.resize) {
                panel.resize(box);
            } else {
                domGeometry.setMarginBox(panel.domNode, box);
            }
        }
    }, _moveSlider:function (slider, pos, size) {
        if (this.isHorizontal) {
            slider.style.left = pos + "px";
            slider.style.top = 0;
            domGeometry.setMarginBox(slider, {w:size, h:this.paneHeight});
        } else {
            slider.style.left = 0;
            slider.style.top = pos + "px";
            domGeometry.setMarginBox(slider, {w:this.paneWidth, h:size});
        }
    }, _growPane:function (growth, pane) {
        if (growth > 0) {
            if (pane.sizeActual > pane.sizeMin) {
                if ((pane.sizeActual - pane.sizeMin) > growth) {
                    pane.sizeActual = pane.sizeActual - growth;
                    growth = 0;
                } else {
                    growth -= pane.sizeActual - pane.sizeMin;
                    pane.sizeActual = pane.sizeMin;
                }
            }
        }
        return growth;
    }, _checkSizes:function () {
        var totalMinSize = 0;
        var totalSize = 0;
        var children = this.getChildren();
        array.forEach(children, function (child) {
            totalSize += child.sizeActual;
            totalMinSize += child.sizeMin;
        });
        if (totalMinSize <= totalSize) {
            var growth = 0;
            array.forEach(children, function (child) {
                if (child.sizeActual < child.sizeMin) {
                    growth += child.sizeMin - child.sizeActual;
                    child.sizeActual = child.sizeMin;
                }
            });
            if (growth > 0) {
                var list = this.isDraggingLeft ? children.reverse() : children;
                array.forEach(list, function (child) {
                    growth = this._growPane(growth, child);
                }, this);
            }
        } else {
            array.forEach(children, function (child) {
                child.sizeActual = Math.round(totalSize * (child.sizeMin / totalMinSize));
            });
        }
    }, beginSizing:function (e, i) {
        var children = this.getChildren();
        this.paneBefore = children[i];
        this.paneAfter = children[i + 1];
        this.paneBefore.sizeBeforeDrag = this.paneBefore.sizeActual;
        this.paneAfter.sizeBeforeDrag = this.paneAfter.sizeActual;
        this.paneAfter.positionBeforeDrag = this.paneAfter.position;
        this.isSizing = true;
        this.sizingSplitter = this.sizers[i];
        this.sizingSplitter.positionBeforeDrag = domStyle.get(this.sizingSplitter, (this.isHorizontal ? "left" : "top"));
        if (!this.cover) {
            this.cover = domConstruct.create("div", {style:{position:"absolute", zIndex:5, top:0, left:0, width:"100%", height:"100%"}}, this.domNode);
        } else {
            this.cover.style.zIndex = 5;
        }
        this.sizingSplitter.style.zIndex = 6;
        this.startPoint = this.lastPoint = (this.isHorizontal ? e.pageX : e.pageY);
        this.maxDelta = this.paneAfter.sizeActual - this.paneAfter.sizeMin;
        this.minDelta = -1 * (this.paneBefore.sizeActual - this.paneBefore.sizeMin);
        if (!this.activeSizing) {
            this._showSizingLine();
        }
        this._ownconnects = [on(this.ownerDocument.documentElement, "mousemove", lang.hitch(this, "changeSizing")), on(this.ownerDocument.documentElement, "mouseup", lang.hitch(this, "endSizing"))];
        event.stop(e);
    }, changeSizing:function (e) {
        if (!this.isSizing) {
            return;
        }
        this.lastPoint = this.isHorizontal ? e.pageX : e.pageY;
        var delta = Math.max(Math.min(this.lastPoint - this.startPoint, this.maxDelta), this.minDelta);
        if (this.activeSizing) {
            this._updateSize(delta);
        } else {
            this._moveSizingLine(delta);
        }
        event.stop(e);
    }, endSizing:function () {
        if (!this.isSizing) {
            return;
        }
        if (this.cover) {
            this.cover.style.zIndex = -1;
        }
        if (!this.activeSizing) {
            this._hideSizingLine();
        }
        var delta = Math.max(Math.min(this.lastPoint - this.startPoint, this.maxDelta), this.minDelta);
        this._updateSize(delta);
        this.isSizing = false;
        if (this.persist) {
            this._saveState(this);
        }
        var h;
        while (h = this._ownconnects.pop()) {
            h.remove();
        }
    }, _updateSize:function (delta) {
        this.paneBefore.sizeActual = this.paneBefore.sizeBeforeDrag + delta;
        this.paneAfter.position = this.paneAfter.positionBeforeDrag + delta;
        this.paneAfter.sizeActual = this.paneAfter.sizeBeforeDrag - delta;
        array.forEach(this.getChildren(), function (child) {
            child.sizeShare = child.sizeActual;
        });
        if (this._started) {
            this.layout();
        }
    }, _showSizingLine:function () {
        this._moveSizingLine(0);
        domGeometry.setMarginBox(this.virtualSizer, this.isHorizontal ? {w:this.sizerWidth, h:this.paneHeight} : {w:this.paneWidth, h:this.sizerWidth});
        this.virtualSizer.style.display = "block";
    }, _hideSizingLine:function () {
        this.virtualSizer.style.display = "none";
    }, _moveSizingLine:function (delta) {
        var pos = delta + this.sizingSplitter.positionBeforeDrag;
        domStyle.set(this.virtualSizer, (this.isHorizontal ? "left" : "top"), pos + "px");
    }, _getCookieName:function (i) {
        return this.id + "_" + i;
    }, _restoreState:function () {
        array.forEach(this.getChildren(), function (child, i) {
            var cookieName = this._getCookieName(i);
            var cookieValue = cookie(cookieName);
            if (cookieValue) {
                var pos = parseInt(cookieValue);
                if (typeof pos == "number") {
                    child.sizeShare = pos;
                }
            }
        }, this);
    }, _saveState:function () {
        if (!this.persist) {
            return;
        }
        array.forEach(this.getChildren(), function (child, i) {
            cookie(this._getCookieName(i), child.sizeShare, {expires:365});
        }, this);
    }});
    SplitContainer.ChildWidgetProperties = {sizeMin:10, sizeShare:10};
    lang.extend(_WidgetBase, SplitContainer.ChildWidgetProperties);
    return SplitContainer;
});

