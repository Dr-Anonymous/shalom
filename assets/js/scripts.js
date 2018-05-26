/*
Slider
*/
$(window).load(function() {
    $('.flexslider').flexslider({
        animation: "slide",
        controlNav: "thumbnails"
    });
});
/*
fb plugin
*/
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
	if (response.status === 'connected') {
      testAPI();
    } else if (response.status === 'not_authorized') {
      document.getElementById('status').innerHTML = 'Please login using FB';
    } else {
      // The person is not logged into Facebook
      document.getElementById('status').innerHTML = 'Please log-into FB';
    }
  }
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }
  window.fbAsyncInit = function() {
    FB.init({
      appId      : '877821148937882',
      xfbml      : true,
	cookie	 : true,
      version    : 'v2.9'
    });
	FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
  };
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
   function testAPI() {
    console.log('Welcome! Fetching your information....');
    FB.api('/me', function(response) {
      res = response.name.split(" ", 1);
	 var loginbtn = document.getElementById('loginbtn');
	  if (loginbtn !== null){
	  loginbtn.style.display='none';
	  document.getElementById('name').innerHTML = res ;
	  }
 });
  }
