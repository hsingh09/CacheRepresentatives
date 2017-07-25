"use strict";
exports.__esModule = true;
require('dotenv').config();
var restify = require("restify");
var request = require("request");
var Senator = require("./models/Senator");
var HouseRep = require("./models/HouseMember");
var Types = require("./models/SharedTypes");
console.log("process.env.PRO_PUBLICA_API_KEY: " + process.env.PRO_PUBLICA_API_KEY);
// Private config file for API keys
var config = require('./config');
var proPublicaRequest = request.defaults({
    headers: { 'X-API-Key': process.env.PRO_PUBLICA_API_KEY }
});
// Homepage handler
function index(req, res, next) {
    res.send("Listening at " + server.url);
    next();
}
// Makes a request to the ProPublica API to get get all members of the House
function getHouse(req, res, next) {
    var requestURL = "https://api.propublica.org/congress/" + config.PRO_PUBLICA_API_VERSION + "/" + config.CURRENT_HOUSE + "/" + config.HOUSE + "/members.json";
    res.locals = {};
    console.log("getHouse::requestURL = " + requestURL);
    proPublicaRequest(requestURL, function (requestError, requestResponse, requestBody) {
        if (requestError) {
            res.locals.proPublicaHouseSuccess = false;
            console.log("getHouse failed");
        }
        else {
            res.locals.proPublicaHouseSuccess = true;
            res.locals.proPublicaHouseResults = JSON.parse(requestBody).results;
        }
        //1      res.json(res.locals);  
        next();
    });
}
// Makes a request to the ProPublica API and gets all members of the Senate
function getSenate(req, res, next) {
    var requestURL = "https://api.propublica.org/congress/" + config.PRO_PUBLICA_API_VERSION + "/" + config.CURRENT_SENATE + "/" + config.SENATE + "/members.json";
    console.log("getSenate::requestURL = " + requestURL);
    proPublicaRequest(requestURL, function (requestError, requestResponse, requestBody) {
        // Store the result in locals if relevant
        if (requestError) {
            res.locals.proPublicaSenateSuccess = false;
            console.log("getSenate failed");
        }
        else {
            res.locals.proPublicaSenateSuccess = true;
            res.locals.proPublicaSenateResults = JSON.parse(requestBody).results;
        }
        next();
    });
}
function updateDatabase(req, res, next) {
    var senators = res.locals.proPublicaSenateResults[0]['members'];
    var houseMembers = res.locals.proPublicaHouseResults[0]['members'];
    var allSenators = [];
    var allHouseMembers = [];
    for (var senatorKey in senators) {
        var senator = senators[senatorKey];
        var senatorObject = new Senator.Senator();
        senatorObject.representativeId = senator.id;
        senatorObject.firstName = senator.first_name;
        senatorObject.lastName = senator.last_name;
        senatorObject.apiUrl = senator.api_url;
        senatorObject.contactUrl = senator.contact_form;
        senatorObject.cspanId = senator.cspan_id;
        senatorObject.facebookAccount = senator.facebook_account;
        senatorObject.googleEntityId = senator.google_entity_id;
        senatorObject.govtrackId = senator.govtrack_id;
        senatorObject.party = GetParty(senator.party);
        senatorObject.phone = senator.phone;
        allSenators.push(senatorObject);
    }
    for (var houseKey in houseMembers) {
        var houseRep = houseMembers[houseKey];
        var houseObject = new HouseRep.HouseMember();
        houseObject.representativeId = houseRep.id;
        houseObject.firstName = houseRep.first_name;
        houseObject.lastName = houseRep.last_name;
        houseObject.apiUrl = houseRep.api_url;
        houseObject.contactUrl = houseRep.contact_form;
        houseObject.cspanId = houseRep.cspan_id;
        houseObject.facebookAccount = houseRep.facebook_account;
        houseObject.googleEntityId = houseRep.google_entity_id;
        houseObject.govtrackId = houseRep.govtrack_id;
        houseObject.party = GetParty(houseRep.party);
        houseObject.phone = houseRep.phone;
        allHouseMembers.push(houseObject);
    }
    var returnObject = {};
    returnObject['senators'] = allSenators;
    returnObject['house'] = allHouseMembers;
    res.json(returnObject);
    next();
}
function GetParty(party) {
    if (party == "R") {
        return 1 /* Republican */;
    }
    else if (party == "D") {
        return 0 /* Democrat */;
    }
    else if (party == "I") {
        return 2 /* Indepdendent */;
    }
    else {
        return 6 /* Other */;
    }
}
var server = restify.createServer();
server.get('/', index);
server.head('/', index);
server.get('/update', [getHouse, getSenate, updateDatabase]);
server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});
