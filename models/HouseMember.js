"use strict";
exports.__esModule = true;
var Types = require("./SharedTypes");
var HouseMember = (function () {
    function HouseMember() {
        this.chamber = 0 /* House */;
    }
    HouseMember.prototype.SetRepresentativeId = function (repId) {
        this.representativeId = repId;
    };
    return HouseMember;
}());
exports.HouseMember = HouseMember;
