var Createsend = require('createsend-node');
var Promise = require('bluebird');
var auth = { apiKey: process.env.CMAPI }
var api = new Createsend(auth);
var fs = require('fs');
var _ = require('lodash');

// Promisify methods
var account = Promise.promisifyAll(api.account);
var clients = Promise.promisifyAll(api.clients);
var campaigns = Promise.promisifyAll(api.campaigns);

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
    .filter(validateYear(2014))
    .then(function(campaigns){
      cmObj.clientId = clientObj.clientId;
      cmObj.campaigns = campaigns;
      return cmObj;
    });
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
      .then(function(clients){
        cmObj.emailClients.push(clients);
      });
  })
  .return(campaignArr)
}


function getData(client){
  return account.getClientsAsync()
  .filter(validateClientName(client))
  .map(getCampaigns)
  .then(getEmailClients)
  .catch(function(err){
    console.log(err);
  });
}

module.exports = getData;