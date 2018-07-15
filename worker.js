var url = '';
self.addEventListener('message', function(event){
    url= event.data;
});

var req = new XMLHttpRequest();
req.overrideMimeType("application/json");
req.open('GET', url, true);
req.onload  = function() {
   var jsonResponse = JSON.parse(req.responseText.slice(1,-1));
   // do something with jsonResponse
    postMessage(jsonResponse);
};
req.send(null);
