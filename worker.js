/*var i = 0;

function timedCount() {
    i = i + 1;
    postMessage(i);
    setTimeout("timedCount()",500);
}

timedCount();
*/

var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
req.open('GET', "https://script.google.com/macros/s/AKfycbwX-bdUXwFHyej-VLVdxQc9v5izgvXJUKiKcWWHVYhnlp1B2Np9/exec?callback= ", true);
req.onload  = function() {
   var jsonResponse = JSON.parse(req.responseText.slice(0,-1));
   // do something with jsonResponse
    postMessage(jsonResponse);
};
req.send(null);
