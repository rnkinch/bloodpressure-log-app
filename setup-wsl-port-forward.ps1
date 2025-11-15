# PowerShell script to forward Windows port 3001 to WSL
# Run this in PowerShell as Administrator

$wslIP = (wsl hostname -I).Trim()
$port = 3001

Write-Host "WSL IP Address: $wslIP"
Write-Host "Forwarding Windows port $port to WSL port $port"

# Remove existing port forwarding rule if it exists
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=$port 2>$null

# Add port forwarding rule
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$port connectaddress=$wslIP connectport=$port

# Show the rule
netsh interface portproxy show all

Write-Host "`nPort forwarding configured successfully!"
Write-Host "The backend will be accessible from other devices on your LAN at:"
Write-Host "  http://<YOUR_WINDOWS_IP>:3001"
Write-Host "`nNote: You may need to allow port $port through Windows Firewall"
Write-Host "Run this command in PowerShell as Admin if needed:"
Write-Host "  New-NetFirewallRule -DisplayName 'WSL Backend Port 3001' -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow"

