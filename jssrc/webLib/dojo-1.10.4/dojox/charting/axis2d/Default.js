//>>built

define("dojox/charting/axis2d/Default", ["dojo/_base/lang", "dojo/_base/array", "dojo/sniff", "dojo/_base/declare", "dojo/_base/connect", "dojo/dom-geometry", "./Invisible", "../scaler/linear", "./common", "dojox/gfx", "dojox/lang/utils", "dojox/lang/functional", "require"], function (lang, arr, has, declare, connect, domGeom, Invisible, lin, acommon, g, du, df, BidiDefault) {
    var centerAnchorLimit = 45;
    var Default = declare(0 ? "dojox.charting.axis2d.NonBidiDefault" : "dojox.charting.axis2d.Default", Invisible, {defaultParams:{vertical:false, fixUpper:"none", fixLower:"none", natural:false, leftBottom:true, includeZero:false, fixed:true, majorLabels:true, minorTicks:true, minorLabels:true, microTicks:false, rotation:0, htmlLabels:true, enableCache:false, dropLabels:true, labelSizeChange:false, position:"leftOrBottom"}, optionalParams:{min:0, max:1, from:0, to:1, majorTickStep:4, minorTickStep:2, microTickStep:1, labels:[], labelFunc:null, maxLabelSize:0, maxLabelCharCount:0, trailingSymbol:null, stroke:{}, majorTick:{}, minorTick:{}, microTick:{}, tick:{}, font:"", fontColor:"", title:"", titleGap:0, titleFont:"", titleFontColor:"", titleOrientation:""}, constructor:function (chart, kwArgs) {
        this.opt = lang.clone(this.defaultParams);
        du.updateWithObject(this.opt, kwArgs);
        du.updateWithPattern(this.opt, kwArgs, this.optionalParams);
        if (this.opt.enableCache) {
            this._textFreePool = [];
            this._lineFreePool = [];
            this._textUsePool = [];
            this._lineUsePool = [];
        }
        this._invalidMaxLabelSize = true;
        if (!(kwArgs && ("position" in kwArgs))) {
            this.opt.position = this.opt.leftBottom ? "leftOrBottom" : "rightOrTop";
        }
        this.renderingOptions = {"shape-rendering":"crispEdges"};
    }, setWindow:function (scale, offset) {
        if (scale != this.scale) {
            this._invalidMaxLabelSize = true;
        }
        return this.inherited(arguments);
    }, _groupLabelWidth:function (labels, font, wcLimit) {
        if (!labels.length) {
            return 0;
        }
        if (labels.length > 50) {
            labels.length = 50;
        }
        if (lang.isObject(labels[0])) {
            labels = df.map(labels, function (label) {
                return label.text;
            });
        }
        if (wcLimit) {
            labels = df.map(labels, function (label) {
                return lang.trim(label).length == 0 ? "" : label.substring(0, wcLimit) + this.trailingSymbol;
            }, this);
        }
        var s = labels.join("<br>");
        return g._base._getTextBox(s, {font:font}).w || 0;
    }, _getMaxLabelSize:function (min, max, span, rotation, font, size) {
        if (this._maxLabelSize == null && arguments.length == 6) {
            var o = this.opt;
            this.scaler.minMinorStep = this._prevMinMinorStep = 0;
            var ob = lang.clone(o);
            delete ob.to;
            delete ob.from;
            var sb = lin.buildScaler(min, max, span, ob, o.to - o.from);
            sb.minMinorStep = 0;
            this._majorStart = sb.major.start;
            var tb = lin.buildTicks(sb, o);
            if (size && tb) {
                var majLabelW = 0, minLabelW = 0;
                var tickLabelFunc = function (tick) {
                    if (tick.label) {
                        this.push(tick.label);
                    }
                };
                var labels = [];
                if (this.opt.majorLabels) {
                    arr.forEach(tb.major, tickLabelFunc, labels);
                    majLabelW = this._groupLabelWidth(labels, font, ob.maxLabelCharCount);
                    if (ob.maxLabelSize) {
                        majLabelW = Math.min(ob.maxLabelSize, majLabelW);
                    }
                }
                labels = [];
                if (this.opt.dropLabels && this.opt.minorLabels) {
                    arr.forEach(tb.minor, tickLabelFunc, labels);
                    minLabelW = this._groupLabelWidth(labels, font, ob.maxLabelCharCount);
                    if (ob.maxLabelSize) {
                        minLabelW = Math.min(ob.maxLabelSize, minLabelW);
                    }
                }
                this._maxLabelSize = {majLabelW:majLabelW, minLabelW:minLabelW, majLabelH:size, minLabelH:size};
            } else {
                this._maxLabelSize = null;
            }
        }
        return this._maxLabelSize;
    }, calculate:function (min, max, span) {
        this.inherited(arguments);
        this.scaler.minMinorStep = this._prevMinMinorStep;
        if ((this._invalidMaxLabelSize || span != this._oldSpan) && (min != Infinity && max != -Infinity)) {
            this._invalidMaxLabelSize = false;
            if (this.opt.labelSizeChange) {
                this._maxLabelSize = null;
            }
            this._oldSpan = span;
            var o = this.opt;
            var ta = this.chart.theme.axis, rotation = o.rotation % 360, labelGap = this.chart.theme.axis.tick.labelGap, font = o.font || (ta.majorTick && ta.majorTick.font) || (ta.tick && ta.tick.font), size = font ? g.normalizedLength(g.splitFontString(font).size) : 0, labelW = this._getMaxLabelSize(min, max, span, rotation, font, size);
            if (typeof labelGap != "number") {
                labelGap = 4;
            }
            if (labelW && o.dropLabels) {
                var cosr = Math.abs(Math.cos(rotation * Math.PI / 180)), sinr = Math.abs(Math.sin(rotation * Math.PI / 180));
                var majLabelW, minLabelW;
                if (rotation < 0) {
                    rotation += 360;
                }
                switch (rotation) {
                  case 0:
                  case 180:
                    if (this.vertical) {
                        majLabelW = minLabelW = size;
                    } else {
                        majLabelW = labelW.majLabelW;
                        minLabelW = labelW.minLabelW;
                    }
                    break;
                  case 90:
                  case 270:
                    if (this.vertical) {
                        majLabelW = labelW.majLabelW;
                        minLabelW = labelW.minLabelW;
                    } else {
                        majLabelW = minLabelW = size;
                    }
                    break;
                  default:
                    majLabelW = this.vertical ? Math.min(labelW.majLabelW, size / cosr) : Math.min(labelW.majLabelW, size / sinr);
                    var gap1 = Math.sqrt(labelW.minLabelW * labelW.minLabelW + size * size), gap2 = this.vertical ? size * cosr + labelW.minLabelW * sinr : labelW.minLabelW * cosr + size * sinr;
                    minLabelW = Math.min(gap1, gap2);
                    break;
                }
                this.scaler.minMinorStep = this._prevMinMinorStep = Math.max(majLabelW, minLabelW) + labelGap;
                var canMinorLabel = this.scaler.minMinorStep <= this.scaler.minor.tick * this.scaler.bounds.scale;
                if (!canMinorLabel) {
                    this._skipInterval = Math.floor((majLabelW + labelGap) / (this.scaler.major.tick * this.scaler.bounds.scale));
                } else {
                    this._skipInterval = 0;
                }
            } else {
                this._skipInterval = 0;
            }
        }
        this.ticks = lin.buildTicks(this.scaler, this.opt);
        return this;
    }, getOffsets:function () {
        var s = this.scaler, offsets = {l:0, r:0, t:0, b:0};
        if (!s) {
            return offsets;
        }
        var o = this.opt, ta = this.chart.theme.axis, labelGap = this.chart.theme.axis.tick.labelGap, taTitleFont = o.titleFont || (ta.title && ta.title.font), taTitleGap = (o.titleGap == 0) ? 0 : o.titleGap || (ta.title && ta.title.gap), taMajorTick = this.chart.theme.getTick("major", o), taMinorTick = this.chart.theme.getTick("minor", o), tsize = taTitleFont ? g.normalizedLength(g.splitFontString(taTitleFont).size) : 0, rotation = o.rotation % 360, position = o.position, leftBottom = position !== "rightOrTop", cosr = Math.abs(Math.cos(rotation * Math.PI / 180)), sinr = Math.abs(Math.sin(rotation * Math.PI / 180));
        this.trailingSymbol = (o.trailingSymbol === undefined || o.trailingSymbol === null) ? this.trailingSymbol : o.trailingSymbol;
        if (typeof labelGap != "number") {
            labelGap = 4;
        }
        if (rotation < 0) {
            rotation += 360;
        }
        var maxLabelSize = this._getMaxLabelSize();
        if (maxLabelSize) {
            var side;
            var labelWidth = Math.ceil(Math.max(maxLabelSize.majLabelW, maxLabelSize.minLabelW)) + 1, size = Math.ceil(Math.max(maxLabelSize.majLabelH, maxLabelSize.minLabelH)) + 1;
            if (this.vertical) {
                side = leftBottom ? "l" : "r";
                switch (rotation) {
                  case 0:
                  case 180:
                    offsets[side] = position === "center" ? 0 : labelWidth;
                    offsets.t = offsets.b = size / 2;
                    break;
                  case 90:
                  case 270:
                    offsets[side] = size;
                    offsets.t = offsets.b = labelWidth / 2;
                    break;
                  default:
                    if (rotation <= centerAnchorLimit || (180 < rotation && rotation <= (180 + centerAnchorLimit))) {
                        offsets[side] = size * sinr / 2 + labelWidth * cosr;
                        offsets[leftBottom ? "t" : "b"] = size * cosr / 2 + labelWidth * sinr;
                        offsets[leftBottom ? "b" : "t"] = size * cosr / 2;
                    } else {
                        if (rotation > (360 - centerAnchorLimit) || (180 > rotation && rotation > (180 - centerAnchorLimit))) {
                            offsets[side] = size * sinr / 2 + labelWidth * cosr;
                            offsets[leftBottom ? "b" : "t"] = size * cosr / 2 + labelWidth * sinr;
                            offsets[leftBottom ? "t" : "b"] = size * cosr / 2;
                        } else {
                            if (rotation < 90 || (180 < rotation && rotation < 270)) {
                                offsets[side] = size * sinr + labelWidth * cosr;
                                offsets[leftBottom ? "t" : "b"] = size * cosr + labelWidth * sinr;
                            } else {
                                offsets[side] = size * sinr + labelWidth * cosr;
                                offsets[leftBottom ? "b" : "t"] = size * cosr + labelWidth * sinr;
                            }
                        }
                    }
                    break;
                }
                if (position === "center") {
                    offsets[side] = 0;
                } else {
                    offsets[side] += labelGap + Math.max(taMajorTick.length > 0 ? taMajorTick.length : 0, taMinorTick.length > 0 ? taMinorTick.length : 0) + (o.title ? (tsize + taTitleGap) : 0);
                }
            } else {
                side = leftBottom ? "b" : "t";
                switch (rotation) {
                  case 0:
                  case 180:
                    offsets[side] = position === "center" ? 0 : size;
                    offsets.l = offsets.r = labelWidth / 2;
                    break;
                  case 90:
                  case 270:
                    offsets[side] = labelWidth;
                    offsets.l = offsets.r = size / 2;
                    break;
                  default:
                    if ((90 - centerAnchorLimit) <= rotation && rotation <= 90 || (270 - centerAnchorLimit) <= rotation && rotation <= 270) {
                        offsets[side] = size * cosr / 2 + labelWidth * sinr;
                        offsets[leftBottom ? "r" : "l"] = size * sinr / 2 + labelWidth * cosr;
                        offsets[leftBottom ? "l" : "r"] = size * sinr / 2;
                    } else {
                        if (90 <= rotation && rotation <= (90 + centerAnchorLimit) || 270 <= rotation && rotation <= (270 + centerAnchorLimit)) {
                            offsets[side] = size * cosr / 2 + labelWidth * sinr;
                            offsets[leftBottom ? "l" : "r"] = size * sinr / 2 + labelWidth * cosr;
                            offsets[leftBottom ? "r" : "l"] = size * sinr / 2;
                        } else {
                            if (rotation < centerAnchorLimit || (180 < rotation && rotation < (180 + centerAnchorLimit))) {
                                offsets[side] = size * cosr + labelWidth * sinr;
                                offsets[leftBottom ? "r" : "l"] = size * sinr + labelWidth * cosr;
                            } else {
                                offsets[side] = size * cosr + labelWidth * sinr;
                                offsets[leftBottom ? "l" : "r"] = size * sinr + labelWidth * cosr;
                            }
                        }
                    }
                    break;
                }
                if (position === "center") {
                    offsets[side] = 0;
                } else {
                    offsets[side] += labelGap + Math.max(taMajorTick.length > 0 ? taMajorTick.length : 0, taMinorTick.length > 0 ? taMinorTick.length : 0) + (o.title ? (tsize + taTitleGap) : 0);
                }
            }
        }
        return offsets;
    }, cleanGroup:function (creator) {
        if (this.opt.enableCache && this.group) {
            this._lineFreePool = this._lineFreePool.concat(this._lineUsePool);
            this._lineUsePool = [];
            this._textFreePool = this._textFreePool.concat(this._textUsePool);
            this._textUsePool = [];
        }
        this.inherited(arguments);
    }, createText:function (labelType, creator, x, y, align, textContent, font, fontColor, labelWidth) {
        if (!this.opt.enableCache || labelType == "html") {
            return acommon.createText[labelType](this.chart, creator, x, y, align, textContent, font, fontColor, labelWidth);
        }
        var text;
        if (this._textFreePool.length > 0) {
            text = this._textFreePool.pop();
            text.setShape({x:x, y:y, text:textContent, align:align});
            creator.add(text);
        } else {
            text = acommon.createText[labelType](this.chart, creator, x, y, align, textContent, font, fontColor);
        }
        this._textUsePool.push(text);
        return text;
    }, createLine:function (creator, params) {
        var line;
        if (this.opt.enableCache && this._lineFreePool.length > 0) {
            line = this._lineFreePool.pop();
            line.setShape(params);
            creator.add(line);
        } else {
            line = creator.createLine(params);
        }
        if (this.opt.enableCache) {
            this._lineUsePool.push(line);
        }
        return line;
    }, render:function (dim, offsets) {
        var isRtl = this._isRtl();
        if (!this.dirty || !this.scaler) {
            return this;
        }
        var o = this.opt, ta = this.chart.theme.axis, position = o.position, leftBottom = position !== "rightOrTop", rotation = o.rotation % 360, start, stop, titlePos, titleRotation = 0, titleOffset, axisVector, tickVector, anchorOffset, labelOffset, labelAlign, labelGap = this.chart.theme.axis.tick.labelGap, taFont = o.font || (ta.majorTick && ta.majorTick.font) || (ta.tick && ta.tick.font), taTitleFont = o.titleFont || (ta.title && ta.title.font), taFontColor = o.fontColor || (ta.majorTick && ta.majorTick.fontColor) || (ta.tick && ta.tick.fontColor) || "black", taTitleFontColor = o.titleFontColor || (ta.title && ta.title.fontColor) || "black", taTitleGap = (o.titleGap == 0) ? 0 : o.titleGap || (ta.title && ta.title.gap) || 15, taTitleOrientation = o.titleOrientation || (ta.title && ta.title.orientation) || "axis", taMajorTick = this.chart.theme.getTick("major", o), taMinorTick = this.chart.theme.getTick("minor", o), taMicroTick = this.chart.theme.getTick("micro", o), taStroke = "stroke" in o ? o.stroke : ta.stroke, size = taFont ? g.normalizedLength(g.splitFontString(taFont).size) : 0, cosr = Math.abs(Math.cos(rotation * Math.PI / 180)), sinr = Math.abs(Math.sin(rotation * Math.PI / 180)), tsize = taTitleFont ? g.normalizedLength(g.splitFontString(taTitleFont).size) : 0;
        if (typeof labelGap != "number") {
            labelGap = 4;
        }
        if (rotation < 0) {
            rotation += 360;
        }
        var cachedLabelW = this._getMaxLabelSize();
        cachedLabelW = cachedLabelW && cachedLabelW.majLabelW;
        if (this.vertical) {
            start = {y:dim.height - offsets.b};
            stop = {y:offsets.t};
            titlePos = {y:(dim.height - offsets.b + offsets.t) / 2};
            titleOffset = size * sinr + (cachedLabelW || 0) * cosr + labelGap + Math.max(taMajorTick.length > 0 ? taMajorTick.length : 0, taMinorTick.length > 0 ? taMinorTick.length : 0) + tsize + taTitleGap;
            axisVector = {x:0, y:-1};
            labelOffset = {x:0, y:0};
            tickVector = {x:1, y:0};
            anchorOffset = {x:labelGap, y:0};
            switch (rotation) {
              case 0:
                labelAlign = "end";
                labelOffset.y = size * 0.4;
                break;
              case 90:
                labelAlign = "middle";
                labelOffset.x = -size;
                break;
              case 180:
                labelAlign = "start";
                labelOffset.y = -size * 0.4;
                break;
              case 270:
                labelAlign = "middle";
                break;
              default:
                if (rotation < centerAnchorLimit) {
                    labelAlign = "end";
                    labelOffset.y = size * 0.4;
                } else {
                    if (rotation < 90) {
                        labelAlign = "end";
                        labelOffset.y = size * 0.4;
                    } else {
                        if (rotation < (180 - centerAnchorLimit)) {
                            labelAlign = "start";
                        } else {
                            if (rotation < (180 + centerAnchorLimit)) {
                                labelAlign = "start";
                                labelOffset.y = -size * 0.4;
                            } else {
                                if (rotation < 270) {
                                    labelAlign = "start";
                                    labelOffset.x = leftBottom ? 0 : size * 0.4;
                                } else {
                                    if (rotation < (360 - centerAnchorLimit)) {
                                        labelAlign = "end";
                                        labelOffset.x = leftBottom ? 0 : size * 0.4;
                                    } else {
                                        labelAlign = "end";
                                        labelOffset.y = size * 0.4;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (leftBottom) {
                start.x = stop.x = position === "center" ? dim.width / 2 : offsets.l;
                titleRotation = (taTitleOrientation && taTitleOrientation == "away") ? 90 : 270;
                titlePos.x = offsets.l - titleOffset + (titleRotation == 270 ? tsize : 0);
                tickVector.x = -1;
                anchorOffset.x = -anchorOffset.x;
            } else {
                start.x = stop.x = dim.width - offsets.r;
                titleRotation = (taTitleOrientation && taTitleOrientation == "axis") ? 90 : 270;
                titlePos.x = dim.width - offsets.r + titleOffset - (titleRotation == 270 ? 0 : tsize);
                switch (labelAlign) {
                  case "start":
                    labelAlign = "end";
                    break;
                  case "end":
                    labelAlign = "start";
                    break;
                  case "middle":
                    labelOffset.x += size;
                    break;
                }
            }
        } else {
            start = {x:offsets.l};
            stop = {x:dim.width - offsets.r};
            titlePos = {x:(dim.width - offsets.r + offsets.l) / 2};
            titleOffset = size * cosr + (cachedLabelW || 0) * sinr + labelGap + Math.max(taMajorTick.length > 0 ? taMajorTick.length : 0, taMinorTick.length > 0 ? taMinorTick.length : 0) + tsize + taTitleGap;
            axisVector = {x:isRtl ? -1 : 1, y:0};
            labelOffset = {x:0, y:0};
            tickVector = {x:0, y:1};
            anchorOffset = {x:0, y:labelGap};
            switch (rotation) {
              case 0:
                labelAlign = "middle";
                labelOffset.y = size;
                break;
              case 90:
                labelAlign = "start";
                labelOffset.x = -size * 0.4;
                break;
              case 180:
                labelAlign = "middle";
                break;
              case 270:
                labelAlign = "end";
                labelOffset.x = size * 0.4;
                break;
              default:
                if (rotation < (90 - centerAnchorLimit)) {
                    labelAlign = "start";
                    labelOffset.y = leftBottom ? size : 0;
                } else {
                    if (rotation < (90 + centerAnchorLimit)) {
                        labelAlign = "start";
                        labelOffset.x = -size * 0.4;
                    } else {
                        if (rotation < 180) {
                            labelAlign = "start";
                            labelOffset.y = leftBottom ? 0 : -size;
                        } else {
                            if (rotation < (270 - centerAnchorLimit)) {
                                labelAlign = "end";
                                labelOffset.y = leftBottom ? 0 : -size;
                            } else {
                                if (rotation < (270 + centerAnchorLimit)) {
                                    labelAlign = "end";
                                    labelOffset.y = leftBottom ? size * 0.4 : 0;
                                } else {
                                    labelAlign = "end";
                                    labelOffset.y = leftBottom ? size : 0;
                                }
                            }
                        }
                    }
                }
            }
            if (leftBottom) {
                start.y = stop.y = position === "center" ? dim.height / 2 : dim.height - offsets.b;
                titleRotation = (taTitleOrientation && taTitleOrientation == "axis") ? 180 : 0;
                titlePos.y = dim.height - offsets.b + titleOffset - (titleRotation ? tsize : 0);
            } else {
                start.y = stop.y = offsets.t;
                titleRotation = (taTitleOrientation && taTitleOrientation == "away") ? 180 : 0;
                titlePos.y = offsets.t - titleOffset + (titleRotation ? 0 : tsize);
                tickVector.y = -1;
                anchorOffset.y = -anchorOffset.y;
                switch (labelAlign) {
                  case "start":
                    labelAlign = "end";
                    break;
                  case "end":
                    labelAlign = "start";
                    break;
                  case "middle":
                    labelOffset.y -= size;
                    break;
                }
            }
        }
        this.cleanGroup();
        var s = this.group, c = this.scaler, t = this.ticks, f = lin.getTransformerFromModel(this.scaler), labelType = (!o.title || !titleRotation) && !rotation && this.opt.htmlLabels && !has("ie") && !has("opera") ? "html" : "gfx", dx = tickVector.x * taMajorTick.length, dy = tickVector.y * taMajorTick.length, skip = this._skipInterval;
        s.createLine({x1:start.x, y1:start.y, x2:stop.x, y2:stop.y}).setStroke(taStroke);
        if (o.title) {
            var axisTitle = acommon.createText[labelType](this.chart, s, titlePos.x, titlePos.y, "middle", o.title, taTitleFont, taTitleFontColor);
            if (labelType == "html") {
                this.htmlElements.push(axisTitle);
            } else {
                axisTitle.setTransform(g.matrix.rotategAt(titleRotation, titlePos.x, titlePos.y));
            }
        }
        if (t == null) {
            this.dirty = false;
            return this;
        }
        var rel = (t.major.length > 0) ? (t.major[0].value - this._majorStart) / c.major.tick : 0;
        var canLabel = this.opt.majorLabels;
        arr.forEach(t.major, function (tick, i) {
            var offset = f(tick.value), elem, x = (isRtl ? stop.x : start.x) + axisVector.x * offset, y = start.y + axisVector.y * offset;
            i += rel;
            this.createLine(s, {x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMajorTick);
            if (tick.label && (!skip || (i - (1 + skip)) % (1 + skip) == 0)) {
                var label = o.maxLabelCharCount ? this.getTextWithLimitCharCount(tick.label, taFont, o.maxLabelCharCount) : {text:tick.label, truncated:false};
                label = o.maxLabelSize ? this.getTextWithLimitLength(label.text, taFont, o.maxLabelSize, label.truncated) : label;
                elem = this.createText(labelType, s, x + (taMajorTick.length > 0 ? dx : 0) + anchorOffset.x + (rotation ? 0 : labelOffset.x), y + (taMajorTick.length > 0 ? dy : 0) + anchorOffset.y + (rotation ? 0 : labelOffset.y), labelAlign, label.text, taFont, taFontColor);
                if (label.truncated) {
                    this.chart.formatTruncatedLabel(elem, tick.label, labelType);
                }
                label.truncated && this.labelTooltip(elem, this.chart, tick.label, label.text, taFont, labelType);
                if (labelType == "html") {
                    this.htmlElements.push(elem);
                } else {
                    if (rotation) {
                        elem.setTransform([{dx:labelOffset.x, dy:labelOffset.y}, g.matrix.rotategAt(rotation, x + (taMajorTick.length > 0 ? dx : 0) + anchorOffset.x, y + (taMajorTick.length > 0 ? dy : 0) + anchorOffset.y)]);
                    }
                }
            }
        }, this);
        dx = tickVector.x * taMinorTick.length;
        dy = tickVector.y * taMinorTick.length;
        canLabel = this.opt.minorLabels && c.minMinorStep <= c.minor.tick * c.bounds.scale;
        arr.forEach(t.minor, function (tick) {
            var offset = f(tick.value), elem, x = (isRtl ? stop.x : start.x) + axisVector.x * offset, y = start.y + axisVector.y * offset;
            this.createLine(s, {x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMinorTick);
            if (canLabel && tick.label) {
                var label = o.maxLabelCharCount ? this.getTextWithLimitCharCount(tick.label, taFont, o.maxLabelCharCount) : {text:tick.label, truncated:false};
                label = o.maxLabelSize ? this.getTextWithLimitLength(label.text, taFont, o.maxLabelSize, label.truncated) : label;
                elem = this.createText(labelType, s, x + (taMinorTick.length > 0 ? dx : 0) + anchorOffset.x + (rotation ? 0 : labelOffset.x), y + (taMinorTick.length > 0 ? dy : 0) + anchorOffset.y + (rotation ? 0 : labelOffset.y), labelAlign, label.text, taFont, taFontColor);
                if (label.truncated) {
                    this.chart.formatTruncatedLabel(elem, tick.label, labelType);
                }
                label.truncated && this.labelTooltip(elem, this.chart, tick.label, label.text, taFont, labelType);
                if (labelType == "html") {
                    this.htmlElements.push(elem);
                } else {
                    if (rotation) {
                        elem.setTransform([{dx:labelOffset.x, dy:labelOffset.y}, g.matrix.rotategAt(rotation, x + (taMinorTick.length > 0 ? dx : 0) + anchorOffset.x, y + (taMinorTick.length > 0 ? dy : 0) + anchorOffset.y)]);
                    }
                }
            }
        }, this);
        dx = tickVector.x * taMicroTick.length;
        dy = tickVector.y * taMicroTick.length;
        arr.forEach(t.micro, function (tick) {
            var offset = f(tick.value), x = start.x + axisVector.x * offset, y = start.y + axisVector.y * offset;
            this.createLine(s, {x1:x, y1:y, x2:x + dx, y2:y + dy}).setStroke(taMicroTick);
        }, this);
        this.dirty = false;
        return this;
    }, labelTooltip:function (elem, chart, label, truncatedLabel, font, elemType) {
        var modules = ["dijit/Tooltip"];
        var aroundRect = {type:"rect"}, position = ["above", "below"], fontWidth = g._base._getTextBox(truncatedLabel, {font:font}).w || 0, fontHeight = font ? g.normalizedLength(g.splitFontString(font).size) : 0;
        if (elemType == "html") {
            lang.mixin(aroundRect, domGeom.position(elem.firstChild, true));
            aroundRect.width = Math.ceil(fontWidth);
            aroundRect.height = Math.ceil(fontHeight);
            this._events.push({shape:dojo, handle:connect.connect(elem.firstChild, "onmouseover", this, function (e) {
                require(modules, function (Tooltip) {
                    Tooltip.show(label, aroundRect, position);
                });
            })});
            this._events.push({shape:dojo, handle:connect.connect(elem.firstChild, "onmouseout", this, function (e) {
                require(modules, function (Tooltip) {
                    Tooltip.hide(aroundRect);
                });
            })});
        } else {
            var shp = elem.getShape(), lt = chart.getCoords();
            aroundRect = lang.mixin(aroundRect, {x:shp.x - fontWidth / 2, y:shp.y});
            aroundRect.x += lt.x;
            aroundRect.y += lt.y;
            aroundRect.x = Math.round(aroundRect.x);
            aroundRect.y = Math.round(aroundRect.y);
            aroundRect.width = Math.ceil(fontWidth);
            aroundRect.height = Math.ceil(fontHeight);
            this._events.push({shape:elem, handle:elem.connect("onmouseenter", this, function (e) {
                require(modules, function (Tooltip) {
                    Tooltip.show(label, aroundRect, position);
                });
            })});
            this._events.push({shape:elem, handle:elem.connect("onmouseleave", this, function (e) {
                require(modules, function (Tooltip) {
                    Tooltip.hide(aroundRect);
                });
            })});
        }
    }, _isRtl:function () {
        return false;
    }});
    return 0 ? declare("dojox.charting.axis2d.Default", [Default, BidiDefault]) : Default;
});

