#!/bin/bash
echo "=== Current WSL Setup ==="
echo ""
echo "WSL IP Address:"
hostname -I | awk '{print $1}'
echo ""
echo "Backend is listening on:"
netstat -tlnp 2>/dev/null | grep ":3001" || ss -tlnp 2>/dev/null | grep ":3001"
echo ""
echo "To set up Windows port forwarding, run in PowerShell as Administrator:"
echo "  .\setup-lan-access.ps1"
