var chartConfig = (function(){

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
          text: 'Email market share 2012-2014'
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

  return chartConfig;

}());