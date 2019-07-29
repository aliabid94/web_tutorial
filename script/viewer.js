var database = firebase.database();
var query = window.location.search.substring(1);
var qs = parseQueryString(query);
var course = qs["course"] || "basic_html";
var lesson = qs["lesson"] || 1;
var lesson_url = `lessons/${course}/${lesson}/`;
var course_tag = course + "_" + lesson;
var exercises_loaded = false;
var config_loaded = false;
var current_slide = 1;
var exercise_data, config_data, slide_count, current_exercise;
var responses = {}
var code_mirrors = {}
var pending_review = []

$.get(lesson_url + "config.yaml", function(data) {
  config_data = YAML.parse(data);
  slide_count = config_data.slide_count;
  $("#slide_count").text(slide_count);
  var slide_html = ""
  for (var i = 0; i < config_data.slide_count; i++) {
    slide_html += `<img class="slide" slide=${i+1} src="${lesson_url}slides/Slide${i+1}.jpg" />`
  }
  $("#slides").html(slide_html);
  resetSlide(/*set_text=*/false);
}).then(function () {
  $.get(lesson_url + "exercises.yaml", function(data) {
    exercise_data = parseFormattedYAML(data);
    exercises_loaded = true;

    var nav_html = "";
    let quiz_questions = []
    for (section in exercise_data) {
      exercise_data[section]["questions"].forEach((question) => {
        if (question["quiz"]) {
          let quiz_question = jQuery.extend(true, {}, question);
          quiz_question["repeat"] = 1
          quiz_questions.push(quiz_question);
        }
      })
    }
    if (quiz_questions.length) {
      exercise_data["quiz"] = {questions: quiz_questions}
    }
    for (section in exercise_data) {
      nav_html += `<button class="ui button exercise_link" exercise=${section}>${section == "quiz" ? "Quiz" : "Slide " + section}</button>`;
    }
    $("#exercises_nav").append(nav_html);
    var problems_html = "";
    for (section in exercise_data) {
      problems_html += `<div class="exercise_set" exercise=${section}>`;
      responses[section] = {};
      let exercises = exercise_data[section]["questions"];
      let i = 0;
      exercises.forEach((exercise) => {
        let repeat = exercise.repeat || 1;
        problems_html += renderRepeat(i, exercise, repeat);
        i += repeat;
      })
      for (var j = 0; j < i; j++) {
        responses[section][j+1] = false;
      }
      problems_html += `</div>`;
    }
    $("#problem_sets").html(problems_html);
    $(".codebox").each(function (i, element) {
      let cm = CodeMirror.fromTextArea(element, {
          mode: $(element).attr("code_lang"),
          lineNumbers: true
      });
      let lang = $(element).closest(".codebox_holder").attr("lang")
      let this_problem = getProblemOfElement(this);
      if (!code_mirrors[this_problem.exercise]) {
        code_mirrors[this_problem.exercise] = {}
      }
      if (!code_mirrors[this_problem.exercise][this_problem.problem]) {
        code_mirrors[this_problem.exercise][this_problem.problem] = {};
      }
      code_mirrors[this_problem.exercise][this_problem.problem][lang] = cm;
      setTimeout(() => void cm.refresh(), 0)
    })
    $(`.codebox_holder[lang=${config_data.lang[0] || "html"}]`).show();
    $("code[lang=html]").each(function (i, element) {
      let html = $(element).get(0).innerHTML;
      let replacements = [
        [/</g, '&lt;'],
        [/>/g, '&gt;'],
        [/<\\/g, '&lt;\\\\'],
      ]
      $(element).html(replaceAll(html, replacements));
    })
  })
})

var name;
var hasSetName = false;
$("body").on('click', '.exercise_link', function() {
  if (!hasSetName) {
    if ($("#name").val()) {
      name = $("#name").val();
      $("#name").attr("disabled", "true");
      api.init();
      hasSetName = true;
    } else {
      alert("Please enter your name in the top right corner.")
      return
    }
  }
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
  let problem_box = $(this).closest(".problem");
  let question_num = problem_box.attr("num");
  let choice = $(this).attr("choice")
  let isCorrect = $(this).hasClass("correct");
  api.uploadMultipleChoice(current_exercise, question_num, choice, isCorrect);
})

$("body").on('click', '.mark_complete', function() {
  let problem_box = $(this).closest(".problem");
  let question_num = problem_box.attr("num");
  api.uploadTodo(current_exercise, question_num);
})

function update_problem(exercise, question, choice, isCorrect) {
  let problem_box = $(`.exercise_set[exercise=${exercise}]`)
    .find(`.problem[num=${question}]`).find(".problem_box");
  let choice_button = problem_box
    .find(`.choice[choice=${choice}], .mark_complete`);
  problem_box.removeClass("red").removeClass("green");
  problem_box.find(".choice").removeClass("red").removeClass("green");
  switch(isCorrect) {
    case -1:
      problem_box.addClass("red");
      choice_button.addClass("red");
      problem_box.find(".no_message").show();
      problem_box.find(".yes_message").hide();
      problem_box.find(".submit_code, .submitting_code").addClass("invisible");
      responses[exercise][question] = false;
      break;
    case 0:
      problem_box.find(".no_message").hide();
      problem_box.find(".yes_message").hide();
      responses[exercise][question] = false;
      break;
    case 1:
      problem_box.addClass("green");
      choice_button.addClass("green");
      problem_box.find(".no_message").hide();
      problem_box.find(".yes_message").show();
      responses[exercise][question] = true;
      problem_box.find(".submit_code, .submitting_code").addClass("invisible");
      break;
  }
  let exerciseComplete = true;
  for (question in responses[exercise]) {
    exerciseComplete &= responses[exercise][question];
  }
  let exercise_link = $(`.exercise_link[exercise=${exercise}]`);
  if (exerciseComplete) {
    exercise_link.addClass("green");
  } else {
    exercise_link.removeClass("green");
  }
}

$("body").on('click', '.lang_link', function() {
  let lang = $(this).attr('lang');
  let problem_box = $(this).closest(".problem");
  problem_box.find('.lang_link').removeClass("active");
  $(this).addClass('active');
  problem_box.find('.codebox_holder').hide();
  problem_box.find(`.codebox_holder[lang=${lang}]`).show();
})

function getCodeSet(cm_set) {
  let code_set = {
    html: "",
    css: "",
    js: "",
  };
  if ("html" in cm_set) {
    code_set["html"] = cm_set["html"].getValue();
  }
  if ("css" in cm_set) {
    code_set["css"] = cm_set["css"].getValue();
  }
  if ("js" in cm_set) {
    code_set["js"] = cm_set["js"].getValue();
  }
  return code_set;
}

$("body").on('click', '.run_code', function() {
  let problem_box = $(this).closest(".problem");
  if (problem_box.find(".submitting_code").hasClass("invisible")) {
    problem_box.find(".submit_code").removeClass("invisible");
  }
  let output = $(this).closest(".problem").find(".output_box");
  let demo = $(this).closest(".problem").find(".demo_box");
  output.show();
  demo.hide();
  output.find('iframe').remove();
  output.append(`<iframe></iframe>`)
  let this_problem = getProblemOfElement(this);
  let cm_set = code_mirrors[this_problem.exercise][this_problem.problem];
  let code_set = getCodeSet(cm_set);
  $iframe = output.find("iframe");
  $iframe.ready(function() {
    $iframe.contents().find("body").html(code_set.html);
    $iframe.contents().find("head").html("<style>" + code_set.css + "</style>");
  });
})

window_count = 1;
$("body").on('click', '.open_max img', function() {
  let html = $(this).closest('.render_box').find('iframe').contents().find("html").html();
  let is_demo = $(this).closest('.render_box').hasClass('demo_box')
  var win = window.open('', (is_demo ? 'demo' : 'output') + (++window_count),'height=600,width=480');
  win.document.write(html);
  win.focus();
})

$("body").on('click', '.show_demo', function() {
  let output = $(this).closest(".problem").find(".output_box");
  let demo = $(this).closest(".problem").find(".demo_box");
  output.hide();
  demo.show();
})

$("body").on('click', '.submit_code', function() {
  let problem_box = $(this).closest(".problem");
  let question_num = problem_box.attr("num");
  let this_problem = getProblemOfElement(this);
  let cm_set = code_mirrors[this_problem.exercise][this_problem.problem];
  let code_set = getCodeSet(cm_set);
  if ($(this).attr("autograder") == 'copy') {
    let passed = "true";
    problem_box.find("code").each(function(i, element) {
      let encoded = $(element).html();
      let decoded = $("<div/>").html(encoded).text();
      let lang = $(element).attr("lang");
      if (decoded.trim() != code_set[lang].trim()) {
        passed = false;
        console.log("failed!")
        return false;
      }
    })
    if (passed) {
      api.uploadCode(current_exercise, question_num, code_set,
        /*isCorrect=*/1);
      return;
    }
  }
  pending_review.push([current_exercise, question_num]);
  problem_box.find(".submit_code").addClass("invisible");
  problem_box.find(".submitting_code").removeClass("invisible");
  api.uploadCode(current_exercise, question_num, code_set);
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

if (localStorage) {
  if ("name" in localStorage) {
    $("#name").val(localStorage["name"])
  }
  $('#name').on('change', function() {
    localStorage["name"] = $(this).val();
  })
}
