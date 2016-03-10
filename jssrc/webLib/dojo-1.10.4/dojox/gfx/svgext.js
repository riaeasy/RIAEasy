//>>built

define("dojox/gfx/svgext", ["dojo/dom", "dojo/_base/array", "dojo/_base/window", "./_base", "./svg"], function (dom, array, win, gfx, svg) {
    var svgext = gfx.svgext = {};
    var toIgnore = {primitives:null, tag:null, children:null};
    function buildFilterPrimitivesDOM(primitive, parentNode) {
        var node = parentNode.ownerDocument.createElementNS(svg.xmlns.svg, primitive.tag);
        parentNode.appendChild(node);
        for (var p in primitive) {
            if (!(p in toIgnore)) {
                node.setAttribute(p, primitive[p]);
            }
        }
        if (primitive.children) {
            array.forEach(primitive.children, function (f) {
                buildFilterPrimitivesDOM(f, node);
            });
        }
        return node;
    }
    svg.Shape.extend({addRenderingOption:function (option, value) {
        this.rawNode.setAttribute(option, value);
        return this;
    }, setFilter:function (filter) {
        if (!filter) {
            this.rawNode.removeAttribute("filter");
            this.filter = null;
            return this;
        }
        this.filter = filter;
        filter.id = filter.id || gfx._base._getUniqueId();
        var filterNode = dom.byId(filter.id);
        if (!filterNode) {
            filterNode = this.rawNode.ownerDocument.createElementNS(svg.xmlns.svg, "filter");
            filterNode.setAttribute("filterUnits", "userSpaceOnUse");
            for (var p in filter) {
                if (!(p in toIgnore)) {
                    filterNode.setAttribute(p, filter[p]);
                }
            }
            array.forEach(filter.primitives, function (p) {
                buildFilterPrimitivesDOM(p, filterNode);
            });
            var surface = this._getParentSurface();
            if (surface) {
                var defs = surface.defNode;
                defs.appendChild(filterNode);
            }
        }
        this.rawNode.setAttribute("filter", "url(#" + filter.id + ")");
        return this;
    }, getFilter:function () {
        return this.filter;
    }});
    return svgext;
});

