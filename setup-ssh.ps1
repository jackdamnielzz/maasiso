$password = "Niekties@100"
$sshKey = "sh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGKCYlSHmEduLa2LX23B2LcjxLcmV6waDFyK2i64ft56 niels@PCNiels"

$command = "mkdir -p ~/.ssh && echo '$sshKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

$password | ssh root@147.93.62.188 $command