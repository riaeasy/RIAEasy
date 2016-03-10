//>>built

define("dojox/calendar/Keyboard", ["dojo/_base/array", "dojo/_base/lang", "dojo/_base/declare", "dojo/on", "dojo/_base/event", "dojo/keys"], function (arr, lang, declare, on, event, keys) {
    return declare("dojox.calendar.Keyboard", null, {keyboardUpDownUnit:"minute", keyboardUpDownSteps:15, keyboardLeftRightUnit:"day", keyboardLeftRightSteps:1, allDayKeyboardUpDownUnit:"day", allDayKeyboardUpDownSteps:7, allDayKeyboardLeftRightUnit:"day", allDayKeyboardLeftRightSteps:1, postCreate:function () {
        this.inherited(arguments);
        this._viewHandles.push(on(this.domNode, "keydown", lang.hitch(this, this._onKeyDown)));
    }, resizeModifier:"ctrl", maxScrollAnimationDuration:1000, tabIndex:"0", focusedItem:null, _isItemFocused:function (item) {
        return this.focusedItem != null && this.focusedItem.id == item.id;
    }, _setFocusedItemAttr:function (value) {
        if (value != this.focusedItem) {
            var old = this.focusedItem;
            this._set("focusedItem", value);
            this.updateRenderers([old, this.focusedItem], true);
            this.onFocusChange({oldValue:old, newValue:value});
        }
        if (value != null) {
            if (this.owner != null && this.owner.get("focusedItem") != null) {
                this.owner.set("focusedItem", null);
            }
            if (this._secondarySheet != null && this._secondarySheet.set("focusedItem") != null) {
                this._secondarySheet.set("focusedItem", null);
            }
        }
    }, onFocusChange:function (e) {
    }, showFocus:false, _focusNextItem:function (dir) {
        if (!this.renderData || !this.renderData.items || this.renderData.items.length == 0) {
            return null;
        }
        var index = -1;
        var list = this.renderData.items;
        var max = list.length - 1;
        var focusedItem = this.get("focusedItem");
        if (focusedItem == null) {
            index = dir > 0 ? 0 : max;
        } else {
            arr.some(list, lang.hitch(this, function (item, i) {
                var found = item.id == focusedItem.id;
                if (found) {
                    index = i;
                }
                return found;
            }));
            index = this._focusNextItemImpl(dir, index, max);
        }
        var reachedOnce = false;
        var old = -1;
        while (old != index && (!reachedOnce || index != 0)) {
            if (!reachedOnce && index == 0) {
                reachedOnce = true;
            }
            var item = list[index];
            if (this.itemToRenderer[item.id] != null) {
                this.set("focusedItem", item);
                return;
            }
            old = index;
            index = this._focusNextItemImpl(dir, index, max);
        }
    }, _focusNextItemImpl:function (dir, index, max) {
        if (index == -1) {
            index = dir > 0 ? 0 : max;
        } else {
            if (index == 0 && dir == -1 || index == max && dir == 1) {
                return index;
            }
            index = dir > 0 ? ++index : --index;
        }
        return index;
    }, _handlePrevNextKeyCode:function (e, dir) {
        if (!this.isLeftToRight()) {
            dir = dir == 1 ? -1 : 1;
        }
        this.showFocus = true;
        this._focusNextItem(dir);
        var focusedItem = this.get("focusedItem");
        if (!e.ctrlKey && focusedItem) {
            this.set("selectedItem", focusedItem);
        }
        if (focusedItem) {
            this.ensureVisibility(focusedItem.startTime, focusedItem.endTime, "both", undefined, this.maxScrollAnimationDuration);
        }
    }, _checkDir:function (dir, value) {
        return this.isLeftToRight() && dir == value || !this.isLeftToRight() && dir == (value == "left" ? "right" : "left");
    }, _keyboardItemEditing:function (e, dir) {
        event.stop(e);
        var p = this._edProps;
        var unit, steps;
        if (p.editedItem.allDay || this.roundToDay || p.rendererKind == "label") {
            unit = dir == "up" || dir == "down" ? this.allDayKeyboardUpDownUnit : this.allDayKeyboardLeftRightUnit;
            steps = dir == "up" || dir == "down" ? this.allDayKeyboardUpDownSteps : this.allDayKeyboardLeftRightSteps;
        } else {
            unit = dir == "up" || dir == "down" ? this.keyboardUpDownUnit : this.keyboardLeftRightUnit;
            steps = dir == "up" || dir == "down" ? this.keyboardUpDownSteps : this.keyboardLeftRightSteps;
        }
        if (dir == "up" || this._checkDir(dir, "left")) {
            steps = -steps;
        }
        var editKind = e[this.resizeModifier + "Key"] ? "resizeEnd" : "move";
        var d = editKind == "resizeEnd" ? p.editedItem.endTime : p.editedItem.startTime;
        var newTime = d;
        var subColumn = p.editedItem.subColumn;
        if (editKind == "move" && this.subColumns && this.subColumns.length > 1) {
            var idx = this.getSubColumnIndex(subColumn);
            var updateTime = true;
            if (idx != -1) {
                if (this._checkDir(dir, "left")) {
                    if (idx == 0) {
                        subColumn = this.subColumns[this.subColumns.length - 1];
                    } else {
                        updateTime = false;
                        subColumn = this.subColumns[idx - 1];
                    }
                } else {
                    if (this._checkDir(dir, "right")) {
                        if (idx == this.subColumns.length - 1) {
                            subColumn = this.subColumns[0];
                        } else {
                            updateTime = false;
                            subColumn = this.subColumns[idx + 1];
                        }
                    }
                }
                if (updateTime) {
                    newTime = this.renderData.dateModule.add(d, unit, steps);
                }
            }
        } else {
            newTime = this.renderData.dateModule.add(d, unit, steps);
        }
        this._startItemEditingGesture([d], editKind, "keyboard", e);
        this._moveOrResizeItemGesture([newTime], "keyboard", e, subColumn);
        this._endItemEditingGesture(editKind, "keyboard", e, false);
        if (editKind == "move") {
            if (this.renderData.dateModule.compare(newTime, d) == -1) {
                this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "start");
            } else {
                this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "end");
            }
        } else {
            this.ensureVisibility(p.editedItem.startTime, p.editedItem.endTime, "end");
        }
    }, _onKeyDown:function (e) {
        var focusedItem = this.get("focusedItem");
        switch (e.keyCode) {
          case keys.ESCAPE:
            if (this._isEditing) {
                if (this._editingGesture) {
                    this._endItemEditingGesture("keyboard", e, true);
                }
                this._endItemEditing("keyboard", true);
                this._edProps = null;
            }
            break;
          case keys.SPACE:
            event.stop(e);
            if (focusedItem != null) {
                this.setItemSelected(focusedItem, e.ctrlKey ? !this.isItemSelected(focusedItem) : true);
            }
            break;
          case keys.ENTER:
            event.stop(e);
            if (focusedItem != null) {
                if (this._isEditing) {
                    this._endItemEditing("keyboard", false);
                } else {
                    var renderers = this.itemToRenderer[focusedItem.id];
                    if (renderers && renderers.length > 0 && this.isItemEditable(focusedItem, renderers[0].kind)) {
                        this._edProps = {renderer:renderers[0], rendererKind:renderers[0].kind, tempEditedItem:focusedItem, liveLayout:this.liveLayout};
                        this.set("selectedItem", focusedItem);
                        this._startItemEditing(focusedItem, "keyboard");
                    }
                }
            }
            break;
          case keys.LEFT_ARROW:
            event.stop(e);
            if (this._isEditing) {
                this._keyboardItemEditing(e, "left");
            } else {
                this._handlePrevNextKeyCode(e, -1);
            }
            break;
          case keys.RIGHT_ARROW:
            event.stop(e);
            if (this._isEditing) {
                this._keyboardItemEditing(e, "right");
            } else {
                this._handlePrevNextKeyCode(e, 1);
            }
            break;
          case keys.UP_ARROW:
            if (this._isEditing) {
                this._keyboardItemEditing(e, "up");
            } else {
                if (this.scrollable) {
                    this.scrollView(-1);
                }
            }
            break;
          case keys.DOWN_ARROW:
            if (this._isEditing) {
                this._keyboardItemEditing(e, "down");
            } else {
                if (this.scrollable) {
                    this.scrollView(1);
                }
            }
            break;
        }
    }});
});

