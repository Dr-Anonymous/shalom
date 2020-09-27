<html>
<head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Prayer Meet</title>
      <script src="/assets/js/jquery-1.8.2.min.js"></script>
</head>
<body>
      <style>
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  border: 3px solid green;
  text-align: center;
}
</style>
      <div class="center"><img src='/assets/img/logo.png'><br>Online Prayer Meet<br><br><p>Every Sunday and Friday at <b>7:00 pm</b> IST.</p><br><br>
      <div id="main"><p>Loading meeting link. Please wait ...</p></div>
      </div>
<script>

// Make an AJAX call to Google Script
var request = jQuery.ajax({
      crossDomain: true,
      url: "https://script.google.com/macros/s/AKfycbxGoWfDAFhBF8Ke31IX4CU1pixoEDsJgjPI9w9PUP5sgzMKWQ0/exec?callback=loadData",
      method: "GET",
      dataType: "jsonp"
    });

// load the returned url
  function loadData(e) {
      $('#main').html("<p><a id='link' href='"+e+"'>Click here to open the app</a>,<br> then \'Ask to join\'</p>");
      }
</script>
</body>
</html>
