
define([
	"../_base",
	"rias/riasBase"
], function(encoding, rias) {

	var crypto = rias.getObject("crypto", true, encoding);

	crypto.cipherModes = {
		// summary:
		//		Enumeration for various cipher modes.
		ECB:0,
		CBC:1,
		PCBC:2,
		CFB:3,
		OFB:4,
		CTR:5
	};
	crypto.outputTypes = {
		// summary:
		//		Enumeration for input and output encodings.
		Base64:0,
		Hex:1,
		String:2,
		Raw:3
	};

	return crypto;
});
