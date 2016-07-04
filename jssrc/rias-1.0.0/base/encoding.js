
//RIAStudio Client/Server Runtime riasBase(rias).

define([
	"rias/base/lang",

	"dojox/encoding/digests/_base",
	"dojox/encoding/digests/MD5",
	//"dojox/encoding/digests/SHA1",
	//"dojox/encoding/digests/SHA224",
	//"dojox/encoding/digests/SHA256",
	//"dojox/encoding/digests/SHA384",
	//"dojox/encoding/digests/SHA512",

	"dojox/encoding/crypto/_base",
	"dojox/encoding/crypto/SimpleAES",
	//"dojox/encoding/crypto/Blowfish",
	//"dojox/encoding/crypto/RSAKey",

	//"dojox/encoding/compression/lzw",
	//"dojox/encoding/compression/splay",

	//"dojox/encoding/bits",
	//"dojox/encoding/ascii85",
	//"dojox/encoding/easy64",
	"dojox/encoding/base64"
], function(rias,
            dbase, MD5,
            //SHA1, SHA224, SHA256, SHA384, SHA512,
            cbase, SimpleAES,
            //Blowfish, RSAKey,
            //lzw, splay,
            //bits, ascii85, easy64,
            base64
	) {

	var encoding = rias.getObject("rias.encoding", true);

	encoding.outputTypes = dbase.outputTypes;
	encoding.cipherModes = cbase.cipherModes;

	encoding.MD5 = MD5;
	//encoding.SHA1 = SHA1;
	//encoding.SHA224 = SHA224;
	//encoding.SHA256 = SHA256;
	//encoding.SHA384 = SHA384;
	//encoding.SHA512 = SHA512;

	encoding.SimpleAES = SimpleAES;
	//encoding.Blowfish = Blowfish;

	encoding.base64 = base64;

	return rias;

});