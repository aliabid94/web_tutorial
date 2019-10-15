var auth2, isLoggedIn, profile;

function onLoadCallback() {
  auth2 = gapi.auth2.getAuthInstance();
  $("#login > *").hide();
  $("#login").show();
  if (auth2.isSignedIn.get()) {
    onSignIn();
  } else {
    $(".out").show();  
    $(".in").hide();  
  }
}

function onSignIn() {
  $(".out").hide();
  $(".in").show();
  isLoggedIn = true;
  profile = auth2.currentUser.get().getBasicProfile();
  $("#fullname").text(profile.getName())
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    location.reload(); 
  });
}
