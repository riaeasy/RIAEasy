//>>built

define("dojox/calendar/CalendarBase", ["dojo/_base/declare", "dojo/_base/sniff", "dojo/_base/event", "dojo/_base/lang", "dojo/_base/array", "dojo/cldr/supplemental", "dojo/dom", "dojo/dom-class", "dojo/dom-style", "dojo/dom-construct", "dojo/dom-geometry", "dojo/date", "dojo/date/locale", "dojo/_base/fx", "dojo/fx", "dojo/on", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "./StoreMixin", "./StoreManager", "dojox/widget/_Invalidating", "dojox/widget/Selection", "dojox/calendar/time", "dojo/i18n!./nls/buttons"], function (declare, has, event, lang, arr, cldr, dom, domClass, domStyle, domConstruct, domGeometry, date, locale, coreFx, fx, on, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StoreMixin, StoreManager, _Invalidating, Selection, timeUtil, _nls) {
    return declare("dojox.calendar.CalendarBase", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, StoreMixin, _Invalidating, Selection], {baseClass:"dojoxCalendar", datePackage:date, startDate:null, endDate:null, date:null, minDate:null, maxDate:null, dateInterval:"week", dateIntervalSteps:1, viewContainer:null, firstDayOfWeek:-1, formatItemTimeFunc:null, editable:true, moveEnabled:true, resizeEnabled:true, columnView:null, matrixView:null, columnViewProps:null, matrixViewProps:null, createOnGridClick:false, createItemFunc:null, currentView:null, _currentViewIndex:-1, views:null, _calendar:"gregorian", constructor:function (args) {
        this.views = [];
        this.invalidatingProperties = ["store", "items", "startDate", "endDate", "views", "date", "minDate", "maxDate", "dateInterval", "dateIntervalSteps", "firstDayOfWeek"];
        args = args || {};
        this._calendar = args.datePackage ? args.datePackage.substr(args.datePackage.lastIndexOf(".") + 1) : this._calendar;
        this.dateModule = args.datePackage ? lang.getObject(args.datePackage, false) : date;
        this.dateClassObj = this.dateModule.Date || Date;
        this.dateLocaleModule = args.datePackage ? lang.getObject(args.datePackage + ".locale", false) : locale;
        this.invalidateRendering();
        this.storeManager = new StoreManager({owner:this, _ownerItemsProperty:"items"});
        this.storeManager.on("layoutInvalidated", lang.hitch(this, this._refreshItemsRendering));
        this.storeManager.on("dataLoaded", lang.hitch(this, function (items) {
            this.set("items", items);
        }));
        this.decorationStoreManager = new StoreManager({owner:this, _ownerItemsProperty:"decorationItems"});
        this.decorationStoreManager.on("layoutInvalidated", lang.hitch(this, this._refreshDecorationItemsRendering));
        this.decorationStoreManager.on("dataLoaded", lang.hitch(this, function (items) {
            this.set("decorationItems", items);
        }));
    }, buildRendering:function () {
        this.inherited(arguments);
        if (this.views == null || this.views.length == 0) {
            this.set("views", this._createDefaultViews());
        }
    }, _applyAttributes:function () {
        this._applyAttr = true;
        this.inherited(arguments);
        delete this._applyAttr;
    }, _setStartDateAttr:function (value) {
        this._set("startDate", value);
        this._timeRangeInvalidated = true;
        this._startDateChanged = true;
    }, _setEndDateAttr:function (value) {
        this._set("endDate", value);
        this._timeRangeInvalidated = true;
        this._endDateChanged = true;
    }, _setDateAttr:function (value) {
        this._set("date", value);
        this._timeRangeInvalidated = true;
        this._dateChanged = true;
    }, _setDateIntervalAttr:function (value) {
        this._set("dateInterval", value);
        this._timeRangeInvalidated = true;
    }, _setDateIntervalStepsAttr:function (value) {
        this._set("dateIntervalSteps", value);
        this._timeRangeInvalidated = true;
    }, _setFirstDayOfWeekAttr:function (value) {
        this._set("firstDayOfWeek", value);
        if (this.get("date") != null && this.get("dateInterval") == "week") {
            this._timeRangeInvalidated = true;
        }
    }, _setTextDirAttr:function (value) {
        arr.forEach(this.views, function (view) {
            view.set("textDir", value);
        });
    }, refreshRendering:function () {
        this.inherited(arguments);
        this._validateProperties();
    }, _refreshItemsRendering:function () {
        if (this.currentView) {
            this.currentView._refreshItemsRendering();
        }
    }, _refreshDecorationItemsRendering:function () {
        if (this.currentView) {
            this.currentView._refreshDecorationItemsRendering();
        }
    }, resize:function (changeSize) {
        if (changeSize) {
            domGeometry.setMarginBox(this.domNode, changeSize);
        }
        if (this.currentView) {
            this.currentView.resize();
        }
    }, _validateProperties:function () {
        var cal = this.dateModule;
        var startDate = this.get("startDate");
        var endDate = this.get("endDate");
        var date = this.get("date");
        if (this.firstDayOfWeek < -1 || this.firstDayOfWeek > 6) {
            this._set("firstDayOfWeek", 0);
        }
        var minDate = this.get("minDate");
        var maxDate = this.get("maxDate");
        if (minDate && maxDate) {
            if (cal.compare(minDate, maxDate) > 0) {
                var t = minDate;
                this._set("minDate", maxDate);
                this._set("maxDate", t);
            }
        }
        if (date == null && (startDate != null || endDate != null)) {
            if (startDate == null) {
                startDate = new this.dateClassObj();
                this._set("startDate", startDate);
                this._timeRangeInvalidated = true;
            }
            if (endDate == null) {
                endDate = new this.dateClassObj();
                this._set("endDate", endDate);
                this._timeRangeInvalidated = true;
            }
            if (cal.compare(startDate, endDate) > 0) {
                endDate = cal.add(startDate, "day", 1);
                this._set("endDate", endDate);
                this._timeRangeInvalidated = true;
            }
        } else {
            if (this.date == null) {
                this._set("date", new this.dateClassObj());
                this._timeRangeInvalidated = true;
            }
            var dint = this.get("dateInterval");
            if (dint != "day" && dint != "week" && dint != "month") {
                this._set("dateInterval", "day");
                this._timeRangeInvalidated = true;
            }
            var dis = this.get("dateIntervalSteps");
            if (lang.isString(dis)) {
                dis = parseInt(dis);
                this._set("dateIntervalSteps", dis);
            }
            if (dis <= 0) {
                this.set("dateIntervalSteps", 1);
                this._timeRangeInvalidated = true;
            }
        }
        if (this._timeRangeInvalidated) {
            this._timeRangeInvalidated = false;
            var timeInterval = this.computeTimeInterval();
            if (this._timeInterval == null || cal.compare(this._timeInterval[0], timeInterval[0]) != 0 || cal.compare(this._timeInterval[1], timeInterval[1]) != 0) {
                if (this._dateChanged) {
                    this._lastValidDate = this.get("date");
                    this._dateChanged = false;
                } else {
                    if (this._startDateChanged || this._endDateChanged) {
                        this._lastValidStartDate = this.get("startDate");
                        this._lastValidEndDate = this.get("endDate");
                        this._startDateChanged = false;
                        this._endDateChanged = false;
                    }
                }
                this.onTimeIntervalChange({oldStartTime:this._timeInterval == null ? null : this._timeInterval[0], oldEndTime:this._timeInterval == null ? null : this._timeInterval[1], startTime:timeInterval[0], endTime:timeInterval[1]});
            } else {
                if (this._dateChanged) {
                    this._dateChanged = false;
                    if (this.lastValidDate != null) {
                        this._set("date", this.lastValidDate);
                    }
                } else {
                    if (this._startDateChanged || this._endDateChanged) {
                        this._startDateChanged = false;
                        this._endDateChanged = false;
                        this._set("startDate", this._lastValidStartDate);
                        this._set("endDate", this._lastValidEndDate);
                    }
                }
                return;
            }
            this._timeInterval = timeInterval;
            var duration = this.dateModule.difference(this._timeInterval[0], this._timeInterval[1], "day");
            var view = this._computeCurrentView(timeInterval[0], timeInterval[1], duration);
            var index = arr.indexOf(this.views, view);
            if (view == null || index == -1) {
                return;
            }
            this._performViewTransition(view, index, timeInterval, duration);
        }
    }, _performViewTransition:function (view, index, timeInterval, duration) {
        var oldView = this.currentView;
        if (this.animateRange && (!has("ie") || has("ie") > 8)) {
            if (oldView) {
                oldView.beforeDeactivate();
                var ltr = this.isLeftToRight();
                var inLeft = this._animRangeInDir == "left" || this._animRangeInDir == null;
                var outLeft = this._animRangeOutDir == "left" || this._animRangeOutDir == null;
                this._animateRange(this.currentView.domNode, outLeft && ltr, false, 0, outLeft ? -100 : 100, lang.hitch(this, function () {
                    oldView.afterDeactivate();
                    view.beforeActivate();
                    this.animateRangeTimer = setTimeout(lang.hitch(this, function () {
                        this._applyViewChange(view, index, timeInterval, duration);
                        this._animateRange(this.currentView.domNode, inLeft && ltr, true, inLeft ? -100 : 100, 0, function () {
                            view.afterActivate();
                        });
                        this._animRangeInDir = null;
                        this._animRangeOutDir = null;
                    }), 100);
                }));
            } else {
                view.beforeActivate();
                this._applyViewChange(view, index, timeInterval, duration);
                view.afterActivate();
            }
        } else {
            if (oldView) {
                oldView.beforeDeactivate();
            }
            view.beforeActivate();
            this._applyViewChange(view, index, timeInterval, duration);
            if (oldView) {
                oldView.afterDeactivate();
            }
            view.afterActivate();
        }
    }, onViewConfigurationChange:function (view) {
    }, _applyViewChange:function (view, index, timeInterval, duration) {
        this._configureView(view, index, timeInterval, duration);
        this.onViewConfigurationChange(view);
        if (index != this._currentViewIndex) {
            if (this.currentView == null) {
                view.set("items", this.items);
                view.set("decorationItems", this.decorationItems);
                this.set("currentView", view);
            } else {
                if (this.items == null || this.items.length == 0) {
                    this.set("currentView", view);
                    if (this.animateRange && (!has("ie") || has("ie") > 8)) {
                        domStyle.set(this.currentView.domNode, "opacity", 0);
                    }
                    view.set("items", this.items);
                    view.set("decorationItems", this.decorationItems);
                } else {
                    this.currentView = view;
                    view.set("items", this.items);
                    view.set("decorationItems", this.decorationItems);
                    this.set("currentView", view);
                    if (this.animateRange && (!has("ie") || has("ie") > 8)) {
                        domStyle.set(this.currentView.domNode, "opacity", 0);
                    }
                }
            }
        }
    }, _timeInterval:null, computeTimeInterval:function () {
        var d = this.get("date");
        var minDate = this.get("minDate");
        var maxDate = this.get("maxDate");
        var cal = this.dateModule;
        if (d == null) {
            var startDate = this.get("startDate");
            var endDate = cal.add(this.get("endDate"), "day", 1);
            if (minDate != null || maxDate != null) {
                var dur = this.dateModule.difference(startDate, endDate, "day");
                if (cal.compare(minDate, startDate) > 0) {
                    startDate = minDate;
                    endDate = cal.add(startDate, "day", dur);
                }
                if (cal.compare(maxDate, endDate) < 0) {
                    endDate = maxDate;
                    startDate = cal.add(endDate, "day", -dur);
                }
                if (cal.compare(minDate, startDate) > 0) {
                    startDate = minDate;
                    endDate = maxDate;
                }
            }
            return [this.floorToDay(startDate), this.floorToDay(endDate)];
        } else {
            var interval = this._computeTimeIntervalImpl(d);
            if (minDate != null) {
                var minInterval = this._computeTimeIntervalImpl(minDate);
                if (cal.compare(minInterval[0], interval[0]) > 0) {
                    interval = minInterval;
                }
            }
            if (maxDate != null) {
                var maxInterval = this._computeTimeIntervalImpl(maxDate);
                if (cal.compare(maxInterval[1], interval[1]) < 0) {
                    interval = maxInterval;
                }
            }
            return interval;
        }
    }, _computeTimeIntervalImpl:function (d) {
        var cal = this.dateModule;
        var s = this.floorToDay(d);
        var di = this.get("dateInterval");
        var dis = this.get("dateIntervalSteps");
        var e;
        switch (di) {
          case "day":
            e = cal.add(s, "day", dis);
            break;
          case "week":
            s = this.floorToWeek(s);
            e = cal.add(s, "week", dis);
            break;
          case "month":
            s.setDate(1);
            e = cal.add(s, "month", dis);
            break;
          default:
            e = cal.add(s, "day", 1);
        }
        return [s, e];
    }, onTimeIntervalChange:function (e) {
    }, views:null, _setViewsAttr:function (views) {
        if (!this._applyAttr) {
            for (var i = 0; i < this.views.length; i++) {
                this._onViewRemoved(this.views[i]);
            }
        }
        if (views != null) {
            for (var i = 0; i < views.length; i++) {
                this._onViewAdded(views[i]);
            }
        }
        this._set("views", views == null ? [] : views.concat());
    }, _getViewsAttr:function () {
        return this.views.concat();
    }, _createDefaultViews:function () {
    }, addView:function (view, index) {
        if (index <= 0 || index > this.views.length) {
            index = this.views.length;
        }
        this.views.splice(index, view);
        this._onViewAdded(view);
    }, removeView:function (view) {
        if (index < 0 || index >= this.views.length) {
            return;
        }
        this._onViewRemoved(this.views[index]);
        this.views.splice(index, 1);
    }, _onViewAdded:function (view) {
        view.owner = this;
        view.buttonContainer = this.buttonContainer;
        view._calendar = this._calendar;
        view.datePackage = this.datePackage;
        view.dateModule = this.dateModule;
        view.dateClassObj = this.dateClassObj;
        view.dateLocaleModule = this.dateLocaleModule;
        domStyle.set(view.domNode, "display", "none");
        domClass.add(view.domNode, "view");
        domConstruct.place(view.domNode, this.viewContainer);
        this.onViewAdded(view);
    }, onViewAdded:function (view) {
    }, _onViewRemoved:function (view) {
        view.owner = null;
        view.buttonContainer = null;
        domClass.remove(view.domNode, "view");
        this.viewContainer.removeChild(view.domNode);
        this.onViewRemoved(view);
    }, onViewRemoved:function (view) {
    }, _setCurrentViewAttr:function (view) {
        var index = arr.indexOf(this.views, view);
        if (index != -1) {
            var oldView = this.get("currentView");
            this._currentViewIndex = index;
            this._set("currentView", view);
            this._showView(oldView, view);
            this.onCurrentViewChange({oldView:oldView, newView:view});
        }
    }, _getCurrentViewAttr:function () {
        return this.views[this._currentViewIndex];
    }, onCurrentViewChange:function (e) {
    }, _configureView:function (view, index, timeInterval, duration) {
        var cal = this.dateModule;
        if (view.viewKind == "columns") {
            view.set("startDate", timeInterval[0]);
            view.set("columnCount", duration);
        } else {
            if (view.viewKind == "matrix") {
                if (duration > 7) {
                    var s = this.floorToWeek(timeInterval[0]);
                    var e = this.floorToWeek(timeInterval[1]);
                    if (cal.compare(e, timeInterval[1]) != 0) {
                        e = this.dateModule.add(e, "week", 1);
                    }
                    duration = this.dateModule.difference(s, e, "day");
                    view.set("startDate", s);
                    view.set("columnCount", 7);
                    view.set("rowCount", Math.ceil(duration / 7));
                    view.set("refStartTime", timeInterval[0]);
                    view.set("refEndTime", timeInterval[1]);
                } else {
                    view.set("startDate", timeInterval[0]);
                    view.set("columnCount", duration);
                    view.set("rowCount", 1);
                    view.set("refStartTime", null);
                    view.set("refEndTime", null);
                }
            }
        }
    }, _computeCurrentView:function (startDate, endDate, duration) {
        return duration <= 7 ? this.columnView : this.matrixView;
    }, matrixViewRowHeaderClick:function (e) {
        var expIndex = this.matrixView.getExpandedRowIndex();
        if (expIndex == e.index) {
            this.matrixView.collapseRow();
        } else {
            if (expIndex == -1) {
                this.matrixView.expandRow(e.index);
            } else {
                var h = this.matrixView.on("expandAnimationEnd", lang.hitch(this, function () {
                    h.remove();
                    this.matrixView.expandRow(e.index);
                }));
                this.matrixView.collapseRow();
            }
        }
    }, columnViewColumnHeaderClick:function (e) {
        var cal = this.dateModule;
        if (cal.compare(e.date, this._timeInterval[0]) == 0 && this.dateInterval == "day" && this.dateIntervalSteps == 1) {
            this.set("dateInterval", "week");
        } else {
            this.set("date", e.date);
            this.set("dateInterval", "day");
            this.set("dateIntervalSteps", 1);
        }
    }, viewChangeDuration:0, _showView:function (oldView, newView) {
        if (oldView != null) {
            domStyle.set(oldView.domNode, "display", "none");
        }
        if (newView != null) {
            domStyle.set(newView.domNode, "display", "block");
            newView.resize();
            if (!has("ie") || has("ie") > 7) {
                domStyle.set(newView.domNode, "opacity", "1");
            }
        }
    }, _setItemsAttr:function (value) {
        this._set("items", value);
        if (this.currentView) {
            this.currentView.set("items", value);
            if (!this._isEditing) {
                this.currentView.invalidateRendering();
            }
        }
    }, _setDecorationItemsAttr:function (value) {
        this._set("decorationItems", value);
        if (this.currentView) {
            this.currentView.set("decorationItems", value);
            this.currentView.invalidateRendering();
        }
    }, _setDecorationStoreAttr:function (value) {
        this._set("decorationStore", value);
        this.decorationStore = value;
        this.decorationStoreManager.set("store", value);
    }, floorToDay:function (date, reuse) {
        return timeUtil.floorToDay(date, reuse, this.dateClassObj);
    }, floorToWeek:function (d) {
        return timeUtil.floorToWeek(d, this.dateClassObj, this.dateModule, this.firstDayOfWeek, this.locale);
    }, newDate:function (obj) {
        return timeUtil.newDate(obj, this.dateClassObj);
    }, isToday:function (date) {
        return timeUtil.isToday(date, this.dateClassObj);
    }, isStartOfDay:function (d) {
        return timeUtil.isStartOfDay(d, this.dateClassObj, this.dateModule);
    }, floorDate:function (date, unit, steps, reuse) {
        return timeUtil.floor(date, unit, steps, reuse, this.classFuncObj);
    }, isOverlapping:function (renderData, start1, end1, start2, end2, includeLimits) {
        return timeUtil.isOverlapping(renderData, start1, end1, start2, end2, includeLimits);
    }, animateRange:true, animationRangeDuration:400, _animateRange:function (node, toLeft, fadeIn, xFrom, xTo, onEnd) {
        if (this.animateRangeTimer) {
            clearTimeout(this.animateRangeTimer);
            delete this.animateRangeTimer;
        }
        var fadeFunc = fadeIn ? coreFx.fadeIn : coreFx.fadeOut;
        domStyle.set(node, {left:xFrom + "px", right:(-xFrom) + "px"});
        fx.combine([coreFx.animateProperty({node:node, properties:{left:xTo, right:-xTo}, duration:this.animationRangeDuration / 2, onEnd:onEnd}), fadeFunc({node:node, duration:this.animationRangeDuration / 2})]).play();
    }, _animRangeOutDir:null, _animRangeOutDir:null, nextRange:function () {
        this._animRangeOutDir = "left";
        this._animRangeInDir = "right";
        this._navigate(1);
    }, previousRange:function () {
        this._animRangeOutDir = "right";
        this._animRangeInDir = "left";
        this._navigate(-1);
    }, _navigate:function (dir) {
        var d = this.get("date");
        var cal = this.dateModule;
        if (d == null) {
            var s = this.get("startDate");
            var e = this.get("endDate");
            var dur = cal.difference(s, e, "day");
            if (dir == 1) {
                e = cal.add(e, "day", 1);
                this.set("startDate", e);
                this.set("endDate", cal.add(e, "day", dur));
            } else {
                s = cal.add(s, "day", -1);
                this.set("startDate", cal.add(s, "day", -dur));
                this.set("endDate", s);
            }
        } else {
            var di = this.get("dateInterval");
            var dis = this.get("dateIntervalSteps");
            this.set("date", cal.add(d, di, dir * dis));
        }
    }, goToday:function () {
        this.set("date", this.floorToDay(new this.dateClassObj(), true));
        this.set("dateInterval", "day");
        this.set("dateIntervalSteps", 1);
    }, postCreate:function () {
        this.inherited(arguments);
        this.configureButtons();
    }, configureButtons:function () {
        var rtl = !this.isLeftToRight();
        if (this.previousButton) {
            this.previousButton.set("label", _nls[rtl ? "nextButton" : "previousButton"]);
            this.own(on(this.previousButton, "click", lang.hitch(this, this.previousRange)));
        }
        if (this.nextButton) {
            this.nextButton.set("label", _nls[rtl ? "previousButton" : "nextButton"]);
            this.own(on(this.nextButton, "click", lang.hitch(this, this.nextRange)));
        }
        if (rtl && this.previousButton && this.nextButton) {
            var t = this.previousButton;
            this.previousButton = this.nextButton;
            this.nextButton = t;
        }
        if (this.todayButton) {
            this.todayButton.set("label", _nls.todayButton);
            this.own(on(this.todayButton, "click", lang.hitch(this, this.todayButtonClick)));
        }
        if (this.dayButton) {
            this.dayButton.set("label", _nls.dayButton);
            this.own(on(this.dayButton, "click", lang.hitch(this, this.dayButtonClick)));
        }
        if (this.weekButton) {
            this.weekButton.set("label", _nls.weekButton);
            this.own(on(this.weekButton, "click", lang.hitch(this, this.weekButtonClick)));
        }
        if (this.fourDaysButton) {
            this.fourDaysButton.set("label", _nls.fourDaysButton);
            this.own(on(this.fourDaysButton, "click", lang.hitch(this, this.fourDaysButtonClick)));
        }
        if (this.monthButton) {
            this.monthButton.set("label", _nls.monthButton);
            this.own(on(this.monthButton, "click", lang.hitch(this, this.monthButtonClick)));
        }
    }, todayButtonClick:function (e) {
        this.goToday();
    }, dayButtonClick:function (e) {
        if (this.get("date") == null) {
            this.set("date", this.floorToDay(new this.dateClassObj(), true));
        }
        this.set("dateInterval", "day");
        this.set("dateIntervalSteps", 1);
    }, weekButtonClick:function (e) {
        this.set("dateInterval", "week");
        this.set("dateIntervalSteps", 1);
    }, fourDaysButtonClick:function (e) {
        this.set("dateInterval", "day");
        this.set("dateIntervalSteps", 4);
    }, monthButtonClick:function (e) {
        this.set("dateInterval", "month");
        this.set("dateIntervalSteps", 1);
    }, updateRenderers:function (obj, stateOnly) {
        if (this.currentView) {
            this.currentView.updateRenderers(obj, stateOnly);
        }
    }, getIdentity:function (item) {
        return item ? item.id : null;
    }, _setHoveredItem:function (item, renderer) {
        if (this.hoveredItem && item && this.hoveredItem.id != item.id || item == null || this.hoveredItem == null) {
            var old = this.hoveredItem;
            this.hoveredItem = item;
            this.updateRenderers([old, this.hoveredItem], true);
            if (item && renderer) {
                this.currentView._updateEditingCapabilities(item._item ? item._item : item, renderer);
            }
        }
    }, hoveredItem:null, isItemHovered:function (item) {
        return this.hoveredItem != null && this.hoveredItem.id == item.id;
    }, isItemEditable:function (item, rendererKind) {
        return this.editable;
    }, isItemMoveEnabled:function (item, rendererKind) {
        return this.isItemEditable(item, rendererKind) && this.moveEnabled;
    }, isItemResizeEnabled:function (item, rendererKind) {
        return this.isItemEditable(item, rendererKind) && this.resizeEnabled;
    }, onGridClick:function (e) {
    }, onGridDoubleClick:function (e) {
    }, onItemClick:function (e) {
    }, onItemDoubleClick:function (e) {
    }, onItemContextMenu:function (e) {
    }, onItemEditBegin:function (e) {
    }, onItemEditEnd:function (e) {
    }, onItemEditBeginGesture:function (e) {
    }, onItemEditMoveGesture:function (e) {
    }, onItemEditResizeGesture:function (e) {
    }, onItemEditEndGesture:function (e) {
    }, onItemRollOver:function (e) {
    }, onItemRollOut:function (e) {
    }, onColumnHeaderClick:function (e) {
    }, onRowHeaderClick:function (e) {
    }, onExpandRendererClick:function (e) {
    }, _onRendererCreated:function (e) {
        this.onRendererCreated(e);
    }, onRendererCreated:function (e) {
    }, _onRendererRecycled:function (e) {
        this.onRendererRecycled(e);
    }, onRendererRecycled:function (e) {
    }, _onRendererReused:function (e) {
        this.onRendererReused(e);
    }, onRendererReused:function (e) {
    }, _onRendererDestroyed:function (e) {
        this.onRendererDestroyed(e);
    }, onRendererDestroyed:function (e) {
    }, _onRenderersLayoutDone:function (view) {
        this.onRenderersLayoutDone(view);
    }, onRenderersLayoutDone:function (view) {
    }});
});

