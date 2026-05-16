param(
  [int]$Port = 4173,
  [switch]$Rebuild,
  [switch]$Kill
)

$nodePath = (Get-Command node).Source
$vitePath = Resolve-Path "node_modules/vite/bin/vite.js"

if ($Kill) {
  $conn = netstat -ano | Select-String ":$Port\s"
  if ($conn) {
    $procId = ($conn.Line -split '\s+')[-1]
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Write-Output "killed PID $procId on port $Port"
  } else {
    Write-Output "no process on port $Port"
  }
  exit 0
}

if ($Rebuild) {
  npm run build 2>&1 | Out-Null
  Copy-Item dist/index.html dist/404.html -Force
}

$proc = Start-Process -FilePath $nodePath -ArgumentList $vitePath, "preview", "--port", $Port -NoNewWindow -PassThru

$maxWait = 10
$elapsed = 0
while ($elapsed -lt $maxWait) {
  $conn = netstat -ano | Select-String ":$Port\s.*LISTENING"
  if ($conn) {
    Write-Output "ready PID $($proc.Id)"
    exit 0
  }
  Start-Sleep -Seconds 1
  $elapsed++
}

Write-Error "timeout: server not ready in ${maxWait}s"
exit 1
