(function(){

  var userListData = [];

  function populateTable(){
    var tableContent = '';

    $.getJSON('/users/userlist', function(data){
      
      $.each(data, function(){
        tableContent += '<tr>';
        tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '">' + this.username + '</a></td>';
        tableContent += '<td>' + this.email + '</td>';
        tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
      });

      $('#userList table tbody').html(tableContent);

    });
  }

  populateTable();

})()


