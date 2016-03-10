//>>built

define("dojox/collections/Set", ["./_base", "./ArrayList"], function (dxc, ArrayList) {
    dxc.Set = new (function () {
        function conv(arr) {
            if (arr.constructor == Array) {
                return new ArrayList(arr);
            }
            return arr;
        }
        this.union = function (setA, setB) {
            setA = conv(setA);
            setB = conv(setB);
            var result = new ArrayList(setA.toArray());
            var e = setB.getIterator();
            while (!e.atEnd()) {
                var item = e.get();
                if (!result.contains(item)) {
                    result.add(item);
                }
            }
            return result;
        };
        this.intersection = function (setA, setB) {
            setA = conv(setA);
            setB = conv(setB);
            var result = new ArrayList();
            var e = setB.getIterator();
            while (!e.atEnd()) {
                var item = e.get();
                if (setA.contains(item)) {
                    result.add(item);
                }
            }
            return result;
        };
        this.difference = function (setA, setB) {
            setA = conv(setA);
            setB = conv(setB);
            var result = new ArrayList();
            var e = setA.getIterator();
            while (!e.atEnd()) {
                var item = e.get();
                if (!setB.contains(item)) {
                    result.add(item);
                }
            }
            return result;
        };
        this.isSubSet = function (setA, setB) {
            setA = conv(setA);
            setB = conv(setB);
            var e = setA.getIterator();
            while (!e.atEnd()) {
                if (!setB.contains(e.get())) {
                    return false;
                }
            }
            return true;
        };
        this.isSuperSet = function (setA, setB) {
            setA = conv(setA);
            setB = conv(setB);
            var e = setB.getIterator();
            while (!e.atEnd()) {
                if (!setA.contains(e.get())) {
                    return false;
                }
            }
            return true;
        };
    })();
    return dxc.Set;
});

