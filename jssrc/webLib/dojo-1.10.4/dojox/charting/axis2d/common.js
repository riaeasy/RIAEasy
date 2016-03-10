//>>built

define("dojox/charting/axis2d/common", ["dojo/_base/lang", "dojo/_base/window", "dojo/dom-geometry", "dojox/gfx", "dojo/has"], function (lang, win, domGeom, g, has) {
    var common = lang.getObject("dojox.charting.axis2d.common", true);
    var clearNode = function (s) {
        s.marginLeft = "0px";
        s.marginTop = "0px";
        s.marginRight = "0px";
        s.marginBottom = "0px";
        s.paddingLeft = "0px";
        s.paddingTop = "0px";
        s.paddingRight = "0px";
        s.paddingBottom = "0px";
        s.borderLeftWidth = "0px";
        s.borderTopWidth = "0px";
        s.borderRightWidth = "0px";
        s.borderBottomWidth = "0px";
    };
    var getBoxWidth = function (n) {
        if (n["getBoundingClientRect"]) {
            var bcr = n.getBoundingClientRect();
            return bcr.width || (bcr.right - bcr.left);
        } else {
            return domGeom.getMarginBox(n).w;
        }
    };
    return lang.mixin(common, {createText:{gfx:function (chart, creator, x, y, align, text, font, fontColor) {
        return creator.createText({x:x, y:y, text:text, align:align}).setFont(font).setFill(fontColor);
    }, html:function (chart, creator, x, y, align, text, font, fontColor, labelWidth) {
        var p = win.doc.createElement("div"), s = p.style, boxWidth;
        if (chart.getTextDir) {
            p.dir = chart.getTextDir(text);
        }
        clearNode(s);
        s.font = font;
        p.innerHTML = String(text).replace(/\s/g, "&nbsp;");
        s.color = fontColor;
        s.position = "absolute";
        s.left = "-10000px";
        win.body().appendChild(p);
        var size = g.normalizedLength(g.splitFontString(font).size);
        if (!labelWidth) {
            boxWidth = getBoxWidth(p);
        }
        if (p.dir == "rtl") {
            x += labelWidth ? labelWidth : boxWidth;
        }
        win.body().removeChild(p);
        s.position = "relative";
        if (labelWidth) {
            s.width = labelWidth + "px";
            switch (align) {
              case "middle":
                s.textAlign = "center";
                s.left = (x - labelWidth / 2) + "px";
                break;
              case "end":
                s.textAlign = "right";
                s.left = (x - labelWidth) + "px";
                break;
              default:
                s.left = x + "px";
                s.textAlign = "left";
                break;
            }
        } else {
            switch (align) {
              case "middle":
                s.left = Math.floor(x - boxWidth / 2) + "px";
                break;
              case "end":
                s.left = Math.floor(x - boxWidth) + "px";
                break;
              default:
                s.left = Math.floor(x) + "px";
                break;
            }
        }
        s.top = Math.floor(y - size) + "px";
        s.whiteSpace = "nowrap";
        var wrap = win.doc.createElement("div"), w = wrap.style;
        clearNode(w);
        w.width = "0px";
        w.height = "0px";
        wrap.appendChild(p);
        chart.node.insertBefore(wrap, chart.node.firstChild);
        if (0) {
            chart.htmlElementsRegistry.push([wrap, x, y, align, text, font, fontColor]);
        }
        return wrap;
    }}});
});

