//>>built

define("dojox/mobile/Video", ["dojo/_base/declare", "dojo/sniff", "./Audio"], function (declare, has, Audio) {
    return declare("dojox.mobile.Video", Audio, {width:"200px", height:"150px", _tag:"video", _getEmbedRegExp:function () {
        return has("ff") ? /video\/mp4/i : has("ie") >= 9 ? /video\/webm/i : null;
    }});
});

