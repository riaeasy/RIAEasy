//>>built

define("dojox/encoding/digests/_sha-32", ["./_base"], function (base) {
    var o = (function (b) {
        var tmp = function () {
        };
        tmp.prototype = b;
        var ret = new tmp();
        return ret;
    })(base);
    o.toWord = function (s) {
        var wa = Array(s.length >> 2);
        for (var i = 0; i < wa.length; i++) {
            wa[i] = 0;
        }
        for (var i = 0; i < s.length * 8; i += 8) {
            wa[i >> 5] |= (s.charCodeAt(i / 8) & 255) << (24 - i % 32);
        }
        return wa;
    };
    o.toHex = function (wa) {
        var h = "0123456789abcdef", s = [];
        for (var i = 0, l = wa.length * 4; i < l; i++) {
            s.push(h.charAt((wa[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 15), h.charAt((wa[i >> 2] >> ((3 - i % 4) * 8)) & 15));
        }
        return s.join("");
    };
    o.toBase64 = function (wa) {
        var p = "=", tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", s = [];
        for (var i = 0, l = wa.length * 4; i < l; i += 3) {
            var t = (((wa[i >> 2] >> 8 * (3 - i % 4)) & 255) << 16) | (((wa[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 255) << 8) | ((wa[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 255);
            for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 > wa.length * 32) {
                    s.push(p);
                } else {
                    s.push(tab.charAt((t >> 6 * (3 - j)) & 63));
                }
            }
        }
        return s.join("");
    };
    o._toString = function (wa) {
        var s = "";
        for (var i = 0; i < wa.length * 32; i += 8) {
            s += String.fromCharCode((wa[i >> 5] >>> (24 - i % 32)) & 255);
        }
        return s;
    };
    function S(X, n) {
        return (X >>> n) | (X << (32 - n));
    }
    function R(X, n) {
        return (X >>> n);
    }
    function Ch(x, y, z) {
        return ((x & y) ^ ((~x) & z));
    }
    function Maj(x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
    }
    function Sigma0256(x) {
        return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
    }
    function Sigma1256(x) {
        return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
    }
    function Gamma0256(x) {
        return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
    }
    function Gamma1256(x) {
        return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
    }
    function Sigma0512(x) {
        return (S(x, 28) ^ S(x, 34) ^ S(x, 39));
    }
    function Sigma1512(x) {
        return (S(x, 14) ^ S(x, 18) ^ S(x, 41));
    }
    function Gamma0512(x) {
        return (S(x, 1) ^ S(x, 8) ^ R(x, 7));
    }
    function Gamma1512(x) {
        return (S(x, 19) ^ S(x, 61) ^ R(x, 6));
    }
    var add = base.addWords;
    var K = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];
    o.digest = function (msg, length, hash, depth) {
        hash = hash.slice(0);
        var w = new Array(64);
        var a, b, c, d, e, f, g, h;
        var i, j, T1, T2;
        msg[length >> 5] |= 128 << (24 - length % 32);
        msg[((length + 64 >> 9) << 4) + 15] = length;
        for (i = 0; i < msg.length; i += 16) {
            a = hash[0];
            b = hash[1];
            c = hash[2];
            d = hash[3];
            e = hash[4];
            f = hash[5];
            g = hash[6];
            h = hash[7];
            for (j = 0; j < 64; j++) {
                if (j < 16) {
                    w[j] = msg[j + i];
                } else {
                    w[j] = add(add(add(Gamma1256(w[j - 2]), w[j - 7]), Gamma0256(w[j - 15])), w[j - 16]);
                }
                T1 = add(add(add(add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), w[j]);
                T2 = add(Sigma0256(a), Maj(a, b, c));
                h = g;
                g = f;
                f = e;
                e = add(d, T1);
                d = c;
                c = b;
                b = a;
                a = add(T1, T2);
            }
            hash[0] = add(a, hash[0]);
            hash[1] = add(b, hash[1]);
            hash[2] = add(c, hash[2]);
            hash[3] = add(d, hash[3]);
            hash[4] = add(e, hash[4]);
            hash[5] = add(f, hash[5]);
            hash[6] = add(g, hash[6]);
            hash[7] = add(h, hash[7]);
        }
        if (depth == 224) {
            hash.pop();
        }
        return hash;
    };
    return o;
});

