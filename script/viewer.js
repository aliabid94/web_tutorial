var query = window.location.search.substring(1);
var qs = parseQueryString(query);
course = qs["course"] || "basic_html";
lesson = qs["lesson"] || 1;
lesson_url = `lessons/${course}/${lesson}/`;
var exercises_loaded = false;
var config_loaded = false;
var current_slide = 1;
var exercise_data, config_data, slide_count, current_exercise;
var responses = {}
var code_mirrors = {}

$.get(lesson_url + "exercises.yaml", function(data) {
  exercise_data = parseFormattedYAML(data);
  exercises_loaded = true;

  var nav_html = "";
  for (section in exercise_data) {
    nav_html += `<button class="ui button exercise_link" exercise=${section}>Slide ${section}</button>`;
  }
  $("#exercises_nav").append(nav_html);
  var problems_html = "";
  for (section in exercise_data) {
    problems_html += `<div class="exercise_set" exercise=${section}>`;
    let exercises = exercise_data[section]["questions"];
    let i = 0;
    exercises.forEach((exercise) => {
      let repeat = exercise.repeat || 1;
      problems_html += renderRepeat(i, exercise, repeat);
      i += repeat;
    })
    problems_html += `</div>`;
  }
  $("#problem_sets").html(problems_html);
  $(".codebox").each(function (i, element) {
    let cm = CodeMirror.fromTextArea(element, {
        mode: $(element).attr("code_lang"),
        lineNumbers: true
    });
    let this_problem = getProblemOfElement(this);
    if (!code_mirrors[this_problem.exercise]) {
      code_mirrors[this_problem.exercise] = {}
    }
    code_mirrors[this_problem.exercise][this_problem.problem] = cm;
    setTimeout(() => void cm.refresh(), 0)
  })
})

$.get(lesson_url + "config.yaml", function(data) {
  config_data = YAML.parse(data);
  slide_count = config_data.slide_count;
  $("#slide_count").text(slide_count);
  var slide_html = ""
  for (var i = 0; i < config_data.slide_count; i++) {
    slide_html += `<img class="slide" slide=${i+1} src="${lesson_url}slides/Slide${i+1}.jpg" />`
    responses[i+1] = {};
  }
  $("#slides").html(slide_html);
  resetSlide(/*set_text=*/false);
})

$("body").on('click', '.exercise_link', function() {
  $(".exercise_set").hide();
  $(".exercise_link").removeClass("active_exercise").removeClass("blue");
  if (!$(this).hasClass("complete_exercise")) {
    $(this).addClass("active_exercise").removeClass("yellow").addClass("blue");
  }
  current_exercise = $(this).attr("exercise");
  $(`.exercise_set[exercise=${current_exercise}]`).show();
  $('html, body').animate({
      scrollTop: ($('#exercises_nav').offset().top)
  }, 500);
})

$("body").on('click', '.answers.multiple_choice button', function() {
  let question_num = $(this).closest(".problem").attr("num");
  if (!responses[current_exercise][question_num]) {
    $(this).parent().find("button").removeClass("green").removeClass("red")
    if ($(this).hasClass("correct")) {
      $(this).addClass("green")
      responses[current_exercise][question_num] = true;
      // if (Object.keys(responses[current_exercise]).length ==
      //     exercise_data[current_exercise]["questions"].length) {
      //   $(`.exercise_link[exercise=${current_exercise}]`).removeClass("blue")
      //     .removeClass("yellow").addClass("complete_exercise").addClass("green");
      // }
    } else {
      $(this).addClass("red")
    }
  }
})

$("body").on('click', '.run_code', function() {
  let output = $(this).closest(".problem").find(".output_box");
  output.show();
  output.html(`<iframe></iframe>`)
  let this_problem = getProblemOfElement(this);
  let cm = code_mirrors[this_problem.exercise][this_problem.problem];
  let code = cm.getValue();
  $iframe = output.find("iframe");
  $iframe.ready(function() {
    $iframe.contents().find("html").html(code);
  });
})

function resetSlide(resetText) {
  $(".slide").hide();
  $(`.slide[slide=${current_slide}]`).show();
  if (resetText) {
    $("#current_slide").val(current_slide);
  }
  $(".exercise_link").removeClass("available_exercise").removeClass("yellow");
  let target_exercise_link = $(`.exercise_link[exercise=${current_slide}]`);
  target_exercise_link.addClass("available_exercise");
  if (!target_exercise_link.hasClass("active_exercise") &&
      !target_exercise_link.hasClass("complete_exercise")) {
    target_exercise_link.addClass("yellow");
  }
}

$("#left").click(function () {
  if (current_slide != 1) {
    current_slide -= 1;
  }
  resetSlide(/*set_text=*/true);
})

$("#right").click(function () {
  if (current_slide != slide_count) {
    current_slide += 1;
  }
  resetSlide(/*set_text=*/true);
})

$('#current_slide').on('input', function() {
  let slide_num = parseInt($(this).val());
  if (slide_num && slide_num >= 1 && slide_num <= slide_count) {
    current_slide = slide_num;
    resetSlide(/*set_text=*/false);
  }
});
