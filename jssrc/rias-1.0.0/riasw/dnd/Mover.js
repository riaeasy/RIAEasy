
define([
	"rias",
	"dojo/dnd/Mover"
], function(rias, _Widget){

// module:
//		dojo/dnd/Mover

	_Widget.extend({
		// utilities
		onFirstMove: function(e){
			// summary:
			//		makes the node absolute; it is meant to be called only once.
			//		relative and absolutely positioned nodes are assumed to use pixel units
			var s = rias.dom.getComputedStyle(this.node),//this.node.style,
				l, t, h = this.host;
			switch(s.position){
				case "relative":
				case "absolute":
					// assume that left and top values are in pixels already
					//if()
					l = Math.round(parseFloat(s.left)) || 0;
					t = Math.round(parseFloat(s.top)) || 0;
					break;
				default:
					s.position = "absolute";	// enforcing the absolute mode
					var m = rias.dom.getMarginBox(this.node);
					// event.pageX/pageY (which we used to generate the initial
					// margin box) includes padding and margin set on the body.
					// However, setting the node's position to absolute and then
					// doing domGeom.marginBox on it *doesn't* take that additional
					// space into account - so we need to subtract the combined
					// padding and margin.  We use getComputedStyle and
					// _getMarginBox/_getContentBox to avoid the extra lookup of
					// the computed style.
					var b = rias.dom.docBody;
					var bs = rias.dom.getComputedStyle(b);
					var bm = rias.dom.getMarginBox(b, bs);
					var bc = rias.dom.getContentBox(b, bs);
					l = m.l - (bc.l - bm.l);
					t = m.t - (bc.t - bm.t);
					break;
			}
			this.marginBox.l = l - this.marginBox.l;
			this.marginBox.t = t - this.marginBox.t;
			if(h && h.onFirstMove){
				h.onFirstMove(this, e);
			}

			// Disconnect touch.move that call this function
			this.events.shift().remove();
		}
	});

	return _Widget;

});
