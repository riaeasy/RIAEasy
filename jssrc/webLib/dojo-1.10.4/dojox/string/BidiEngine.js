//>>built

define("dojox/string/BidiEngine", ["dojo/_base/lang", "dojo/_base/declare"], function (lang, declare) {
    lang.getObject("string", true, dojox);
    var BidiEngine = declare("dojox.string.BidiEngine", null, {bidiTransform:function (text, formatIn, formatOut) {
        if (!text) {
            return "";
        }
        if (!formatIn && !formatOut) {
            return text;
        }
        var validFormat = /^[(I|V)][(L|R|C|D)][(Y|N)][(S|N)][N]$/;
        if (!validFormat.test(formatIn) || !validFormat.test(formatOut)) {
            throw new Error("dojox.string.BidiEngine: the bidi layout string is wrong!");
        }
        if (formatIn == formatOut) {
            return text;
        }
        var orientIn = getOrientation(formatIn.charAt(1)), orientOut = getOrientation(formatOut.charAt(1)), os_in = (formatIn.charAt(0) == "I") ? "L" : formatIn.charAt(0), os_out = (formatOut.charAt(0) == "I") ? "L" : formatOut.charAt(0), inFormat = os_in + orientIn, outFormat = os_out + orientOut, swap = formatIn.charAt(2) + formatOut.charAt(2);
        if (inFormat) {
            bdx.defInFormat = inFormat;
        }
        if (outFormat) {
            bdx.defOutFormat = outFormat;
        }
        if (swap) {
            bdx.defSwap = swap;
        }
        var stage1_text = doBidiReorder(text, os_in + orientIn, os_out + orientOut, formatIn.charAt(2) + formatOut.charAt(2)), isRtl = false;
        if (formatOut.charAt(1) == "R") {
            isRtl = true;
        } else {
            if (formatOut.charAt(1) == "C" || formatOut.charAt(1) == "D") {
                isRtl = this.checkContextual(stage1_text);
            }
        }
        if (formatIn.charAt(3) == formatOut.charAt(3)) {
            return stage1_text;
        } else {
            if (formatOut.charAt(3) == "S") {
                return shape(isRtl, stage1_text, true);
            }
        }
        if (formatOut.charAt(3) == "N") {
            return deshape(stage1_text, isRtl, true);
        }
    }, checkContextual:function (text) {
        var dir = firstStrongDir(text);
        if (dir != "ltr" && dir != "rtl") {
            dir = document.dir.toLowerCase();
            if (dir != "ltr" && dir != "rtl") {
                dir = "ltr";
            }
        }
        return dir;
    }, hasBidiChar:function (text) {
        var type = null, uc = null, hi = null;
        for (var i = 0; i < text.length; i++) {
            uc = text.charAt(i).charCodeAt(0);
            hi = MasterTable[uc >> 8];
            type = hi < TBBASE ? hi : UnicodeTable[hi - TBBASE][uc & 255];
            if (type == UBAT_R || type == UBAT_AL) {
                return true;
            }
            if (type == UBAT_B) {
                break;
            }
        }
        return false;
    }});
    function doBidiReorder(text, inFormat, outFormat, swap) {
        if (inFormat == undefined) {
            inFormat = bdx.defInFormat;
        }
        if (outFormat == undefined) {
            outFormat = bdx.defOutFormat;
        }
        if (swap == undefined) {
            swap = bdx.defSwap;
        }
        if (inFormat == outFormat) {
            return text;
        }
        var dir, inOrdering = inFormat.substring(0, 1), inOrientation = inFormat.substring(1, 4), outOrdering = outFormat.substring(0, 1), outOrientation = outFormat.substring(1, 4);
        if (inOrientation.charAt(0) == "C") {
            dir = firstStrongDir(text);
            if (dir == "ltr" || dir == "rtl") {
                inOrientation = dir.toUpperCase();
            } else {
                inOrientation = inFormat.charAt(2) == "L" ? "LTR" : "RTL";
            }
            inFormat = inOrdering + inOrientation;
        }
        if (outOrientation.charAt(0) == "C") {
            dir = firstStrongDir(text);
            if (dir == "rtl") {
                outOrientation = "RTL";
            } else {
                if (dir == "ltr") {
                    dir = lastStrongDir(text);
                    outOrientation = dir.toUpperCase();
                } else {
                    outOrientation = outFormat.charAt(2) == "L" ? "LTR" : "RTL";
                }
            }
            outFormat = outOrdering + outOrientation;
        }
        if (inFormat == outFormat) {
            return text;
        }
        bdx.inFormat = inFormat;
        bdx.outFormat = outFormat;
        bdx.swap = swap;
        if ((inOrdering == "L") && (outFormat == "VLTR")) {
            if (inOrientation == "LTR") {
                bdx.dir = LTR;
                return doReorder(text);
            }
            if (inOrientation == "RTL") {
                bdx.dir = RTL;
                return doReorder(text);
            }
        }
        if ((inOrdering == "V") && (outOrdering == "V")) {
            return invertStr(text);
        }
        if ((inOrdering == "L") && (outFormat == "VRTL")) {
            if (inOrientation == "LTR") {
                bdx.dir = LTR;
                text = doReorder(text);
            } else {
                bdx.dir = RTL;
                text = doReorder(text);
            }
            return invertStr(text);
        }
        if ((inFormat == "VLTR") && (outFormat == "LLTR")) {
            bdx.dir = LTR;
            return doReorder(text);
        }
        if ((inOrdering == "V") && (outOrdering == "L") && (inOrientation != outOrientation)) {
            text = invertStr(text);
            return (inOrientation == "RTL") ? doBidiReorder(text, "LLTR", "VLTR", swap) : doBidiReorder(text, "LRTL", "VRTL", swap);
        }
        if ((inFormat == "VRTL") && (outFormat == "LRTL")) {
            return doBidiReorder(text, "LRTL", "VRTL", swap);
        }
        if ((inOrdering == "L") && (outOrdering == "L")) {
            var saveSwap = bdx.swap;
            bdx.swap = saveSwap.substr(0, 1) + "N";
            if (inOrientation == "RTL") {
                bdx.dir = RTL;
                text = doReorder(text);
                bdx.swap = "N" + saveSwap.substr(1, 2);
                bdx.dir = LTR;
                text = doReorder(text);
            } else {
                bdx.dir = LTR;
                text = doReorder(text);
                bdx.swap = "N" + saveSwap.substr(1, 2);
                text = doBidiReorder(text, "VLTR", "LRTL", bdx.swap);
            }
            return text;
        }
    }
    function shape(rtl, text, compress) {
        if (text.length == 0) {
            return;
        }
        if (rtl == undefined) {
            rtl = true;
        }
        if (compress == undefined) {
            compress = true;
        }
        text = new String(text);
        var str06 = text.split(""), Ix = 0, step = +1, nIEnd = str06.length;
        if (!rtl) {
            Ix = str06.length - 1;
            step = -1;
            nIEnd = 1;
        }
        var previousCursive = 0, compressArray = [], compressArrayIndx = 0;
        for (var index = Ix; index * step < nIEnd; index = index + step) {
            if (isArabicAlefbet(str06[index]) || isArabicDiacritics(str06[index])) {
                if (str06[index] == "\u0644") {
                    if (isNextAlef(str06, (index + step), step, nIEnd)) {
                        str06[index] = (previousCursive == 0) ? getLamAlefFE(str06[index + step], LamAlefInialTableFE) : getLamAlefFE(str06[index + step], LamAlefMedialTableFE);
                        index += step;
                        setAlefToSpace(str06, index, step, nIEnd);
                        if (compress) {
                            compressArray[compressArrayIndx] = index;
                            compressArrayIndx++;
                        }
                        previousCursive = 0;
                        continue;
                    }
                }
                var currentChr = str06[index];
                if (previousCursive == 1) {
                    str06[index] = (isNextArabic(str06, (index + step), step, nIEnd)) ? getMedialFormCharacterFE(str06[index]) : getFormCharacterFE(str06[index], FinalForm);
                } else {
                    if (isNextArabic(str06, (index + step), step, nIEnd) == true) {
                        str06[index] = getFormCharacterFE(str06[index], InitialForm);
                    } else {
                        str06[index] = getFormCharacterFE(str06[index], IsolatedForm);
                    }
                }
                if (!isArabicDiacritics(currentChr)) {
                    previousCursive = 1;
                }
                if (isStandAlonCharacter(currentChr) == true) {
                    previousCursive = 0;
                }
            } else {
                previousCursive = 0;
            }
        }
        var outBuf = "";
        for (idx = 0; idx < str06.length; idx++) {
            if (!(compress && indexOf(compressArray, compressArray.length, idx) > -1)) {
                outBuf += str06[idx];
            }
        }
        return outBuf;
    }
    function firstStrongDir(text) {
        var type = null, uc = null, hi = null;
        for (var i = 0; i < text.length; i++) {
            uc = text.charAt(i).charCodeAt(0);
            hi = MasterTable[uc >> 8];
            type = hi < TBBASE ? hi : UnicodeTable[hi - TBBASE][uc & 255];
            if (type == UBAT_R || type == UBAT_AL) {
                return "rtl";
            }
            if (type == UBAT_L) {
                return "ltr";
            }
            if (type == UBAT_B) {
                break;
            }
        }
        return "";
    }
    function lastStrongDir(text) {
        var type = null;
        for (var i = text.length - 1; i >= 0; i--) {
            type = getCharacterType(text.charAt(i));
            if (type == UBAT_R || type == UBAT_AL) {
                return "rtl";
            }
            if (type == UBAT_L) {
                return "ltr";
            }
            if (type == UBAT_B) {
                break;
            }
        }
        return "";
    }
    function deshape(text, rtl, consume_next_space) {
        if (text.length == 0) {
            return;
        }
        if (consume_next_space == undefined) {
            consume_next_space = true;
        }
        if (rtl == undefined) {
            rtl = true;
        }
        text = new String(text);
        var outBuf = "", strFE = [], textBuff = "";
        if (consume_next_space) {
            for (var j = 0; j < text.length; j++) {
                if (text.charAt(j) == " ") {
                    if (rtl) {
                        if (j > 0) {
                            if (text.charAt(j - 1) >= "\ufef5" && text.charAt(j - 1) <= "\ufefc") {
                                continue;
                            }
                        }
                    } else {
                        if (j + 1 < text.length) {
                            if (text.charAt(j + 1) >= "\ufef5" && text.charAt(j + 1) <= "\ufefc") {
                                continue;
                            }
                        }
                    }
                }
                textBuff += text.charAt(j);
            }
        } else {
            textBuff = new String(text);
        }
        strFE = textBuff.split("");
        for (var i = 0; i < textBuff.length; i++) {
            if (strFE[i] >= "\ufe70" && strFE[i] < "\ufeff") {
                var chNum = textBuff.charCodeAt(i);
                if (strFE[i] >= "\ufef5" && strFE[i] <= "\ufefc") {
                    if (rtl) {
                        outBuf += "\u0644";
                        outBuf += AlefTable[parseInt((chNum - 65269) / 2)];
                    } else {
                        outBuf += AlefTable[parseInt((chNum - 65269) / 2)];
                        outBuf += "\u0644";
                    }
                } else {
                    outBuf += FETo06Table[chNum - 65136];
                }
            } else {
                outBuf += strFE[i];
            }
        }
        return outBuf;
    }
    function doReorder(str) {
        var chars = str.split(""), levels = [];
        computeLevels(chars, levels);
        swapChars(chars, levels);
        invertLevel(2, chars, levels);
        invertLevel(1, chars, levels);
        return chars.join("");
    }
    function computeLevels(chars, levels) {
        var len = chars.length, impTab = bdx.dir ? impTab_RTL : impTab_LTR, prevState = null, newClass = null, newLevel = null, newState = 0, action = null, cond = null, condPos = -1, i = null, ix = null, types = [], classes = [];
        bdx.hiLevel = bdx.dir;
        bdx.lastArabic = false;
        bdx.hasUBAT_AL = false, bdx.hasUBAT_B = false;
        bdx.hasUBAT_S = false;
        for (i = 0; i < len; i++) {
            types[i] = getCharacterType(chars[i]);
        }
        for (ix = 0; ix < len; ix++) {
            prevState = newState;
            classes[ix] = newClass = getCharClass(chars, types, classes, ix);
            newState = impTab[prevState][newClass];
            action = newState & 240;
            newState &= 15;
            levels[ix] = newLevel = impTab[newState][ITIL];
            if (action > 0) {
                if (action == 16) {
                    for (i = condPos; i < ix; i++) {
                        levels[i] = 1;
                    }
                    condPos = -1;
                } else {
                    condPos = -1;
                }
            }
            cond = impTab[newState][ITCOND];
            if (cond) {
                if (condPos == -1) {
                    condPos = ix;
                }
            } else {
                if (condPos > -1) {
                    for (i = condPos; i < ix; i++) {
                        levels[i] = newLevel;
                    }
                    condPos = -1;
                }
            }
            if (types[ix] == UBAT_B) {
                levels[ix] = 0;
            }
            bdx.hiLevel |= newLevel;
        }
        if (bdx.hasUBAT_S) {
            for (i = 0; i < len; i++) {
                if (types[i] == UBAT_S) {
                    levels[i] = bdx.dir;
                    for (var j = i - 1; j >= 0; j--) {
                        if (types[j] == UBAT_WS) {
                            levels[j] = bdx.dir;
                        } else {
                            break;
                        }
                    }
                }
            }
        }
    }
    function swapChars(chars, levels) {
        if (bdx.hiLevel == 0 || bdx.swap.substr(0, 1) == bdx.swap.substr(1, 2)) {
            return;
        }
        for (var i = 0; i < chars.length; i++) {
            if (levels[i] == 1) {
                chars[i] = getMirror(chars[i]);
            }
        }
    }
    function getCharacterType(ch) {
        var uc = ch.charCodeAt(0), hi = MasterTable[uc >> 8];
        return (hi < TBBASE) ? hi : UnicodeTable[hi - TBBASE][uc & 255];
    }
    function invertStr(str) {
        var chars = str.split("");
        chars.reverse();
        return chars.join("");
    }
    function indexOf(cArray, cLength, idx) {
        var counter = -1;
        for (var i = 0; i < cLength; i++) {
            if (cArray[i] == idx) {
                return i;
            }
        }
        return -1;
    }
    function isArabicAlefbet(c) {
        for (var i = 0; i < ArabicAlefBetIntervalsBegine.length; i++) {
            if (c >= ArabicAlefBetIntervalsBegine[i] && c <= ArabicAlefBetIntervalsEnd[i]) {
                return true;
            }
        }
        return false;
    }
    function isNextArabic(str06, index, step, nIEnd) {
        while (((index) * step) < nIEnd && isArabicDiacritics(str06[index])) {
            index += step;
        }
        if (((index) * step) < nIEnd && isArabicAlefbet(str06[index])) {
            return true;
        }
        return false;
    }
    function isNextAlef(str06, index, step, nIEnd) {
        while (((index) * step) < nIEnd && isArabicDiacritics(str06[index])) {
            index += step;
        }
        var c = " ";
        if (((index) * step) < nIEnd) {
            c = str06[index];
        } else {
            return false;
        }
        for (var i = 0; i < AlefTable.length; i++) {
            if (AlefTable[i] == c) {
                return true;
            }
        }
        return false;
    }
    function invertLevel(lev, chars, levels) {
        if (bdx.hiLevel < lev) {
            return;
        }
        if (lev == 1 && bdx.dir == RTL && !bdx.hasUBAT_B) {
            chars.reverse();
            return;
        }
        var len = chars.length, start = 0, end, lo, hi, tmp;
        while (start < len) {
            if (levels[start] >= lev) {
                end = start + 1;
                while (end < len && levels[end] >= lev) {
                    end++;
                }
                for (lo = start, hi = end - 1; lo < hi; lo++, hi--) {
                    tmp = chars[lo];
                    chars[lo] = chars[hi];
                    chars[hi] = tmp;
                }
                start = end;
            }
            start++;
        }
    }
    function getCharClass(chars, types, classes, ix) {
        var cType = types[ix], wType, nType, len, i;
        switch (cType) {
          case UBAT_L:
          case UBAT_R:
            bdx.lastArabic = false;
          case UBAT_ON:
          case UBAT_AN:
            return cType;
          case UBAT_EN:
            return bdx.lastArabic ? UBAT_AN : UBAT_EN;
          case UBAT_AL:
            bdx.lastArabic = true;
            bdx.hasUBAT_AL = true;
            return UBAT_R;
          case UBAT_WS:
            return UBAT_ON;
          case UBAT_CS:
            if (ix < 1 || (ix + 1) >= types.length || ((wType = classes[ix - 1]) != UBAT_EN && wType != UBAT_AN) || ((nType = types[ix + 1]) != UBAT_EN && nType != UBAT_AN)) {
                return UBAT_ON;
            }
            if (bdx.lastArabic) {
                nType = UBAT_AN;
            }
            return nType == wType ? nType : UBAT_ON;
          case UBAT_ES:
            wType = ix > 0 ? classes[ix - 1] : UBAT_B;
            if (wType == UBAT_EN && (ix + 1) < types.length && types[ix + 1] == UBAT_EN) {
                return UBAT_EN;
            }
            return UBAT_ON;
          case UBAT_ET:
            if (ix > 0 && classes[ix - 1] == UBAT_EN) {
                return UBAT_EN;
            }
            if (bdx.lastArabic) {
                return UBAT_ON;
            }
            i = ix + 1;
            len = types.length;
            while (i < len && types[i] == UBAT_ET) {
                i++;
            }
            if (i < len && types[i] == UBAT_EN) {
                return UBAT_EN;
            }
            return UBAT_ON;
          case UBAT_NSM:
            if (bdx.inFormat == "VLTR") {
                len = types.length;
                i = ix + 1;
                while (i < len && types[i] == UBAT_NSM) {
                    i++;
                }
                if (i < len) {
                    var c = chars[ix], rtlCandidate = (c >= 1425 && c <= 2303) || c == 64286;
                    wType = types[i];
                    if (rtlCandidate && (wType == UBAT_R || wType == UBAT_AL)) {
                        return UBAT_R;
                    }
                }
            }
            if (ix < 1 || (wType = types[ix - 1]) == UBAT_B) {
                return UBAT_ON;
            }
            return classes[ix - 1];
          case UBAT_B:
            lastArabic = false;
            bdx.hasUBAT_B = true;
            return bdx.dir;
          case UBAT_S:
            bdx.hasUBAT_S = true;
            return UBAT_ON;
          case UBAT_LRE:
          case UBAT_RLE:
          case UBAT_LRO:
          case UBAT_RLO:
          case UBAT_PDF:
            lastArabic = false;
          case UBAT_BN:
            return UBAT_ON;
        }
    }
    function getMirror(c) {
        var mid, low = 0, high = SwapTable.length - 1;
        while (low <= high) {
            mid = Math.floor((low + high) / 2);
            if (c < SwapTable[mid][0]) {
                high = mid - 1;
            } else {
                if (c > SwapTable[mid][0]) {
                    low = mid + 1;
                } else {
                    return SwapTable[mid][1];
                }
            }
        }
        return c;
    }
    function isStandAlonCharacter(c) {
        for (var i = 0; i < StandAlonForm.length; i++) {
            if (StandAlonForm[i] == c) {
                return true;
            }
        }
        return false;
    }
    function getMedialFormCharacterFE(c) {
        for (var i = 0; i < BaseForm.length; i++) {
            if (c == BaseForm[i]) {
                return MedialForm[i];
            }
        }
        return c;
    }
    function getFormCharacterFE(c, formArr) {
        for (var i = 0; i < BaseForm.length; i++) {
            if (c == BaseForm[i]) {
                return formArr[i];
            }
        }
        return c;
    }
    function isArabicDiacritics(c) {
        return (c >= "\u064b" && c <= "\u0655") ? true : false;
    }
    function getOrientation(oc) {
        if (oc == "L") {
            return "LTR";
        }
        if (oc == "R") {
            return "RTL";
        }
        if (oc == "C") {
            return "CLR";
        }
        if (oc == "D") {
            return "CRL";
        }
    }
    function setAlefToSpace(str06, index, step, nIEnd) {
        while (((index) * step) < nIEnd && isArabicDiacritics(str06[index])) {
            index += step;
        }
        if (((index) * step) < nIEnd) {
            str06[index] = " ";
            return true;
        }
        return false;
    }
    function getLamAlefFE(alef06, LamAlefForm) {
        for (var i = 0; i < AlefTable.length; i++) {
            if (alef06 == AlefTable[i]) {
                return LamAlefForm[i];
            }
        }
        return alef06;
    }
    function LamAlef(alef) {
        for (var i = 0; i < AlefTable.length; i++) {
            if (AlefTable[i] == alef) {
                return AlefTable[i];
            }
        }
        return 0;
    }
    var bdx = {dir:0, defInFormat:"LLTR", defoutFormat:"VLTR", defSwap:"YN", inFormat:"LLTR", outFormat:"VLTR", swap:"YN", hiLevel:0, lastArabic:false, hasUBAT_AL:false, hasBlockSep:false, hasSegSep:false};
    var ITIL = 5;
    var ITCOND = 6;
    var LTR = 0;
    var RTL = 1;
    var SwapTable = [["(", ")"], [")", "("], ["<", ">"], [">", "<"], ["[", "]"], ["]", "["], ["{", "}"], ["}", "{"], ["\xab", "\xbb"], ["\xbb", "\xab"], ["\u2039", "\u203a"], ["\u203a", "\u2039"], ["\u207d", "\u207e"], ["\u207e", "\u207d"], ["\u208d", "\u208e"], ["\u208e", "\u208d"], ["\u2264", "\u2265"], ["\u2265", "\u2264"], ["\u2329", "\u232a"], ["\u232a", "\u2329"], ["\ufe59", "\ufe5a"], ["\ufe5a", "\ufe59"], ["\ufe5b", "\ufe5c"], ["\ufe5c", "\ufe5b"], ["\ufe5d", "\ufe5e"], ["\ufe5e", "\ufe5d"], ["\ufe64", "\ufe65"], ["\ufe65", "\ufe64"]];
    var AlefTable = ["\u0622", "\u0623", "\u0625", "\u0627"];
    var AlefTableFE = [65153, 65154, 65155, 65156, 65159, 65160, 65165, 65166];
    var LamTableFE = [65245, 65246, 65247, 65248];
    var LamAlefInialTableFE = ["\ufef5", "\ufef7", "\ufef9", "\ufefb"];
    var LamAlefMedialTableFE = ["\ufef6", "\ufef8", "\ufefa", "\ufefc"];
    var BaseForm = ["\u0627", "\u0628", "\u062a", "\u062b", "\u062c", "\u062d", "\u062e", "\u062f", "\u0630", "\u0631", "\u0632", "\u0633", "\u0634", "\u0635", "\u0636", "\u0637", "\u0638", "\u0639", "\u063a", "\u0641", "\u0642", "\u0643", "\u0644", "\u0645", "\u0646", "\u0647", "\u0648", "\u064a", "\u0625", "\u0623", "\u0622", "\u0629", "\u0649", "\u06cc", "\u0626", "\u0624", "\u064b", "\u064c", "\u064d", "\u064e", "\u064f", "\u0650", "\u0651", "\u0652", "\u0621"];
    var IsolatedForm = ["\ufe8d", "\ufe8f", "\ufe95", "\ufe99", "\ufe9d", "\ufea1", "\ufea5", "\ufea9", "\ufeab", "\ufead", "\ufeaf", "\ufeb1", "\ufeb5", "\ufeb9", "\ufebd", "\ufec1", "\ufec5", "\ufec9", "\ufecd", "\ufed1", "\ufed5", "\ufed9", "\ufedd", "\ufee1", "\ufee5", "\ufee9", "\ufeed", "\ufef1", "\ufe87", "\ufe83", "\ufe81", "\ufe93", "\ufeef", "\ufbfc", "\ufe89", "\ufe85", "\ufe70", "\ufe72", "\ufe74", "\ufe76", "\ufe78", "\ufe7a", "\ufe7c", "\ufe7e", "\ufe80"];
    var FinalForm = ["\ufe8e", "\ufe90", "\ufe96", "\ufe9a", "\ufe9e", "\ufea2", "\ufea6", "\ufeaa", "\ufeac", "\ufeae", "\ufeb0", "\ufeb2", "\ufeb6", "\ufeba", "\ufebe", "\ufec2", "\ufec6", "\ufeca", "\ufece", "\ufed2", "\ufed6", "\ufeda", "\ufede", "\ufee2", "\ufee6", "\ufeea", "\ufeee", "\ufef2", "\ufe88", "\ufe84", "\ufe82", "\ufe94", "\ufef0", "\ufbfd", "\ufe8a", "\ufe86", "\ufe70", "\ufe72", "\ufe74", "\ufe76", "\ufe78", "\ufe7a", "\ufe7c", "\ufe7e", "\ufe80"];
    var MedialForm = ["\ufe8e", "\ufe92", "\ufe98", "\ufe9c", "\ufea0", "\ufea4", "\ufea8", "\ufeaa", "\ufeac", "\ufeae", "\ufeb0", "\ufeb4", "\ufeb8", "\ufebc", "\ufec0", "\ufec4", "\ufec8", "\ufecc", "\ufed0", "\ufed4", "\ufed8", "\ufedc", "\ufee0", "\ufee4", "\ufee8", "\ufeec", "\ufeee", "\ufef4", "\ufe88", "\ufe84", "\ufe82", "\ufe94", "\ufef0", "\ufbff", "\ufe8c", "\ufe86", "\ufe71", "\ufe72", "\ufe74", "\ufe77", "\ufe79", "\ufe7b", "\ufe7d", "\ufe7f", "\ufe80"];
    var InitialForm = ["\ufe8d", "\ufe91", "\ufe97", "\ufe9b", "\ufe9f", "\ufea3", "\ufea7", "\ufea9", "\ufeab", "\ufead", "\ufeaf", "\ufeb3", "\ufeb7", "\ufebb", "\ufebf", "\ufec3", "\ufec7", "\ufecb", "\ufecf", "\ufed3", "\ufed7", "\ufedb", "\ufedf", "\ufee3", "\ufee7", "\ufeeb", "\ufeed", "\ufef3", "\ufe87", "\ufe83", "\ufe81", "\ufe93", "\ufeef", "\ufbfe", "\ufe8b", "\ufe85", "\ufe70", "\ufe72", "\ufe74", "\ufe76", "\ufe78", "\ufe7a", "\ufe7c", "\ufe7e", "\ufe80"];
    var StandAlonForm = ["\u0621", "\u0627", "\u062f", "\u0630", "\u0631", "\u0632", "\u0648", "\u0622", "\u0629", "\u0626", "\u0624", "\u0625", "\u0675", "\u0623"];
    var FETo06Table = ["\u064b", "\u064b", "\u064c", "\u061f", "\u064d", "\u061f", "\u064e", "\u064e", "\u064f", "\u064f", "\u0650", "\u0650", "\u0651", "\u0651", "\u0652", "\u0652", "\u0621", "\u0622", "\u0622", "\u0623", "\u0623", "\u0624", "\u0624", "\u0625", "\u0625", "\u0626", "\u0626", "\u0626", "\u0626", "\u0627", "\u0627", "\u0628", "\u0628", "\u0628", "\u0628", "\u0629", "\u0629", "\u062a", "\u062a", "\u062a", "\u062a", "\u062b", "\u062b", "\u062b", "\u062b", "\u062c", "\u062c", "\u062c", "\u062c", "\u062d", "\u062d", "\u062d", "\u062d", "\u062e", "\u062e", "\u062e", "\u062e", "\u062f", "\u062f", "\u0630", "\u0630", "\u0631", "\u0631", "\u0632", "\u0632", "\u0633", "\u0633", "\u0633", "\u0633", "\u0634", "\u0634", "\u0634", "\u0634", "\u0635", "\u0635", "\u0635", "\u0635", "\u0636", "\u0636", "\u0636", "\u0636", "\u0637", "\u0637", "\u0637", "\u0637", "\u0638", "\u0638", "\u0638", "\u0638", "\u0639", "\u0639", "\u0639", "\u0639", "\u063a", "\u063a", "\u063a", "\u063a", "\u0641", "\u0641", "\u0641", "\u0641", "\u0642", "\u0642", "\u0642", "\u0642", "\u0643", "\u0643", "\u0643", "\u0643", "\u0644", "\u0644", "\u0644", "\u0644", "\u0645", "\u0645", "\u0645", "\u0645", "\u0646", "\u0646", "\u0646", "\u0646", "\u0647", "\u0647", "\u0647", "\u0647", "\u0648", "\u0648", "\u0649", "\u0649", "\u064a", "\u064a", "\u064a", "\u064a", "\ufef5", "\ufef6", "\ufef7", "\ufef8", "\ufef9", "\ufefa", "\ufefb", "\ufefc", "\u061f", "\u061f", "\u061f"];
    var ArabicAlefBetIntervalsBegine = ["\u0621", "\u0641"];
    var ArabicAlefBetIntervalsEnd = ["\u063a", "\u064a"];
    var Link06 = [1 + 32 + 256 * 17, 1 + 32 + 256 * 19, 1 + 256 * 21, 1 + 32 + 256 * 23, 1 + 2 + 256 * 25, 1 + 32 + 256 * 29, 1 + 2 + 256 * 31, 1 + 256 * 35, 1 + 2 + 256 * 37, 1 + 2 + 256 * 41, 1 + 2 + 256 * 45, 1 + 2 + 256 * 49, 1 + 2 + 256 * 53, 1 + 256 * 57, 1 + 256 * 59, 1 + 256 * 61, 1 + 256 * 63, 1 + 2 + 256 * 65, 1 + 2 + 256 * 69, 1 + 2 + 256 * 73, 1 + 2 + 256 * 77, 1 + 2 + 256 * 81, 1 + 2 + 256 * 85, 1 + 2 + 256 * 89, 1 + 2 + 256 * 93, 0, 0, 0, 0, 0, 1 + 2, 1 + 2 + 256 * 97, 1 + 2 + 256 * 101, 1 + 2 + 256 * 105, 1 + 2 + 16 + 256 * 109, 1 + 2 + 256 * 113, 1 + 2 + 256 * 117, 1 + 2 + 256 * 121, 1 + 256 * 125, 1 + 256 * 127, 1 + 2 + 256 * 129, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 + 256 * 133, 1 + 256 * 135, 1 + 256 * 137, 1 + 256 * 139, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 1 + 32, 1 + 32, 0, 1 + 32, 1, 1, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1, 1 + 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 + 2, 1, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1, 1];
    var LinkFE = [1 + 2, 1 + 2, 1 + 2, 0, 1 + 2, 0, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 1 + 2, 0, 0 + 32, 1 + 32, 0 + 32, 1 + 32, 0, 1, 0 + 32, 1 + 32, 0, 2, 1 + 2, 1, 0 + 32, 1 + 32, 0, 2, 1 + 2, 1, 0, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0 + 16, 2 + 16, 1 + 2 + 16, 1 + 16, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 2, 1 + 2, 1, 0, 1, 0, 1, 0, 2, 1 + 2, 1, 0, 1, 0, 1, 0, 1, 0, 1];
    var impTab_LTR = [[0, 3, 0, 1, 0, 0, 0], [0, 3, 0, 1, 2, 2, 0], [0, 3, 0, 17, 2, 0, 1], [0, 3, 5, 5, 4, 1, 0], [0, 3, 21, 21, 4, 0, 1], [0, 3, 5, 5, 4, 2, 0]];
    var impTab_RTL = [[2, 0, 1, 1, 0, 1, 0], [2, 0, 1, 1, 0, 2, 0], [2, 0, 2, 1, 3, 2, 0], [2, 0, 2, 33, 3, 1, 1]];
    var UBAT_L = 0;
    var UBAT_R = 1;
    var UBAT_EN = 2;
    var UBAT_AN = 3;
    var UBAT_ON = 4;
    var UBAT_B = 5;
    var UBAT_S = 6;
    var UBAT_AL = 7;
    var UBAT_WS = 8;
    var UBAT_CS = 9;
    var UBAT_ES = 10;
    var UBAT_ET = 11;
    var UBAT_NSM = 12;
    var UBAT_LRE = 13;
    var UBAT_RLE = 14;
    var UBAT_PDF = 15;
    var UBAT_LRO = 16;
    var UBAT_RLO = 17;
    var UBAT_BN = 18;
    var TBBASE = 100;
    var TB00 = TBBASE + 0;
    var TB05 = TBBASE + 1;
    var TB06 = TBBASE + 2;
    var TB07 = TBBASE + 3;
    var TB20 = TBBASE + 4;
    var TBFB = TBBASE + 5;
    var TBFE = TBBASE + 6;
    var TBFF = TBBASE + 7;
    var L = UBAT_L;
    var R = UBAT_R;
    var EN = UBAT_EN;
    var AN = UBAT_AN;
    var ON = UBAT_ON;
    var B = UBAT_B;
    var S = UBAT_S;
    var AL = UBAT_AL;
    var WS = UBAT_WS;
    var CS = UBAT_CS;
    var ES = UBAT_ES;
    var ET = UBAT_ET;
    var NSM = UBAT_NSM;
    var LRE = UBAT_LRE;
    var RLE = UBAT_RLE;
    var PDF = UBAT_PDF;
    var LRO = UBAT_LRO;
    var RLO = UBAT_RLO;
    var BN = UBAT_BN;
    var MasterTable = [TB00, L, L, L, L, TB05, TB06, TB07, R, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, TB20, ON, ON, ON, L, ON, L, ON, L, ON, ON, ON, L, L, ON, ON, L, L, L, L, L, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, L, L, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, L, L, ON, ON, L, L, ON, ON, L, L, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, L, L, L, TBFB, AL, AL, TBFE, TBFF];
    delete TB00;
    delete TB05;
    delete TB06;
    delete TB07;
    delete TB20;
    delete TBFB;
    delete TBFE;
    delete TBFF;
    var UnicodeTable = [[BN, BN, BN, BN, BN, BN, BN, BN, BN, S, B, S, WS, B, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, B, B, B, S, WS, ON, ON, ET, ET, ET, ON, ON, ON, ON, ON, ES, CS, ES, CS, CS, EN, EN, EN, EN, EN, EN, EN, EN, EN, EN, CS, ON, ON, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, ON, ON, BN, BN, BN, BN, BN, BN, B, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, CS, ON, ET, ET, ET, ET, ON, ON, ON, ON, L, ON, ON, BN, ON, ON, ET, ET, EN, EN, ON, L, ON, ON, ON, EN, L, ON, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, L, L, L, L, L, L, L, L], [L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, ON, ON, ON, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, L, L, L, L, L, L, L, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, L, ON, ON, ON, ON, ON, ON, ON, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, R, NSM, R, NSM, NSM, R, NSM, NSM, R, NSM, ON, ON, ON, ON, ON, ON, ON, ON, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, ON, ON, ON, ON, ON, R, R, R, R, R, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON], [AN, AN, AN, AN, ON, ON, ON, ON, AL, ET, ET, AL, CS, AL, ON, ON, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, AL, ON, ON, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, AN, AN, AN, AN, AN, AN, AN, AN, AN, AN, ET, AN, AN, AL, AL, AL, NSM, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, NSM, NSM, NSM, NSM, NSM, NSM, NSM, AN, ON, NSM, NSM, NSM, NSM, NSM, NSM, AL, AL, NSM, NSM, ON, NSM, NSM, NSM, NSM, AL, AL, EN, EN, EN, EN, EN, EN, EN, EN, EN, EN, AL, AL, AL, AL, AL, AL], [AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, ON, AL, AL, NSM, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, ON, ON, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, AL, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, R, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, R, R, ON, ON, ON, ON, R, ON, ON, ON, ON, ON], [WS, WS, WS, WS, WS, WS, WS, WS, WS, WS, WS, BN, BN, BN, L, R, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, WS, B, LRE, RLE, PDF, LRO, RLO, CS, ET, ET, ET, ET, ET, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, CS, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, WS, BN, BN, BN, BN, BN, ON, ON, ON, ON, ON, BN, BN, BN, BN, BN, BN, EN, L, ON, ON, EN, EN, EN, EN, EN, EN, ES, ES, ON, ON, ON, L, EN, EN, EN, EN, EN, EN, EN, EN, EN, EN, ES, ES, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, ON, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ET, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON], [L, L, L, L, L, L, L, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, L, L, L, L, L, ON, ON, ON, ON, ON, R, NSM, R, R, R, R, R, R, R, R, R, R, ES, R, R, R, R, R, R, R, R, R, R, R, R, R, ON, R, R, R, R, R, ON, R, ON, R, R, ON, R, R, ON, R, R, R, R, R, R, R, R, R, R, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL], [NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, NSM, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, NSM, NSM, NSM, NSM, NSM, NSM, NSM, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, CS, ON, CS, ON, ON, CS, ON, ON, ON, ON, ON, ON, ON, ON, ON, ET, ON, ON, ES, ES, ON, ON, ON, ON, ON, ET, ET, ON, ON, ON, ON, ON, AL, AL, AL, AL, AL, ON, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, AL, ON, ON, BN], [ON, ON, ON, ET, ET, ET, ON, ON, ON, ON, ON, ES, CS, ES, CS, CS, EN, EN, EN, EN, EN, EN, EN, EN, EN, EN, CS, ON, ON, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, L, ON, ON, ON, L, L, L, L, L, L, ON, ON, L, L, L, L, L, L, ON, ON, L, L, L, L, L, L, ON, ON, L, L, L, ON, ON, ON, ET, ET, ON, ON, ON, ET, ET, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON, ON]];
    delete L;
    delete R;
    delete EN;
    delete AN;
    delete ON;
    delete B;
    delete S;
    delete AL;
    delete WS;
    delete CS;
    delete ES;
    delete ET;
    delete NSM;
    delete LRE;
    delete RLE;
    delete PDF;
    delete LRO;
    delete RLO;
    delete BN;
    return BidiEngine;
});

