define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"rias/riasw/widget/_PaletteMixin",
	"dojo/i18n!./nls/Smiley"
], function(rias, _Widget, _TemplatedMixin, _PaletteMixin) {

	//rias.experimental("dojox.editor.plugins._SmileyPalette");
	var pluginsName = "rias.riasw.editor.htmleditor.plugins";

	var Emoticon = rias.declare(pluginsName + ".Emoticon", null, {
			// summary:
			//		JS Object representing an emoticon

			constructor: function(/*String*/ id){
				// summary:
				//	 Create emoticon object from an id (like "smile")
				// value: String
				//		alias name 'smile', 'cool' ..
				this.id = id;
			},

			getValue: function(){
				// summary:
				//		Returns a emoticon string in ascii representation, ex: :-)
				return Emoticon.ascii[this.id];
			},

			imgHtml: function(/*String*/ clazz){
				// summary:
				//		Return the HTML string for an `<img>` node that shows this smiley
				var eId = "emoticon" + this.id.substr(0,1).toUpperCase() + this.id.substr(1),
					//src = dojo.moduleUrl("dojox.editor.plugins", "resources/emoticons/" + eId + ".gif"),
					src = rias.toUrl(pluginsName.replace(/\./g, "/") + "/emoticons/" + eId + ".gif"),
					label = rias.i18n.getLocalization(pluginsName, "Smiley")[eId],
						html = ['<img src=\"',
						src,
						'\" class=\"',
						clazz,
						'\" alt=\"',
						this.getValue(),
						'\" title=\"',
						label,
						'\">'];
				return html.join("");
			},

			fillCell: function(/*DOMNode*/cell, /*String*/ blankGif){
				rias.dom.place(this.imgHtml("dijitPaletteImg"), cell);
			}
	});

	Emoticon.ascii = {
		smile: ":-)",
		laughing: "lol",
		wink: ";-)",
		grin: ":-D",
		cool: "8-)",
		angry: ":-@",
		half: ":-/",
		eyebrow: "/:)",
		frown: ":-(",
		shy: ":-$",
		goofy: ":-S",
		oops: ":-O",
		tongue: ":-P",
		idea: "(i)",
		yes: "(y)",
		no: "(n)",
		angel: "0:-)",
		crying: ":'(",
		happy: "=)"
	};

	Emoticon.fromAscii = function(/*String*/str){
		// summary:
		//		Factory to create Emoticon object based on string like ":-)" rather than id like "smile"
		var ascii = Emoticon.ascii;
		for(var i in ascii){
			if(str == ascii[i]){
				return new Emoticon(i);
			}
		}
		return null;
	};

	var SmileyPalette = rias.declare(pluginsName + "._SmileyPalette", [_Widget, _TemplatedMixin, _PaletteMixin], {
		// summary:
		//		A keyboard accessible emoticon-picking widget (for inserting smiley characters)
		// description:
		//		Grid showing various emoticons.
		//		Can be used standalone, or as a popup.

		// templateString:
		//		The template of this widget.
		templateString:
			'<table class="dijitInline dijitEditorSmileyPalette dijitPaletteTable" cellSpacing=0 cellPadding=0>' +
				'<tbody data-dojo-attach-point="gridNode"></tbody>' +
			'</table>',

		baseClass: "dijitEditorSmileyPalette",

		_palette: [
			["smile", "laughing", "wink", "grin"],
			["cool", "angry", "half", "eyebrow"],
			["frown", "shy", "goofy", "oops"],
			["tongue", "idea", "angel", "happy"],
			["yes", "no", "crying", ""]
		],

		dyeClass: Emoticon,

		buildRendering: function(){
			// Instantiate the template, which makes a skeleton into which we'll insert a bunch of
			// <img> nodes
			this.inherited(arguments);

			var i18n = rias.i18n.getLocalization(pluginsName, "Smiley");

			// Generate hash from emoticon standard name (like "smile") to translation
			var emoticonI18n = {};
			for(var name in i18n){
				if(name.substr(0,8) == "emoticon"){
					emoticonI18n[name.substr(8).toLowerCase()] = i18n[name];
				}
			}
			this._preparePalette(
				this._palette,
				emoticonI18n
			);
		}
	});

	// For monkey-patching
	SmileyPalette.Emoticon = Emoticon;

	return SmileyPalette;
});
