//>>built

define("dojox/encoding/digests/SHA1", ["./_base"], function (base) {
    var chrsz = 8, mask = (1 << chrsz) - 1;
    function R(n, c) {
        return (n << c) | (n >>> (32 - c));
    }
    function FT(t, b, c, d) {
        if (t < 20) {
            return (b & c) | ((~b) & d);
        }
        if (t < 40) {
            return b ^ c ^ d;
        }
        if (t < 60) {
            return (b & c) | (b & d) | (c & d);
        }
        return b ^ c ^ d;
    }
    function KT(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
    }
    function core(x, len) {
        x[len >> 5] |= 128 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;
        var w = new Array(80), a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a, oldb = b, oldc = c, oldd = d, olde = e;
            for (var j = 0; j < 80; j++) {
                if (j < 16) {
                    w[j] = x[i + j];
                } else {
                    w[j] = R(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                }
                var t = base.addWords(base.addWords(R(a, 5), FT(j, b, c, d)), base.addWords(base.addWords(e, w[j]), KT(j)));
                e = d;
                d = c;
                c = R(b, 30);
                b = a;
                a = t;
            }
            a = base.addWords(a, olda);
            b = base.addWords(b, oldb);
            c = base.addWords(c, oldc);
            d = base.addWords(d, oldd);
            e = base.addWords(e, olde);
        }
        return [a, b, c, d, e];
    }
    function hmac(data, key) {
        var wa = toWord(key);
        if (wa.length > 16) {
            wa = core(wa, key.length * chrsz);
        }
        var ipad = new Array(16), opad = new Array(16);
        for (var i = 0; i < 16; i++) {
            ipad[i] = wa[i] ^ 909522486;
            opad[i] = wa[i] ^ 1549556828;
        }
        var hash = core(ipad.concat(toWord(data)), 512 + data.length * chrsz);
        return core(opad.concat(hash), 512 + 160);
    }
    function toWord(s) {
        var wa = [];
        for (var i = 0, l = s.length * chrsz; i < l; i += chrsz) {
            wa[i >> 5] |= (s.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i % 32);
        }
        return wa;
    }
    function toHex(wa) {
        var h = "0123456789abcdef", s = [];
        for (var i = 0, l = wa.length * 4; i < l; i++) {
            s.push(h.charAt((wa[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 15), h.charAt((wa[i >> 2] >> ((3 - i % 4) * 8)) & 15));
        }
        return s.join("");
    }
    function _toString(wa) {
        var s = [];
        for (var i = 0, l = wa.length * 32; i < l; i += chrsz) {
            s.push(String.fromCharCode((wa[i >> 5] >>> (32 - chrsz - i % 32)) & mask));
        }
        return s.join("");
    }
    function toBase64(wa) {
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
    }
    base.SHA1 = function (data, outputType) {
        var out = outputType || base.outputTypes.Base64;
        var wa = core(toWord(data), data.length * chrsz);
        switch (out) {
          case base.outputTypes.Raw:
            return wa;
          case base.outputTypes.Hex:
            return toHex(wa);
          case base.outputTypes.String:
            return _toString(wa);
          default:
            return toBase64(wa);
        }
    };
    base.SHA1._hmac = function (data, key, outputType) {
        var out = outputType || base.outputTypes.Base64;
        var wa = hmac(data, key);
        switch (out) {
          case base.outputTypes.Raw:
            return wa;
          case base.outputTypes.Hex:
            return toHex(wa);
          case base.outputTypes.String:
            return _toString(wa);
          default:
            return toBase64(wa);
        }
    };
    return base.SHA1;
});

