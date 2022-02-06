<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <title>Bible Online</title> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta name="keywords" content="ministry,prayer,christianity,church"> <meta name="description" content="Ministries, work done by Shalom Worship Centre"> <meta name="author" content="Shalom Worship Centre"> <!-- CSS --> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:400italic,400"> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Droid+Sans"> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lobster"> <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css"><link rel="stylesheet" href="assets/css/font-awesome.css"><link rel="stylesheet" href="assets/css/style.css"> <!-- Favicon and touch icons --> <link rel="shortcut icon" href="assets/ico/favicon.ico"> </head>
<body> <!-- Header --> <div class="container"> <div class="header row"> <div class="span12"> <div class="navbar"> <div class="navbar-inner"> <h1> <a class="brand" href="/">Shalom Worship Centre</a> </h1> <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse"> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </a> <div class="nav-collapse collapse"> <ul class="nav pull-right"> <li> <a href="/"><i class="icon-home"></i><br />Home</a> </li> <li class="current-page"> <a href="#"><i class="icon-camera"></i><br />Our Ministries</a> </li> <li> <a href="testimonies/"><i class="icon-user"></i><br />Testimonies</a> </li> <li> <a href="/messages"><i class="icon-tasks"></i><br/>Messages</a> </li><li> <a href="contact.html"><i class="icon-envelope-alt"></i><br />Contact</a> </li> </ul> </div> </div> </div> </div> </div> </div>
<!-- Page Title --> <div class="page-title"> <div class="container"> <div class="row"> <div class="span12"> <i class="icon-camera page-title-icon"></i> <h2>Bible</h2> </div> </div> </div> </div>
<!-- Services Full Width Text -->
<!-- Call To Action -->
<div class="call-to-action container"> <div class="row"> <div class="call-to-action-text span12"><div class="ca-text"><p>Some text here..</p> </div>
<div class="ca-button"> <a href="androidApp/">Book</a></div> <div class="ca-button"> <a href="androidApp/">Chapter</a> </div> </div></div></div>

<div class="services-full-width container"><div id = "bible" class="presentation container span12">Select a book and chapter to start reading</div></div>
<script>
 var requested= window.location.pathname.slice(1);
if(isNaN(requested))
{
console.log(requested);
} else {

var url = "https://script.google.com/macros/s/AKfycbzbybWimuDLj6iFAmhB7e7oGvq6Jha_enGTN9SxMJ_jSeRM78WdEXe2-dQvg_74ezr4/exec?callback=loadData&book=1&chapter=1" ;//+ requested;
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
  console.log(e);
  try {
         for (var i = 0; i < e.length; i++) {
      $("#bible").html(e[i][0] + "<p>"+e[i][1]+"</p>");
	 }
	}catch(err) {
        //$("#main_content").html("No such redirect present");
	}
}
</script>
<!-- Footer --> <footer> <div class="container"> <div class="row"> <div class="social span4"> <a class="facebook" href="https://www.facebook.com/shalomworshipcentre.kkd"></a> <a class="youtube" href="https://www.youtube.com/c/ShalomWorshipCentreKakinada"></a> <a class="googleplus" href="https://plus.google.com/+ShalomWorshipCentreKakinada"></a></div><div class="copyright span4"><p>Copyright 2016 Shalom Worship Centre.</p></div> <!--Google Ads --> <div class="copyright span4 app"></div></div></div></footer>
<!-- Javascript --><script src="assets/js/jquery-1.8.2.min.js"></script> <script src="assets/bootstrap/js/bootstrap.min.js"></script><script src="assets/js/jquery.quicksand.js"></script></body></html> 
