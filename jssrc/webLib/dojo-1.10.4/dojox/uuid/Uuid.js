//>>built

define("dojox/uuid/Uuid", ["dojo/_base/lang", "./_base"], function (dojo, uuid) {
    dojox.uuid.Uuid = function (input) {
        this._uuidString = dojox.uuid.NIL_UUID;
        if (input) {
            dojox.uuid.assert(dojo.isString(input));
            this._uuidString = input.toLowerCase();
            dojox.uuid.assert(this.isValid());
        } else {
            var ourGenerator = dojox.uuid.Uuid.getGenerator();
            if (ourGenerator) {
                this._uuidString = ourGenerator();
                dojox.uuid.assert(this.isValid());
            }
        }
    };
    dojox.uuid.Uuid.compare = function (uuidOne, uuidTwo) {
        var uuidStringOne = uuidOne.toString();
        var uuidStringTwo = uuidTwo.toString();
        if (uuidStringOne > uuidStringTwo) {
            return 1;
        }
        if (uuidStringOne < uuidStringTwo) {
            return -1;
        }
        return 0;
    };
    dojox.uuid.Uuid.setGenerator = function (generator) {
        dojox.uuid.assert(!generator || dojo.isFunction(generator));
        dojox.uuid.Uuid._ourGenerator = generator;
    };
    dojox.uuid.Uuid.getGenerator = function () {
        return dojox.uuid.Uuid._ourGenerator;
    };
    dojox.uuid.Uuid.prototype.toString = function () {
        return this._uuidString;
    };
    dojox.uuid.Uuid.prototype.compare = function (otherUuid) {
        return dojox.uuid.Uuid.compare(this, otherUuid);
    };
    dojox.uuid.Uuid.prototype.isEqual = function (otherUuid) {
        return (this.compare(otherUuid) == 0);
    };
    dojox.uuid.Uuid.prototype.isValid = function () {
        return dojox.uuid.isValid(this);
    };
    dojox.uuid.Uuid.prototype.getVariant = function () {
        return dojox.uuid.getVariant(this);
    };
    dojox.uuid.Uuid.prototype.getVersion = function () {
        if (!this._versionNumber) {
            this._versionNumber = dojox.uuid.getVersion(this);
        }
        return this._versionNumber;
    };
    dojox.uuid.Uuid.prototype.getNode = function () {
        if (!this._nodeString) {
            this._nodeString = dojox.uuid.getNode(this);
        }
        return this._nodeString;
    };
    dojox.uuid.Uuid.prototype.getTimestamp = function (returnType) {
        if (!returnType) {
            returnType = null;
        }
        switch (returnType) {
          case "string":
          case String:
            return this.getTimestamp(Date).toUTCString();
            break;
          case "hex":
            if (!this._timestampAsHexString) {
                this._timestampAsHexString = dojox.uuid.getTimestamp(this, "hex");
            }
            return this._timestampAsHexString;
            break;
          case null:
          case "date":
          case Date:
            if (!this._timestampAsDate) {
                this._timestampAsDate = dojox.uuid.getTimestamp(this, Date);
            }
            return this._timestampAsDate;
            break;
          default:
            dojox.uuid.assert(false, "The getTimestamp() method dojox.uuid.Uuid was passed a bogus returnType: " + returnType);
            break;
        }
    };
    return dojox.uuid.Uuid;
});

