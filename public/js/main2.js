$(function () {

  'use strict';

  
  function buildDataObj(data){
    var dataObj = {}
    dataObj.total = data.total;

    _.each(data.emailClients, function(version){

      if(!dataObj[version.Client]){
        dataObj[version.Client] = {};
      }

      if(!dataObj[version.Client][version.Version]){
        dataObj[version.Client][version.Version] = { value: 0 };
      }

      dataObj[version.Client][version.Version].value += version.Subscribers;

    });

    return dataObj;
  }


  /*
  * This creates the inital object that contains the properties needed to 
  * pass to chart.series.data and chart.drilldown.series.data
  * 
  * @param {Object} clientObj
  * @param {String} clientName
  *
  * @returns {Object} object literal 
  */

  function initDataObj(clientObj, clientName){

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
  }



  /*
  * This creates the initial data array containing all of the email clients
  * 
  * @param {Object} dataObj
  *
  * @returns {Array} array containing a series of data
  */
  
  function buildSeriesData(dataObj){

    var clientData = [];
    var clients;

    _.each(dataObj, function(clientObj, clientName){
      clients = initDataObj(clientObj, clientName); 
      clients = getTotalAndBuildData(clientObj, clients);
      clients.total = dataObj.total;
      clientData.push(clients);
    });

    var sorted = _.sortBy(clientData, 'y').reverse()

    return sorted;
  }


  /*
  * This creates the inital object that contains the properties needed to 
  * pass to chart.series.data and chart.drilldown.series.data
  * 
  * @param {Object} clientObj
  * @param {String} clientName
  *
  * @returns {Object} object literal 
  */

  function getTotalAndBuildData(clientObj, seriesObj){

    _.each(clientObj, function(versionObj, versionName){
         
        // y value in a chart 
        seriesObj.y += versionObj.value;

        // drilldown data
        seriesObj.data.push({ name: versionName, y: versionObj.value })
      });

      return seriesObj;
  }


  /*
  * Add "Others" data to series that combines the clients that are 
  * less than 2% of the email market share
  * 
  * @param {Object} dataObj
  *
  * @returns {Array} new series data  
  */

  function addClientData(dataObj){
    var data = buildSeriesData(dataObj);
    var otherClients = _.filter(data, isLessThanAverage);
    var total = getTotal(otherClients, 'y');
    var newData = _.filter(data, isGreaterThanAverage);

    newData.push({
      name: 'Others',
      y: total,
      drilldown: 'Others',
      id: 'Others',
      data: otherClients
    });
  
    return newData;
  }


  /*
  * Joins clients into one
  * 
  * @param {Object} dataObj
  * @param {String} clientName
  * @param {Array} arr
  *
  * @returns {Array} new series data 
  */

  function joinClientData(dataObj, clientName, arr){
    var data = addClientData(dataObj);
    var clients = _.filter(data, itemExists.bind(null, arr)); 
    var newData = _.filter(data, itemMissing.bind(null, arr));

    var total = getTotal(clients, 'y');
  
    newData.push({
      name: clientName,
      y: total
    });
    
    var sorted = _.sortBy(newData, 'y').reverse();

    return sorted;
  }


  /*
  * Checks if item exists in an array
  *
  * @param {Array} arr
  * @param {Object} client
  *
  * @returns {Boolean} true or false
  */

  function itemExists(arr, client){
    return arr.indexOf(client.name) !== -1;
  }


  /*
  * Checks if item is missing in an array
  *
  * @param {Array} arr
  * @param {Object} client
  *
  * @returns {Boolean} true or false
  */

  function itemMissing(arr, client){
    return arr.indexOf(client.name) == -1;
  }


  /*
  * Calculate total of y values 
  *
  * @param {Object} obj
  * @param {String} prop
  *
  * @returns {Number} total
  */

  function getTotal(obj, prop){
    return _.reduce(_.pluck(obj, prop), getSum);
  }


  /*
  * Calculates sum 
  *
  * @param {Number} sum
  * @param {Number} num
  *
  * @returns {Number} sum
  */

  function getSum(sum, num){
    return sum + num;
  }


  /*
  * Is client less than 2% average 
  *
  * @param {Object} client
  *
  * @returns {Boolean} true or false
  */

  function isLessThanAverage(client){
    return client.y/client.total * 100 < 2;
  }


  /*
  * Is client > than 2% average 
  *
  * @param {Object} client
  *
  * @returns {Boolean} true or false
  */

  function isGreaterThanAverage(client){
    return client.y/client.total * 100 > 2;
  }

  var data = buildDataObj(DATA);
  var finalData = joinClientData(data, 'Outlook.com', ['Hotmail', 'Outlook.com']);

  var config = {
      chart: {
          type: 'pie',
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          // spacingLeft: -100
          renderTo: 'container'
      },
      rangeSelector: {
            enabled: true
        },

      title: {
          text: 'Email market share 2012-2014'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        borderWidth: 1,
        itemMarginBottom: 5,
        verticalAlign: 'middle',
        itemStyle: {
          fontWeight: 'normal'
        },
        labelFormatter: function(){
          return '<strong>' + this.name + '</strong> (' + Number(this.percentage).toFixed(1) + '%)' ;
        },
        y: 0,
        x: 0
      },
      plotOptions: {
        pie: {
          // allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
              enabled: false
          },
          showInLegend: true
        }
      },
      series: [{
        type: 'pie',
        name: 'Email Market share',
        data: finalData
      }],
      drilldown: {
        series: finalData
      }
  }

  // Build the chart
  $('#container').highcharts(config);

  // Grab chart object
  var chart = $('#container').highcharts();
  

});