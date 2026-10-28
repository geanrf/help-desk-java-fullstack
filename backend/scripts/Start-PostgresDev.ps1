[CmdletBinding()]
param(
    [switch] $BootstrapAdmin,
    [string] $AdminName = 'Administrador PostgreSQL',
    [string] $AdminEmail = 'admin@helpdesk.dev',
    [string] $SecretPath
)

$ErrorActionPreference = 'Stop'

function Read-RequiredSecureString {
    param([Parameter(Mandatory = $true)][string] $Prompt)

    do {
        $value = Read-Host $Prompt -AsSecureString
        if ($value.Length -eq 0) {
            Write-Host 'O valor nao pode ficar vazio. Tente novamente.' -ForegroundColor Yellow
        }
    } while ($value.Length -eq 0)

    return $value
}

function ConvertTo-PlainText {
    param([Parameter(Mandatory = $true)][Security.SecureString] $Value)

    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

Write-Host ''
Write-Host 'Help Desk - PostgreSQL de desenvolvimento' -ForegroundColor Cyan
Write-Host 'As senhas serao mantidas somente no processo atual e nao serao exibidas.'
Write-Host ''

$adminPassword = $null

if (-not [string]::IsNullOrWhiteSpace($SecretPath)) {
    if (-not (Test-Path -LiteralPath $SecretPath)) {
        throw 'O arquivo protegido de credenciais nao foi encontrado.'
    }

    $protectedCredentials = Import-Clixml -LiteralPath $SecretPath
    $databasePassword = $protectedCredentials.DatabasePassword
    $adminPassword = $protectedCredentials.AdminPassword

    if ($databasePassword -isnot [Security.SecureString]) {
        throw 'O arquivo protegido nao contem uma senha valida do PostgreSQL.'
    }
    if ($BootstrapAdmin -and $adminPassword -isnot [Security.SecureString]) {
        throw 'O arquivo protegido nao contem uma senha valida do ADMIN.'
    }
} else {
    $databasePassword = Read-RequiredSecureString 'Senha do usuario PostgreSQL helpdesk_app'

    if ($BootstrapAdmin) {
        do {
            $adminPassword = Read-RequiredSecureString 'Defina a senha do ADMIN inicial (minimo 12 caracteres)'
            $adminPasswordConfirmation = Read-RequiredSecureString 'Confirme a senha do ADMIN inicial'
            $adminPlainText = ConvertTo-PlainText $adminPassword
            $adminConfirmationPlainText = ConvertTo-PlainText $adminPasswordConfirmation

            if ($adminPlainText.Length -lt 12) {
                Write-Host 'A senha do ADMIN deve ter pelo menos 12 caracteres. Tente novamente.' -ForegroundColor Yellow
            }
            elseif ($adminPlainText -cne $adminConfirmationPlainText) {
                Write-Host 'A confirmacao da senha do ADMIN nao confere. Tente novamente.' -ForegroundColor Yellow
            }
        } while ($adminPlainText.Length -lt 12 -or $adminPlainText -cne $adminConfirmationPlainText)

        $adminPlainText = $null
        $adminConfirmationPlainText = $null
    }
}

$databasePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($databasePassword)
$adminPointer = if ($BootstrapAdmin) {
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($adminPassword)
} else {
    [IntPtr]::Zero
}

$jwtBytes = New-Object byte[] 48
$randomNumberGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
$randomNumberGenerator.GetBytes($jwtBytes)
$randomNumberGenerator.Dispose()

$environmentNames = @(
    'DB_URL',
    'DB_USERNAME',
    'DB_PASSWORD',
    'JWT_SECRET',
    'JWT_ISSUER',
    'CORS_ALLOWED_ORIGINS',
    'SPRING_PROFILES_ACTIVE',
    'APP_BOOTSTRAP_ADMIN_ENABLED',
    'APP_BOOTSTRAP_ADMIN_NAME',
    'APP_BOOTSTRAP_ADMIN_EMAIL',
    'APP_BOOTSTRAP_ADMIN_PASSWORD',
    'DEBUG'
)
$originalEnvironment = @{}
$environmentNames | ForEach-Object {
    $originalEnvironment[$_] = [Environment]::GetEnvironmentVariable($_, 'Process')
}

$backendDirectory = Split-Path -Parent $PSScriptRoot

try {
    $env:DB_URL = 'jdbc:postgresql://127.0.0.1:5432/helpdesk_db'
    $env:DB_USERNAME = 'helpdesk_app'
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($databasePointer)
    $env:JWT_SECRET = [Convert]::ToBase64String($jwtBytes)
    $env:JWT_ISSUER = 'help-desk-postgres-dev'
    $env:CORS_ALLOWED_ORIGINS = 'http://localhost:5174,http://127.0.0.1:5174'
    $env:SPRING_PROFILES_ACTIVE = 'postgres-dev'
    $env:APP_BOOTSTRAP_ADMIN_ENABLED = $BootstrapAdmin.ToString().ToLowerInvariant()
    $env:APP_BOOTSTRAP_ADMIN_NAME = $AdminName
    $env:APP_BOOTSTRAP_ADMIN_EMAIL = $AdminEmail
    $env:DEBUG = 'false'

    if ($BootstrapAdmin) {
        $env:APP_BOOTSTRAP_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($adminPointer)
    } else {
        Remove-Item Env:APP_BOOTSTRAP_ADMIN_PASSWORD -ErrorAction SilentlyContinue
    }

    Push-Location $backendDirectory
    try {
        & '.\mvnw.cmd' spring-boot:run
        if ($LASTEXITCODE -ne 0) {
            throw "O backend terminou com codigo $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    $environmentNames | ForEach-Object {
        if ($null -eq $originalEnvironment[$_]) {
            Remove-Item "Env:$_" -ErrorAction SilentlyContinue
        } else {
            Set-Item "Env:$_" $originalEnvironment[$_]
        }
    }

    [Array]::Clear($jwtBytes, 0, $jwtBytes.Length)
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($databasePointer)
    if ($adminPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($adminPointer)
    }
}
