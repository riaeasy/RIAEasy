//>>built

define("dojox/encoding/digests/SHA224", ["./_sha-32", "./_sha2"], function (sha32, sha2) {
    var hash = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428];
    return sha2(sha32, 224, 512, hash);
});

