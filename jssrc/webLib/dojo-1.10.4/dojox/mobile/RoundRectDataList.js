//>>built

define("dojox/mobile/RoundRectDataList", ["dojo/_base/kernel", "dojo/_base/declare", "./RoundRectList", "./_DataListMixin"], function (kernel, declare, RoundRectList, DataListMixin) {
    kernel.deprecated("dojox/mobile/RoundRectDataList", "Use dojox/mobile/RoundRectStoreList instead", "2.0");
    return declare("dojox.mobile.RoundRectDataList", [RoundRectList, DataListMixin], {});
});

