function onLoadCallback() {
  auth2 = gapi.auth2.getAuthInstance();
  if (auth2.isSignedIn.get()) {
    var profile = auth2.currentUser.get().getBasicProfile();
    $("#fullname").text(profile.getName())
    $(".in").show();
  } else {
    $(".out").show();  
  }
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    location.reload(); 
  });
}
