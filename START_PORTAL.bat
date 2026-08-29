@echo off
title Burhani Tutorials — Board Form Portal
echo ========================================================
echo   BURHANI TUTORIALS — BOARD FORM & DOCUMENT PORTAL
echo   30+ Years of Excellence in Teaching
echo ========================================================
echo.
echo [1/2] Starting Express + MongoDB Backend API on http://localhost:5000...
start cmd /k "cd server && npm start"

echo.
echo [2/2] Starting React (Vite) Frontend on http://localhost:5173...
start cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo  All services started!
echo  Student Portal: http://localhost:5173
echo  Admin Portal:   http://localhost:5173/admin/login
echo  Admin User:     yusufali
echo  Admin Pass:     yusufali@4486
echo ========================================================
echo.
pause
