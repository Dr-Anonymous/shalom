<head><meta charset="utf-8"> <title>Shalom Worship Centre</title> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta name="keywords" content="ministry,prayer,christianity,church"> <meta name="description" content="Worship Ministry"> <meta name="author" content="Shalom Worship Centre"> <!-- CSS --> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:400italic,400"> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Droid+Sans"> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lobster"> <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css"><link rel="stylesheet" href="/assets/css/font-awesome.css"><link rel="stylesheet" href="/assets/css/style.css"> <!-- Favicon and touch icons --> <link rel="shortcut icon" href="/assets/ico/favicon.ico"></head>
<body> <!-- Header --> <div class="container"> <div class="header row"> <div class="span12"> <div class="navbar"> <div class="navbar-inner"> <h1> <a class="brand" href="/">Shalom Worship Centre</a> </h1> <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse"> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </a> <div class="nav-collapse collapse"> <ul class="nav pull-right"> <li> <a href="/"><i class="icon-home"></i><br />Home</a> </li> <li class="current-page"> <a href="/Our Ministries.html"><i class="icon-camera"></i><br />Our Minisitries</a> </li> <li> <a href="/testimonies/"><i class="icon-user"></i><br />Testimonies</a> </li> <li> <a href="/messages"><i class="icon-tasks"></i><br/>Messages</a> </li><li> <a href="/contact.html"><i class="icon-envelope-alt"></i><br />Contact</a> </li> </ul> </div> </div> </div> </div> </div> </div>
<!-- Page Title --> <div class="page-title"> <div class="container"> <div class="row"> <div class="span12"> <i class="icon-camera page-title-icon"></i> <h2>Worship Ministry</h2> </div> </div> </div> </div>
<!-- Services Full Width Text -->
<script src="/assets/js/jquery-1.8.2.min.js"></script>
<script>
var requested = urlParam();
if(isNaN(requested))
{
console.log(requested);
} else {

var url = "https://script.google.com/macros/s/AKfycbxoSc26qwvAQrSJ540a5AFFfC3qq1PcKggOL-F2Kg6WF98DgOSj9AmQhm6nMW5zUyPcPA/exec?callback=loadData&id="+ requested;
// Make an AJAX call to Google Script
var request = jQuery.ajax({
      crossDomain: true,
      url: url,
      method: "GET",
      dataType: "jsonp"
    });
 }
 // print the returned data from jsonp
  function loadData(e) {
  try {
         for (var i = 1; i < e.length; i++) {
	   $("#resultHere").text(e);
	 }
	}catch(err) {
        //$("#main_content").html("No such redirect present");
	}
}

function urlParam(){
var url = new URL(window.location.href);
var param = url.searchParams.toString().slice(0, -1);
return param;
}				      
				      
  </script>

<div class="services-half-width container"><div class="row"><div class="services-half-width-text span12">
  <div id="resultHere"></div> 
      </div></div></div>
<!-- Footer --> <footer> <div class="container"> <div class="row"> <div class="social span4"> <a class="facebook" href="https://www.facebook.com/shalomworshipcentre.kkd"></a> <a class="youtube" href="https://www.youtube.com/PrasadCherukuri"></a></div><div class="copyright span4"><p>Copyright 2021 Shalom Worship Centre.</p></div> <!--Google Ads --> <div class="copyright span4 app"></div></div></div></footer>
<!-- Javascript --> <script src="/assets/bootstrap/js/bootstrap.min.js"></script></body>
