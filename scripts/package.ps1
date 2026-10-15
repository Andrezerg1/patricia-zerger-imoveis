param(
    [Parameter(Mandatory = $true)][string]$OutputPath,
    [switch]$IncludeLocalConfig
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskOutput = [IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $taskOutput) { throw 'O pacote de destino já existe. Escolha outro nome para preservá-lo.' }
if ($IncludeLocalConfig -and !(Test-Path -LiteralPath (Join-Path $taskRoot 'private/config.php'))) { throw 'Configuração local não encontrada.' }
[IO.Directory]::CreateDirectory((Split-Path -Parent $taskOutput)) | Out-Null
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskArchive = [IO.Compression.ZipFile]::Open($taskOutput, [IO.Compression.ZipArchiveMode]::Create)
try {
    $taskDocs = Join-Path $taskRoot 'docs'
    foreach ($taskFile in Get-ChildItem -LiteralPath $taskDocs -Recurse -File -Force) {
        $taskRelative = [IO.Path]::GetRelativePath($taskDocs, $taskFile.FullName).Replace('\', '/')
        if ($taskRelative.StartsWith('uploads/') -and $taskRelative -ne 'uploads/.htaccess') { continue }
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskArchive, $taskFile.FullName, ('public_html/' + $taskRelative)) | Out-Null
    }
    foreach ($taskFile in Get-ChildItem -LiteralPath (Join-Path $taskRoot 'private') -File -Force) {
        if ($taskFile.Name -eq 'config.php' -and !$IncludeLocalConfig) { continue }
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($taskArchive, $taskFile.FullName, ('private/' + $taskFile.Name)) | Out-Null
    }
    $taskArchive.CreateEntry('private/data/') | Out-Null
} finally { $taskArchive.Dispose() }
Write-Output "Pacote criado: $taskOutput"
Write-Output "Configuração local incluída: $($IncludeLocalConfig.IsPresent). Catálogo de execução e fotos cadastradas não foram incluídos."
