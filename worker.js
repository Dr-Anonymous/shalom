/*var i = 0;

function timedCount() {
    i = i + 1;
    postMessage(i);
    setTimeout("timedCount()",500);
}

timedCount();
*/
import {jQuery.ajax()} from '/assets/js/jquery-1.8.2.min.js';
//let val = hello(); // val is "Hello";

function callGoogleScript() {
var url = "https://script.google.com/macros/s/AKfycbwX-bdUXwFHyej-VLVdxQc9v5izgvXJUKiKcWWHVYhnlp1B2Np9/exec?callback=loadData";
// Make an AJAX call to Google Script
let request = jQuery.ajax({
      crossDomain: true,
      url: url ,
      method: "GET",
      dataType: "jsonp"
    });
}
callGoogleScript();
  // print the returned data from jsonp
  function loadData(e) {
     postMessage(e.result1);
  }
