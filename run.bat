nginx -s stop
ping -n 2 127.0.0.1>nul
start nginx
start java -server -Xms256m -Xmx256m -jar -Dfile.encoding=utf-8 RSServer.jar
