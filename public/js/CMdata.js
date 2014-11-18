var CMData = (function(){

  'use strict';

  function CMData(data, year){
    this.year = year;
    this.data = this.buildDataObj(data, this.year);
  }

  CMData.prototype.buildDataObj = function(data) {
    
    var obj = {};
    var total = 0;
    data = ( (this.year) && (typeof this.year === 'number') ) ? this.getYearData(data) : data.emailClients;

    _.forEach(data, function(version){

      if(!obj[version.Client]){
        obj[version.Client] = {};
      }

      if(!obj[version.Client][version.Version]){
        obj[version.Client][version.Version] = { value: 0 };
      }

      obj[version.Client][version.Version].value += version.Subscribers;
      total += version.Subscribers;

    });
    this.total = total;
    return obj;
    
  };

  CMData.prototype.initDataObj = function(clientObj, clientName) {
    var versionLength = _.keys(clientObj).length;

    // object used for any "series.data" objects
    var client = {};

    // properties for config.series.data  
    client.name = clientName;
    client.y = 0;
    if(versionLength > 1) { client.drilldown = clientName } 

    // properties for drilldown.series.data 
    client.id = clientName;
    client.data = [];

    return client;
  };

  CMData.prototype.buildSeriesData = function() {
    var clientData = [];
    var clients;

    _.forEach(this.data, function(clientObj, clientName){
      clients = this.initDataObj(clientObj, clientName); 
      clients = this.getTotalAndBuildData(clientObj, clients);
      clientData.push(clients);
    }, this);

    var sorted = _.sortBy(clientData, 'y').reverse()

    return sorted;
  };

  CMData.prototype.getTotalAndBuildData = function(clientObj, seriesObj) {
    _.forEach(clientObj, function(versionObj, versionName){
            
      // y value in a chart 
      seriesObj.y += versionObj.value;

      // drilldown data
      seriesObj.data.push({ name: versionName, y: versionObj.value })
    });

    return seriesObj;
  };

  CMData.prototype.addClientData = function(){
    var data = this.buildSeriesData(this.data);
    var otherClients = _.filter(data, this.isLessThanAverage, this);
    var total = this.getTotal(otherClients, 'y');
    var newData = _.filter(data, this.isGreaterThanAverage, this);

    newData.push({
      name: 'Others',
      y: total,
      drilldown: 'Others',
      id: 'Others',
      data: otherClients
    });
  
    return newData;
  };


  CMData.prototype.joinClientData = function(finalName, arr){
    var dataObj = this.addClientData(this.data);
    var clients = _.filter(dataObj, this.itemExists(arr)); 
    var newData = _.filter(dataObj, this.itemMissing(arr));
    var total = this.getTotal(clients, 'y');
    
    newData.push({
      name: finalName,
      y: total
    });
    
    var sorted = _.sortBy(newData, 'y').reverse();

    return sorted;
  };

   CMData.prototype.itemExists = function(arr){
    return function(client){
      return arr.indexOf(client.name) !== -1;
    }
  };

   CMData.prototype.itemMissing = function(arr){
    return function(client){
      return arr.indexOf(client.name) == -1;
    }
  };

   CMData.prototype.getTotal = function(obj, prop){
    var plucked  = _.pluck(obj, prop);
    return _.reduce(plucked, this.addTotal);
  };

   CMData.prototype.addTotal = function(prevVal, currentVal){
    return prevVal + currentVal;
  };

   CMData.prototype.isLessThanAverage = function(client){
    return client.y/this.total * 100 < 2;
  };

   CMData.prototype.isGreaterThanAverage = function(client){
    return client.y/this.total * 100 > 2;
  };

  CMData.prototype.getYearData = function(data){

    var self = this;
    var year = _.filter(data.emailClients, function(client){
      return parseInt(client.date) === self.year;
    });

    return year;
  };  

  return CMData;

}());