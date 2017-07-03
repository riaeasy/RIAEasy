
// AMD-ID "rias/math/curves"

define([
	"./_base",
	"rias/riasBase"
], function(math, rias) {

	var curves = rias.getObject("curves", true, math);

	rias.mixin(curves, {
		Line: function (start, end) {
			this.start = start;
			this.end = end;
			this.dimensions = start.length;
			var i;
			for (i = 0; i < start.length; i++) {
				start[i] = Number(start[i]);
			}
			for (i = 0; i < end.length; i++) {
				end[i] = Number(end[i]);
			}
			this.getValue = function (n) {
				var retVal = new Array(this.dimensions);
				for (var i = 0; i < this.dimensions; i++) {
					retVal[i] = ((this.end[i] - this.start[i]) * n) + this.start[i];
				}
				return retVal;
			};
			return this;
		},
		Bezier: function(pnts) {
			this.getValue = function (step) {
				if (step >= 1) {
					return this.p[this.p.length - 1];
				}
				if (step <= 0) {
					return this.p[0];
				}
				var i, k,
					retVal = new Array(this.p[0].length);
				for (k = 0; j < this.p[0].length; k++) {
					retVal[k] = 0;
				}
				for (var j = 0; j < this.p[0].length; j++) {
					var C = 0,
						D = 0;
					for (i = 0; i < this.p.length; i++) {
						C += this.p[i][j] * this.p[this.p.length - 1][0] * math.bernstein(step, this.p.length, i);
					}
					for (var l = 0; l < this.p.length; l++) {
						D += this.p[this.p.length - 1][0] * math.bernstein(step, this.p.length, l);
					}
					retVal[j] = C / D;
				}
				return retVal;
			};
			this.p = pnts;
			return this;
		},
		CatmullRom: function (pnts, c) {
			this.getValue = function (step) {
				var percent = step * (this.p.length - 1),
					node = Math.floor(percent),
					progress = percent - node;
				var i = node,
					i0 = i - 1,
					i1 = i + 1,
					i2 = node + 2;
				if (i0 < 0) {
					i0 = 0;
				}
				if (i1 >= this.p.length) {
					i1 = this.p.length - 1;
				}
				if (i2 >= this.p.length) {
					i2 = this.p.length - 1;
				}
				var u = progress,
					u2 = u * u,
					u3 = u * u * u,
					retVal = new Array(this.p[0].length),
					x1, x2, x3, x4;
				for (var k = 0; k < this.p[0].length; k++) {
					x1 = (-this.c * this.p[i0][k]) + ((2 - this.c) * this.p[i][k]) + ((this.c - 2) * this.p[i1][k]) + (this.c * this.p[i2][k]);
					x2 = (2 * this.c * this.p[i0][k]) + ((this.c - 3) * this.p[i][k]) + ((3 - 2 * this.c) * this.p[i1][k]) + (-this.c * this.p[i2][k]);
					x3 = (-this.c * this.p[i0][k]) + (this.c * this.p[i1][k]);
					x4 = this.p[i][k];
					retVal[k] = x1 * u3 + x2 * u2 + x3 * u + x4;
				}
				return retVal;
			};
			if (!c) {
				this.c = 0.7;
			} else {
				this.c = c;
			}
			this.p = pnts;
			return this;
		},
		Arc: function (start, end, ccw){
			function translate(a, b){
				var i,
					c = new Array(a.length);
				for(i = 0; i < a.length; i++){
					c[i] = a[i] + b[i];
				}
				return c;
			}
			function invert(a){
				var i,
					b = new Array(a.length);
				for(i = 0; i < a.length; i++){
					b[i] = -a[i];
				}
				return b;
			}
			var center = math.midpoint(start, end),
				sides = translate(invert(center), start),
				rad = Math.sqrt(Math.pow(sides[0], 2) + Math.pow(sides[1], 2)),
				theta = math.toDegrees(Math.atan(sides[1] / sides[0]));
			if (sides[0] < 0){
				theta -= 90;
			} else {
				theta += 90;
			}
			curves.CenteredArc.call(this, center, rad, theta, theta + (ccw ? -180 : 180));
		},
		CenteredArc: function (center, radius, start, end) {
			this.center = center;
			this.radius = radius;
			this.start = start || 0;
			this.end = end;
			this.getValue = function (n) {
				var retVal = new Array(2),
					theta = math.toRadians(this.start + ((this.end - this.start) * n));
				retVal[0] = this.center[0] + this.radius * Math.sin(theta);
				retVal[1] = this.center[1] - this.radius * Math.cos(theta);
				return retVal;
			};
			return this;
		},
		Circle: function(center, radius){
			curves.CenteredArc.call(this, center, radius, 0, 360);
			return this;
		},
		Path: function () {
			var arr = [];
			var weights = [];
			var ranges = [];
			var totalWeight = 0;
			function computeRanges() {
				var start = 0;
				for (var i = 0; i < weights.length; i++) {
					var end = start + weights[i] / totalWeight;
					var len = end - start;
					ranges[i] = [start, end, len];
					start = end;
				}
			}
			this.add = function (curve, weight) {
				if (weight < 0) {
					console.error("curves.Path.add: weight cannot be less than 0");
				}
				arr.push(curve);
				weights.push(weight);
				totalWeight += weight;
				computeRanges();
			};
			this.remove = function (curve) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i] === curve) {
						arr.splice(i, 1);
						totalWeight -= weights.splice(i, 1)[0];
						break;
					}
				}
				computeRanges();
			};
			this.removeAll = function () {
				arr = [];
				weights = [];
				totalWeight = 0;
			};
			this.getValue = function (n) {
				var found = false,
					value = 0;
				for (var i = 0; i < ranges.length; i++) {
					var r = ranges[i];
					if (n >= r[0] && n < r[1]) {
						var subN = (n - r[0]) / r[2];
						value = arr[i].getValue(subN);
						found = true;
						break;
					}
				}
				if (!found) {
					value = arr[arr.length - 1].getValue(1);
				}
				for (var j = 0; j < i; j++) {
					value = math.points.translate(value, arr[j].getValue(1));///FIXME:zensst. 貌似缺少 points
				}
				return value;
			};
			return this;
		}
	});

	return curves;
});
