"use strict";
exports.__esModule = true;
var Types = require("./SharedTypes");
var Senator = (function () {
    function Senator() {
        this.chamber = 1 /* Senate */;
    }
    Senator.prototype.SetRepresentativeId = function (repId) {
        this.representativeId = repId;
    };
    return Senator;
}());
exports.Senator = Senator;
