npm i && npm run build && move build htdocs && rmdir /s /q C:\xampp\htdocs && move htdocs C:\xampp && cd server && npm i && npm i && set BUILD_ID=dontKillMe && set JENKINS_NODE_COOKIE=dontKillMe && forever stopall && forever start index.js