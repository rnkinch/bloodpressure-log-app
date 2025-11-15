#!/bin/bash
# Bash script to get WSL IP and show Windows commands for port forwarding

echo "WSL IP Address:"
WSL_IP=$(hostname -I | awk '{print $1}')
echo "$WSL_IP"
echo ""
echo "To forward Windows port 3001 to WSL, run this in PowerShell as Administrator:"
echo ""
echo "netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=$WSL_IP connectport=3001"
echo ""
echo "To remove the forwarding rule later:"
echo "netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3001"
echo ""
echo "To allow through Windows Firewall (run in PowerShell as Admin):"
echo "New-NetFirewallRule -DisplayName 'WSL Backend Port 3001' -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow"

