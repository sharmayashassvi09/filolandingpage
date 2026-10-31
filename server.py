from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import requests
from dotenv import load_dotenv
import serpapi
from functools import partial
from pathlib import Path


load_dotenv()
URL = os.getenv("URL")
API_KEY = os.getenv("API_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

HOST = "127.0.0.1"
PORT = 8000

class class_handler(SimpleHTTPRequestHandler):

  def send_exception_error(self, error):
    self.send_response(500)       
    self.send_header("Content-Type", "application/json")
    self.send_header("Access-Control-Allow-Origin", "*")
    self.end_headers()

    self.wfile.write(
      json.dumps({
          "error": str(error)
      }).encode()
    )

  # Using SERPAPI
  def get_image_url(self, ques):
    data = []
    print("Inside get img urls")

    client = serpapi.Client(api_key=SERPAPI_KEY)
    results = client.search({
      "engine": "google_images",
      "q": ques,
      "location": "Austin, Texas, United States",
      "google_domain": "google.com",
      "hl": "en",
      "gl": "us"
    })
    images_results = results["images_results"]
    images_results = images_results[:1]
    for image_url in images_results:
      data.append(image_url)
      event = {
        "type": "image",
        "url": image_url
      }

      self.wfile.write(
        f"data: {json.dumps(event)}\n\n".encode("utf-8")
      )
      self.wfile.flush()
    # print(images_results)
    return data

  def do_GET(self):
    if self.path == "/api/chat":
      print("Inside do_GET chat")
      try:
        with open("src/data/chats.json") as file:
          data = json.load(file)
          print(data)

          self.send_response(200)
          self.send_header('Content-type', 'application/json')
          self.send_header("Access-Control-Allow-Origin", "*")
          self.end_headers()

          id = str(len(data))
          print(data[id])
          send_data = {
            "id": id,
            "question": data[id]
          }
          print(send_data)
          self.wfile.write(
            json.dumps(send_data).encode()
          )

      except Exception as error:
        self.send_exception_error(error)

    # ------------------------------ x ---- x ------------------------------
    elif self.path == "/api/solutions":
      self.send_response(200)
      self.send_header('Content-type', 'application/json')
      self.send_header("Access-Control-Allow-Origin", "*")
      self.end_headers()
      print("inside do_GET Solutions")
      
      try:
        with open("src/data/chats.json") as file:
          data = json.load(file)
          print(data)

        self.wfile.write(
          json.dumps(data).encode()
        )
      except Exception as error:
        self.send_exception_error(error)

    elif self.path == "/":
      self.path = "/index.html"
      return super().do_GET()
    elif self.path == "/chat":
      self.path = "/src/pages/chat.html"
      return super().do_GET()
    elif self.path == "/solutions":
      self.path = "/src/pages/solutions.html"
      return super().do_GET()
    else:
      return super().do_GET()
    
  def do_OPTIONS(self):
    self.send_response(204)
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    self.send_header("Access-Control-Allow-Headers", "Content-Type")
    self.end_headers()

  def do_POST(self):
    if self.path == "/":
      try:
        content_length = int(self.headers['Content-Length'])
        request_body = self.rfile.read(content_length)

        user_ques_data = json.loads(request_body)

        print("Data read - 200.")

        with open("src/data/chats.json") as file:
          data = json.load(file)

        id = len(data) + 1
        # new_ques = {id: user_ques_data['question']}
        data[id] = user_ques_data['question']
        
        print(data)
        with open("src/data/chats.json", "w") as file:
          json.dump(data, file)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers() 
        
        result = {
          "id": id,
          "question": user_ques_data['question'],
        }
        self.wfile.write(
          json.dumps(result).encode("utf-8")
        )

        print(user_ques_data)  

      except Exception as error:
        self.send_exception_error(error)

    # ------------------------------ x ---- x ------------------------------
    if self.path == "/api/chat":
      try:
        content_length = int(self.headers['Content-Length'])
        request_body = self.rfile.read(content_length)
  
        user_ques_data = json.loads(request_body)
        # self.send_response(200)
        print("Data read - 200.")
        print(user_ques_data)

        # self.send_response(200)
        with open("src/data/chats.json") as file:
          data = json.load(file)

        id = len(data) + 1
        if user_ques_data['question'] not in data.values():
          data[id] = user_ques_data['question']
        
        # print(data)
        with open("src/data/chats.json", "w") as file:
          json.dump(data, file)

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        # Sending request to LLM
        headers = {
          "Authorization": f"Bearer {API_KEY}",
          "Content-Type": "application/json"
        }

        messages = [
          {
            "role": "system",
            "content": """
              You are an educational assistant.

              Explain the answer progressively, in a logical order.

              When the user requests diagrams or images:
              1. First generate a short textual introduction.
              2. Then request an image relevant to the next part of the explanation.
              3. After receiving the image results, continue the textual explanation.
              4. Request another image only when it is needed for the next part.
              5. Never request multiple images for future stages all at once.
              6. Finish with the remaining explanation after the final image.

              Do not generate the entire answer before requesting images.
            """
          },
          {
            "role": "user",
            "content": user_ques_data["question"]
          }
        ]

        while True:
            payload = {
                "model": "openai/gpt-4o",
                "messages": messages,
                "tools": [
                    {
                        "type": "function",
                        "function": {
                            "name": "get_image_url",
                            "description": (
                                "Get relevant image URLs when an image "
                                "would help answer the question."
                            ),
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "query": {
                                        "type": "string",
                                        "description": (
                                          "Retrieve relevant image URLs for ONE specific stage or subject "
                                          "currently being explained. Call this function at most once "
                                          "for that stage. Do not request images for multiple future "
                                          "stages in the same tool call."
                                        )
                                    }
                                },
                                "required": ["query"]
                            }
                        }
                    }
                ],
                "tool_choice": "auto",
                "stream": True
            }

            # Collect tool-call fragments for this LLM request.
            tool_calls = {}

            # Collect the assistant's text for conversation history.
            assistant_content = ""

            finish_reason = None
            buffer = ""

            with requests.post(URL, headers=headers, json=payload, stream=True) as r:
                print("API status:", r.status_code, flush=True)
                print("API headers:", r.headers.get("Content-Type"), flush=True)
                r.raise_for_status()

                for chunk in r.iter_content(chunk_size=1024, decode_unicode=True):
                    # print("RAW CHUNK:", repr(chunk), flush=True)
                    if not chunk:
                        continue

                    buffer += chunk

                    while "\n" in buffer:
                        line_end = buffer.find("\n")
                        line = buffer[:line_end].strip()
                        buffer = buffer[line_end + 1:]

                        if not line or line.startswith(":"):
                            continue

                        if not line.startswith("data: "):
                            continue

                        data = line[6:]

                        if data == "[DONE]":
                            break

                        try:
                            data_obj = json.loads(data)
                            choice = data_obj["choices"][0]
                            delta = choice.get("delta", {})

                            print("DELTA:", delta.get("content"), flush=True)
                            print("FINISH REASON:", choice.get("finish_reason"), flush=True)
                        except json.JSONDecodeError:
                            continue

                        choice = data_obj["choices"][0]
                        delta = choice.get("delta", {})

                        # 1. Stream text to the frontend immediately.
                        content = delta.get("content")

                        if content:
                          assistant_content += content
                          print(content, end="", flush=True)

                          event = {
                            "type": "text",
                            "content": content
                          }

                          # Forward the original SSE event to JavaScript.
                          self.wfile.write(f"data: {json.dumps(event)}\n\n".encode("utf-8"))
                          self.wfile.flush()  

                        # 2. Collect tool-call fragments.
                        calls = delta.get("tool_calls") or []

                        for call in calls:

                            index = call["index"]

                            if index not in tool_calls:
                                tool_calls[index] = {
                                    "id": "",
                                    "type": "function",
                                    "function": {
                                        "name": "",
                                        "arguments": ""
                                    }
                                }

                            current = tool_calls[index]

                            if call.get("id"):
                                current["id"] = call["id"]

                            if call.get("type"):
                                current["type"] = call["type"]

                            function = call.get("function", {})

                            current["function"]["name"] += (
                                function.get("name") or ""
                            )

                            current["function"]["arguments"] += (
                                function.get("arguments") or ""
                            )

                        # 3. Check whether this LLM response has finished.
                        if choice.get("finish_reason") is not None:
                            finish_reason = choice["finish_reason"]
                            break

                    if finish_reason is not None:
                        break

            # 4. If the model requested tools, execute them.
            if finish_reason == "tool_calls":

                completed_calls = [
                    tool_calls[index]
                    for index in sorted(tool_calls)
                ]

                # Save the assistant's message, including its tool calls.
                messages.append({
                    "role": "assistant",
                    "content": assistant_content or None,
                    "tool_calls": completed_calls
                })

                # Execute each tool and append its result.
                for call in completed_calls:
                    function_name = call["function"]["name"]
                    arguments = json.loads(
                        call["function"]["arguments"]
                    )

                    if function_name == "get_image_url":
                        image_urls = self.get_image_url(
                            arguments["query"]
                        )

                        print("Image URLs:", image_urls)

                        messages.append({
                            "role": "tool",
                            "tool_call_id": call["id"],
                            "content": json.dumps(image_urls)
                        })

                # Start another LLM request with the updated messages.
                continue

            # 5. If the model finished normally, end the loop.
            if finish_reason == "stop":
                break

            # Handle unexpected termination instead of looping forever.
            break

        self.send_response(200)
        print("Got the Answer.")

        # result = {
        #   "question": user_ques_data['question'],
        #   "text": answer
        # }
        # self.wfile.write(
        #   json.dumps(result).encode("utf-8")
        # )
        
      except Exception as error:
        self.send_exception_error(error)





    

 

handler = partial(
    class_handler,
    directory=str(Path(__file__).resolve().parent)
)

server = HTTPServer((HOST, PORT), handler)
print(f"Listening on PORT: {PORT}")

server.serve_forever()
server.server_close()
print("Server stopped!")