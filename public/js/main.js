var data = [
    {
        value: 300,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Red"
    },
    {
        value: 50,
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Green"
    },
    {
        value: 100,
        color: "#FDB45C",
        highlight: "#FFC870",
        label: "Yellow"
    }
];

var colors = ['#309762','#7c5f70','#94d4ac','#b3df4a','#d34751','#011af3','#bb253a','#8c8baa','#a599f1','#3137f3','#fef23c','#d6141a','#2c31f9','#4195d5','#a1444f','#ba384c','#37a2d5','#73cdda','#395cca','#6b8fdd'];


var dataArr = [];
var dataObj = {}

_.each(DATA[0].emailClients, function(camp){

    _.each(camp, function(version){

      if(!dataObj[version.Client]){
        dataObj[version.Client] = {};
      }

      if(!dataObj[version.Client][version.Version]){
        dataObj[version.Client][version.Version] = { value: 0 };
      }

      dataObj[version.Client][version.Version].value += version.Percentage;
      // console.log(dataObj);

    });

});


_.each(dataObj, function(clientObj, clientName){

  _.each(clientObj, function(versionObj, versionName){
    
    dataArr.push({
      value: versionObj.value,
      label: versionName,
      color: getRandomColor(),
      hightlight: '#444444'
    });
  });

});


var ctx = document.getElementById("myChart").getContext("2d");

var myNewChart = new Chart(ctx).Doughnut(dataArr);

function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.round(Math.random() * 15)];
        }
        return color;
    }
