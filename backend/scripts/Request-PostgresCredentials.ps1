[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $SecretPath,
    [switch] $DatabaseOnly
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

try {
    Write-Host ''
    Write-Host 'Help Desk - coleta segura de credenciais PostgreSQL' -ForegroundColor Cyan
    Write-Host 'Nenhuma conexao com o banco ou migration sera executada.'
    Write-Host ''

    if (Test-Path -LiteralPath $SecretPath) {
        throw 'Ja existe um arquivo temporario de credenciais. Nada foi sobrescrito.'
    }

    $databasePassword = Read-RequiredSecureString 'Senha do usuario PostgreSQL helpdesk_app'
    $adminPassword = $null

    if (-not $DatabaseOnly) {
        do {
            $adminPassword = Read-RequiredSecureString 'Defina a senha do ADMIN (minimo 12 caracteres)'
            $adminPasswordConfirmation = Read-RequiredSecureString 'Confirme a senha do ADMIN'
            $adminPlainText = ConvertTo-PlainText $adminPassword
            $adminConfirmationPlainText = ConvertTo-PlainText $adminPasswordConfirmation

            if ($adminPlainText.Length -lt 12) {
                Write-Host ''
                Write-Host 'Erro: a senha do ADMIN deve ter pelo menos 12 caracteres.' -ForegroundColor Red
                Write-Host 'Tente novamente; a janela permanecera aberta.' -ForegroundColor Yellow
                Write-Host ''
            }
            elseif ($adminPlainText -cne $adminConfirmationPlainText) {
                Write-Host ''
                Write-Host 'Erro: a confirmacao da senha do ADMIN nao confere.' -ForegroundColor Red
                Write-Host 'Tente novamente; a janela permanecera aberta.' -ForegroundColor Yellow
                Write-Host ''
            }
        } while ($adminPlainText.Length -lt 12 -or $adminPlainText -cne $adminConfirmationPlainText)
    }

    $adminPlainText = $null
    $adminConfirmationPlainText = $null

    [pscustomobject]@{
        DatabasePassword = $databasePassword
        AdminPassword = $adminPassword
        CreatedAt = [DateTimeOffset]::Now
    } | Export-Clixml -LiteralPath $SecretPath -NoClobber

    Write-Host ''
    Write-Host 'Credenciais recebidas e protegidas pelo Windows.' -ForegroundColor Green
    Write-Host 'O backend e o banco nao foram acessados.' -ForegroundColor Green
}
catch {
    Write-Host ''
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'Nenhuma credencial existente foi sobrescrita.' -ForegroundColor Yellow
}
finally {
    $adminPlainText = $null
    $adminConfirmationPlainText = $null
}

Write-Host ''
Read-Host 'Pressione Enter para fechar esta janela'
