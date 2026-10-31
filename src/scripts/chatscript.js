import { createParser } from "https://esm.sh/eventsource-parser";

async function chatText() {
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

  const questionfromserver = document.querySelector('.question-from-server');

  let data_ques = "";
  let data_id = "";
  await fetch('http://127.0.0.1:8000/api/chat') 
  .then(async (response) => await response.json())
  .then((data) => {
    console.log(data);
    questionfromserver.textContent = data['question'];
    data_ques = data['question'];
    data_id = data['id'];
  })
  .catch((error) => {
    console.log("Error fetching JSON file:", error);
  })

  console.log(questionfromserver.textContent);

  const response = await fetch('http://127.0.0.1:8000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: data_ques
    }),
  });

  console.log("2. Response received:", response.status);
  console.log("3. Content-Type:", response.headers.get("Content-Type"));

  if (!response.ok) {
    const error = await response.json();
    console.error("Server error:", error);
    throw new Error(error.error?.message || "Request failed");
  }

  const parser = createParser({
    onEvent(event) {
      if (event.data === '[DONE]') return;
      console.log("RAW SSE EVENT:", JSON.stringify(event.data));

      try {
        const data = JSON.parse(event.data);

        if (data.type === 'text' && data.content) {
          fullresponse += data.content;

          if (!hasReceivedContent) {
            hasReceivedContent = true;
          }

          answerText.appendChild(
            document.createTextNode(data.content)
          );
        }

        else if (data.type === 'image' && data.url) {
          const img = document.createElement('img');

          img.src = data.url.thumbnail;
          img.alt = data.url.title || 'Educational image';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';

          answerText.appendChild(img);
          answerText.appendChild(document.createElement('br'));
        }

        else if (data.type === 'done') {
          console.log('Response completed');
        }

      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    },
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullresponse = "";
  let hasReceivedContent = false;

  console.log("4. Starting to read stream");

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("5. Stream finished");
        break;
      }

      parser.feed(decoder.decode(value, { stream: true }));
    }

    parser.feed(decoder.decode());

  } finally {
    loadingRow.forEach((row) => {
      row.classList.remove("skeleton");
    });
    loadingRowHalf.forEach((row) => {
      row.classList.remove("skeleton");
    });
    loadingRowDiv.style.height = '0px';
  }

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

  let fullresponse = "";
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
            fullresponse += chunk;
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
    answerText.innerHTML = fullresponse;
    console.log("Streaming complete");
  })
  .catch(error => {
    console.error('Streaming error:', error);
  });
};

function parseMarkdown(text) {
  return text
    // 1. Clean up windows-style newlines
    .replace(/\r\n/g, '\n')
    
    // 2. Headings (H1 to H6)
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // 3. Bold (**text**) and Italics (*text* or _text_)
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/__(.*)__/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/_(.*)_/gim, '<em>$1</em>')
    
    // 4. Inline Code (`code`)
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    
    // 5. Links ([text](url))
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    
    // 6. Blockquotes (> text)
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    
    // 7. Paragraphs & Line Breaks (Wrap standalone lines in <p>)
    .split('\n\n')
    .map(paragraph => {
      // If it's already an HTML block element (like H1-H6 or blockquote), leave it
      if (paragraph.trim().match(/^<\/?(h[1-6]|blockquote|ul|ol|li)/i)) {
        return paragraph;
      }
      // Otherwise, wrap it in a paragraph tag
      return paragraph.trim() ? `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>` : '';
    })
    .join('\n');
}
