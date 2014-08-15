$(function () {

  var dataArr = [];
  var dataObj = {}
  var total = 0;

  _.each(DATA[0].emailClients, function(camp){

      _.each(camp, function(version){

        if(!dataObj[version.Client]){
          dataObj[version.Client] = {};
        }

        if(!dataObj[version.Client][version.Version]){
          dataObj[version.Client][version.Version] = { value: 0 };
        }

        dataObj[version.Client][version.Version].value += version.Subscribers;
        total += version.Subscribers;

      });

  });

  var clientData = [];
  var versionData = [];
  var clients;
  var versions;

  var others;
  var othersTotal = 0;
  var otherVersions = {};
  otherVersions.id = 'Others';
  otherVersions.data = [];

  _.each(dataObj, function(clientObj, clientName){
    
    var versionLength = Object.keys(clientObj).length;

    // Create an empty object for that will hold the name and y value
    // Set the name of email client and y value to start at 0;
    clients = {};
    clients.name = clientName
    clients.y = 0

    // If there is more than one version of an email client, let's 
    // drill down to those specific versions
    if(versionLength > 1 ) {  clients.drilldown = clientName };

    // Create object that will be filled with the different client versions
    versions = {};
    versions.id = clientName;
    versions.data = [];


    // Loop through each client version and add the totals 
    _.each(clientObj, function(versionObj, versionName){

      // Add the total value of all versions of email client
      clients.y += versionObj.value;

      // Create drilldown data
      versions.data.push({ name: versionName, y: versionObj.value })

    });

    // Create others category
    var average = Number(clients.y/total * 100);
    if(average < 2){

      others = {};
      others.name = 'Others';
      others.y = othersTotal += clients.y
      others.drilldown = 'Others';

      otherVersions.data.push({ name: clients.name, y: clients.y });

      versionData.push(otherVersions);

    }else{
      clientData.push(clients);
      versionData.push(versions)
    }
    
  });
  
  clientData.push(others)

  function getClientData(dataObj){

    var clientData = [];
    var clients;

    _.each(dataObj, function(clientObj, clientName){
     
      clients = {};
      clients.name = clientName;
      clients.y = 0;
      clients.versionLength = Object.keys(clientObj).length;

      _.each(clientObj, function(versionObj, versionName){
        clients.y += versionObj.value;
      });

      clientData.push(clients);

    });

    return clientData;
  }

  function getVersionData(dataObj){
    
  }

  console.log(getClientData(dataObj));


  // console.log(clientData);
  // console.log(versionData);

  var config = {
      chart: {
          type: 'pie',
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false
      },
      title: {
          text: 'Browser market shares at a specific website, 2014'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        borderWidth: 1
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
          data: clientData
      }],
      drilldown: {
        series: versionData
      }
  }

  // Build the chart
  $('#container').highcharts(config);

});