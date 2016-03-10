//>>built

define("dijit/layout/AccordionPane", ["dojo/_base/declare", "dojo/_base/kernel", "./ContentPane"], function (declare, kernel, ContentPane) {
    return declare("dijit.layout.AccordionPane", ContentPane, {constructor:function () {
        kernel.deprecated("dijit.layout.AccordionPane deprecated, use ContentPane instead", "", "2.0");
    }, onSelected:function () {
    }});
});

