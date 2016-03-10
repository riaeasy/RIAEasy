//>>built

define("dojox/fx/ext-dojo/reverse", ["dojo/_base/fx", "dojo/fx", "dojo/_base/lang", "dojo/fx/easing", "dojox/fx"], function (baseFx, coreFx, lang, easingUtil, dojoxFx) {
    var reverseApi = {_reversed:false, reverse:function (keepPaused, reverseEase) {
        var playing = this.status() == "playing";
        this.pause();
        this._reversed = !this._reversed;
        var d = this.duration, sofar = d * this._percent, togo = d - sofar, curr = new Date().valueOf(), cp = this.curve._properties, p = this.properties, nm;
        this._endTime = curr + sofar;
        this._startTime = curr - togo;
        if (playing) {
            this.gotoPercent(togo / d);
        }
        for (nm in p) {
            var tmp = p[nm].start;
            p[nm].start = cp[nm].start = p[nm].end;
            p[nm].end = cp[nm].end = tmp;
        }
        if (this._reversed) {
            if (!this.rEase) {
                this.fEase = this.easing;
                if (reverseEase) {
                    this.rEase = reverseEase;
                } else {
                    var de = easingUtil, found, eName;
                    for (nm in de) {
                        if (this.easing == de[nm]) {
                            found = nm;
                            break;
                        }
                    }
                    if (found) {
                        if (/InOut/.test(nm) || !/In|Out/i.test(nm)) {
                            this.rEase = this.easing;
                        } else {
                            if (/In/.test(nm)) {
                                eName = nm.replace("In", "Out");
                            } else {
                                eName = nm.replace("Out", "In");
                            }
                        }
                        if (eName) {
                            this.rEase = easingUtil[eName];
                        }
                    } else {
                        console.info("ease function to reverse not found");
                        this.rEase = this.easing;
                    }
                }
            }
            this.easing = this.rEase;
        } else {
            this.easing = this.fEase;
        }
        if (!keepPaused && this.status() != "playing") {
            this.play();
        }
        return this;
    }};
    lang.extend(baseFx.Animation, reverseApi);
    return baseFx.Animation;
});

