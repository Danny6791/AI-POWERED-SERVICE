#!/usr/bin/env python3
"""Simple HTTP server for the example website."""
import http.server
import socketserver
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = 8080
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving Nexus AI website at http://0.0.0.0:{PORT}")
    httpd.serve_forever()
