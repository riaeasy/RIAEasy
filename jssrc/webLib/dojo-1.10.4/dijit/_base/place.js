//>>built

define("dijit/_base/place", ["dojo/_base/array", "dojo/_base/lang", "dojo/window", "../place", "../main"], function (array, lang, windowUtils, place, dijit) {
    var exports = {};
    exports.getViewport = function () {
        return windowUtils.getBox();
    };
    exports.placeOnScreen = place.at;
    exports.placeOnScreenAroundElement = function (node, aroundNode, aroundCorners, layoutNode) {
        var positions;
        if (lang.isArray(aroundCorners)) {
            positions = aroundCorners;
        } else {
            positions = [];
            for (var key in aroundCorners) {
                positions.push({aroundCorner:key, corner:aroundCorners[key]});
            }
        }
        return place.around(node, aroundNode, positions, true, layoutNode);
    };
    exports.placeOnScreenAroundNode = exports.placeOnScreenAroundElement;
    exports.placeOnScreenAroundRectangle = exports.placeOnScreenAroundElement;
    exports.getPopupAroundAlignment = function (position, leftToRight) {
        var align = {};
        array.forEach(position, function (pos) {
            var ltr = leftToRight;
            switch (pos) {
              case "after":
                align[leftToRight ? "BR" : "BL"] = leftToRight ? "BL" : "BR";
                break;
              case "before":
                align[leftToRight ? "BL" : "BR"] = leftToRight ? "BR" : "BL";
                break;
              case "below-alt":
                ltr = !ltr;
              case "below":
                align[ltr ? "BL" : "BR"] = ltr ? "TL" : "TR";
                align[ltr ? "BR" : "BL"] = ltr ? "TR" : "TL";
                break;
              case "above-alt":
                ltr = !ltr;
              case "above":
              default:
                align[ltr ? "TL" : "TR"] = ltr ? "BL" : "BR";
                align[ltr ? "TR" : "TL"] = ltr ? "BR" : "BL";
                break;
            }
        });
        return align;
    };
    lang.mixin(dijit, exports);
    return dijit;
});

