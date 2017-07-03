
//RIAStudio Client/Server Runtime riasBase(rias).

define([
	"exports",
	"./riasBase",

	"./encoding/digests/_base",
	"./encoding/digests/MD5",
	//"./encoding/digests/SHA1",
	//"./encoding/digests/SHA224",
	//"./encoding/digests/SHA256",
	//"./encoding/digests/SHA384",
	//"./encoding/digests/SHA512",

	"./encoding/crypto/_base",
	"./encoding/crypto/SimpleAES",
	//"./encoding/crypto/Blowfish",
	//"./encoding/crypto/RSAKey",

	//"./encoding/compression/lzw",
	//"./encoding/compression/splay",

	//"./encoding/bits",
	//"./encoding/ascii85",
	//"./encoding/easy64",
	"./encoding/base64"
], function(exports, rias,
			dbase, MD5,
			//SHA1, SHA224, SHA256, SHA384, SHA512,
			cbase, SimpleAES,
			//Blowfish, RSAKey,
			//lzw, splay,
			//bits, ascii85, easy64,
			base64
	) {

	rias.encoding = exports;

	exports.outputTypes = dbase.outputTypes;
	exports.cipherModes = cbase.cipherModes;

	exports.MD5 = MD5;
	//exports.SHA1 = SHA1;
	//exports.SHA224 = SHA224;
	//exports.SHA256 = SHA256;
	//exports.SHA384 = SHA384;
	//exports.SHA512 = SHA512;

	exports.SimpleAES = SimpleAES;
	//exports.Blowfish = Blowfish;

	exports.base64 = base64;

	return exports;

});