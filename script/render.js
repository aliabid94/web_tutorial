function renderToString(i, question) {
  if ("variables" in question) {
    for(variable_expression of question["variables"]) {
      var type = variable_expression["type"] || "int"
      var final_value;
      if ("values" in variable_expression) {
        var parse_command = ""
        if (type == "int") {
          parse_command = "parseInt"
        } else if (type == "float") {
          parse_command = "parseFloat"
        }
        final_value =  parse_command + "(`" + pickRandom(variable_expression["values"]) + "`)"
      } else if ("range" in variable_expression) {
        var start = variable_expression["range"][0]
        var end = variable_expression["range"][1]
        final_value = Math.floor(Math.random() * (end - start + 1) + start)
      }
      var expr_string = "var " + variable_expression["name"] + " = " + final_value
      eval(expr_string)
    }
  }
  question = JSON.parse(eval("`" + JSON.stringify(question) + "`"))
  var choices = question.choices || []
  var answers;
  switch (question.type) {
    case "data_sufficiency":
      choices_html = generateDataSufficiencyChoices(question.answer)
      break;
    default:
      choices_html = generateScrambledMultipleChoices(choices)
  }
  return `
   <div class='ui message'>
    <div class='question-number'>
      <div class='ui header'>Question ${i+1}</div>
    </div>
    <div class="white_canvas">
      <div class='question ui segment fluid'>
        ${katex.renderToString(question["question"] || "")}
        <div class='answers'>
          <div class='ui vertical buttons'>
            ${choices_html}
          </div>
        </div>
      </div>
    </div>
    ${(question["solution"] || []).map(str => "<div class='hint'>"+katex.renderToString(str)+"</div>").join("")}
    <button class='ui blue button add_hint'>Hint?</button>
  </div>`
}

function generateScrambledMultipleChoices(choices) {
  var choices_html = ""
  var random_order = getRandomSample(choices.length-1, choices.length)
  random_order.forEach(function (order, i) {
    choices_html += `<button class='ui button fluid choice ${order == 0 ? "correct" : ""}'>${alphabet.charAt(i) + ") &nbsp;" + katex.renderToString(choices[order])}</button>`
  })
  return choices_html
}
