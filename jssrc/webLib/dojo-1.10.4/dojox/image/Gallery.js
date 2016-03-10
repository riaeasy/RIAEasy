//>>built

define("dojox/image/Gallery", ["dijit", "dojo", "dojox", "dojo/require!dojo/fx,dijit/_Widget,dijit/_Templated,dojox/image/ThumbnailPicker,dojox/image/SlideShow"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.image.Gallery");
    dojo.experimental("dojox.image.Gallery");
    dojo.require("dojo.fx");
    dojo.require("dijit._Widget");
    dojo.require("dijit._Templated");
    dojo.require("dojox.image.ThumbnailPicker");
    dojo.require("dojox.image.SlideShow");
    dojo.declare("dojox.image.Gallery", [dijit._Widget, dijit._Templated], {imageHeight:375, imageWidth:500, pageSize:dojox.image.SlideShow.prototype.pageSize, autoLoad:true, linkAttr:"link", imageThumbAttr:"imageUrlThumb", imageLargeAttr:"imageUrl", titleAttr:"title", slideshowInterval:3, templateString:dojo.cache("dojox.image", "resources/Gallery.html", "<div dojoAttachPoint=\"outerNode\" class=\"imageGalleryWrapper\">\n\t<div dojoAttachPoint=\"thumbPickerNode\"></div>\n\t<div dojoAttachPoint=\"slideShowNode\"></div>\n</div>"), postCreate:function () {
        this.widgetid = this.id;
        this.inherited(arguments);
        this.thumbPicker = new dojox.image.ThumbnailPicker({linkAttr:this.linkAttr, imageLargeAttr:this.imageLargeAttr, imageThumbAttr:this.imageThumbAttr, titleAttr:this.titleAttr, useLoadNotifier:true, size:this.imageWidth}, this.thumbPickerNode);
        this.slideShow = new dojox.image.SlideShow({imageHeight:this.imageHeight, imageWidth:this.imageWidth, autoLoad:this.autoLoad, linkAttr:this.linkAttr, imageLargeAttr:this.imageLargeAttr, titleAttr:this.titleAttr, slideshowInterval:this.slideshowInterval, pageSize:this.pageSize}, this.slideShowNode);
        var _this = this;
        dojo.subscribe(this.slideShow.getShowTopicName(), function (packet) {
            _this.thumbPicker._showThumbs(packet.index);
        });
        dojo.subscribe(this.thumbPicker.getClickTopicName(), function (evt) {
            _this.slideShow.showImage(evt.index);
        });
        dojo.subscribe(this.thumbPicker.getShowTopicName(), function (evt) {
            _this.slideShow.moveImageLoadingPointer(evt.index);
        });
        dojo.subscribe(this.slideShow.getLoadTopicName(), function (index) {
            _this.thumbPicker.markImageLoaded(index);
        });
        this._centerChildren();
    }, setDataStore:function (dataStore, request, paramNames) {
        this.thumbPicker.setDataStore(dataStore, request, paramNames);
        this.slideShow.setDataStore(dataStore, request, paramNames);
    }, reset:function () {
        this.slideShow.reset();
        this.thumbPicker.reset();
    }, showNextImage:function (inTimer) {
        this.slideShow.showNextImage();
    }, toggleSlideshow:function () {
        dojo.deprecated("dojox.widget.Gallery.toggleSlideshow is deprecated.  Use toggleSlideShow instead.", "", "2.0");
        this.toggleSlideShow();
    }, toggleSlideShow:function () {
        this.slideShow.toggleSlideShow();
    }, showImage:function (index, callback) {
        this.slideShow.showImage(index, callback);
    }, resize:function (dim) {
        this.thumbPicker.resize(dim);
    }, _centerChildren:function () {
        var thumbSize = dojo.marginBox(this.thumbPicker.outerNode);
        var slideSize = dojo.marginBox(this.slideShow.outerNode);
        var diff = (thumbSize.w - slideSize.w) / 2;
        if (diff > 0) {
            dojo.style(this.slideShow.outerNode, "marginLeft", diff + "px");
        } else {
            if (diff < 0) {
                dojo.style(this.thumbPicker.outerNode, "marginLeft", (diff * -1) + "px");
            }
        }
    }});
});

