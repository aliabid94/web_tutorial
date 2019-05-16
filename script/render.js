function renderToString(i, question) {
  if ("variables" in question) {
    for(variable_expression of question["variables"]) {
      if ("values" in variable_expression) {
        let final_value = pickRandom(variable_expression["values"]);
        let expr_string = "var " + variable_expression["name"] + " = `" + final_value + "`";
        eval(expr_string)
      }
    }
  }
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
        <textarea class="codebox" code_lang=${question['code_language']}></textarea>
        <button class="ui button run_code">Run Code</button>
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
  </div>
  <div class='output_box ui segment fluid'>
  </div>`
}

function generateScrambledMultipleChoices(choices) {
  var choices_html = ""
  var random_order = getRandomSample(choices.length-1, choices.length)
  random_order.forEach(function (order, i) {
    choices_html += `<button class='ui button fluid choice ${order == 0 ? "correct" : ""}'>${alphabet.charAt(i) + ") &nbsp;" + choices[order]}</button>`
  })
  return choices_html
}
