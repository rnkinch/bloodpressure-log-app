# Complete setup script for WSL backend LAN access
# MUST run as Administrator in PowerShell

Write-Host "=== WSL Backend LAN Access Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Get WSL IP
Write-Host "Getting WSL IP address..." -ForegroundColor Yellow
$wslIP = (wsl hostname -I).Trim()
if (-not $wslIP) {
    Write-Host "ERROR: Could not get WSL IP. Is WSL running?" -ForegroundColor Red
    exit 1
}
Write-Host "WSL IP: $wslIP" -ForegroundColor Green

# Get Windows IPs on 192 subnet
Write-Host ""
Write-Host "Getting Windows IP addresses on 192.x.x.x subnet..." -ForegroundColor Yellow
$windowsIPs = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.*" } | Select-Object -ExpandProperty IPAddress
if ($windowsIPs) {
    Write-Host "Windows IPs on LAN:" -ForegroundColor Green
    foreach ($ip in $windowsIPs) {
        Write-Host "  $ip" -ForegroundColor Green
    }
} else {
    Write-Host "WARNING: No 192.x.x.x IP found. Are you connected to a network?" -ForegroundColor Yellow
}

$backendPort = 3001
$frontendPort = 3000

# Remove existing rules
Write-Host ""
Write-Host "Removing existing port forwarding rules (if any)..." -ForegroundColor Yellow
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=$backendPort 2>$null
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=$frontendPort 2>$null

# Add IPv4 forwarding for backend
Write-Host "Adding IPv4 port forwarding for backend (port $backendPort)..." -ForegroundColor Yellow
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$backendPort connectaddress=$wslIP connectport=$backendPort

# Add IPv4 forwarding for frontend
Write-Host "Adding IPv4 port forwarding for frontend (port $frontendPort)..." -ForegroundColor Yellow
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$frontendPort connectaddress=$wslIP connectport=$frontendPort

if ($LASTEXITCODE -eq 0) {
    Write-Host "Port forwarding configured!" -ForegroundColor Green
} else {
    Write-Host "Failed to configure port forwarding" -ForegroundColor Red
    exit 1
}

# Verify the rules
Write-Host ""
Write-Host "Verifying port forwarding rules..." -ForegroundColor Yellow
$backendRule = netsh interface portproxy show all | Select-String "$backendPort"
$frontendRule = netsh interface portproxy show all | Select-String "$frontendPort"
if ($backendRule -and $frontendRule) {
    Write-Host "Rules exist:" -ForegroundColor Green
    netsh interface portproxy show all | Select-String "$backendPort|$frontendPort" -Context 0,1
} else {
    Write-Host "Some rules not found!" -ForegroundColor Red
}

# Configure Windows Firewall
Write-Host ""
Write-Host "Configuring Windows Firewall..." -ForegroundColor Yellow

# Backend firewall rule
$backendFirewall = Get-NetFirewallRule -DisplayName "WSL Backend Port $backendPort" -ErrorAction SilentlyContinue
if ($backendFirewall) {
    Remove-NetFirewallRule -DisplayName "WSL Backend Port $backendPort" -ErrorAction SilentlyContinue
}
New-NetFirewallRule -DisplayName "WSL Backend Port $backendPort" -Description "Allow inbound traffic on port $backendPort for WSL backend" -Direction Inbound -LocalPort $backendPort -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

# Frontend firewall rule
$frontendFirewall = Get-NetFirewallRule -DisplayName "WSL Frontend Port $frontendPort" -ErrorAction SilentlyContinue
if ($frontendFirewall) {
    Remove-NetFirewallRule -DisplayName "WSL Frontend Port $frontendPort" -ErrorAction SilentlyContinue
}
New-NetFirewallRule -DisplayName "WSL Frontend Port $frontendPort" -Description "Allow inbound traffic on port $frontendPort for WSL frontend" -Direction Inbound -LocalPort $frontendPort -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

Write-Host "Firewall rules added!" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will be accessible from:" -ForegroundColor Yellow
Write-Host "  - Localhost: http://localhost:$backendPort/api/readings" -ForegroundColor Green
if ($windowsIPs) {
    foreach ($ip in $windowsIPs) {
        $lanUrl = "http://${ip}:${backendPort}/api/readings"
        Write-Host "  - LAN:      $lanUrl" -ForegroundColor Green
    }
}
Write-Host ""
Write-Host "Frontend will be accessible from:" -ForegroundColor Yellow
Write-Host "  - Localhost: http://localhost:$frontendPort" -ForegroundColor Green
if ($windowsIPs) {
    foreach ($ip in $windowsIPs) {
        $lanUrl = "http://${ip}:${frontendPort}"
        Write-Host "  - LAN:      $lanUrl" -ForegroundColor Green
    }
}
Write-Host ""
Write-Host "To test from another device on your LAN:" -ForegroundColor Yellow
Write-Host "  1. Make sure backend is running in WSL" -ForegroundColor White
Write-Host "  2. Access from another device using one of the LAN URLs above" -ForegroundColor White
Write-Host ""
Write-Host "Note: WSL IP may change after reboot. Run this script again if needed." -ForegroundColor Yellow
