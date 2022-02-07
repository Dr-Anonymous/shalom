<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <title>Bible Online</title> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta name="keywords" content="ministry,prayer,christianity,church"> <meta name="description" content="Ministries, work done by Shalom Worship Centre"> <meta name="author" content="Shalom Worship Centre"> <!-- CSS --> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:400italic,400"> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Droid+Sans"> <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lobster"> <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css"><link rel="stylesheet" href="/assets/css/font-awesome.css"><link rel="stylesheet" href="/assets/css/style.css"> <!-- Favicon and touch icons --> <link rel="shortcut icon" href="/assets/ico/favicon.ico">
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script></head>
<body> <!-- Header --> <div class="container"> <div class="header row"> <div class="span12"> <div class="navbar"> <div class="navbar-inner"> <h1> <a class="brand" href="/">Shalom Worship Centre</a> </h1> <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse"> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </a> <div class="nav-collapse collapse"> <ul class="nav pull-right"> <li> <a href="/"><i class="icon-home"></i><br />Home</a> </li> <li class="current-page"> <a href="/Our Ministries.html"><i class="icon-camera"></i><br />Our Ministries</a> </li> <li> <a href="/testimonies/"><i class="icon-user"></i><br />Testimonies</a> </li> <li> <a href="/messages"><i class="icon-tasks"></i><br/>Messages</a> </li><li> <a href="/contact.html"><i class="icon-envelope-alt"></i><br />Contact</a> </li> </ul> </div> </div> </div> </div> </div> </div>
<!-- Page Title --> <div class="page-title"> <div class="container"> <div class="row"> <div class="span12"> <i class="icon-book page-title-icon"></i> <h2>Bible</h2> </div> </div> </div> </div>
<!-- Services Full Width Text -->
<!-- Call To Action -->
<div class="call-to-action container"> <div class="row"> <div class="call-to-action-text span12"><div class="ca-text"> </div>
<div class="ca-button"> <a href="">Telugu</a></div> <div class="ca-button"> <a href="">Dark Mode</a></div> </div></div></div>

<div class="services-full-width container"><div id = "bible" class="presentation container span12" style="text-align: left;"><p>Select a book and chapter to start reading.</p></div></div>
<script>
function getVerse(b, c) {
    var url = "https://script.google.com/macros/s/AKfycbyAYRUXR-Omreu1HRiNn0jRYxv6U_WrPwYw2C10OVBPM21R_2u_6IHjXq9KbJwq7tEc/exec?callback=loadData&book=" + b + "&chapter=" + c ,
        request = jQuery.ajax({
        crossDomain: true,
        url: url,
        method: "GET",
        dataType: "jsonp"
    });
}

function loadData(e) {
    $("#bible").empty();
    try {
        for (var i = 0; i < e.length; i++) {
            if (e[i][1].substring(0, 1) == "[") {
                $("#bible").append("<p>" + e[i][1] + "</p>");
            } else {
                $("#bible").append("<p>" + e[i][0] + ". " + e[i][1] + "</p>");
            }
        }
    } catch (err) {
        console.log(err);
    }
}
</script>
<!-- Footer --> <footer> <div class="container"> <div class="row"> <div class="social span4"> <a class="facebook" href="https://www.facebook.com/shalomworshipcentre.kkd"></a> <a class="youtube" href="https://www.youtube.com/c/ShalomWorshipCentreKakinada"></a> <a class="googleplus" href="https://plus.google.com/+ShalomWorshipCentreKakinada"></a></div><div class="copyright span4"><p>Copyright 2016 Shalom Worship Centre.</p></div> <!--Google Ads --> <div class="copyright span4 app"></div></div></div></footer>
<!-- Javascript --><script src="/assets/bootstrap/js/bootstrap.min.js"></script><script src="/assets/js/jquery.quicksand.js"></script></body></html> 
