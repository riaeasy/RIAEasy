//>>built

define("dijit/form/_ListMouseMixin", ["dojo/_base/declare", "dojo/on", "dojo/touch", "./_ListBase"], function (declare, on, touch, _ListBase) {
    return declare("dijit.form._ListMouseMixin", _ListBase, {postCreate:function () {
        this.inherited(arguments);
        this.domNode.dojoClick = true;
        this._listConnect("click", "_onClick");
        this._listConnect("mousedown", "_onMouseDown");
        this._listConnect("mouseup", "_onMouseUp");
        this._listConnect("mouseover", "_onMouseOver");
        this._listConnect("mouseout", "_onMouseOut");
    }, _onClick:function (evt, target) {
        this._setSelectedAttr(target, false);
        if (this._deferredClick) {
            this._deferredClick.remove();
        }
        this._deferredClick = this.defer(function () {
            this._deferredClick = null;
            this.onClick(target);
        });
    }, _onMouseDown:function (evt, target) {
        if (this._hoveredNode) {
            this.onUnhover(this._hoveredNode);
            this._hoveredNode = null;
        }
        this._isDragging = true;
        this._setSelectedAttr(target, false);
    }, _onMouseUp:function (evt, target) {
        this._isDragging = false;
        var selectedNode = this.selected;
        var hoveredNode = this._hoveredNode;
        if (selectedNode && target == selectedNode) {
            this.defer(function () {
                this._onClick(evt, selectedNode);
            });
        } else {
            if (hoveredNode) {
                this.defer(function () {
                    this._onClick(evt, hoveredNode);
                });
            }
        }
    }, _onMouseOut:function (evt, target) {
        if (this._hoveredNode) {
            this.onUnhover(this._hoveredNode);
            this._hoveredNode = null;
        }
        if (this._isDragging) {
            this._cancelDrag = (new Date()).getTime() + 1000;
        }
    }, _onMouseOver:function (evt, target) {
        if (this._cancelDrag) {
            var time = (new Date()).getTime();
            if (time > this._cancelDrag) {
                this._isDragging = false;
            }
            this._cancelDrag = null;
        }
        this._hoveredNode = target;
        this.onHover(target);
        if (this._isDragging) {
            this._setSelectedAttr(target, false);
        }
    }});
});

