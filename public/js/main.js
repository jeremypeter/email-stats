$(function () {

  'use strict';

  /*
  * Add the last time the chart was updated as a sub line 
  *
  * @param {Object} config - highcharts config object
  */

  function getLastUpdate(config){
    if(localStorage.CMData_date){
      config.title.text += '<br /><span style="font-size:.6em; color: #aaa; ">Last updated ' + localStorage.CMData_date;+'</span>';
    }
    return config;
  }


  /*
  * Create a new chart based on DATA passed to it
  *
  * @param {Object} DATA - data object to be used for highcharts
  */

  function createChart(DATA){
    var container     = $('#container');
    var legendName    = 'Outlook.com';
    var emailsToMerge = ['Hotmail', 'Outlook.com'];
    var years         = document.getElementById('years');
    var data          = new CMData(DATA).joinClientData(legendName, emailsToMerge);
    var config        = chartConfig(data);

    config = getLastUpdate(config);
    container.highcharts(config);
    
    // Create chart based on year selected
    $(years).on('change', function(e){

      var year = parseInt(e.target.value) || '2012-2014';

      var data = new CMData(DATA, year).joinClientData(legendName, emailsToMerge);
      console.log(data);
      config = chartConfig(data);

      config.title.text = 'Email market share ' + year;
      config = getLastUpdate(config);

      // Build the chart
      container.highcharts(config);
    });

  }


  /*
  * Create a new chart via rest api and store data in local storage
  */

  function createNewChart(){

    var main = $('.main');
    var container = $('#container');

    $.ajax({
      beforeSend: function(){ 
        // Hide container and show loading 
        container.addClass('hide');
        main.addClass('loading'); 
      },
      url: 'https://email-stats.firebaseio.com/stats.json'
    }).done(function(DATA){

      // Show updated chart and remove loading
      main.removeClass('loading');
      container.removeClass('hide');

      // Add data and date to local storage
      localStorage.CMData = JSON.stringify(DATA);
      localStorage.CMData_date = moment().format('MMMM Do YYYY h:mm a');

      // Create the chart
      createChart(DATA)
    }).fail(function(e){
      console.log('There was an err %s', e);
    });
  }


  // Create new chart based on whether or not it's in local storage
  if(!localStorage.CMData){
    createNewChart();
  } else {
    createChart(JSON.parse(localStorage.CMData));
  }

  // Update new chart when update is clicked
  var button = $('.update');
  button.on('click', function(e){
    localStorage.clear();
    createNewChart();
  });

});