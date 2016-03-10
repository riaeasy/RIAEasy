//>>built

require({cache:{"url:dojox/calendar/templates/ColumnView.html":"<div data-dojo-attach-events=\"keydown:_onKeyDown\">\n\t\n\t<div data-dojo-attach-point=\"header\" class=\"dojoxCalendarHeader\">\n\t\t<div class=\"dojoxCalendarYearColumnHeader\" data-dojo-attach-point=\"yearColumnHeader\">\n\t\t\t<table cellspacing=\"0\" cellpadding=\"0\"><tr><td><span data-dojo-attach-point=\"yearColumnHeaderContent\"></span></td></tr></table>\t\t\n\t\t</div>\n\t\t<div data-dojo-attach-point=\"columnHeader\" class=\"dojoxCalendarColumnHeader\">\n\t\t\t<table data-dojo-attach-point=\"columnHeaderTable\" class=\"dojoxCalendarColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t</div>\n\t</div>\n\t\n\t<div data-dojo-attach-point=\"secondarySheetNode\"></div>\n\t\n\t<div data-dojo-attach-point=\"subHeader\" class=\"dojoxCalendarSubHeader\">\n\t\t<div class=\"dojoxCalendarSubRowHeader\">\n\t\t\t<table cellspacing=\"0\" cellpadding=\"0\"><tr><td></td></tr></table>\t\t\n\t\t</div>\n\t\t<div data-dojo-attach-point=\"subColumnHeader\" class=\"dojoxCalendarSubColumnHeader\">\n\t\t\t<table data-dojo-attach-point=\"subColumnHeaderTable\" class=\"dojoxCalendarSubColumnHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t</div>\n\t</div>\n\t\n\t<div data-dojo-attach-point=\"scrollContainer\" class=\"dojoxCalendarScrollContainer\">\n\t\t<div data-dojo-attach-point=\"sheetContainer\" style=\"position:relative;left:0;right:0;margin:0;padding:0\">\n\t\t\t<div data-dojo-attach-point=\"rowHeader\" class=\"dojoxCalendarRowHeader\">\n\t\t\t\t<table data-dojo-attach-point=\"rowHeaderTable\" class=\"dojoxCalendarRowHeaderTable\" cellpadding=\"0\" cellspacing=\"0\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"grid\" class=\"dojoxCalendarGrid\">\n\t\t\t\t<table data-dojo-attach-point=\"gridTable\" class=\"dojoxCalendarGridTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t\t<div data-dojo-attach-point=\"itemContainer\" class=\"dojoxCalendarContainer\" data-dojo-attach-event=\"mousedown:_onGridMouseDown,mouseup:_onGridMouseUp,ondblclick:_onGridDoubleClick,touchstart:_onGridTouchStart,touchmove:_onGridTouchMove,touchend:_onGridTouchEnd\">\n\t\t\t\t<table data-dojo-attach-point=\"itemContainerTable\" class=\"dojoxCalendarContainerTable\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%\"></table>\n\t\t\t</div>\n\t\t</div> \n\t</div>\n\t\n\t<div data-dojo-attach-point=\"vScrollBar\" class=\"dojoxCalendarVScrollBar\">\n\t\t<div data-dojo-attach-point=\"vScrollBarContent\" style=\"visibility:hidden;position:relative;width:1px;height:1px;\" ></div>\n\t</div>\n\t\n\t<div data-dojo-attach-point=\"hScrollBar\" class=\"dojoxCalendarHScrollBar\">\n\t\t<div data-dojo-attach-point=\"hScrollBarContent\" style=\"visibility:hidden;position:relative;width:1px;height:1px;\" ></div>\n\t</div>\n\t\n</div>\n"}});
define("dojox/calendar/ColumnView", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/event", "dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/fx", "dojo/dom", "dojo/dom-class", "dojo/dom-style", "dojo/dom-geometry", "dojo/dom-construct", "dojo/on", "dojo/date", "dojo/date/locale", "dojo/query", "dojox/html/metrics", "./SimpleColumnView", "dojo/text!./templates/ColumnView.html", "./ColumnViewSecondarySheet"], function (arr, declare, event, lang, has, fx, dom, domClass, domStyle, domGeometry, domConstruct, on, date, locale, query, metrics, SimpleColumnView, template, ColumnViewSecondarySheet) {
    return declare("dojox.calendar.ColumnView", SimpleColumnView, {templateString:template, baseClass:"dojoxCalendarColumnView", secondarySheetClass:ColumnViewSecondarySheet, secondarySheetProps:null, headerPadding:3, _showSecondarySheet:true, buildRendering:function () {
        this.inherited(arguments);
        if (this.secondarySheetNode) {
            var args = lang.mixin({owner:this}, this.secondarySheetProps);
            this.secondarySheet = new this.secondarySheetClass(args, this.secondarySheetNode);
            this.secondarySheetNode = this.secondarySheet.domNode;
        }
    }, destroy:function (preserveDom) {
        if (this.secondarySheet) {
            this.secondarySheet.destroy(preserveDom);
        }
        this.inherited(arguments);
    }, _setVisibility:function (value) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet._setVisibility(value);
        }
    }, resize:function (changedSize) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet.resize();
        }
    }, invalidateLayout:function () {
        this._layoutRenderers(this.renderData);
        if (this.secondarySheet) {
            this.secondarySheet._layoutRenderers(this.secondarySheet.renderData);
        }
    }, onRowHeaderClick:function (e) {
    }, _setSubColumnsAttr:function (value) {
        var old = this.get("subColumns");
        if (old != value) {
            this._secondaryHeightInvalidated = true;
        }
        this._set("subColumns", value);
    }, refreshRendering:function () {
        this.inherited(arguments);
        if (this._secondaryHeightInvalidated) {
            this._secondaryHeightInvalidated = false;
            var h = domGeometry.getMarginBox(this.secondarySheetNode).h;
            this.resizeSecondarySheet(h);
        }
    }, resizeSecondarySheet:function (height) {
        if (this.secondarySheetNode) {
            var headerH = domGeometry.getMarginBox(this.header).h;
            domStyle.set(this.secondarySheetNode, "height", height + "px");
            this.secondarySheet._resizeHandler(null, true);
            var top = (height + headerH + this.headerPadding);
            if (this.subHeader && this.subColumns) {
                domStyle.set(this.subHeader, "top", top + "px");
                top += domGeometry.getMarginBox(this.subHeader).h;
            }
            domStyle.set(this.scrollContainer, "top", top + "px");
            if (this.vScrollBar) {
                domStyle.set(this.vScrollBar, "top", top + "px");
            }
        }
    }, updateRenderers:function (obj, stateOnly) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet.updateRenderers(obj, stateOnly);
        }
    }, _setItemsAttr:function (value) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet.set("items", value);
        }
    }, _setDecorationItemsAttr:function (value) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet.set("decorationItems", value);
        }
    }, _setStartDateAttr:function (value) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet.set("startDate", value);
        }
    }, _setColumnCountAttr:function (value) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet.set("columnCount", value);
        }
    }, _setHorizontalRendererAttr:function (value) {
        if (this.secondarySheet) {
            this.secondarySheet.set("horizontalRenderer", value);
        }
    }, _getHorizontalRendererAttr:function () {
        if (this.secondarySheet) {
            return this.secondarySheet.get("horizontalRenderer");
        }
        return null;
    }, _setHorizontalDecorationRendererAttr:function (value) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet.set("horizontalDecorationRenderer", value);
        }
    }, _getHorizontalRendererAttr:function () {
        if (this.secondarySheet) {
            return this.secondarySheet.get("horizontalDecorationRenderer");
        }
        return null;
    }, _setExpandRendererAttr:function (value) {
        if (this.secondarySheet) {
            this.secondarySheet.set("expandRenderer", value);
        }
    }, _getExpandRendererAttr:function () {
        if (this.secondarySheet) {
            return this.secondarySheet.get("expandRenderer");
        }
        return null;
    }, _setTextDirAttr:function (value) {
        this.secondarySheet.set("textDir", value);
        this._set("textDir", value);
    }, _defaultItemToRendererKindFunc:function (item) {
        return item.allDay ? null : "vertical";
    }, getSecondarySheet:function () {
        return this.secondarySheet;
    }, _onGridTouchStart:function (e) {
        this.inherited(arguments);
        this._doEndItemEditing(this.secondarySheet, "touch");
    }, _onGridMouseDown:function (e) {
        this.inherited(arguments);
        this._doEndItemEditing(this.secondarySheet, "mouse");
    }, _configureScrollBar:function (renderData) {
        this.inherited(arguments);
        if (this.secondarySheetNode) {
            var atRight = this.isLeftToRight() ? true : this.scrollBarRTLPosition == "right";
            domStyle.set(this.secondarySheetNode, atRight ? "right" : "left", renderData.scrollbarWidth + "px");
            domStyle.set(this.secondarySheetNode, atRight ? "left" : "right", "0");
            arr.forEach(this.secondarySheet._hScrollNodes, function (elt) {
                domClass[renderData.hScrollBarEnabled ? "add" : "remove"](elt.parentNode, "dojoxCalendarHorizontalScroll");
            }, this);
        }
    }, _configureHScrollDomNodes:function (styleWidth) {
        this.inherited(arguments);
        if (this.secondarySheet && this.secondarySheet._configureHScrollDomNodes) {
            this.secondarySheet._configureHScrollDomNodes(styleWidth);
        }
    }, _setHScrollPosition:function (pos) {
        this.inherited(arguments);
        if (this.secondarySheet) {
            this.secondarySheet._setHScrollPosition(pos);
        }
    }, _refreshItemsRendering:function () {
        this.inherited(arguments);
        if (this.secondarySheet) {
            var rd = this.secondarySheet.renderData;
            this.secondarySheet._computeVisibleItems(rd);
            this.secondarySheet._layoutRenderers(rd);
        }
    }, _layoutRenderers:function (renderData) {
        if (!this.secondarySheet._domReady) {
            this.secondarySheet._domReady = true;
            this.secondarySheet._layoutRenderers(this.secondarySheet.renderData);
        }
        this.inherited(arguments);
    }, _layoutDecorationRenderers:function (renderData) {
        if (!this.secondarySheet._decDomReady) {
            this.secondarySheet._decDomReady = true;
            this.secondarySheet._layoutDecorationRenderers(this.secondarySheet.renderData);
        }
        this.inherited(arguments);
    }, invalidateRendering:function () {
        if (this.secondarySheet) {
            this.secondarySheet.invalidateRendering();
        }
        this.inherited(arguments);
    }});
});

