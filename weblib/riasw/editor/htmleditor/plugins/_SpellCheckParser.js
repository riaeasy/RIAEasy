define([
	"riasw/riaswBase"
], function(rias) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var SpellCheckParser = rias.declare(pluginsName + "._SpellCheckParser", null, {
		lang: "english",

		parseIntoWords: function(/*String*/ text){
			// summary:
			//		Parse the text into words
			// text:
			//		Plain text without html tags
			// tags:
			//		public
			// returns:
			//		Array holding all the words
			function isCharExt(c){
				var ch = c.charCodeAt(0);
				return 48 <= ch && ch <= 57 || 65 <= ch && ch <= 90 || 97 <= ch && ch <= 122;
			}
			var words = this.words = [],
				indices = this.indices = [],
				index = 0,
				length = text && text.length,
				start = 0;

			while(index < length){
				var ch;
				// Skip the white character and need to treat HTML entity respectively
				while(index < length && !isCharExt(ch = text.charAt(index)) && ch != "&"){ index++; }
				if(ch == "&"){ // An HTML entity, skip it
					while(++index < length && (ch = text.charAt(index)) != ";" && isCharExt(ch)){}
				}else{ // A word
					start = index;
					while(++index < length && isCharExt(text.charAt(index))){}
					if(start < length){
						words.push(text.substring(start, index));
						indices.push(start);
					}
				}
			}

			return words;
		},

		getIndices: function(){
			// summary:
			//		Get the indices of the words. They are in one-to-one correspondence
			// tags:
			//		public
			// returns:
			//		Index array
			return this.indices;
		}
	});

	// Register this parser in the SpellCheck plugin.
	rias.subscribe(pluginsName + ".SpellCheck.getParser", function(sp){
		if(sp.parser){
			return;
		}
		sp.parser = new SpellCheckParser();
	});

	return SpellCheckParser;

});