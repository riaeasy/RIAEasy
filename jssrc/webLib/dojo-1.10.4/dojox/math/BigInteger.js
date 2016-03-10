//>>built

define("dojox/math/BigInteger", ["dojo", "dojox"], function (dojo, dojox) {
    dojo.getObject("math.BigInteger", true, dojox);
    dojo.experimental("dojox.math.BigInteger");
    var dbits;
    var canary = 244837814094590;
    var j_lm = ((canary & 16777215) == 15715070);
    function BigInteger(a, b, c) {
        if (a != null) {
            if ("number" == typeof a) {
                this._fromNumber(a, b, c);
            } else {
                if (!b && "string" != typeof a) {
                    this._fromString(a, 256);
                } else {
                    this._fromString(a, b);
                }
            }
        }
    }
    function nbi() {
        return new BigInteger(null);
    }
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) {
            var v = x * this[i++] + w[j] + c;
            c = Math.floor(v / 67108864);
            w[j++] = v & 67108863;
        }
        return c;
    }
    function am2(i, x, w, j, c, n) {
        var xl = x & 32767, xh = x >> 15;
        while (--n >= 0) {
            var l = this[i] & 32767;
            var h = this[i++] >> 15;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 32767) << 15) + w[j] + (c & 1073741823);
            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
            w[j++] = l & 1073741823;
        }
        return c;
    }
    function am3(i, x, w, j, c, n) {
        var xl = x & 16383, xh = x >> 14;
        while (--n >= 0) {
            var l = this[i] & 16383;
            var h = this[i++] >> 14;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 16383) << 14) + w[j] + c;
            c = (l >> 28) + (m >> 14) + xh * h;
            w[j++] = l & 268435455;
        }
        return c;
    }
    if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
        BigInteger.prototype.am = am2;
        dbits = 30;
    } else {
        if (j_lm && (navigator.appName != "Netscape")) {
            BigInteger.prototype.am = am1;
            dbits = 26;
        } else {
            BigInteger.prototype.am = am3;
            dbits = 28;
        }
    }
    var BI_FP = 52;
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = [];
    var rr, vv;
    rr = "0".charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) {
        BI_RC[rr++] = vv;
    }
    rr = "a".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) {
        BI_RC[rr++] = vv;
    }
    rr = "A".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) {
        BI_RC[rr++] = vv;
    }
    function int2char(n) {
        return BI_RM.charAt(n);
    }
    function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return (c == null) ? -1 : c;
    }
    function bnpCopyTo(r) {
        for (var i = this.t - 1; i >= 0; --i) {
            r[i] = this[i];
        }
        r.t = this.t;
        r.s = this.s;
    }
    function bnpFromInt(x) {
        this.t = 1;
        this.s = (x < 0) ? -1 : 0;
        if (x > 0) {
            this[0] = x;
        } else {
            if (x < -1) {
                this[0] = x + _DV;
            } else {
                this.t = 0;
            }
        }
    }
    function nbv(i) {
        var r = nbi();
        r._fromInt(i);
        return r;
    }
    function bnpFromString(s, b) {
        var k;
        if (b == 16) {
            k = 4;
        } else {
            if (b == 8) {
                k = 3;
            } else {
                if (b == 256) {
                    k = 8;
                } else {
                    if (b == 2) {
                        k = 1;
                    } else {
                        if (b == 32) {
                            k = 5;
                        } else {
                            if (b == 4) {
                                k = 2;
                            } else {
                                this._fromRadix(s, b);
                                return;
                            }
                        }
                    }
                }
            }
        }
        this.t = 0;
        this.s = 0;
        var i = s.length, mi = false, sh = 0;
        while (--i >= 0) {
            var x = (k == 8) ? s[i] & 255 : intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-") {
                    mi = true;
                }
                continue;
            }
            mi = false;
            if (sh == 0) {
                this[this.t++] = x;
            } else {
                if (sh + k > this._DB) {
                    this[this.t - 1] |= (x & ((1 << (this._DB - sh)) - 1)) << sh;
                    this[this.t++] = (x >> (this._DB - sh));
                } else {
                    this[this.t - 1] |= x << sh;
                }
            }
            sh += k;
            if (sh >= this._DB) {
                sh -= this._DB;
            }
        }
        if (k == 8 && (s[0] & 128) != 0) {
            this.s = -1;
            if (sh > 0) {
                this[this.t - 1] |= ((1 << (this._DB - sh)) - 1) << sh;
            }
        }
        this._clamp();
        if (mi) {
            BigInteger.ZERO._subTo(this, this);
        }
    }
    function bnpClamp() {
        var c = this.s & this._DM;
        while (this.t > 0 && this[this.t - 1] == c) {
            --this.t;
        }
    }
    function bnToString(b) {
        if (this.s < 0) {
            return "-" + this.negate().toString(b);
        }
        var k;
        if (b == 16) {
            k = 4;
        } else {
            if (b == 8) {
                k = 3;
            } else {
                if (b == 2) {
                    k = 1;
                } else {
                    if (b == 32) {
                        k = 5;
                    } else {
                        if (b == 4) {
                            k = 2;
                        } else {
                            return this._toRadix(b);
                        }
                    }
                }
            }
        }
        var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
        var p = this._DB - (i * this._DB) % k;
        if (i-- > 0) {
            if (p < this._DB && (d = this[i] >> p) > 0) {
                m = true;
                r = int2char(d);
            }
            while (i >= 0) {
                if (p < k) {
                    d = (this[i] & ((1 << p) - 1)) << (k - p);
                    d |= this[--i] >> (p += this._DB - k);
                } else {
                    d = (this[i] >> (p -= k)) & km;
                    if (p <= 0) {
                        p += this._DB;
                        --i;
                    }
                }
                if (d > 0) {
                    m = true;
                }
                if (m) {
                    r += int2char(d);
                }
            }
        }
        return m ? r : "0";
    }
    function bnNegate() {
        var r = nbi();
        BigInteger.ZERO._subTo(this, r);
        return r;
    }
    function bnAbs() {
        return (this.s < 0) ? this.negate() : this;
    }
    function bnCompareTo(a) {
        var r = this.s - a.s;
        if (r) {
            return r;
        }
        var i = this.t;
        r = i - a.t;
        if (r) {
            return r;
        }
        while (--i >= 0) {
            if ((r = this[i] - a[i])) {
                return r;
            }
        }
        return 0;
    }
    function nbits(x) {
        var r = 1, t;
        if ((t = x >>> 16)) {
            x = t;
            r += 16;
        }
        if ((t = x >> 8)) {
            x = t;
            r += 8;
        }
        if ((t = x >> 4)) {
            x = t;
            r += 4;
        }
        if ((t = x >> 2)) {
            x = t;
            r += 2;
        }
        if ((t = x >> 1)) {
            x = t;
            r += 1;
        }
        return r;
    }
    function bnBitLength() {
        if (this.t <= 0) {
            return 0;
        }
        return this._DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this._DM));
    }
    function bnpDLShiftTo(n, r) {
        var i;
        for (i = this.t - 1; i >= 0; --i) {
            r[i + n] = this[i];
        }
        for (i = n - 1; i >= 0; --i) {
            r[i] = 0;
        }
        r.t = this.t + n;
        r.s = this.s;
    }
    function bnpDRShiftTo(n, r) {
        for (var i = n; i < this.t; ++i) {
            r[i - n] = this[i];
        }
        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
    }
    function bnpLShiftTo(n, r) {
        var bs = n % this._DB;
        var cbs = this._DB - bs;
        var bm = (1 << cbs) - 1;
        var ds = Math.floor(n / this._DB), c = (this.s << bs) & this._DM, i;
        for (i = this.t - 1; i >= 0; --i) {
            r[i + ds + 1] = (this[i] >> cbs) | c;
            c = (this[i] & bm) << bs;
        }
        for (i = ds - 1; i >= 0; --i) {
            r[i] = 0;
        }
        r[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r._clamp();
    }
    function bnpRShiftTo(n, r) {
        r.s = this.s;
        var ds = Math.floor(n / this._DB);
        if (ds >= this.t) {
            r.t = 0;
            return;
        }
        var bs = n % this._DB;
        var cbs = this._DB - bs;
        var bm = (1 << bs) - 1;
        r[0] = this[ds] >> bs;
        for (var i = ds + 1; i < this.t; ++i) {
            r[i - ds - 1] |= (this[i] & bm) << cbs;
            r[i - ds] = this[i] >> bs;
        }
        if (bs > 0) {
            r[this.t - ds - 1] |= (this.s & bm) << cbs;
        }
        r.t = this.t - ds;
        r._clamp();
    }
    function bnpSubTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] - a[i];
            r[i++] = c & this._DM;
            c >>= this._DB;
        }
        if (a.t < this.t) {
            c -= a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this._DM;
                c >>= this._DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c -= a[i];
                r[i++] = c & this._DM;
                c >>= this._DB;
            }
            c -= a.s;
        }
        r.s = (c < 0) ? -1 : 0;
        if (c < -1) {
            r[i++] = this._DV + c;
        } else {
            if (c > 0) {
                r[i++] = c;
            }
        }
        r.t = i;
        r._clamp();
    }
    function bnpMultiplyTo(a, r) {
        var x = this.abs(), y = a.abs();
        var i = x.t;
        r.t = i + y.t;
        while (--i >= 0) {
            r[i] = 0;
        }
        for (i = 0; i < y.t; ++i) {
            r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
        }
        r.s = 0;
        r._clamp();
        if (this.s != a.s) {
            BigInteger.ZERO._subTo(r, r);
        }
    }
    function bnpSquareTo(r) {
        var x = this.abs();
        var i = r.t = 2 * x.t;
        while (--i >= 0) {
            r[i] = 0;
        }
        for (i = 0; i < x.t - 1; ++i) {
            var c = x.am(i, x[i], r, 2 * i, 0, 1);
            if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x._DV) {
                r[i + x.t] -= x._DV;
                r[i + x.t + 1] = 1;
            }
        }
        if (r.t > 0) {
            r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
        }
        r.s = 0;
        r._clamp();
    }
    function bnpDivRemTo(m, q, r) {
        var pm = m.abs();
        if (pm.t <= 0) {
            return;
        }
        var pt = this.abs();
        if (pt.t < pm.t) {
            if (q != null) {
                q._fromInt(0);
            }
            if (r != null) {
                this._copyTo(r);
            }
            return;
        }
        if (r == null) {
            r = nbi();
        }
        var y = nbi(), ts = this.s, ms = m.s;
        var nsh = this._DB - nbits(pm[pm.t - 1]);
        if (nsh > 0) {
            pm._lShiftTo(nsh, y);
            pt._lShiftTo(nsh, r);
        } else {
            pm._copyTo(y);
            pt._copyTo(r);
        }
        var ys = y.t;
        var y0 = y[ys - 1];
        if (y0 == 0) {
            return;
        }
        var yt = y0 * (1 << this._F1) + ((ys > 1) ? y[ys - 2] >> this._F2 : 0);
        var d1 = this._FV / yt, d2 = (1 << this._F1) / yt, e = 1 << this._F2;
        var i = r.t, j = i - ys, t = (q == null) ? nbi() : q;
        y._dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
            r[r.t++] = 1;
            r._subTo(t, r);
        }
        BigInteger.ONE._dlShiftTo(ys, t);
        t._subTo(y, y);
        while (y.t < ys) {
            y[y.t++] = 0;
        }
        while (--j >= 0) {
            var qd = (r[--i] == y0) ? this._DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
            if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
                y._dlShiftTo(j, t);
                r._subTo(t, r);
                while (r[i] < --qd) {
                    r._subTo(t, r);
                }
            }
        }
        if (q != null) {
            r._drShiftTo(ys, q);
            if (ts != ms) {
                BigInteger.ZERO._subTo(q, q);
            }
        }
        r.t = ys;
        r._clamp();
        if (nsh > 0) {
            r._rShiftTo(nsh, r);
        }
        if (ts < 0) {
            BigInteger.ZERO._subTo(r, r);
        }
    }
    function bnMod(a) {
        var r = nbi();
        this.abs()._divRemTo(a, null, r);
        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
            a._subTo(r, r);
        }
        return r;
    }
    function Classic(m) {
        this.m = m;
    }
    function cConvert(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0) {
            return x.mod(this.m);
        } else {
            return x;
        }
    }
    function cRevert(x) {
        return x;
    }
    function cReduce(x) {
        x._divRemTo(this.m, null, x);
    }
    function cMulTo(x, y, r) {
        x._multiplyTo(y, r);
        this.reduce(r);
    }
    function cSqrTo(x, r) {
        x._squareTo(r);
        this.reduce(r);
    }
    dojo.extend(Classic, {convert:cConvert, revert:cRevert, reduce:cReduce, mulTo:cMulTo, sqrTo:cSqrTo});
    function bnpInvDigit() {
        if (this.t < 1) {
            return 0;
        }
        var x = this[0];
        if ((x & 1) == 0) {
            return 0;
        }
        var y = x & 3;
        y = (y * (2 - (x & 15) * y)) & 15;
        y = (y * (2 - (x & 255) * y)) & 255;
        y = (y * (2 - (((x & 65535) * y) & 65535))) & 65535;
        y = (y * (2 - x * y % this._DV)) % this._DV;
        return (y > 0) ? this._DV - y : -y;
    }
    function Montgomery(m) {
        this.m = m;
        this.mp = m._invDigit();
        this.mpl = this.mp & 32767;
        this.mph = this.mp >> 15;
        this.um = (1 << (m._DB - 15)) - 1;
        this.mt2 = 2 * m.t;
    }
    function montConvert(x) {
        var r = nbi();
        x.abs()._dlShiftTo(this.m.t, r);
        r._divRemTo(this.m, null, r);
        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) {
            this.m._subTo(r, r);
        }
        return r;
    }
    function montRevert(x) {
        var r = nbi();
        x._copyTo(r);
        this.reduce(r);
        return r;
    }
    function montReduce(x) {
        while (x.t <= this.mt2) {
            x[x.t++] = 0;
        }
        for (var i = 0; i < this.m.t; ++i) {
            var j = x[i] & 32767;
            var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x._DM;
            j = i + this.m.t;
            x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
            while (x[j] >= x._DV) {
                x[j] -= x._DV;
                x[++j]++;
            }
        }
        x._clamp();
        x._drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0) {
            x._subTo(this.m, x);
        }
    }
    function montSqrTo(x, r) {
        x._squareTo(r);
        this.reduce(r);
    }
    function montMulTo(x, y, r) {
        x._multiplyTo(y, r);
        this.reduce(r);
    }
    dojo.extend(Montgomery, {convert:montConvert, revert:montRevert, reduce:montReduce, mulTo:montMulTo, sqrTo:montSqrTo});
    function bnpIsEven() {
        return ((this.t > 0) ? (this[0] & 1) : this.s) == 0;
    }
    function bnpExp(e, z) {
        if (e > 4294967295 || e < 1) {
            return BigInteger.ONE;
        }
        var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
        g._copyTo(r);
        while (--i >= 0) {
            z.sqrTo(r, r2);
            if ((e & (1 << i)) > 0) {
                z.mulTo(r2, g, r);
            } else {
                var t = r;
                r = r2;
                r2 = t;
            }
        }
        return z.revert(r);
    }
    function bnModPowInt(e, m) {
        var z;
        if (e < 256 || m._isEven()) {
            z = new Classic(m);
        } else {
            z = new Montgomery(m);
        }
        return this._exp(e, z);
    }
    dojo.extend(BigInteger, {_DB:dbits, _DM:(1 << dbits) - 1, _DV:1 << dbits, _FV:Math.pow(2, BI_FP), _F1:BI_FP - dbits, _F2:2 * dbits - BI_FP, _copyTo:bnpCopyTo, _fromInt:bnpFromInt, _fromString:bnpFromString, _clamp:bnpClamp, _dlShiftTo:bnpDLShiftTo, _drShiftTo:bnpDRShiftTo, _lShiftTo:bnpLShiftTo, _rShiftTo:bnpRShiftTo, _subTo:bnpSubTo, _multiplyTo:bnpMultiplyTo, _squareTo:bnpSquareTo, _divRemTo:bnpDivRemTo, _invDigit:bnpInvDigit, _isEven:bnpIsEven, _exp:bnpExp, toString:bnToString, negate:bnNegate, abs:bnAbs, compareTo:bnCompareTo, bitLength:bnBitLength, mod:bnMod, modPowInt:bnModPowInt});
    dojo._mixin(BigInteger, {ZERO:nbv(0), ONE:nbv(1), _nbi:nbi, _nbv:nbv, _nbits:nbits, _Montgomery:Montgomery});
    dojox.math.BigInteger = BigInteger;
    return dojox.math.BigInteger;
});

