from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import requests
from dotenv import load_dotenv
import os

load_dotenv()
URL = os.getenv("URL")
API_KEY = os.getenv("API_KEY")
img_urls_key = os.getenv("img_urls_key")

HOST = "127.0.0.1"
PORT = 8000

class handler(BaseHTTPRequestHandler):

  def do_GET(self):
    if self.path == "/solutions":
      self.send_response(200)
      self.send_header('Content-type', 'application/json')
      self.send_header("Access-Control-Allow-Origin", "*")
      self.end_headers()
      print("inside do_GET")
      
      try:
        with open("./src/data/chats.json") as file:
          data = json.load(file)
          print(data)

        self.wfile.write(
          json.dumps(data['Questions']).encode()
        )
      except Exception as error:
        self.send_response(500)
        
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        self.wfile.write(
          json.dumps({
              "error": str(error)
          }).encode()
        )
    
  def do_OPTIONS(self):
    self.send_response(204)
    print("do_OPTIONS is OK.")
    self.send_header("Allow", "GET, POST, OPTIONS")
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    self.send_header("Access-Control-Allow-Headers", "Content-Type")
    self.end_headers()

  def do_POST(self):
    if self.path == "/chat":
      try:
        content_length = int(self.headers['Content-Length'])
        request_body = self.rfile.read(content_length)
  
        user_ques_data = json.loads(request_body)
        self.send_response(200)
        print("Data read - 200.")
        
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        self.send_response(200)
        with open("./src/data/chats.json") as file:
          data = json.load(file)

        if user_ques_data['question'] not in data['Questions']:
          data['Questions'].append(user_ques_data['question'])
        
        # print(data)
        with open("./src/data/chats.json", "w") as file:
          json.dump(data, file)

        print(user_ques_data)

        # Getting Image from PIXABAY 
        image_urls = self.get_image_url('MonaLisa')
        self.wfile.write(
          json.dumps(image_urls).encode("utf-8")
        )

        # Sending request to LLM
        url = URL
        headers = {
          "Authorization": f"Bearer {API_KEY}",
          "Content-Type": "application/json"
        }

        payload = {
          "model": "openai/gpt-4o",
          "messages": [{
            "role": "user",
            "content": user_ques_data['question']
          }],
          "stream": True
        }

        buffer = ""
        with requests.post(url, headers=headers, json=payload, stream=True) as r:
          for chunk in r.iter_content(chunk_size=1024, decode_unicode=True):
            buffer += chunk
            while True:
              try:
                # Find the next complete SSE line
                line_end = buffer.find('\n')
                if line_end == -1:
                  break

                line = buffer[:line_end].strip()
                buffer = buffer[line_end + 1:]

                # Skip SSE comments (lines starting with ":"), e.g. the
                # ": OPENROUTER PROCESSING" keep-alive — they are not JSON
                if line.startswith(':'):
                  continue

                if line.startswith('data: '):
                  data = line[6:]
                  if data == '[DONE]':
                    break

                  try:
                    
                    data_obj = json.loads(data)
                    content = data_obj["choices"][0]["delta"].get("content")
                    if content:
                      print(content, end="", flush=True)
                      self.wfile.write(content.encode("utf-8"))
                      
                  except json.JSONDecodeError:
                    pass

                  
              except Exception:
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
        self.send_response(500)

        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        self.wfile.write(
          json.dumps({
              "error": str(error)
          }).encode()
        )

  # get JSON data w/ API and extract image URL
  # Using Pixabay
  def get_image_url(self, query):
    data = []
    # print("Inside get img urls")
    base_url = f"https://pixabay.com/api/?key={img_urls_key}&image_type=photo&safesearch=true&q="
    try:
      api_res = requests.get(base_url + query).json()
      for item in api_res['hits']:
        data.append(item['largeImageURL'])
        print(item['largeImageURL'])
    except Exception as exc:
      print("Error:", exc)
      data = None

    return data


server = HTTPServer((HOST, PORT), handler)
print(f"Listening on PORT: {PORT}")

server.serve_forever()
server.server_close()
print("Server stopped!")