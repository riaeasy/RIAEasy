//>>built

define("dojox/mobile/EdgeToEdgeDataList", ["dojo/_base/kernel", "dojo/_base/declare", "./EdgeToEdgeList", "./_DataListMixin"], function (kernel, declare, EdgeToEdgeList, DataListMixin) {
    kernel.deprecated("dojox/mobile/EdgeToEdgeDataList", "Use dojox/mobile/EdgeToEdgeStoreList instead", "2.0");
    return declare("dojox.mobile.EdgeToEdgeDataList", [EdgeToEdgeList, DataListMixin], {});
});

