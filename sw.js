self.addEventListener('message', function(e) {
  self.postMessage(e.data);
   self.postMessage("Terminated");
  self.close();
     self.postMessage("Not dead");
});
