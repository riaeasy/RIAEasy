//>>built

define("dijit/place", ["dojo/_base/array", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/kernel", "dojo/_base/window", "./Viewport", "./main"], function (array, domGeometry, domStyle, kernel, win, Viewport, dijit) {
    function _place(node, choices, layoutNode, aroundNodeCoords) {
        var view = Viewport.getEffectiveBox(node.ownerDocument);
        if (!node.parentNode || String(node.parentNode.tagName).toLowerCase() != "body") {
            win.body(node.ownerDocument).appendChild(node);
        }
        var best = null;
        array.some(choices, function (choice) {
            var corner = choice.corner;
            var pos = choice.pos;
            var overflow = 0;
            var spaceAvailable = {w:{"L":view.l + view.w - pos.x, "R":pos.x - view.l, "M":view.w}[corner.charAt(1)], h:{"T":view.t + view.h - pos.y, "B":pos.y - view.t, "M":view.h}[corner.charAt(0)]};
            var s = node.style;
            s.left = s.right = "auto";
            if (layoutNode) {
                var res = layoutNode(node, choice.aroundCorner, corner, spaceAvailable, aroundNodeCoords);
                overflow = typeof res == "undefined" ? 0 : res;
            }
            var style = node.style;
            var oldDisplay = style.display;
            var oldVis = style.visibility;
            if (style.display == "none") {
                style.visibility = "hidden";
                style.display = "";
            }
            var bb = domGeometry.position(node);
            style.display = oldDisplay;
            style.visibility = oldVis;
            var startXpos = {"L":pos.x, "R":pos.x - bb.w, "M":Math.max(view.l, Math.min(view.l + view.w, pos.x + (bb.w >> 1)) - bb.w)}[corner.charAt(1)], startYpos = {"T":pos.y, "B":pos.y - bb.h, "M":Math.max(view.t, Math.min(view.t + view.h, pos.y + (bb.h >> 1)) - bb.h)}[corner.charAt(0)], startX = Math.max(view.l, startXpos), startY = Math.max(view.t, startYpos), endX = Math.min(view.l + view.w, startXpos + bb.w), endY = Math.min(view.t + view.h, startYpos + bb.h), width = endX - startX, height = endY - startY;
            overflow += (bb.w - width) + (bb.h - height);
            if (best == null || overflow < best.overflow) {
                best = {corner:corner, aroundCorner:choice.aroundCorner, x:startX, y:startY, w:width, h:height, overflow:overflow, spaceAvailable:spaceAvailable};
            }
            return !overflow;
        });
        if (best.overflow && layoutNode) {
            layoutNode(node, best.aroundCorner, best.corner, best.spaceAvailable, aroundNodeCoords);
        }
        var top = best.y, side = best.x, body = win.body(node.ownerDocument);
        if (/relative|absolute/.test(domStyle.get(body, "position"))) {
            top -= domStyle.get(body, "marginTop");
            side -= domStyle.get(body, "marginLeft");
        }
        var s = node.style;
        s.top = top + "px";
        s.left = side + "px";
        s.right = "auto";
        return best;
    }
    var reverse = {"TL":"BR", "TR":"BL", "BL":"TR", "BR":"TL"};
    var place = {at:function (node, pos, corners, padding, layoutNode) {
        var choices = array.map(corners, function (corner) {
            var c = {corner:corner, aroundCorner:reverse[corner], pos:{x:pos.x, y:pos.y}};
            if (padding) {
                c.pos.x += corner.charAt(1) == "L" ? padding.x : -padding.x;
                c.pos.y += corner.charAt(0) == "T" ? padding.y : -padding.y;
            }
            return c;
        });
        return _place(node, choices, layoutNode);
    }, around:function (node, anchor, positions, leftToRight, layoutNode) {
        var aroundNodePos;
        if (typeof anchor == "string" || "offsetWidth" in anchor || "ownerSVGElement" in anchor) {
            aroundNodePos = domGeometry.position(anchor, true);
            if (/^(above|below)/.test(positions[0])) {
                var anchorBorder = domGeometry.getBorderExtents(anchor), anchorChildBorder = anchor.firstChild ? domGeometry.getBorderExtents(anchor.firstChild) : {t:0, l:0, b:0, r:0}, nodeBorder = domGeometry.getBorderExtents(node), nodeChildBorder = node.firstChild ? domGeometry.getBorderExtents(node.firstChild) : {t:0, l:0, b:0, r:0};
                aroundNodePos.y += Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t + nodeChildBorder.t);
                aroundNodePos.h -= Math.min(anchorBorder.t + anchorChildBorder.t, nodeBorder.t + nodeChildBorder.t) + Math.min(anchorBorder.b + anchorChildBorder.b, nodeBorder.b + nodeChildBorder.b);
            }
        } else {
            aroundNodePos = anchor;
        }
        if (anchor.parentNode) {
            var sawPosAbsolute = domStyle.getComputedStyle(anchor).position == "absolute";
            var parent = anchor.parentNode;
            while (parent && parent.nodeType == 1 && parent.nodeName != "BODY") {
                var parentPos = domGeometry.position(parent, true), pcs = domStyle.getComputedStyle(parent);
                if (/relative|absolute/.test(pcs.position)) {
                    sawPosAbsolute = false;
                }
                if (!sawPosAbsolute && /hidden|auto|scroll/.test(pcs.overflow)) {
                    var bottomYCoord = Math.min(aroundNodePos.y + aroundNodePos.h, parentPos.y + parentPos.h);
                    var rightXCoord = Math.min(aroundNodePos.x + aroundNodePos.w, parentPos.x + parentPos.w);
                    aroundNodePos.x = Math.max(aroundNodePos.x, parentPos.x);
                    aroundNodePos.y = Math.max(aroundNodePos.y, parentPos.y);
                    aroundNodePos.h = bottomYCoord - aroundNodePos.y;
                    aroundNodePos.w = rightXCoord - aroundNodePos.x;
                }
                if (pcs.position == "absolute") {
                    sawPosAbsolute = true;
                }
                parent = parent.parentNode;
            }
        }
        var x = aroundNodePos.x, y = aroundNodePos.y, width = "w" in aroundNodePos ? aroundNodePos.w : (aroundNodePos.w = aroundNodePos.width), height = "h" in aroundNodePos ? aroundNodePos.h : (kernel.deprecated("place.around: dijit/place.__Rectangle: { x:" + x + ", y:" + y + ", height:" + aroundNodePos.height + ", width:" + width + " } has been deprecated.  Please use { x:" + x + ", y:" + y + ", h:" + aroundNodePos.height + ", w:" + width + " }", "", "2.0"), aroundNodePos.h = aroundNodePos.height);
        var choices = [];
        function push(aroundCorner, corner) {
            choices.push({aroundCorner:aroundCorner, corner:corner, pos:{x:{"L":x, "R":x + width, "M":x + (width >> 1)}[aroundCorner.charAt(1)], y:{"T":y, "B":y + height, "M":y + (height >> 1)}[aroundCorner.charAt(0)]}});
        }
        array.forEach(positions, function (pos) {
            var ltr = leftToRight;
            switch (pos) {
              case "above-centered":
                push("TM", "BM");
                break;
              case "below-centered":
                push("BM", "TM");
                break;
              case "after-centered":
                ltr = !ltr;
              case "before-centered":
                push(ltr ? "ML" : "MR", ltr ? "MR" : "ML");
                break;
              case "after":
                ltr = !ltr;
              case "before":
                push(ltr ? "TL" : "TR", ltr ? "TR" : "TL");
                push(ltr ? "BL" : "BR", ltr ? "BR" : "BL");
                break;
              case "below-alt":
                ltr = !ltr;
              case "below":
                push(ltr ? "BL" : "BR", ltr ? "TL" : "TR");
                push(ltr ? "BR" : "BL", ltr ? "TR" : "TL");
                break;
              case "above-alt":
                ltr = !ltr;
              case "above":
                push(ltr ? "TL" : "TR", ltr ? "BL" : "BR");
                push(ltr ? "TR" : "TL", ltr ? "BR" : "BL");
                break;
              default:
                push(pos.aroundCorner, pos.corner);
            }
        });
        var position = _place(node, choices, layoutNode, {w:width, h:height});
        position.aroundNodePos = aroundNodePos;
        return position;
    }};
    return dijit.place = place;
});

