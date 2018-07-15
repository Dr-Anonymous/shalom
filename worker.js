var url = '';
self.addEventListener('message', function(event){
    url= event.data;
   console.log("SW Received Message: " + url);
});

var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
req.open('GET', "https://script.google.com/macros/s/AKfycbwX-bdUXwFHyej-VLVdxQc9v5izgvXJUKiKcWWHVYhnlp1B2Np9/exec?callback= ", true);
req.onload  = function() {
   var jsonResponse = JSON.parse(req.responseText.slice(1,-1));
   // do something with jsonResponse
    postMessage(jsonResponse);
};
req.send(null);
