//>>built

define("dojox/sql/_crypto", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.sql._crypto");
    dojo.mixin(dojox.sql._crypto, {_POOL_SIZE:100, encrypt:function (plaintext, password, callback) {
        this._initWorkerPool();
        var msg = {plaintext:plaintext, password:password};
        msg = dojo.toJson(msg);
        msg = "encr:" + String(msg);
        this._assignWork(msg, callback);
    }, decrypt:function (ciphertext, password, callback) {
        this._initWorkerPool();
        var msg = {ciphertext:ciphertext, password:password};
        msg = dojo.toJson(msg);
        msg = "decr:" + String(msg);
        this._assignWork(msg, callback);
    }, _initWorkerPool:function () {
        if (!this._manager) {
            try {
                this._manager = google.gears.factory.create("beta.workerpool", "1.0");
                this._unemployed = [];
                this._employed = {};
                this._handleMessage = [];
                var self = this;
                this._manager.onmessage = function (msg, sender) {
                    var callback = self._employed["_" + sender];
                    self._employed["_" + sender] = undefined;
                    self._unemployed.push("_" + sender);
                    if (self._handleMessage.length) {
                        var handleMe = self._handleMessage.shift();
                        self._assignWork(handleMe.msg, handleMe.callback);
                    }
                    callback(msg);
                };
                var workerInit = "function _workerInit(){" + "gearsWorkerPool.onmessage = " + String(this._workerHandler) + ";" + "}";
                var code = workerInit + " _workerInit();";
                for (var i = 0; i < this._POOL_SIZE; i++) {
                    this._unemployed.push("_" + this._manager.createWorker(code));
                }
            }
            catch (exp) {
                throw exp.message || exp;
            }
        }
    }, _assignWork:function (msg, callback) {
        if (!this._handleMessage.length && this._unemployed.length) {
            var workerID = this._unemployed.shift().substring(1);
            this._employed["_" + workerID] = callback;
            this._manager.sendMessage(msg, parseInt(workerID, 10));
        } else {
            this._handleMessage = {msg:msg, callback:callback};
        }
    }, _workerHandler:function (msg, sender) {
        var Sbox = [99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22];
        var Rcon = [[0, 0, 0, 0], [1, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0], [8, 0, 0, 0], [16, 0, 0, 0], [32, 0, 0, 0], [64, 0, 0, 0], [128, 0, 0, 0], [27, 0, 0, 0], [54, 0, 0, 0]];
        function Cipher(input, w) {
            var Nb = 4;
            var Nr = w.length / Nb - 1;
            var state = [[], [], [], []];
            for (var i = 0; i < 4 * Nb; i++) {
                state[i % 4][Math.floor(i / 4)] = input[i];
            }
            state = AddRoundKey(state, w, 0, Nb);
            for (var round = 1; round < Nr; round++) {
                state = SubBytes(state, Nb);
                state = ShiftRows(state, Nb);
                state = MixColumns(state, Nb);
                state = AddRoundKey(state, w, round, Nb);
            }
            state = SubBytes(state, Nb);
            state = ShiftRows(state, Nb);
            state = AddRoundKey(state, w, Nr, Nb);
            var output = new Array(4 * Nb);
            for (var i = 0; i < 4 * Nb; i++) {
                output[i] = state[i % 4][Math.floor(i / 4)];
            }
            return output;
        }
        function SubBytes(s, Nb) {
            for (var r = 0; r < 4; r++) {
                for (var c = 0; c < Nb; c++) {
                    s[r][c] = Sbox[s[r][c]];
                }
            }
            return s;
        }
        function ShiftRows(s, Nb) {
            var t = new Array(4);
            for (var r = 1; r < 4; r++) {
                for (var c = 0; c < 4; c++) {
                    t[c] = s[r][(c + r) % Nb];
                }
                for (var c = 0; c < 4; c++) {
                    s[r][c] = t[c];
                }
            }
            return s;
        }
        function MixColumns(s, Nb) {
            for (var c = 0; c < 4; c++) {
                var a = new Array(4);
                var b = new Array(4);
                for (var i = 0; i < 4; i++) {
                    a[i] = s[i][c];
                    b[i] = s[i][c] & 128 ? s[i][c] << 1 ^ 283 : s[i][c] << 1;
                }
                s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
                s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
                s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
                s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
            }
            return s;
        }
        function AddRoundKey(state, w, rnd, Nb) {
            for (var r = 0; r < 4; r++) {
                for (var c = 0; c < Nb; c++) {
                    state[r][c] ^= w[rnd * 4 + c][r];
                }
            }
            return state;
        }
        function KeyExpansion(key) {
            var Nb = 4;
            var Nk = key.length / 4;
            var Nr = Nk + 6;
            var w = new Array(Nb * (Nr + 1));
            var temp = new Array(4);
            for (var i = 0; i < Nk; i++) {
                var r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
                w[i] = r;
            }
            for (var i = Nk; i < (Nb * (Nr + 1)); i++) {
                w[i] = new Array(4);
                for (var t = 0; t < 4; t++) {
                    temp[t] = w[i - 1][t];
                }
                if (i % Nk == 0) {
                    temp = SubWord(RotWord(temp));
                    for (var t = 0; t < 4; t++) {
                        temp[t] ^= Rcon[i / Nk][t];
                    }
                } else {
                    if (Nk > 6 && i % Nk == 4) {
                        temp = SubWord(temp);
                    }
                }
                for (var t = 0; t < 4; t++) {
                    w[i][t] = w[i - Nk][t] ^ temp[t];
                }
            }
            return w;
        }
        function SubWord(w) {
            for (var i = 0; i < 4; i++) {
                w[i] = Sbox[w[i]];
            }
            return w;
        }
        function RotWord(w) {
            w[4] = w[0];
            for (var i = 0; i < 4; i++) {
                w[i] = w[i + 1];
            }
            return w;
        }
        function AESEncryptCtr(plaintext, password, nBits) {
            if (!(nBits == 128 || nBits == 192 || nBits == 256)) {
                return "";
            }
            var nBytes = nBits / 8;
            var pwBytes = new Array(nBytes);
            for (var i = 0; i < nBytes; i++) {
                pwBytes[i] = password.charCodeAt(i) & 255;
            }
            var key = Cipher(pwBytes, KeyExpansion(pwBytes));
            key = key.concat(key.slice(0, nBytes - 16));
            var blockSize = 16;
            var counterBlock = new Array(blockSize);
            var nonce = (new Date()).getTime();
            for (var i = 0; i < 4; i++) {
                counterBlock[i] = (nonce >>> i * 8) & 255;
            }
            for (var i = 0; i < 4; i++) {
                counterBlock[i + 4] = (nonce / 4294967296 >>> i * 8) & 255;
            }
            var keySchedule = KeyExpansion(key);
            var blockCount = Math.ceil(plaintext.length / blockSize);
            var ciphertext = new Array(blockCount);
            for (var b = 0; b < blockCount; b++) {
                for (var c = 0; c < 4; c++) {
                    counterBlock[15 - c] = (b >>> c * 8) & 255;
                }
                for (var c = 0; c < 4; c++) {
                    counterBlock[15 - c - 4] = (b / 4294967296 >>> c * 8);
                }
                var cipherCntr = Cipher(counterBlock, keySchedule);
                var blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
                var ct = "";
                for (var i = 0; i < blockLength; i++) {
                    var plaintextByte = plaintext.charCodeAt(b * blockSize + i);
                    var cipherByte = plaintextByte ^ cipherCntr[i];
                    ct += String.fromCharCode(cipherByte);
                }
                ciphertext[b] = escCtrlChars(ct);
            }
            var ctrTxt = "";
            for (var i = 0; i < 8; i++) {
                ctrTxt += String.fromCharCode(counterBlock[i]);
            }
            ctrTxt = escCtrlChars(ctrTxt);
            return ctrTxt + "-" + ciphertext.join("-");
        }
        function AESDecryptCtr(ciphertext, password, nBits) {
            if (!(nBits == 128 || nBits == 192 || nBits == 256)) {
                return "";
            }
            var nBytes = nBits / 8;
            var pwBytes = new Array(nBytes);
            for (var i = 0; i < nBytes; i++) {
                pwBytes[i] = password.charCodeAt(i) & 255;
            }
            var pwKeySchedule = KeyExpansion(pwBytes);
            var key = Cipher(pwBytes, pwKeySchedule);
            key = key.concat(key.slice(0, nBytes - 16));
            var keySchedule = KeyExpansion(key);
            ciphertext = ciphertext.split("-");
            var blockSize = 16;
            var counterBlock = new Array(blockSize);
            var ctrTxt = unescCtrlChars(ciphertext[0]);
            for (var i = 0; i < 8; i++) {
                counterBlock[i] = ctrTxt.charCodeAt(i);
            }
            var plaintext = new Array(ciphertext.length - 1);
            for (var b = 1; b < ciphertext.length; b++) {
                for (var c = 0; c < 4; c++) {
                    counterBlock[15 - c] = ((b - 1) >>> c * 8) & 255;
                }
                for (var c = 0; c < 4; c++) {
                    counterBlock[15 - c - 4] = ((b / 4294967296 - 1) >>> c * 8) & 255;
                }
                var cipherCntr = Cipher(counterBlock, keySchedule);
                ciphertext[b] = unescCtrlChars(ciphertext[b]);
                var pt = "";
                for (var i = 0; i < ciphertext[b].length; i++) {
                    var ciphertextByte = ciphertext[b].charCodeAt(i);
                    var plaintextByte = ciphertextByte ^ cipherCntr[i];
                    pt += String.fromCharCode(plaintextByte);
                }
                plaintext[b - 1] = pt;
            }
            return plaintext.join("");
        }
        function escCtrlChars(str) {
            return str.replace(/[\0\t\n\v\f\r\xa0!-]/g, function (c) {
                return "!" + c.charCodeAt(0) + "!";
            });
        }
        function unescCtrlChars(str) {
            return str.replace(/!\d\d?\d?!/g, function (c) {
                return String.fromCharCode(c.slice(1, -1));
            });
        }
        function encrypt(plaintext, password) {
            return AESEncryptCtr(plaintext, password, 256);
        }
        function decrypt(ciphertext, password) {
            return AESDecryptCtr(ciphertext, password, 256);
        }
        var cmd = msg.substr(0, 4);
        var arg = msg.substr(5);
        if (cmd == "encr") {
            arg = eval("(" + arg + ")");
            var plaintext = arg.plaintext;
            var password = arg.password;
            var results = encrypt(plaintext, password);
            gearsWorkerPool.sendMessage(String(results), sender);
        } else {
            if (cmd == "decr") {
                arg = eval("(" + arg + ")");
                var ciphertext = arg.ciphertext;
                var password = arg.password;
                var results = decrypt(ciphertext, password);
                gearsWorkerPool.sendMessage(String(results), sender);
            }
        }
    }});
});

