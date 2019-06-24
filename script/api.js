function parseSnapshot(snapshot) {
  let key_split = snapshot.key.split("_");
  let child = snapshot.val();
  let values = {
    exercise: key_split[0],
    question: key_split[1],
    choice: child.choice,
    isCorrect: child.isCorrect
  }
  update_problem(values.exercise, values.question, values.choice,
      values.isCorrect);
}

var api = {
  init: function() {
    let dbRef = firebase.database().ref('responses/' + course_tag + '/' + name);
    dbRef.on('child_added', function(snapshot) {
      parseSnapshot(snapshot);
    })
    dbRef.on('child_changed', function(snapshot) {
      parseSnapshot(snapshot);
    })
    dbRef.on('child_removed', function(snapshot) {
      parseSnapshot(snapshot);
    })
  },
  uploadMultipleChoice: function(exercise, question, choice, isCorrect) {
    question_data = {
      choice: choice,
      isCorrect: isCorrect ? 1 : -1,
    }
    if (!isCorrect) {
      question_data.wasCorrect = false
    }
    firebase
      .database()
      .ref('responses/' + course_tag + '/' + name + '/' + exercise + '_' +
          question)
      .update(question_data);
  },
  uploadCode: function(exercise, question, code) {
    question_data = {
      isCorrect: 0,
      code: code
    }
    firebase
      .database()
      .ref('responses/' + course_tag + '/' + name + '/' + exercise + '_' +
          question)
      .update(question_data);
  }
}
