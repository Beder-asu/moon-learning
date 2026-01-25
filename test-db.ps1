$body = '{"courseId": "1", "amount": 29.99, "paymentMethod": "visa", "userId": "test123"}'
$result = Invoke-RestMethod -Uri "http://localhost:3000/api/payments" -Method POST -ContentType "application/json" -Body $body
$result | ConvertTo-Json | Out-File -FilePath "test-result.json"
Write-Host "Test completed! Check test-result.json"
