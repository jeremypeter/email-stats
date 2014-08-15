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

console.time('TEST');
account.getClientsAsync()
  .filter(validateClientName('Genentech'))
  .map(getCampaigns)
  .then(getEmailClients)
  .then(function(a){
    console.log(a);
    console.timeEnd('TEST');
    fs.writeFileSync('data.js', JSON.stringify(a));
  })
  .catch(function(err){
    console.log(err);
  })


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

    var yr = year || parseInt(campaignObj.SentDate);

    return (parseInt(campaignObj.SentDate) == yr) ? true : false;
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



// function getCampaigns(res){

//   var data = [];

//   api.account.getClients(function(err, clientList){
//     clientList.forEach(function(client){
//       console.log(client.name);
//       if(client.name === 'Genentech'){
//         var id = client.clientId;
        
//         api.clients.getSentCampaigns(id, function(err, campaigns){
          
//           campaigns.forEach(function(campaign){
//             var name = campaign.Name;
            
//             if(parseInt(campaign.SentDate, 10) === 2014 && campaign.TotalRecipients > 100){

              

//               api.campaigns.getEmailClientUsage(campaign.CampaignID, function(err, stats){
//               fs.appendFileSync('emails.js', JSON.stringify(stats));
//               console.log(stats);
//               res.send(stats)
//               data.push(stats);
//               // stats.forEach(function(stat){
//               //   // console.log(stat);
//               // });

//             });

//             }

//           });
//         });
//       }
//     });
//   });
// }

module.exports = getCampaigns;