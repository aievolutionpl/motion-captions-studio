$ErrorActionPreference = 'Stop'
$studioRoot = Split-Path -Parent $PSScriptRoot
$env:FABLECUT_DATA_DIR = [System.IO.Path]::GetFullPath((Join-Path $studioRoot '../local-data'))
$env:PORT = '7788'
Push-Location $studioRoot
try { & node server.js } finally { Pop-Location }
