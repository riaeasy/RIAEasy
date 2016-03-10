//>>built

define("dojox/app/utils/constraints", ["dojo/_base/array"], function (arr) {
    var constraints = [];
    return {getSelectedChild:function (view, constraint) {
        var type = typeof (constraint);
        var hash = (type == "string" || type == "number") ? constraint : constraint.__hash;
        return (view && view.selectedChildren && view.selectedChildren[hash]) ? view.selectedChildren[hash] : null;
    }, setSelectedChild:function (view, constraint, child) {
        var type = typeof (constraint);
        var hash = (type == "string" || type == "number") ? constraint : constraint.__hash;
        view.selectedChildren[hash] = child;
    }, getAllSelectedChildren:function (view, selChildren) {
        selChildren = selChildren || [];
        if (view && view.selectedChildren) {
            for (var hash in view.selectedChildren) {
                if (view.selectedChildren[hash]) {
                    var subChild = view.selectedChildren[hash];
                    selChildren.push(subChild);
                    this.getAllSelectedChildren(subChild, selChildren);
                }
            }
        }
        return selChildren;
    }, register:function (constraint) {
        var type = typeof (constraint);
        if (!constraint.__hash && type != "string" && type != "number") {
            var match = null;
            arr.some(constraints, function (item) {
                var ok = true;
                for (var prop in item) {
                    if (prop.charAt(0) !== "_") {
                        if (item[prop] != constraint[prop]) {
                            ok = false;
                            break;
                        }
                    }
                }
                if (ok == true) {
                    match = item;
                }
                return ok;
            });
            if (match) {
                constraint.__hash = match.__hash;
            } else {
                var hash = "";
                for (var prop in constraint) {
                    if (prop.charAt(0) !== "_") {
                        hash += constraint[prop];
                    }
                }
                constraint.__hash = hash;
                constraints.push(constraint);
            }
        }
    }};
});

