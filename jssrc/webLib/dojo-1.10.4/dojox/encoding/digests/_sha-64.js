//>>built

define("dojox/encoding/digests/_sha-64", ["./_sha-32"], function (sha32) {
    var int64 = function (h, l) {
        return {h:h, l:l};
    };
    function copy(dst, src) {
        dst.h = src.h;
        dst.l = src.l;
    }
    function rrot(dst, x, shift) {
        dst.l = (x.l >>> shift) | (x.h << (32 - shift));
        dst.h = (x.h >>> shift) | (x.l << (32 - shift));
    }
    function revrrot(dst, x, shift) {
        dst.l = (x.h >>> shift) | (x.l << (32 - shift));
        dst.h = (x.l >>> shift) | (x.h << (32 - shift));
    }
    function shr(dst, x, shift) {
        dst.l = (x.l >>> shift) | (x.h << (32 - shift));
        dst.h = (x.h >>> shift);
    }
    function add(dst, x, y) {
        var w0 = (x.l & 65535) + (y.l & 65535);
        var w1 = (x.l >>> 16) + (y.l >>> 16) + (w0 >>> 16);
        var w2 = (x.h & 65535) + (y.h & 65535) + (w1 >>> 16);
        var w3 = (x.h >>> 16) + (y.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 65535) | (w1 << 16);
        dst.h = (w2 & 65535) | (w3 << 16);
    }
    function add4(dst, a, b, c, d) {
        var w0 = (a.l & 65535) + (b.l & 65535) + (c.l & 65535) + (d.l & 65535);
        var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (w0 >>> 16);
        var w2 = (a.h & 65535) + (b.h & 65535) + (c.h & 65535) + (d.h & 65535) + (w1 >>> 16);
        var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 65535) | (w1 << 16);
        dst.h = (w2 & 65535) | (w3 << 16);
    }
    function add5(dst, a, b, c, d, e) {
        var w0 = (a.l & 65535) + (b.l & 65535) + (c.l & 65535) + (d.l & 65535) + (e.l & 65535);
        var w1 = (a.l >>> 16) + (b.l >>> 16) + (c.l >>> 16) + (d.l >>> 16) + (e.l >>> 16) + (w0 >>> 16);
        var w2 = (a.h & 65535) + (b.h & 65535) + (c.h & 65535) + (d.h & 65535) + (e.h & 65535) + (w1 >>> 16);
        var w3 = (a.h >>> 16) + (b.h >>> 16) + (c.h >>> 16) + (d.h >>> 16) + (e.h >>> 16) + (w2 >>> 16);
        dst.l = (w0 & 65535) | (w1 << 16);
        dst.h = (w2 & 65535) | (w3 << 16);
    }
    var K = [int64(1116352408, 3609767458), int64(1899447441, 602891725), int64(3049323471, 3964484399), int64(3921009573, 2173295548), int64(961987163, 4081628472), int64(1508970993, 3053834265), int64(2453635748, 2937671579), int64(2870763221, 3664609560), int64(3624381080, 2734883394), int64(310598401, 1164996542), int64(607225278, 1323610764), int64(1426881987, 3590304994), int64(1925078388, 4068182383), int64(2162078206, 991336113), int64(2614888103, 633803317), int64(3248222580, 3479774868), int64(3835390401, 2666613458), int64(4022224774, 944711139), int64(264347078, 2341262773), int64(604807628, 2007800933), int64(770255983, 1495990901), int64(1249150122, 1856431235), int64(1555081692, 3175218132), int64(1996064986, 2198950837), int64(2554220882, 3999719339), int64(2821834349, 766784016), int64(2952996808, 2566594879), int64(3210313671, 3203337956), int64(3336571891, 1034457026), int64(3584528711, 2466948901), int64(113926993, 3758326383), int64(338241895, 168717936), int64(666307205, 1188179964), int64(773529912, 1546045734), int64(1294757372, 1522805485), int64(1396182291, 2643833823), int64(1695183700, 2343527390), int64(1986661051, 1014477480), int64(2177026350, 1206759142), int64(2456956037, 344077627), int64(2730485921, 1290863460), int64(2820302411, 3158454273), int64(3259730800, 3505952657), int64(3345764771, 106217008), int64(3516065817, 3606008344), int64(3600352804, 1432725776), int64(4094571909, 1467031594), int64(275423344, 851169720), int64(430227734, 3100823752), int64(506948616, 1363258195), int64(659060556, 3750685593), int64(883997877, 3785050280), int64(958139571, 3318307427), int64(1322822218, 3812723403), int64(1537002063, 2003034995), int64(1747873779, 3602036899), int64(1955562222, 1575990012), int64(2024104815, 1125592928), int64(2227730452, 2716904306), int64(2361852424, 442776044), int64(2428436474, 593698344), int64(2756734187, 3733110249), int64(3204031479, 2999351573), int64(3329325298, 3815920427), int64(3391569614, 3928383900), int64(3515267271, 566280711), int64(3940187606, 3454069534), int64(4118630271, 4000239992), int64(116418474, 1914138554), int64(174292421, 2731055270), int64(289380356, 3203993006), int64(460393269, 320620315), int64(685471733, 587496836), int64(852142971, 1086792851), int64(1017036298, 365543100), int64(1126000580, 2618297676), int64(1288033470, 3409855158), int64(1501505948, 4234509866), int64(1607167915, 987167468), int64(1816402316, 1246189591)];
    var o = {outputTypes:sha32.outputTypes, stringToUtf8:function (s) {
        return sha32.stringToUtf8(s);
    }, toWord:function (s) {
        return sha32.toWord(s);
    }, toHex:function (wa) {
        return sha32.toHex(wa);
    }, toBase64:function (wa) {
        return sha32.toBase64(wa);
    }, _toString:function (wa) {
        return sha32._toString(wa);
    }};
    o.digest = function (msg, length, hash, depth) {
        var HASH = [];
        for (var i = 0, l = hash.length; i < l; i += 2) {
            HASH.push(int64(hash[i], hash[i + 1]));
        }
        var T1 = int64(0, 0), T2 = int64(0, 0), a = int64(0, 0), b = int64(0, 0), c = int64(0, 0), d = int64(0, 0), e = int64(0, 0), f = int64(0, 0), g = int64(0, 0), h = int64(0, 0), s0 = int64(0, 0), s1 = int64(0, 0), Ch = int64(0, 0), Maj = int64(0, 0), r1 = int64(0, 0), r2 = int64(0, 0), r3 = int64(0, 0);
        var j, i;
        var w = new Array(80);
        for (i = 0; i < 80; i++) {
            w[i] = int64(0, 0);
        }
        msg[length >> 5] |= 128 << (24 - (length & 31));
        msg[((length + 128 >> 10) << 5) + 31] = length;
        for (i = 0; i < msg.length; i += 32) {
            copy(a, HASH[0]);
            copy(b, HASH[1]);
            copy(c, HASH[2]);
            copy(d, HASH[3]);
            copy(e, HASH[4]);
            copy(f, HASH[5]);
            copy(g, HASH[6]);
            copy(h, HASH[7]);
            for (j = 0; j < 16; j++) {
                w[j].h = msg[i + 2 * j];
                w[j].l = msg[i + 2 * j + 1];
            }
            for (j = 16; j < 80; j++) {
                rrot(r1, w[j - 2], 19);
                revrrot(r2, w[j - 2], 29);
                shr(r3, w[j - 2], 6);
                s1.l = r1.l ^ r2.l ^ r3.l;
                s1.h = r1.h ^ r2.h ^ r3.h;
                rrot(r1, w[j - 15], 1);
                rrot(r2, w[j - 15], 8);
                shr(r3, w[j - 15], 7);
                s0.l = r1.l ^ r2.l ^ r3.l;
                s0.h = r1.h ^ r2.h ^ r3.h;
                add4(w[j], s1, w[j - 7], s0, w[j - 16]);
            }
            for (j = 0; j < 80; j++) {
                Ch.l = (e.l & f.l) ^ (~e.l & g.l);
                Ch.h = (e.h & f.h) ^ (~e.h & g.h);
                rrot(r1, e, 14);
                rrot(r2, e, 18);
                revrrot(r3, e, 9);
                s1.l = r1.l ^ r2.l ^ r3.l;
                s1.h = r1.h ^ r2.h ^ r3.h;
                rrot(r1, a, 28);
                revrrot(r2, a, 2);
                revrrot(r3, a, 7);
                s0.l = r1.l ^ r2.l ^ r3.l;
                s0.h = r1.h ^ r2.h ^ r3.h;
                Maj.l = (a.l & b.l) ^ (a.l & c.l) ^ (b.l & c.l);
                Maj.h = (a.h & b.h) ^ (a.h & c.h) ^ (b.h & c.h);
                add5(T1, h, s1, Ch, K[j], w[j]);
                add(T2, s0, Maj);
                copy(h, g);
                copy(g, f);
                copy(f, e);
                add(e, d, T1);
                copy(d, c);
                copy(c, b);
                copy(b, a);
                add(a, T1, T2);
            }
            add(HASH[0], HASH[0], a);
            add(HASH[1], HASH[1], b);
            add(HASH[2], HASH[2], c);
            add(HASH[3], HASH[3], d);
            add(HASH[4], HASH[4], e);
            add(HASH[5], HASH[5], f);
            add(HASH[6], HASH[6], g);
            add(HASH[7], HASH[7], h);
        }
        var ret = [];
        if (depth == 384) {
            HASH.length = 6;
        }
        for (var i = 0, l = HASH.length; i < l; i++) {
            ret[i * 2] = HASH[i].h;
            ret[i * 2 + 1] = HASH[i].l;
        }
        return ret;
    };
    return o;
});

