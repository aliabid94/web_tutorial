var auth2;

function onLoadCallback() {
  auth2 = gapi.auth2.getAuthInstance();
  $("#login").show();
  if (auth2.isSignedIn.get()) {
    onSignIn();
  } else {
    $(".in").hide();  
  }
}

function onSignIn() {
  $(".out").hide();
  var profile = auth2.currentUser.get().getBasicProfile();
  $("#fullname").text(profile.getName())
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    location.reload(); 
  });
}
