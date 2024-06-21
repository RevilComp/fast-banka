@echo off
npm i && npm run build && move build htdocs && rmdir /s /q C:\xampp\htdocs && move htdocs C:\xampp
pause