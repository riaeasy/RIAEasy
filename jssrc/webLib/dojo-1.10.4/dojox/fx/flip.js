//>>built

define("dojox/fx/flip", ["dojo/_base/kernel", "dojo/_base/html", "dojo/dom", "dojo/dom-construct", "dojo/dom-geometry", "dojo/_base/connect", "dojo/_base/Color", "dojo/_base/sniff", "dojo/_base/lang", "dojo/_base/window", "dojo/_base/fx", "dojo/fx", "./_base"], function (kernel, htmlUtil, dom, domConstruct, domGeom, connectUtil, Color, has, lang, winUtil, baseFx, coreFx, fxExt) {
    kernel.experimental("dojox.fx.flip");
    var borderConst = "border", widthConst = "Width", heightConst = "Height", topConst = "Top", rightConst = "Right", leftConst = "Left", bottomConst = "Bottom";
    fxExt.flip = function (args) {
        var helperNode = domConstruct.create("div"), node = args.node = dom.byId(args.node), s = node.style, dims = null, hs = null, pn = null, lightColor = args.lightColor || "#dddddd", darkColor = args.darkColor || "#555555", bgColor = htmlUtil.style(node, "backgroundColor"), endColor = args.endColor || bgColor, staticProps = {}, anims = [], duration = args.duration ? args.duration / 2 : 250, dir = args.dir || "left", pConst = 0.9, transparentColor = "transparent", whichAnim = args.whichAnim, axis = args.axis || "center", depth = args.depth;
        var convertColor = function (color) {
            return ((new Color(color)).toHex() === "#000000") ? "#000001" : color;
        };
        if (has("ie") < 7) {
            endColor = convertColor(endColor);
            lightColor = convertColor(lightColor);
            darkColor = convertColor(darkColor);
            bgColor = convertColor(bgColor);
            transparentColor = "black";
            helperNode.style.filter = "chroma(color='#000000')";
        }
        var init = (function (n) {
            return function () {
                var ret = htmlUtil.coords(n, true);
                dims = {top:ret.y, left:ret.x, width:ret.w, height:ret.h};
            };
        })(node);
        init();
        hs = {position:"absolute", top:dims["top"] + "px", left:dims["left"] + "px", height:"0", width:"0", zIndex:args.zIndex || (s.zIndex || 0), border:"0 solid " + transparentColor, fontSize:"0", visibility:"hidden"};
        var props = [{}, {top:dims["top"], left:dims["left"]}];
        var dynProperties = {left:[leftConst, rightConst, topConst, bottomConst, widthConst, heightConst, "end" + heightConst + "Min", leftConst, "end" + heightConst + "Max"], right:[rightConst, leftConst, topConst, bottomConst, widthConst, heightConst, "end" + heightConst + "Min", leftConst, "end" + heightConst + "Max"], top:[topConst, bottomConst, leftConst, rightConst, heightConst, widthConst, "end" + widthConst + "Min", topConst, "end" + widthConst + "Max"], bottom:[bottomConst, topConst, leftConst, rightConst, heightConst, widthConst, "end" + widthConst + "Min", topConst, "end" + widthConst + "Max"]};
        pn = dynProperties[dir];
        if (typeof depth != "undefined") {
            depth = Math.max(0, Math.min(1, depth)) / 2;
            pConst = 0.4 + (0.5 - depth);
        } else {
            pConst = Math.min(0.9, Math.max(0.4, dims[pn[5].toLowerCase()] / dims[pn[4].toLowerCase()]));
        }
        var p0 = props[0];
        for (var i = 4; i < 6; i++) {
            if (axis == "center" || axis == "cube") {
                dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()] * pConst;
                dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()] / pConst;
            } else {
                if (axis == "shortside") {
                    dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()];
                    dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()] / pConst;
                } else {
                    if (axis == "longside") {
                        dims["end" + pn[i] + "Min"] = dims[pn[i].toLowerCase()] * pConst;
                        dims["end" + pn[i] + "Max"] = dims[pn[i].toLowerCase()];
                    }
                }
            }
        }
        if (axis == "center") {
            p0[pn[2].toLowerCase()] = dims[pn[2].toLowerCase()] - (dims[pn[8]] - dims[pn[6]]) / 4;
        } else {
            if (axis == "shortside") {
                p0[pn[2].toLowerCase()] = dims[pn[2].toLowerCase()] - (dims[pn[8]] - dims[pn[6]]) / 2;
            }
        }
        staticProps[pn[5].toLowerCase()] = dims[pn[5].toLowerCase()] + "px";
        staticProps[pn[4].toLowerCase()] = "0";
        staticProps[borderConst + pn[1] + widthConst] = dims[pn[4].toLowerCase()] + "px";
        staticProps[borderConst + pn[1] + "Color"] = bgColor;
        p0[borderConst + pn[1] + widthConst] = 0;
        p0[borderConst + pn[1] + "Color"] = darkColor;
        p0[borderConst + pn[2] + widthConst] = p0[borderConst + pn[3] + widthConst] = axis != "cube" ? (dims["end" + pn[5] + "Max"] - dims["end" + pn[5] + "Min"]) / 2 : dims[pn[6]] / 2;
        p0[pn[7].toLowerCase()] = dims[pn[7].toLowerCase()] + dims[pn[4].toLowerCase()] / 2 + (args.shift || 0);
        p0[pn[5].toLowerCase()] = dims[pn[6]];
        var p1 = props[1];
        p1[borderConst + pn[0] + "Color"] = {start:lightColor, end:endColor};
        p1[borderConst + pn[0] + widthConst] = dims[pn[4].toLowerCase()];
        p1[borderConst + pn[2] + widthConst] = 0;
        p1[borderConst + pn[3] + widthConst] = 0;
        p1[pn[5].toLowerCase()] = {start:dims[pn[6]], end:dims[pn[5].toLowerCase()]};
        lang.mixin(hs, staticProps);
        htmlUtil.style(helperNode, hs);
        winUtil.body().appendChild(helperNode);
        var finalize = function () {
            domConstruct.destroy(helperNode);
            s.backgroundColor = endColor;
            s.visibility = "visible";
        };
        if (whichAnim == "last") {
            for (i in p0) {
                p0[i] = {start:p0[i]};
            }
            p0[borderConst + pn[1] + "Color"] = {start:darkColor, end:endColor};
            p1 = p0;
        }
        if (!whichAnim || whichAnim == "first") {
            anims.push(baseFx.animateProperty({node:helperNode, duration:duration, properties:p0}));
        }
        if (!whichAnim || whichAnim == "last") {
            anims.push(baseFx.animateProperty({node:helperNode, duration:duration, properties:p1, onEnd:finalize}));
        }
        connectUtil.connect(anims[0], "play", function () {
            helperNode.style.visibility = "visible";
            s.visibility = "hidden";
        });
        return coreFx.chain(anims);
    };
    fxExt.flipCube = function (args) {
        var anims = [], mb = domGeom.getMarginBox(args.node), shiftX = mb.w / 2, shiftY = mb.h / 2, dims = {top:{pName:"height", args:[{whichAnim:"first", dir:"top", shift:-shiftY}, {whichAnim:"last", dir:"bottom", shift:shiftY}]}, right:{pName:"width", args:[{whichAnim:"first", dir:"right", shift:shiftX}, {whichAnim:"last", dir:"left", shift:-shiftX}]}, bottom:{pName:"height", args:[{whichAnim:"first", dir:"bottom", shift:shiftY}, {whichAnim:"last", dir:"top", shift:-shiftY}]}, left:{pName:"width", args:[{whichAnim:"first", dir:"left", shift:-shiftX}, {whichAnim:"last", dir:"right", shift:shiftX}]}};
        var d = dims[args.dir || "left"], p = d.args;
        args.duration = args.duration ? args.duration * 2 : 500;
        args.depth = 0.8;
        args.axis = "cube";
        for (var i = p.length - 1; i >= 0; i--) {
            lang.mixin(args, p[i]);
            anims.push(fxExt.flip(args));
        }
        return coreFx.combine(anims);
    };
    fxExt.flipPage = function (args) {
        var n = args.node, coords = htmlUtil.coords(n, true), x = coords.x, y = coords.y, w = coords.w, h = coords.h, bgColor = htmlUtil.style(n, "backgroundColor"), lightColor = args.lightColor || "#dddddd", darkColor = args.darkColor, helperNode = domConstruct.create("div"), anims = [], hn = [], dir = args.dir || "right", pn = {left:["left", "right", "x", "w"], top:["top", "bottom", "y", "h"], right:["left", "left", "x", "w"], bottom:["top", "top", "y", "h"]}, shiftMultiplier = {right:[1, -1], left:[-1, 1], top:[-1, 1], bottom:[1, -1]};
        htmlUtil.style(helperNode, {position:"absolute", width:w + "px", height:h + "px", top:y + "px", left:x + "px", visibility:"hidden"});
        var hs = [];
        for (var i = 0; i < 2; i++) {
            var r = i % 2, d = r ? pn[dir][1] : dir, wa = r ? "last" : "first", endColor = r ? bgColor : lightColor, startColor = r ? endColor : args.startColor || n.style.backgroundColor;
            hn[i] = lang.clone(helperNode);
            var finalize = function (x) {
                return function () {
                    domConstruct.destroy(hn[x]);
                };
            }(i);
            winUtil.body().appendChild(hn[i]);
            hs[i] = {backgroundColor:r ? startColor : bgColor};
            hs[i][pn[dir][0]] = coords[pn[dir][2]] + shiftMultiplier[dir][0] * i * coords[pn[dir][3]] + "px";
            htmlUtil.style(hn[i], hs[i]);
            anims.push(dojox.fx.flip({node:hn[i], dir:d, axis:"shortside", depth:args.depth, duration:args.duration / 2, shift:shiftMultiplier[dir][i] * coords[pn[dir][3]] / 2, darkColor:darkColor, lightColor:lightColor, whichAnim:wa, endColor:endColor}));
            connectUtil.connect(anims[i], "onEnd", finalize);
        }
        return coreFx.chain(anims);
    };
    fxExt.flipGrid = function (args) {
        var rows = args.rows || 4, cols = args.cols || 4, anims = [], helperNode = domConstruct.create("div"), n = args.node, coords = htmlUtil.coords(n, true), x = coords.x, y = coords.y, nw = coords.w, nh = coords.h, w = coords.w / cols, h = coords.h / rows, cAnims = [];
        htmlUtil.style(helperNode, {position:"absolute", width:w + "px", height:h + "px", backgroundColor:htmlUtil.style(n, "backgroundColor")});
        for (var i = 0; i < rows; i++) {
            var r = i % 2, d = r ? "right" : "left", signum = r ? 1 : -1;
            var cn = lang.clone(n);
            htmlUtil.style(cn, {position:"absolute", width:nw + "px", height:nh + "px", top:y + "px", left:x + "px", clip:"rect(" + i * h + "px," + nw + "px," + nh + "px,0)"});
            winUtil.body().appendChild(cn);
            anims[i] = [];
            for (var j = 0; j < cols; j++) {
                var hn = lang.clone(helperNode), l = r ? j : cols - (j + 1);
                var adjustClip = function (xn, yCounter, xCounter) {
                    return function () {
                        if (!(yCounter % 2)) {
                            htmlUtil.style(xn, {clip:"rect(" + yCounter * h + "px," + (nw - (xCounter + 1) * w) + "px," + ((yCounter + 1) * h) + "px,0px)"});
                        } else {
                            htmlUtil.style(xn, {clip:"rect(" + yCounter * h + "px," + nw + "px," + ((yCounter + 1) * h) + "px," + ((xCounter + 1) * w) + "px)"});
                        }
                    };
                }(cn, i, j);
                winUtil.body().appendChild(hn);
                htmlUtil.style(hn, {left:x + l * w + "px", top:y + i * h + "px", visibility:"hidden"});
                var a = dojox.fx.flipPage({node:hn, dir:d, duration:args.duration || 900, shift:signum * w / 2, depth:0.2, darkColor:args.darkColor, lightColor:args.lightColor, startColor:args.startColor || args.node.style.backgroundColor}), removeHelper = function (xn) {
                    return function () {
                        domConstruct.destroy(xn);
                    };
                }(hn);
                connectUtil.connect(a, "play", this, adjustClip);
                connectUtil.connect(a, "play", this, removeHelper);
                anims[i].push(a);
            }
            cAnims.push(coreFx.chain(anims[i]));
        }
        connectUtil.connect(cAnims[0], "play", function () {
            htmlUtil.style(n, {visibility:"hidden"});
        });
        return coreFx.combine(cAnims);
    };
    return fxExt;
});

