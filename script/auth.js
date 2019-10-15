function onLoadCallback() {
  auth2 = gapi.auth2.getAuthInstance();

  if (auth2.isSignedIn.get()) {
    $(".in").show();
  } else {
    $(".out").show();  
  }
}