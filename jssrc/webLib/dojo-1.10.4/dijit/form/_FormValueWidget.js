//>>built

define("dijit/form/_FormValueWidget", ["dojo/_base/declare", "dojo/sniff", "./_FormWidget", "./_FormValueMixin"], function (declare, has, _FormWidget, _FormValueMixin) {
    return declare("dijit.form._FormValueWidget", [_FormWidget, _FormValueMixin], {_layoutHackIE7:function () {
        if (has("ie") == 7) {
            var domNode = this.domNode;
            var parent = domNode.parentNode;
            var pingNode = domNode.firstChild || domNode;
            var origFilter = pingNode.style.filter;
            var _this = this;
            while (parent && parent.clientHeight == 0) {
                (function ping() {
                    var disconnectHandle = _this.connect(parent, "onscroll", function () {
                        _this.disconnect(disconnectHandle);
                        pingNode.style.filter = (new Date()).getMilliseconds();
                        _this.defer(function () {
                            pingNode.style.filter = origFilter;
                        });
                    });
                })();
                parent = parent.parentNode;
            }
        }
    }});
});

