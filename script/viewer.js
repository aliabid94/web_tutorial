selected = {}

$.get("data/1.yaml", function(data) {
  questions = parseYAML(data)
  var question_numbers = getRandomSample(Object.keys(questions).length-1, NUM_QUESTIONS)
  var html =
    `<h1 class='intro'>${NUM_QUESTIONS} Question Quiz</h1>
     <h1 class='final_score'>Final Score: <span class='score'></span> <small>/ ${NUM_QUESTIONS}</small></h1>`
  for (var i = 0; i < question_numbers.length; i++) {
    question_number = question_numbers[i]+1
    answer = questions[question_number]
    html += `
      <div class='problem' num="${i+1}">
        ${renderToString(i, answer)}
      </div>
    `
  }
  html += `
    <div class="check_answers"><button class="ui button huge fluid blue">Check answers!</div></div>
  `
  $("body").append(html);
})

$("body").on("click", ".answers button", function (evt) {
  $(evt.target).parent().find("button").removeClass("blue").removeClass("selected")
  $(evt.target).addClass("blue").addClass("selected")
  var problem = $(evt.target).parent().parent().parent().parent().parent().attr('num')
  selected[problem] = true
})

$("body").on("click", ".add_hint", function (evt) {
  var hints = $(evt.target).parent().find(".hint")
  var opened = false
  var hints_complete = true
  for (var i = 0; i < hints.length; i++) {
    if (opened) {
      hints_complete = false
    }
    var hint = hints[i];
    if ($(hint).is(":hidden") && opened == false) {
      $(hint).show();
      opened = true;
    }
  }

  if (hints_complete) {
    $(evt.target).hide()
  } else {
    $(evt.target).text("Another Hint?")
  }
});

$("body").on("click", ".check_answers", function (evt) {
  $(".check_answers").hide()
  $(".add_hint").hide()
  $(".hint").show()
  $(".intro").hide()
  $(".final_score").show()
  $(".selected").removeClass("blue")
  $(".selected:not(.correct)").addClass("red")
  $(".selected.correct").addClass("green")
  $(".choice").addClass("disabled")
  $(".score").text($(".selected.correct").length)
  window.scrollTo(0,document.body.scrollHeight)
  $("html, body").animate({ scrollTop: 0 }, "slow")
});
