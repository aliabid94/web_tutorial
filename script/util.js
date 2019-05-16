var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var seed = Math.random() * 1000
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
function roundf(f) {
  f = parseFloat(f)
  var int_f = Math.floor(f)
  return int_f + parseFloat((f - int_f).toPrecision(2))
}
function pickRandom(array) {
  return array[Math.floor(random() * array.length)]
}

function getRandomSample(range, size) {
    var arr = []
    for (var j = 0; j <= range; arr.push(j++)) {}
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function parseFormattedYAML(str) {
  let reformatted_str = str.replace(/<</g,'&lt;').replace(/>>/g,'&gt;').replace(/<<\\/g, '&lt;\\\\')
  return YAML.parse(reformatted_str)
}

function parseQueryString(query) {
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    var key = decodeURIComponent(pair[0]);
    var value = decodeURIComponent(pair[1]);
    // If first entry with this name
    if (typeof query_string[key] === "undefined") {
      query_string[key] = decodeURIComponent(value);
      // If second entry with this name
    } else if (typeof query_string[key] === "string") {
      var arr = [query_string[key], decodeURIComponent(value)];
      query_string[key] = arr;
      // If third or later entry with this name
    } else {
      query_string[key].push(decodeURIComponent(value));
    }
  }
  return query_string;
}

function getProblemOfElement(obj) {
  return {
    "exercise" : $(obj).closest(".exercise_set").attr("exercise"),
    "problem" : $(obj).closest(".problem").attr("num")
  }
}
