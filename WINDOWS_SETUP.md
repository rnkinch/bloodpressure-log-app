# WSL Port Forwarding Setup for LAN Access

## The Problem
WSL runs on a virtual network (172.x.x.x) separate from Windows LAN (192.x.x.x). To access the backend from other devices on your LAN, you need to forward Windows port 3001 to WSL.

## Quick Setup (Run in PowerShell as Administrator)

### Step 1: Get WSL IP
```powershell
wsl hostname -I
```
You should see something like `172.30.184.138`

### Step 2: Forward Port 3001
```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=172.30.184.138 connectport=3001
```
Replace `172.30.184.138` with your actual WSL IP from Step 1.

### Step 3: Allow Through Firewall
```powershell
New-NetFirewallRule -DisplayName "WSL Backend Port 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### Step 4: Verify
```powershell
# Check port forwarding rules
netsh interface portproxy show all

# Get your Windows IP on the LAN
ipconfig | findstr "192"
```

### Step 5: Test
From Windows: `http://localhost:3001/api/readings`
From another device on LAN: `http://<YOUR_WINDOWS_IP>:3001/api/readings`

## Troubleshooting

### Port forwarding not working?
1. Make sure you ran PowerShell **as Administrator**
2. Check if rule exists: `netsh interface portproxy show all`
3. Remove and re-add: 
   ```powershell
   netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=3001
   netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3001 connectaddress=<WSL_IP> connectport=3001
   ```

### Firewall blocking?
```powershell
# Check firewall rules
Get-NetFirewallRule -DisplayName "*WSL*" | Format-Table DisplayName, Enabled, Direction, Action
```

### WSL IP Changed?
WSL IP can change after reboot. Run `wsl hostname -I` again and update the port forwarding rule.

## Alternative: Run Backend on Windows
If port forwarding is too problematic, you can run the backend directly on Windows:
1. Install Node.js on Windows
2. Copy the `backend` folder to Windows
3. Run `npm install` and `npm start` from Windows PowerShell

