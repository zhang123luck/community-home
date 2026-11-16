@echo off
chcp 65001 >nul
title 推送到 GitHub
cd /d "%~dp0"
echo ============================================================
echo   把「社区家园」推送到你的 GitHub 仓库
echo   先在 https://github.com/new 新建一个仓库（不要勾选 README）
echo   仓库名建议：community-home
echo ============================================================
echo.
set /p REPO=请粘贴仓库地址（例如 https://github.com/zhang123luck/community-home.git）:
if "%REPO%"=="" goto empty
echo.
git remote remove origin 2>nul
git remote add origin %REPO%
echo 正在推送，如果弹出登录窗口请登录你的 GitHub 账号...
echo.
git push -u origin main
if errorlevel 1 goto failed
echo.
echo ============================================================
echo   推送成功！
echo   下一步：打开仓库 - Settings - Pages
echo   Build and deployment 的 Source 选择 GitHub Actions
echo   等 1-2 分钟后访问 https://你的用户名.github.io/community-home/
echo ============================================================
pause
exit /b 0

:empty
echo 没有输入仓库地址，已取消。
pause
exit /b 1

:failed
echo.
echo 推送失败，常见原因：
echo   1. 仓库地址填错（要以 .git 结尾）
echo   2. 没有登录 GitHub，或没有权限
echo   3. 网络问题，可重试一次
pause
exit /b 1
