describe('CMdata', function(){

  describe("#buildDataObj", function() {
    
    it('should build the data object', function(){

      var data = {
        emailClients: [{
          Client: "iOS Devices",
          Percentage: 30.957683741648108,
          Subscribers: 139,
          Version: "iPhone",
          date: "2014-10-30 16:30:00"
        }]
      };

      var da = new CMData(data).buildDataObj(data);
      console.log(da);
      
    });


  });


});