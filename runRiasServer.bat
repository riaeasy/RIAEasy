rem needs java 8+

rem start java -server -Xms512m -Xmx512m -XX:MetaspaceSize=16m -XX:MaxMetaspaceSize=256m -Dfile.encoding=utf-8 -jar RSServer.jar
start java -server -Xms512m -Xmx512m -XX:MetaspaceSize=16m -XX:MaxMetaspaceSize=256m -jar RSServer.jar
