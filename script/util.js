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

function parseYAML(str) {
  return YAML.parse(str)
}

