<html>
<head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prayer Meet</title>
      <script src="/assets/js/jquery-1.8.2.min.js"></script>
</head>
<body>
      <style>
.center {
  padding: 70px 0;
  border: 3px solid green;
  text-align: center;
}
</style>
<div class="center" id="main"></div>
      
<script>
$('#main').html("<p>Loading meeting link. Please wait ...</p>");

// Make an AJAX call to Google Script
var request = jQuery.ajax({
      crossDomain: true,
      url: "https://script.google.com/macros/s/AKfycbxGoWfDAFhBF8Ke31IX4CU1pixoEDsJgjPI9w9PUP5sgzMKWQ0/exec?callback=loadData",
      method: "GET",
      dataType: "jsonp"
    });

// load the returned url
  function loadData(e) {
      $('#main').html("<a id='link' href='"+e+"'><img src='/assets/img/logo.png'><br><br>Click here to open the app</a>");
      }
</script>
</body>
</html>
