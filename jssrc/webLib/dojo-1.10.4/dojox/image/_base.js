//>>built

define("dojox/image/_base", ["dojo", "dojox"], function (dojo, dojox) {
    dojo.getObject("image", true, dojox);
    var d = dojo;
    var cacheNode;
    dojox.image.preload = function (urls) {
        if (!cacheNode) {
            cacheNode = d.create("div", {style:{position:"absolute", top:"-9999px", height:"1px", overflow:"hidden"}}, d.body());
        }
        return d.map(urls, function (url) {
            return d.create("img", {src:url}, cacheNode);
        });
    };
    if (d.config.preloadImages) {
        d.addOnLoad(function () {
            dojox.image.preload(d.config.preloadImages);
        });
    }
});

