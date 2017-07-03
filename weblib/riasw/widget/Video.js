
//RIAStudio ClientWidget - widget.Video.

define([
	"riasw/riaswBase",
	"./Audio"
], function(rias, Audio){
	// module:
	//		riasw/widget/Video

	return rias.declare("riasw.widget.Video", Audio, {
		// summary:
		//		A thin wrapper around the HTML5 `<video>` element.
		// description:
		//		dojox/mobile/Video is a widget which plays video. If all sources cannot 
		//		be played (typically, in desktop browsers that do not support `<video>`), 
		//		dojox/mobile/Video automatically replaces `<video>` with `<embed>`, such 
		//		that the browser tries to play it with a suitable plug-in.
		
		// width: [const] String
		//		The width of the embed element.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		width: "200px",

		// height: [const] String
		//		The height of the embed element.
		//		Note that changing the value of the property after the widget
		//		creation has no effect.
		height: "150px",

		// _tag: [private] String
		//		The name of the tag ("video").
		_tag: "video",

		_getEmbedRegExp: function(){
			return rias.has("ff") ? /video\/mp4/i :
				rias.has("ie") >= 9 ? /video\/webm/i :
				//has("safari") ? /video\/webm/i : //Google is gooing to provide webm plugin for safari
				null;
		}
	});
});
