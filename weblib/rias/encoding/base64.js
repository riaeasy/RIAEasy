
define([
	"./_base",
	"rias/riasBase"
], function(encoding, rias) {

	var base64 = rias.getObject("base64", true, encoding);

	var p = "=";
	var tab="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

	base64.encode = function(/* byte[] */ba){
		// summary:
		//		Encode an array of bytes as a base64-encoded string
		var s = [], t,
			i, l = ba.length,
			rm = l % 3,
			x = l - rm;
		for (i = 0; i < x;){
			t = ba[i++] << 16 | ba[i++] << 8 | ba[i++];
			s.push(tab.charAt((t >>> 18) & 0x3f));
			s.push(tab.charAt((t >>> 12) & 0x3f));
			s.push(tab.charAt((t >>> 6) & 0x3f));
			s.push(tab.charAt(t & 0x3f));
		}
		//	deal with trailers, based on patch from Peter Wood.
		switch(rm){
			case 2:{
				t = ba[i++] << 16 | ba[i++] << 8;
				s.push(tab.charAt((t >>> 18) & 0x3f));
				s.push(tab.charAt((t >>> 12) & 0x3f));
				s.push(tab.charAt((t >>> 6) & 0x3f));
				s.push(p);
				break;
			}
			case 1:{
				t = ba[i++] << 16;
				s.push(tab.charAt((t >>> 18) & 0x3f));
				s.push(tab.charAt((t >>> 12) & 0x3f));
				s.push(p);
				s.push(p);
				break;
			}
		}
		return s.join("");	//	string
	};

	base64.decode = function(/* string */str){
		// summary:
		//		Convert a base64-encoded string to an array of bytes
		var s = str.split(""),
			out = [], t,
			i, l = s.length;
		while(s[--l] === p){
		}	//	strip off trailing padding
		for (i = 0; i < l;){
			t = tab.indexOf(s[i++]) << 18;
			if(i <= l){
				t |= tab.indexOf(s[i++]) << 12;
			}
			if(i <= l){
				t |= tab.indexOf(s[i++]) << 6;
			}
			if(i <= l){
				t |= tab.indexOf(s[i++]);
			}
			out.push((t >>> 16) & 0xff);
			out.push((t >>> 8) & 0xff);
			out.push(t & 0xff);
		}
		//	strip off any null bytes
		while(out[out.length - 1] === 0){
			out.pop();
		}
		return out;	//	byte[]
	};

	return base64;
});
