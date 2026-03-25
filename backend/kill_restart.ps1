$port = 5000
$pids = (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($pids) {
    foreach ($pid in $pids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "Killed process $pid on port $port"
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "No process found on port $port"
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'g:\Task App\backend'; npm start" -WindowStyle Normal
Write-Host "Backend restarted in new window"
