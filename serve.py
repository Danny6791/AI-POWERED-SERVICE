#!/usr/bin/env python3
import http.server, socketserver, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("Serving SERVICECRAFT at http://0.0.0.0:8080")
socketserver.TCPServer.allow_reuse_address = True
httpd = socketserver.TCPServer(("0.0.0.0", 8080), http.server.SimpleHTTPRequestHandler)
httpd.serve_forever()
