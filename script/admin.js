var database = firebase.database();
var query = window.location.search.substring(1);
var qs = parseQueryString(query);
var course = qs["course"] || "basic_html";
var lesson = qs["lesson"] || 1;
var lesson_url = `lessons/${course}/${lesson}/`;

