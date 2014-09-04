$(function () {

  'use strict';

  function CMData(data, year){
    this.year = year;
    this.data = this.buildDataObj(data, this.year);
    console.log(this.data);
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



  /*
  * This creates the inital object that contains the properties needed to 
  * pass to chart.series.data and chart.drilldown.series.data
  * 
  * @param {Object} clientObj
  * @param {String} clientName
  *
  * @returns {Object} object literal 
  */

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



  /*
  * This creates the initial data array containing all of the email clients
  * 
  * @param {Object} dataObj
  *
  * @returns {Array} array containing a series of data
  */

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



  /*
  * This creates the inital object that contains the properties needed to 
  * pass to chart.series.data and chart.drilldown.series.data
  * 
  * @param {Object} clientObj
  * @param {String} clientName
  *
  * @returns {Object} object literal 
  */

  CMData.prototype.getTotalAndBuildData = function(clientObj, seriesObj) {
    _.forEach(clientObj, function(versionObj, versionName){
            
      // y value in a chart 
      seriesObj.y += versionObj.value;

      // drilldown data
      seriesObj.data.push({ name: versionName, y: versionObj.value })
    });

    return seriesObj;
  };



  /*
  * Add "Others" data to series that combines the clients that are 
  * less than 2% of the email market share
  * 
  * @param {Object} dataObj
  *
  * @returns {Array} new series data  
  */

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



  /*
  * Joins clients into one
  * 
  * @param {Object} dataObj
  * @param {String} clientName
  * @param {Array} arr
  *
  * @returns {Array} new series data 
  */

  CMData.prototype.joinClientData = function(finalName, arr){
    var dataObj = this.addClientData(this.data);
    var clients = _.filter(dataObj, this.itemExists(arr)); 
    var newData = _.filter(dataObj, this.itemMissing(arr));
    var total = this.getTotal(clients, 'y');
    console.log(clients);
    newData.push({
      name: finalName,
      y: total
    });
    
    var sorted = _.sortBy(newData, 'y').reverse();

    return sorted;
  };



  /*
  * Checks if item exists in an array
  *
  * @param {Array} arr
  * @param {Object} client
  *
  * @returns {Boolean} true or false
  */

  CMData.prototype.itemExists = function(arr){
    return function(client){
      return arr.indexOf(client.name) !== -1;
    }
  };



  /*
  * Checks if item is missing in an array
  *
  * @param {Array} arr
  * @param {Object} client
  *
  * @returns {Boolean} true or false
  */

  CMData.prototype.itemMissing = function(arr){
    return function(client){
      return arr.indexOf(client.name) == -1;
    }
  };



  /*
  * Calculate total of y values 
  *
  * @param {Object} obj
  * @param {String} prop
  *
  * @returns {Number} total
  */

  CMData.prototype.getTotal = function(obj, prop){
    var plucked  = _.pluck(obj, prop);
    return _.reduce(plucked, this.addTotal);
  };



  /*
  * Calculates sum 
  *
  * @param {Number} sum
  * @param {Number} num
  *
  * @returns {Number} sum
  */

  CMData.prototype.addTotal = function(prevVal, currentVal){
    return prevVal + currentVal;
  };


  /*
  * Is client less than 2% average 
  *
  * @param {Object} client
  *
  * @returns {Boolean} true or false
  */

  CMData.prototype.isLessThanAverage = function(client){
    return client.y/this.total * 100 < 2;
  };


  /*
  * Is client > than 2% average 
  *
  * @param {Object} client
  *
  * @returns {Boolean} true or false
  */

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

  
  var cm = new CMData(DATA);
  var data = cm.joinClientData('Outlook.com', ['Hotmail', 'Outlook.com']);


  function barChartConfig(data){
    var config = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Stacked column chart'
        },
        xAxis: {
            categories: ['2012', '2013', '2014']
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total fruit consumption'
            },
        },
        legend: {
            borderColor: '#CCC',
            borderWidth: 1,
            shadow: false
        },

        series: [{
            name: 'John',
            data: [5, 3, 4]
        }, {
            name: 'Jane',
            data: [2, 2, 3]
        }, {
            name: 'Joe',
            data: [3, 4, 4]
        }]
    };

    return config; 
  }

  function chartConfig(data){
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
          text: 'Email client usage 2012-2014'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      legend: {
        title: {
          text: '<strong style="font-size: 18px">Clients</strong>',
          align: 'center'
        },
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
        name: 'Email market share',
        data: data
      }],
      drilldown: {
        series: data,
        drillUpButton: {
          position: {
            align: 'right',
            y: 50
          },
          relativeTo: 'spaceBox'
        }
      }
    }

    return config;
  }

  $('#container').highcharts(chartConfig(data));
  

  var years = document.getElementById('years');
  $(years).on('change', function(e){

    var year = parseInt(e.target.value);
    var cm = new CMData(DATA, year);
    var data = cm.joinClientData('Outlook.com', ['Hotmail', 'Outlook.com']);
    var config = chartConfig(data);

    config.title.text = 'Email market share ' + e.target.value;

    // Build the chart
    $('#container').highcharts(config);

  });


  // Grab chart object
  var chart = $('#container').highcharts();
  

});