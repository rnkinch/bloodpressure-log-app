# Test and setup WSL port forwarding for backend
# Run in PowerShell as Administrator

Write-Host "=== WSL Port Forwarding Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get WSL IP
Write-Host "Getting WSL IP address..." -ForegroundColor Yellow
$wslIP = (wsl hostname -I).Trim()
Write-Host "WSL IP: $wslIP" -ForegroundColor Green
Write-Host ""

# Check existing port forwarding rules
Write-Host "Checking existing port forwarding rules for port 3001..." -ForegroundColor Yellow
$existing = netsh interface portproxy show all | Select-String "3001"
if ($existing) {
    Write-Host "Found existing rule:" -ForegroundColor Yellow
    netsh interface portproxy show all | Select-String "3001" -Context 0,2
    Write-Host ""
    Write-Host "Removing existing rule..." -ForegroundColor Yellow
    netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3001
}

# Add port forwarding
Write-Host "Adding port forwarding rule..." -ForegroundColor Yellow
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=$wslIP connectport=3001

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Port forwarding configured successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to configure port forwarding" -ForegroundColor Red
    exit 1
}

# Check Windows Firewall
Write-Host ""
Write-Host "Checking Windows Firewall..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "WSL Backend Port 3001" -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    Write-Host "Adding Windows Firewall rule..." -ForegroundColor Yellow
    New-NetFirewallRule -DisplayName "WSL Backend Port 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
    Write-Host "✓ Firewall rule added!" -ForegroundColor Green
} else {
    Write-Host "✓ Firewall rule already exists" -ForegroundColor Green
}

# Show current rules
Write-Host ""
Write-Host "=== Current Port Forwarding Rules ===" -ForegroundColor Cyan
netsh interface portproxy show all

Write-Host ""
Write-Host "=== Test from Windows ===" -ForegroundColor Cyan
Write-Host "Try accessing from Windows: http://localhost:3001/api/readings"
Write-Host ""
Write-Host "To access from other devices on your LAN:"
$windowsIPs = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.*" } | Select-Object -ExpandProperty IPAddress
foreach ($ip in $windowsIPs) {
    Write-Host "  http://$ip:3001/api/readings" -ForegroundColor Green
}

