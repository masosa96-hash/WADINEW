$HookUrl = "https://api.render.com/deploy/srv-d4q7q2ggjchc73b7h2p0?key=w0SN6NdW8cY"
Invoke-RestMethod -Uri $HookUrl -Method Post
Write-Host "Deployment triggered successfully on Render!"
