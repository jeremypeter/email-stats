describe("jQuery", function() {
   beforeEach(function() { });
   afterEach(function() { });
   it('should fail', function() {
      var h = hello('hwww')
      console.log(h);
      expect(h).to.equal('hwww')
      

   });
});