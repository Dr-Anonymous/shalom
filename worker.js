/*var i = 0;

function timedCount() {
    i = i + 1;
    postMessage(i);
    setTimeout("timedCount()",500);
}

timedCount();
*/
function loadXMLDoc() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
           if (xmlhttp.status == 200) {
               postMessage(xmlhttp.responseText+" one");
           }
           else if (xmlhttp.status == 400) {
              postMessage('There was an error 400');
           }
           else {
               postMessage('something else other than 200 was returned');
           }
        }
    };

    xmlhttp.open("GET", "https://script.google.com/macros/s/AKfycbwX-bdUXwFHyej-VLVdxQc9v5izgvXJUKiKcWWHVYhnlp1B2Np9/exec?callback=loadData", true);
    xmlhttp.send();
}
loadXMLDoc();
  // print the returned data from jsonp
  function loadData(e) {
     postMessage(e.result1+" two");
  }
