import http.server
import socketserver
import webbrowser
import os

# 设置端口
PORT = 8080

# 设置当前工作目录到包含index.html文件的目录
web_dir = os.path.join(os.path.dirname(__file__), 'web')
os.chdir(web_dir)

print(web_dir)

# 创建一个处理程序
Handler = http.server.SimpleHTTPRequestHandler

# 创建服务器对象
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    # 自动在默认浏览器中打开网页
    webbrowser.open(f"http://localhost:{PORT}")
    # 开始服务器
    httpd.serve_forever()
