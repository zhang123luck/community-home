@echo off
chcp 65001 >nul
title 社区家园 - 本地开发服务（前端 + 后端）
cd /d "%~dp0"
echo ============================================================
echo   社区家园（翡翠花园小区）本地开发模式
echo.
echo   居民端小程序：http://localhost:5173
echo   物业管理后台：http://localhost:5173/admin.html
echo                  默认账号 root / 密码 12345
echo   后端接口：    http://localhost:3001/api/health
echo.
echo   关闭此窗口即可停止全部服务（请只开一个窗口）
echo ============================================================
echo.
call npm run dev:all
pause
