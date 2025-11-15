# Manual Windows Port Forwarding Setup

## Option 1: Run script with bypass

In PowerShell as Administrator, run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-lan-access.ps1
```

## Option 2: Run commands manually

In PowerShell as Administrator, run these commands one by one:

### Step 1: Get WSL IP
```powershell
$wslIP = (wsl hostname -I).Trim()
Write-Host "WSL IP: $wslIP"
```

### Step 2: Forward port 3001
```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=$wslIP connectport=3001
```

### Step 3: Allow through Windows Firewall
```powershell
New-NetFirewallRule -DisplayName "WSL Backend Port 3001" -Description "Allow inbound traffic on port 3001 for WSL backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### Step 4: Verify
```powershell
# Check port forwarding
netsh interface portproxy show all

# Get your Windows IP on LAN
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.*" } | Select-Object IPAddress
```

## Quick One-Liner (PowerShell as Admin)

```powershell
$wslIP = (wsl hostname -I).Trim(); netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=$wslIP connectport=3001; New-NetFirewallRule -DisplayName "WSL Backend Port 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

## After Setup

1. Make sure backend is running in WSL: `cd backend && npm start`
2. Access from Windows: `http://localhost:3001/api/readings`
3. Access from LAN devices: `http://<YOUR_WINDOWS_IP>:3001/api/readings`

Get your Windows IP with: `ipconfig | findstr "192"`
