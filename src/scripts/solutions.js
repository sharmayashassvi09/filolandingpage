// import data from "../data/chats.json" assert {type: 'json'};

// function populateQuestions() {
//   const question_container = document.querySelector('.questions-container');
//   data['Questions'].forEach(ques => {
//     question_container.innerHTML = `  
//       <div class="question">
//         <div class="each-question-container">
//           <div class="top-of-questions">
//             <div>Time Stamp</div>
//             <svg viewBox="0 0 4 14" xmlns="http://www.w3.org/2000/svg" fill="none" height="12px" width="12px" style="display: block;"><path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M0 1.66667C0 0.746192 0.746192 0 1.66667 0C2.58714 0 3.33333 0.746192 3.33333 1.66667C3.33333 2.58714 2.58714 3.33333 1.66667 3.33333C0.746192 3.33333 0 2.58714 0 1.66667ZM0 6.66667C0 5.74619 0.746192 5 1.66667 5C2.58714 5 3.33333 5.74619 3.33333 6.66667C3.33333 7.58714 2.58714 8.33333 1.66667 8.33333C0.746192 8.33333 0 7.58714 0 6.66667ZM0 11.6667C0 10.7462 0.746192 10 1.66667 10C2.58714 10 3.33333 10.7462 3.33333 11.6667C3.33333 12.5871 2.58714 13.3333 1.66667 13.3333C0.746192 13.3333 0 12.5871 0 11.6667Z" fill="#8A8A8A"></path></svg>
//           </div>
//         </div>
//         <div>${ques}</div>
//       </div>
//     `
//     console.log(ques);
//   });
// }

function populateQuestions() {
  const question_container = document.querySelector('.questions-container');

  fetch('http://127.0.0.1:8000/solutions') 
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    data.forEach(ques => {
      const newElement = document.createElement("div");
      const new_question = `  
        <div class="question">
          <div class="each-question-container">
            <div class="top-of-questions">
              <div>Time Stamp</div>
              <svg viewBox="0 0 4 14" xmlns="http://www.w3.org/2000/svg" fill="none" height="12px" width="12px" style="display: block;"><path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M0 1.66667C0 0.746192 0.746192 0 1.66667 0C2.58714 0 3.33333 0.746192 3.33333 1.66667C3.33333 2.58714 2.58714 3.33333 1.66667 3.33333C0.746192 3.33333 0 2.58714 0 1.66667ZM0 6.66667C0 5.74619 0.746192 5 1.66667 5C2.58714 5 3.33333 5.74619 3.33333 6.66667C3.33333 7.58714 2.58714 8.33333 1.66667 8.33333C0.746192 8.33333 0 7.58714 0 6.66667ZM0 11.6667C0 10.7462 0.746192 10 1.66667 10C2.58714 10 3.33333 10.7462 3.33333 11.6667C3.33333 12.5871 2.58714 13.3333 1.66667 13.3333C0.746192 13.3333 0 12.5871 0 11.6667Z" fill="#8A8A8A"></path></svg>
            </div>
          </div>
          <div>${ques}</div>
        </div>
      `
      newElement.innerHTML = new_question;
      question_container.appendChild(newElement);
      console.log(ques);
    });
  })
  .catch((error) => {
    console.log("Error fetching JSON file:", error);
  })
}
populateQuestions()