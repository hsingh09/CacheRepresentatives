require('dotenv').config();

import * as restify from "restify";
import * as request from "request";
import * as sequelize from "sequelize";
import * as Senator from "./models/Senator";
import * as HouseRep from "./models/HouseMember";
import * as Types from "./models/SharedTypes";

var data = require('./data');

var sqlize = new sequelize(process.env.REP_DB_NAME, process.env.REP_DB_USERNAME, process.env.REP_DB_PASSWORD, {
  host: 'replist.database.windows.net',
  port: 1433,
  dialect: 'mssql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  dialectOptions: {
    encrypt: true
  }
});


sqlize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    OnDatabaseConnectionEstablished();
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Private config file for API keys
var config = require('./config');
var proPublicaRequest = request.defaults(
  {
    headers: {'X-API-Key' : process.env.PRO_PUBLICA_API_KEY }
  }
)

// Homepage handler
function index(req, res, next) {
    res.send("Listening at " + server.url);
    next();
}

// Makes a request to the ProPublica API to get get all members of the House
function getHouse(req : restify.Request, res, next : restify.Next)
{
  let requestURL = "https://api.propublica.org/congress/" + config.PRO_PUBLICA_API_VERSION + "/" + config.CURRENT_HOUSE + "/" + config.HOUSE + "/members.json";
  res.locals = {};
  console.log("getHouse::requestURL = " + requestURL);

  proPublicaRequest(requestURL, function(requestError, requestResponse, requestBody)
  {
    if (requestError)
    {
      res.locals.proPublicaHouseSuccess = false;
      console.log("getHouse failed");
    }
    else
    {
      res.locals.proPublicaHouseSuccess = true;
      console.log(requestBody);
      res.locals.proPublicaHouseResults = JSON.parse(requestBody).results;
    }

//1      res.json(res.locals);  
      next();
  });
}

// Makes a request to the ProPublica API and gets all members of the Senate
function getSenate(req : restify.Request, res, next: restify.Next)
{
  let requestURL = "https://api.propublica.org/congress/" + config.PRO_PUBLICA_API_VERSION + "/" + config.CURRENT_SENATE + "/" + config.SENATE + "/members.json";
  console.log("getSenate::requestURL = " + requestURL);

  proPublicaRequest(requestURL, function(requestError, requestResponse, requestBody)
  {
    // Store the result in locals if relevant
    if (requestError)
    {
      res.locals.proPublicaSenateSuccess = false;
      console.log("getSenate failed");
    }
    else
    {
      res.locals.proPublicaSenateSuccess = true;
      res.locals.proPublicaSenateResults = JSON.parse(requestBody).results;
    }

    next();
  });
}

function loadData(req : restify.Request, res, next: restify.Next)
{

}

function updateDatabase(req : restify.Request, res, next: restify.Next)
{
    //res.json(res.locals.proPublicaSenateResults);
    /*let senators = res.locals.proPublicaSenateResults[0]['members'];
    let houseMembers = res.locals.proPublicaHouseResults[0]['members'];

    let allSenators : Senator.Senator[] = [];
    let allHouseMembers : HouseRep.HouseMember[] = [];

    for (let senatorKey in senators)
    {
        let senator = senators[senatorKey];
        let senatorObject = new Senator.Senator();
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

    for (let houseKey in houseMembers)
    {
        let houseRep = houseMembers[houseKey];
        let houseObject = new HouseRep.HouseMember();

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
    res.json(returnObject);*/
    next();
}

function GetParty(party : string) : Types.Party
{
    if (party == "R")
    {
        return Types.Party.Republican;
    }
    else if (party == "D")
    {
        return Types.Party.Democrat;
    }
    else if (party == "I")
    {
        return Types.Party.Indepdendent;
    }
    else
    {
        return Types.Party.Other;
    }
}

var server = restify.createServer();

function OnDatabaseConnectionEstablished()
{
    server.get('/', index);
    server.head('/', index);
    //server.get('/update', [getHouse, getSenate, updateDatabase])
    server.get('/update', [updateDatabase]);
    server.listen(8080, function () {
        console.log('%s listening at %s', server.name, server.url);
    });
}
