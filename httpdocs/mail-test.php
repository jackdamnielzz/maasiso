<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log function
function log_message($message) {
    $log_file = 'mail-test.log';
    $timestamp = date('[Y-m-d H:i:s]');
    file_put_contents($log_file, "{$timestamp} {$message}\n", FILE_APPEND);
}

// Test email parameters
$to = 'info@maasiso.nl';
$subject = 'Test Email from PHP';
$message = 'This is a test email sent from PHP mail() function.';
$headers = 'From: info@maasiso.nl' . "\r\n" .
    'Reply-To: info@maasiso.nl' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

// Log attempt
log_message("Attempting to send test email to {$to}");

// Try to send email
$result = mail($to, $subject, $message, $headers);

// Log result
if ($result) {
    log_message("Email sent successfully");
    echo json_encode(['status' => 'success', 'message' => 'Test email sent successfully']);
} else {
    log_message("Failed to send email");
    echo json_encode(['status' => 'error', 'message' => 'Failed to send test email']);
}

// Log PHP mail configuration
log_message("PHP mail configuration:");
log_message("sendmail_path: " . ini_get('sendmail_path'));
log_message("SMTP: " . ini_get('SMTP'));
log_message("smtp_port: " . ini_get('smtp_port'));
?>
