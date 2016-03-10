//>>built

define("dojo/data/util/sorter", ["../../_base/lang"], function (lang) {
    var sorter = {};
    lang.setObject("dojo.data.util.sorter", sorter);
    sorter.basicComparator = function (a, b) {
        var r = -1;
        if (a === null) {
            a = undefined;
        }
        if (b === null) {
            b = undefined;
        }
        if (a == b) {
            r = 0;
        } else {
            if (a > b || a == null) {
                r = 1;
            }
        }
        return r;
    };
    sorter.createSortFunction = function (sortSpec, store) {
        var sortFunctions = [];
        function createSortFunction(attr, dir, comp, s) {
            return function (itemA, itemB) {
                var a = s.getValue(itemA, attr);
                var b = s.getValue(itemB, attr);
                return dir * comp(a, b);
            };
        }
        var sortAttribute;
        var map = store.comparatorMap;
        var bc = sorter.basicComparator;
        for (var i = 0; i < sortSpec.length; i++) {
            sortAttribute = sortSpec[i];
            var attr = sortAttribute.attribute;
            if (attr) {
                var dir = (sortAttribute.descending) ? -1 : 1;
                var comp = bc;
                if (map) {
                    if (typeof attr !== "string" && ("toString" in attr)) {
                        attr = attr.toString();
                    }
                    comp = map[attr] || bc;
                }
                sortFunctions.push(createSortFunction(attr, dir, comp, store));
            }
        }
        return function (rowA, rowB) {
            var i = 0;
            while (i < sortFunctions.length) {
                var ret = sortFunctions[i++](rowA, rowB);
                if (ret !== 0) {
                    return ret;
                }
            }
            return 0;
        };
    };
    return sorter;
});

