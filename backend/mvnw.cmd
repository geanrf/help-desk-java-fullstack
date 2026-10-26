@echo off
setlocal

set "MVNW_MAVEN_VERSION=3.9.12"
set "MVNW_MAVEN_CMD="

if defined MAVEN_HOME if exist "%MAVEN_HOME%\bin\mvn.cmd" set "MVNW_MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd"

if not defined MVNW_MAVEN_CMD for /f "delims=" %%I in ('where mvn.cmd 2^>nul') do if not defined MVNW_MAVEN_CMD set "MVNW_MAVEN_CMD=%%I"

if not defined MVNW_MAVEN_CMD for /d %%D in ("%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MVNW_MAVEN_VERSION%-bin\*") do if exist "%%~fD\apache-maven-%MVNW_MAVEN_VERSION%\bin\mvn.cmd" set "MVNW_MAVEN_CMD=%%~fD\apache-maven-%MVNW_MAVEN_VERSION%\bin\mvn.cmd"

if not defined MVNW_MAVEN_CMD (
    echo Maven %MVNW_MAVEN_VERSION% nao foi encontrado no PATH, MAVEN_HOME ou cache local. 1>&2
    echo Downloads automaticos estao desabilitados neste projeto. 1>&2
    exit /b 1
)

call "%MVNW_MAVEN_CMD%" "-Dmaven.repo.local=%USERPROFILE%\.m2\repository" %*
exit /b %ERRORLEVEL%
