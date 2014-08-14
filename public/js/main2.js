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

var haha = [];
  _.each(dataObj, function(clientObj, clientName){
      var count = 0;
      var obj = {};
      obj.name = clientName
      obj.y = 0
    _.each(clientObj, function(versionObj, versionName){

      obj.y += clientObj[versionName].value ;

      dataArr.push({
        name: versionName,
        y: +Number(versionObj.value/total * 100).toFixed(2)
      });

    });
      haha.push(obj)

  });
  console.log(haha);
// console.log(dataObj);
// console.log(testobj);
// console.log(dataArr);

    // Build the chart
    $('#container').highcharts({
        chart: {
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
        plotOptions: {
            pie: {
                allowPointSelect: true,
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
            data: haha
        }
        ]
    });

});