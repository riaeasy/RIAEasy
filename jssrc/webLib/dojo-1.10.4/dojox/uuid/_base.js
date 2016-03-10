//>>built

define("dojox/uuid/_base", ["dojo/_base/kernel", "dojo/_base/lang"], function (dojo) {
    dojo.getObject("uuid", true, dojox);
    dojox.uuid.NIL_UUID = "00000000-0000-0000-0000-000000000000";
    dojox.uuid.version = {UNKNOWN:0, TIME_BASED:1, DCE_SECURITY:2, NAME_BASED_MD5:3, RANDOM:4, NAME_BASED_SHA1:5};
    dojox.uuid.variant = {NCS:"0", DCE:"10", MICROSOFT:"110", UNKNOWN:"111"};
    dojox.uuid.assert = function (booleanValue, message) {
        if (!booleanValue) {
            if (!message) {
                message = "An assert statement failed.\n" + "The method dojox.uuid.assert() was called with a 'false' value.\n";
            }
            throw new Error(message);
        }
    };
    dojox.uuid.generateNilUuid = function () {
        return dojox.uuid.NIL_UUID;
    };
    dojox.uuid.isValid = function (uuidString) {
        uuidString = uuidString.toString();
        var valid = (dojo.isString(uuidString) && (uuidString.length == 36) && (uuidString == uuidString.toLowerCase()));
        if (valid) {
            var arrayOfParts = uuidString.split("-");
            valid = ((arrayOfParts.length == 5) && (arrayOfParts[0].length == 8) && (arrayOfParts[1].length == 4) && (arrayOfParts[2].length == 4) && (arrayOfParts[3].length == 4) && (arrayOfParts[4].length == 12));
            var HEX_RADIX = 16;
            for (var i in arrayOfParts) {
                var part = arrayOfParts[i];
                var integer = parseInt(part, HEX_RADIX);
                valid = valid && isFinite(integer);
            }
        }
        return valid;
    };
    dojox.uuid.getVariant = function (uuidString) {
        if (!dojox.uuid._ourVariantLookupTable) {
            var variant = dojox.uuid.variant;
            var lookupTable = [];
            lookupTable[0] = variant.NCS;
            lookupTable[1] = variant.NCS;
            lookupTable[2] = variant.NCS;
            lookupTable[3] = variant.NCS;
            lookupTable[4] = variant.NCS;
            lookupTable[5] = variant.NCS;
            lookupTable[6] = variant.NCS;
            lookupTable[7] = variant.NCS;
            lookupTable[8] = variant.DCE;
            lookupTable[9] = variant.DCE;
            lookupTable[10] = variant.DCE;
            lookupTable[11] = variant.DCE;
            lookupTable[12] = variant.MICROSOFT;
            lookupTable[13] = variant.MICROSOFT;
            lookupTable[14] = variant.UNKNOWN;
            lookupTable[15] = variant.UNKNOWN;
            dojox.uuid._ourVariantLookupTable = lookupTable;
        }
        uuidString = uuidString.toString();
        var variantCharacter = uuidString.charAt(19);
        var HEX_RADIX = 16;
        var variantNumber = parseInt(variantCharacter, HEX_RADIX);
        dojox.uuid.assert((variantNumber >= 0) && (variantNumber <= 16));
        return dojox.uuid._ourVariantLookupTable[variantNumber];
    };
    dojox.uuid.getVersion = function (uuidString) {
        var errorMessage = "dojox.uuid.getVersion() was not passed a DCE Variant UUID.";
        dojox.uuid.assert(dojox.uuid.getVariant(uuidString) == dojox.uuid.variant.DCE, errorMessage);
        uuidString = uuidString.toString();
        var versionCharacter = uuidString.charAt(14);
        var HEX_RADIX = 16;
        var versionNumber = parseInt(versionCharacter, HEX_RADIX);
        return versionNumber;
    };
    dojox.uuid.getNode = function (uuidString) {
        var errorMessage = "dojox.uuid.getNode() was not passed a TIME_BASED UUID.";
        dojox.uuid.assert(dojox.uuid.getVersion(uuidString) == dojox.uuid.version.TIME_BASED, errorMessage);
        uuidString = uuidString.toString();
        var arrayOfStrings = uuidString.split("-");
        var nodeString = arrayOfStrings[4];
        return nodeString;
    };
    dojox.uuid.getTimestamp = function (uuidString, returnType) {
        var errorMessage = "dojox.uuid.getTimestamp() was not passed a TIME_BASED UUID.";
        dojox.uuid.assert(dojox.uuid.getVersion(uuidString) == dojox.uuid.version.TIME_BASED, errorMessage);
        uuidString = uuidString.toString();
        if (!returnType) {
            returnType = null;
        }
        switch (returnType) {
          case "string":
          case String:
            return dojox.uuid.getTimestamp(uuidString, Date).toUTCString();
            break;
          case "hex":
            var arrayOfStrings = uuidString.split("-");
            var hexTimeLow = arrayOfStrings[0];
            var hexTimeMid = arrayOfStrings[1];
            var hexTimeHigh = arrayOfStrings[2];
            hexTimeHigh = hexTimeHigh.slice(1);
            var timestampAsHexString = hexTimeHigh + hexTimeMid + hexTimeLow;
            dojox.uuid.assert(timestampAsHexString.length == 15);
            return timestampAsHexString;
            break;
          case null:
          case "date":
          case Date:
            var GREGORIAN_CHANGE_OFFSET_IN_HOURS = 3394248;
            var HEX_RADIX = 16;
            var arrayOfParts = uuidString.split("-");
            var timeLow = parseInt(arrayOfParts[0], HEX_RADIX);
            var timeMid = parseInt(arrayOfParts[1], HEX_RADIX);
            var timeHigh = parseInt(arrayOfParts[2], HEX_RADIX);
            var hundredNanosecondIntervalsSince1582 = timeHigh & 4095;
            hundredNanosecondIntervalsSince1582 <<= 16;
            hundredNanosecondIntervalsSince1582 += timeMid;
            hundredNanosecondIntervalsSince1582 *= 4294967296;
            hundredNanosecondIntervalsSince1582 += timeLow;
            var millisecondsSince1582 = hundredNanosecondIntervalsSince1582 / 10000;
            var secondsPerHour = 60 * 60;
            var hoursBetween1582and1970 = GREGORIAN_CHANGE_OFFSET_IN_HOURS;
            var secondsBetween1582and1970 = hoursBetween1582and1970 * secondsPerHour;
            var millisecondsBetween1582and1970 = secondsBetween1582and1970 * 1000;
            var millisecondsSince1970 = millisecondsSince1582 - millisecondsBetween1582and1970;
            var timestampAsDate = new Date(millisecondsSince1970);
            return timestampAsDate;
            break;
          default:
            dojox.uuid.assert(false, "dojox.uuid.getTimestamp was not passed a valid returnType: " + returnType);
            break;
        }
    };
    return dojox.uuid;
});

