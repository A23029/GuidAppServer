@echo off
REM このバッチファイルが置かれているディレクトリに移動
cd /d %~dp0
REM サーバーを起動
node server.js
pause

