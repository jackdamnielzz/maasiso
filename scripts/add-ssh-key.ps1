$sshKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEVqaO0Rs6c0AYj2ZyHxUTJE/VcbServXr/DVnEovVMI niels@PCNiels"
$command = "mkdir -p ~/.ssh && echo '$sshKey' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
$password = "[REDACTED_PASSWORD]"

# Create expect script to handle SSH password authentication
$expectScript = @"
spawn ssh root@147.93.62.188 "$command"
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    eof
}
"@

Set-Content -Path "add-key.exp" -Value $expectScript

# Run expect script
expect add-key.exp
Remove-Item add-key.exp