var auth2, isLoggedIn, profile;

function onLoadCallback() {
  auth2 = gapi.auth2.getAuthInstance();
}

window.setTimeout(function() {
  if (isLoggedIn) {
    return;
  }
  $("#login").show();
  $(".out").show();  
  $(".in").hide();  
}, 1000)

function onSignIn() {
  print("sign in! ")
  $("#login").show();
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
