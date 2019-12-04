"use strict";

// get DOM elements
const questions = document.getElementsByClassName('questionLink');
const assignmentName = document.querySelector("#assignmentName");
const assignmentDate = document.querySelector("#assignmentDate")
const allList = document.querySelector("#allQuestions")
let assignmentCount = 0
let assignmentQuestions = []
let unsavedAssignmentQuestions = []
let allQuestions = []

// parse ending
const mode = window.location.href.split('/').pop()

if (mode==="new"){
  getAssignment("")
} else {
  getAssignment(mode)
}

getAllQuestions()

function getAssignment(mode) {
  const url = "/api/ass/" + mode
  fetch(url).then((res) => {
    if (res.status === 200) {
      return res.json()
    } else {
      alert("Could not load assignment")
    }
  }).then((json) => {
    if (mode === ""){
      assignmentCount = json.length
    } else {
      assignmentName.value = json.name
      assignmentQuestions = json.questions
      assignmentDate.value = json.due.slice(0, 10)
      setTimeout(loadAssignmentQuestions, 10)
    }
  })
}

function getAllQuestions() {
  const url = ("/api/questions")

  fetch(url).then((res) => {
    if (res.status === 200) {
      return res.json()
    } else {
      alert("Could not load questions")
    }
  }).then((json) => {
    allQuestions = json
    updateQuestions()
  })
}

function updateQuestions() {
  allQuestions.map( (q) => {
    const newLink = document.createElement('a')
    newLink.id = q.qid
    newLink.classList.add("questionLink")
    console.log("newLink:")
    console.log(newLink)
    newLink.addEventListener("click", addQuestion)
    console.log("added event listener to")
    console.log(newLink)
    newLink.innerHTML = `<li class="questionListItem"><p class="red-txt">` + q.qid+ `</p><p class="questionPreviewText sm-txt">` + q.question + `</p></li>`
    allList.appendChild(newLink)
    return 0
  })
}

function loadAssignmentQuestions() {
  assignmentQuestions.map( (q) => {
    console.log("loading question " + q)
    const newDiv = document.createElement("div")
    newDiv.classList.add("selectedQuestion")
    newDiv.innerHTML = '<li class="selectedQuestionListItem"><p class="red-txt">' + q + '</p></li>';
    const link = document.createElement("a")
    link.classList.add("closeButton")
    link.classList.add("removeSelectedQuestionBtn")
    link.addEventListener("click", removeQuestion)
    newDiv.appendChild(link)

    document.getElementById('selectedQuestionList').appendChild(newDiv);

    document.getElementById(q).children[0].classList.add("done")
    document.getElementById(q).removeEventListener("click", addQuestion)
    console.log("removed event listener from")
    console.log(document.getElementById(q))

    unsavedAssignmentQuestions.push(q)
  })
}


function updateAssignment(e) {
  e.preventDefault()
  let request = null

  let url = ""
  let data = {
    "name": assignmentName.value,
    "q_ids": unsavedAssignmentQuestions,
    "aid": mode === "new" ? assignmentCount : mode,
    "due": new Date(assignmentDate.value + "T23:59:00")
  }

  if (mode === "new") {
    url = "/api/ass"

    request = new Request(url, {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
         'Accept': 'application/json, text/plain, */*',
         'Content-Type': 'application/json'
      },
    })
  } else {
    url = "/api/ass/mode"
  }
  fetch(request).then(function(res) {
    if (res.status === 200) {
      alert("Assignment created!")
      window.location.href = "/admin/dashboard"
    } else {
      alert("Could not add assignment")
    }
  })
}

/*
// Add questionLink
for (let i = 0; i < questions.length; i++) {
  const question = questions[i];
  question.onclick = function() {
    if (question.children[0].classList.contains("done")) {
      removeQuestion(question.id);
    } else {
      addQuestion(question.id);
      question.children[0].classList.add("done");
    }
  }
}

*/

updateAssignmentButton.addEventListener("click", updateAssignment)

function addQuestion(e) {
  console.log("adding question")
  console.log(e.target)
  const q = e.target
  const newDiv = document.createElement("div")
  newDiv.classList.add("selectedQuestion")
  newDiv.innerHTML = '<li class="selectedQuestionListItem"><p class="red-txt">' + e.target.innerText + '</p></li>';
  const link = document.createElement("a")
  link.classList.add("closeButton")
  link.classList.add("removeSelectedQuestionBtn")
  link.addEventListener("click", removeQuestion)
  console.log("added event listener too")
  console.log(link)
  newDiv.appendChild(link)

  document.getElementById('selectedQuestionList').appendChild(newDiv);
  e.target.parentElement.classList.add("done")
  e.target.parentElement.parentElement.removeEventListener("click", addQuestion)
  console.log("removed event listener from")
  console.log(e.target.parentElement)

  unsavedAssignmentQuestions.push(e.target.innerText)
}

function removeQuestion(e) {
  e.target.parentElement.remove()
  unsavedAssignmentQuestions = unsavedAssignmentQuestions.filter(qid => qid != e.target.parentElement.children[0].children[0].innerText)
  document.getElementById(e.target.parentElement.children[0].children[0].innerText).addEventListener("click", addQuestion)
  document.getElementById(e.target.parentElement.children[0].children[0].innerText).children[0].classList.remove("done")
}
