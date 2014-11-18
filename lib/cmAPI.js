var Createsend = require('createsend-node');
var Promise    = require('bluebird');
var auth       = { apiKey: process.env.CMAPI }
var api        = new Createsend(auth);
var fs         = require('fs');
var _          = require('lodash');

// Promisify methods
var account          = Promise.promisifyAll(api.account);
var clients          = Promise.promisifyAll(api.clients);
var campaigns        = Promise.promisifyAll(api.campaigns);
var OperationalError = Promise.OperationalError;

var cmObj = {
  clientId: null,
  campaigns: null,
  emailClients: []
};

/**
* Use this to filter by client name
*
* @param {String} clientName 
* @returns {Function} that returns a boolean
*/

function validateClientName(clientName){
  return function(clientObj){
    return (clientObj.name === clientName) ? true : false;
  }
}


/**
* Use this to filter by the total ammount of recipients of a campaign
*
* @param {String} clientName 
* @returns {Function} that returns a boolean
*/

function validateRecipientTotal(total){
  return function(campaignObj){
    return (campaignObj.TotalRecipients > total) ? true : false;
  }
}


/**
* Use this to filter by the total ammount of recipients of a campaign
*
* @param {String} clientName 
* @returns {Function} that returns a boolean
*/

function validateYear(year){

  return function(campaignObj){

    var sentDate = parseInt(campaignObj.SentDate)
    var yr = year || sentDate;

    return (sentDate == yr) ? true : false;
  }
}


/**
* Gets the campaigns of a client
*
* @param {Object} clientObj - name of client 
* @returns {Object} a promise that resolves with clientId and campaigns added to the main cmObject
*/

function getCampaigns(clientObj){
  
  return clients.getSentCampaignsAsync(clientObj.clientId)
    .filter(validateRecipientTotal(20))
    .filter(validateYear())
    .then(function(campaigns){
      cmObj.clientId = clientObj.clientId;
      cmObj.campaigns = campaigns;
      return cmObj;
    });
}


/**
* Adds email client data along with date to obj.emailClients
*
* @param {Object} obj - object map
* @param {Object} campaign - campaign object
* @returns {Object} a function 
*/

function addClientsAndDate(obj, campaign){
  return function(clients){

    // Add date to the client object so we can filter on client
    _.each(clients,function(client){
      client.date = campaign.SentDate
    });

    obj.emailClients.push(clients);
  }
}


/**
* Retry Gettting the email client usage from a campaign
*
* @param {Object} obj - object map
* @param {Object} campaign - campaign object
* @returns {Object} a promise that resolves with emailClients added to the main cmObject as a full array
*/

function retryGetEmailClientUsage(obj, campaign){
  return function(error){
    return campaigns.getEmailClientUsageAsync(campaign.CampaignID)
      .then(addClientsAndDate(obj, campaign));
  }
}


/**
* Gets the email client usage from a campaign
*
* @param {Object} campaignArr - array that contains the cmObj at index 0 
* @returns {Object} a promise that resolves with emailClients added to the main cmObject as a full array
*/

function getEmailClients(campaignArr){
  return Promise.map(cmObj.campaigns, function(campaign){
    return campaigns.getEmailClientUsageAsync(campaign.CampaignID)
      .then(addClientsAndDate(cmObj, campaign))
      .catch(OperationalError, retryGetEmailClientUsage(cmObj, campaign));
  })
  .return(campaignArr);
}


/**
* Builds the final object 
*
* @param {Object} cmObj
* @returns {Object} the final object to be used as data
*/

function buildFinalObj(cmObj){
  var obj = {};
  var subscribers;

  obj.emailClients = _.flatten(cmObj[0].emailClients);
  subscribers = _.pluck(obj.emailClients, 'Subscribers');
  obj.total = _.reduce(subscribers, function(sum, num){ return sum + num });
  // fs.writeFileSync('data.js', JSON.stringify(obj));
  return obj;
}


/**
* Get data from client e.g. (Genentech, Meltmedia etc...)
*
* @param {String} client - client name
* @returns {Object} a promise that resolves with final data object
*/

function getData(client){
  return account.getClientsAsync()
  .filter(validateClientName(client))
  .map(getCampaigns)
  .then(getEmailClients)
  .then(buildFinalObj)
  .catch(function(e){ console.log(e); });
}

module.exports = getData;