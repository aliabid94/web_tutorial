function renderRepeat(i, question, repeat) {
  let html = '';
  used_variable_sets = [];
  for (let r = 0; r < repeat; r++) {
    let variable_set = {};
    let false_variable_set = {};
    if ("variables" in question) {
      let run_count = 0;
      do {
        variable_set = {};
        for(variable_expression of question["variables"]) {
          let true_variable = pickRandom(variable_expression["values"]);
          let false_variable;
          do {
            false_variable = pickRandom(variable_expression["values"]);
          } while (true_variable == false_variable)
          variable_set[variable_expression["name"]] = true_variable;
          false_variable_set[variable_expression["name"]] = false_variable;
        }
        if (run_count++ > 100) {
          break
          throw "Unable to make unique: " + variable_expression["name"]
        }
      } while (hasMatch(used_variable_sets, variable_set))
      used_variable_sets.push(variable_set);
    }
    html += `
      <div class='problem' num="${i+r+1}">
        ${renderToString(i + r, question, variable_set, false_variable_set)}
      </div>`;
  }
  return html;
}

function renderToString(i, question, variables, false_variables) {
  question = JSON.parse(eval(("`" + JSON.stringify(question) + "`").replace(/\\n/g,'')))
  let choices = question.choices || []
  let answers, answers_input;
  switch (question.type) {
    case "multiple_choice":
      answers_input = `
        <div class='ui vertical buttons'>
          ${generateScrambledMultipleChoices(choices)}
        </div>`
      break;
    case "code":
      answers_input = `
        <textarea class="codebox" code_lang=${question['code_language']}>${question['preset_code'] || ""}</textarea>
        <button class="ui button run_code">Run Code</button>
        ${question.demo_code ? `<button class="ui button yellow show_demo">Show Demo</button>` : ""}
        <button class="ui button blue submit_code invisible">Submit Code</button>
        <button class="ui loading blue button submitting_code invisible">Loading</button>
      `
      break;
    default:
      answers_input = "";
  }
  return `
   <div class='ui message problem_box'>
    <div class='question-number'>
      <div class='ui header'>Question ${i+1}</div>
    </div>
    <div class="white_canvas">
      <div class='question ui segment fluid'>
        ${question["question"]}
        <div class='answers ${question.type}'>
          ${answers_input}
        </div>
      </div>
    </div>
    <span class="no_message"><span class="header ui red">${noMessage()}</span>${
        question.hint ? "<strong>Hint:</strong> " + question.hint : ""}</span>
    <span class="yes_message"><span class="header ui green">${yesMessage()}</span></span>
  </div>
  <div class='output_box render_box ui message fluid'>
  </div>
  ${question.demo_code ? `
  <div class='demo_box render_box yellow ui message fluid'>
    <iframe srcdoc="${question.demo_code}"></iframe>
  </div>
    ` : ""}
  `
}

function generateScrambledMultipleChoices(choices) {
  var choices_html = ""
  var random_order = getRandomSample(choices.length-1, choices.length)
  random_order.forEach(function (order, i) {
    let char_choice = alphabet.charAt(i);
    choices_html += `
      <button choice=${char_choice} class='ui button fluid choice
        ${order == 0 ? "correct" : ""}'>${char_choice + ") &nbsp;"
      + choices[order]}</button>`
  })
  return choices_html
}

function yesMessage() {
  let messages = ["Correct!", "Well done.", "You got it.", "Yep.", "Good job!"]
  return pickRandom(messages);
}

function noMessage() {
  let messages = ["Not quite, try again.", "Hmm, let's try again.", "Let's give it another shot.", "That's not correct, give it another try.", "Nope, try again."]
  return pickRandom(messages);
}
