async function chatText(){
  const question = sessionStorage.getItem('Question');

  const questionfromserver = document.querySelector('.question-from-server');
  questionfromserver.textContent = question;
  const answerText = document.querySelector('.answer-from-server');
  answerText.textContent = "";

  const loadingRowDiv = document.getElementById('card-title');
  const loadingRow = document.querySelectorAll('.skeleton-text');
  loadingRow.forEach((row) => {
    row.classList.add("skeleton");
  });
  const loadingRowHalf = document.querySelectorAll('.skeleton-text-half');
  loadingRowHalf.forEach((row) => {
    row.classList.add("skeleton");
  });

  const res = fetch('http://127.0.0.1:8000/chat', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "question": question
    })											
  })
  .then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const head = response.headers.get('img_url');
    console.log(head);
    let receivedLength = 0;
    
    return new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            loadingRow.forEach((row) => {
              row.classList.remove("skeleton");
            });
            loadingRowHalf.forEach((row) => {
              row.classList.remove("skeleton");
            });
            loadingRowDiv.style.height = '0px';
            
            receivedLength += value.length;
            const chunk = decoder.decode(value, { stream: true });
            console.log(chunk);
            answerText.textContent += chunk;
            controller.enqueue(value);
            push();
          });
        }
				push();
			}
		});
	})
  .then(stream => new Response(stream))
	.then(response => response.text())
	.then(data => {
		console.log("Streaming complete");
	})
	.catch(error => {
		console.error('Streaming error:', error);
	});
}
chatText()

const sendToServer = () => {
	const textQuestion = document.getElementById('questiondata');
  sessionStorage.setItem("Question", textQuestion.textContent);

  const questionfromserver = document.querySelector('.question-from-server');
  questionfromserver.textContent = textQuestion.textContent;
  const answerText = document.querySelector('.answer-from-server');
  answerText.textContent = "";

  const loadingRowDiv = document.getElementById('card-title');
  loadingRowDiv.style.height = '100%';
  const loadingRow = document.querySelectorAll('.skeleton-text');
  loadingRow.forEach((row) => {
    row.classList.add("skeleton");
  });
  const loadingRowHalf = document.querySelectorAll('.skeleton-text-half');
  loadingRowHalf.forEach((row) => {
    row.classList.add("skeleton");
  });

  const getSolutionbutton = document.querySelector('.getsol');
	const buttonText = document.querySelector("#buttonText");

  getSolutionbutton.classList.add("loading");
  buttonText.textContent = "Generating...";

	const res = fetch('http://127.0.0.1:8000/chat', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "question": textQuestion.textContent
    })											
  })
	.then(response => {
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let receivedLength = 0;

    textQuestion.textContent = "";
    
		return new ReadableStream({
			start(controller) {
				function push() {
					reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            
            loadingRow.forEach((row) => {
              row.classList.remove("skeleton");
            });
            loadingRowHalf.forEach((row) => {
              row.classList.remove("skeleton");
            });
            loadingRowDiv.style.height = '0px';
            getSolutionbutton.classList.remove("loading");
            buttonText.textContent = "Get Solution";
            
            receivedLength += value.length;
            const chunk = decoder.decode(value, { stream: true });
            console.log(chunk);
            answerText.textContent += chunk;
            controller.enqueue(value);
            push();
          });
        }
			  push();			
		  }
	  });
	})
  .then(stream => new Response(stream))
  .then(response => response.text())
  .then(data => {
  console.log("Streaming complete");
	})
	.catch(error => {
		console.error('Streaming error:', error);
	});
};
