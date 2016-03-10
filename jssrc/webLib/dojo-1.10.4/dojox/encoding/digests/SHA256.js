//>>built

define("dojox/encoding/digests/SHA256", ["./_sha-32", "./_sha2"], function (sha32, sha2) {
    var hash = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
    return sha2(sha32, 256, 512, hash);
});

