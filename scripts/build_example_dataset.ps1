param(
  [string]$Source = "..\data\finalized\probe_dialects.jsonl",
  [string]$Output = "data\vialectbench-example-32.jsonl"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Source))
$outputPath = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $Output))

if (-not (Test-Path -LiteralPath $sourcePath)) {
  throw "Source dataset not found: $sourcePath"
}

$utf8 = [System.Text.UTF8Encoding]::new($false, $true)
$rows = [System.IO.File]::ReadLines($sourcePath, $utf8) | ForEach-Object { $_ | ConvertFrom-Json }
$tasks = @("mcqa", "nli", "qa", "sentiment")
$selected = foreach ($task in $tasks) {
  @($rows | Where-Object { $_.task -eq $task } | Select-Object -First 8)
}

if (@($selected).Count -ne 32) {
  throw "Expected 32 examples (8 per task), found $(@($selected).Count)."
}

$outputDirectory = Split-Path -Parent $outputPath
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$lines = $selected | ForEach-Object { $_ | ConvertTo-Json -Depth 30 -Compress }
[System.IO.File]::WriteAllLines($outputPath, $lines, $utf8)

Write-Output "Wrote 32 public examples to $outputPath"
