//>>built

define("dojox/mobile/DataCarousel", ["dojo/_base/kernel", "dojo/_base/declare", "./Carousel", "./_DataMixin"], function (kernel, declare, Carousel, DataMixin) {
    kernel.deprecated("dojox/mobile/DataCarousel", "Use dojox/mobile/StoreCarousel instead", 2);
    return declare("dojox.mobile.DataCarousel", [Carousel, DataMixin], {});
});

