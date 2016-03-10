//>>built

define("dojox/encoding/crypto/_base", ["dojo/_base/lang"], function (lang) {
    var c = lang.getObject("dojox.encoding.crypto", true);
    c.cipherModes = {ECB:0, CBC:1, PCBC:2, CFB:3, OFB:4, CTR:5};
    c.outputTypes = {Base64:0, Hex:1, String:2, Raw:3};
    return c;
});

