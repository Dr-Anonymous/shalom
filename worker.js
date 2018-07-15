var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
self.addEventListener('message', function(event){
   var url= event.data;
req.open('GET', url, true);
req.onload  = function() {
   var jsonResponse = JSON.parse(req.responseText.slice(1,-1));
   // do something with jsonResponse
    postMessage(jsonResponse);
};
req.send(null);


});

