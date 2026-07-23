$hostName = "13.140.153.222"
$user = "root"
$password = "fco8523al"

# Create process with redirected I/O
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "ssh"
$psi.Arguments = "-o StrictHostKeyChecking=no $user@$hostName"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $true

$proc = [System.Diagnostics.Process]::Start($psi)

# Wait for password prompt
Start-Sleep -Seconds 5
$proc.StandardInput.WriteLine($password)
$proc.StandardInput.Flush()

Start-Sleep -Seconds 3

# Run commands
$commands = @(
    "git clone https://github.com/fco701115/webvermart.git /var/www/webvermart",
    "echo CLONE_DONE",
    "exit"
)

foreach ($cmd in $commands) {
    $proc.StandardInput.WriteLine($cmd)
    $proc.StandardInput.Flush()
    Start-Sleep -Seconds 2
}

$proc.WaitForExit(30000)

Write-Host "=== STDOUT ==="
Write-Host $proc.StandardOutput.ReadToEnd()
Write-Host "=== STDERR ==="
Write-Host $proc.StandardError.ReadToEnd()
