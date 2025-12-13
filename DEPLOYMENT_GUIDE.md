#  Eco-Vault 360 - Deployment Guide

## Running on Different Devices

### Option 1: Run on Your Local Machine

```powershell
# Windows (PowerShell)
cd C:\Users\singh
python app.py
```

Then open browser: **http://localhost:5000**

### Option 2: Run on Another Device (Same Network)

**Step 1: Find Your Machine's IP Address**

Windows:
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

Mac/Linux:
```bash
ifconfig
```

**Step 2: Transfer Files to Remote Device**

Copy these files to the remote device:
- `index.html`
- `script.js`
- `style.css`
- `app.py`
- `requirements.txt`

**Step 3: Install Dependencies on Remote Device**

```bash
pip install -r requirements.txt
```

**Step 4: Run Flask Server**

```bash
python app.py
```

**Step 5: Access from Any Device**

From your local machine or any device on the network:
```
http://<remote-machine-ip>:5000
```

Example:
```
http://192.168.1.100:5000
```

### Option 3: Deploy to Cloud (AWS, Heroku, Render)

#### Heroku Deployment (Free)

1. Create a `Procfile` in the project root:
```
web: python app.py
```

2. Create `runtime.txt`:
```
python-3.10.0
```

3. Initialize Git and push:
```bash
git init
git add .
git commit -m "Deploy Eco-Vault 360"
heroku login
heroku create eco-vault-360
git push heroku main
```

4. Access at: `https://eco-vault-360.herokuapp.com`

---

## Troubleshooting

### Port 5000 Already in Use?

```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux

# Kill it
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Can't Access from Other Device?

1. Check firewall allows port 5000
2. Verify machines are on same network
3. Use `ping <ip-address>` to test connectivity
4. Check Flask is running on `0.0.0.0` (not `localhost`)

### Module Not Found?

```bash
pip install -r requirements.txt
```

---

## Key Points

 Flask serves all frontend files (HTML, CSS, JS)  
 Backend API handles data persistence  
 Network-accessible on port 5000  
 Works on Windows, Mac, Linux, and cloud platforms  
 Perfect for demos, presentations, and collaboration  

---

**Happy deploying! **
