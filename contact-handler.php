<?php
// Enable error reporting based on server settings
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_log("Contact form handler started");

// Set headers for JSON response
header('Content-Type: application/json');

// Log incoming request
error_log("Received " . $_SERVER['REQUEST_METHOD'] . " request");
error_log("POST data: " . print_r($_POST, true));

// Main script execution
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get and sanitize form data
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
    
    error_log("Sanitized form data - Name: $name, Email: $email, Subject: $subject");
    
    // Validate required fields
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        error_log("Validation failed - missing required fields");
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Alle verplichte velden moeten ingevuld zijn'
        ]);
        exit;
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log("Validation failed - invalid email: $email");
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Ongeldig e-mailadres'
        ]);
        exit;
    }

    // Prepare email content
    $to = 'info@maasiso.nl';
    $email_subject = "Nieuw contactformulier: " . $subject;
    
    // Create email body
    $email_body = "Nieuw bericht via het contactformulier:\n\n";
    $email_body .= "Naam: " . $name . "\n";
    $email_body .= "E-mail: " . $email . "\n";
    if (!empty($phone)) {
        $email_body .= "Telefoon: " . $phone . "\n";
    }
    $email_body .= "Onderwerp: " . $subject . "\n\n";
    $email_body .= "Bericht:\n" . $message . "\n";

    // Set email headers
    $headers = array(
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'From: MaasISO Website <website@maasiso.nl>',
        'Reply-To: ' . $name . ' <' . $email . '>',
        'X-Mailer: PHP/' . phpversion()
    );

    // Convert headers array to string
    $headers_string = implode("\r\n", $headers);

    error_log("Attempting to send email to: $to");
    error_log("Email headers: " . print_r($headers, true));

    // Log mail configuration
    error_log("PHP mail configuration:");
    error_log("sendmail_path: " . ini_get('sendmail_path'));
    error_log("SMTP: " . ini_get('SMTP'));
    error_log("smtp_port: " . ini_get('smtp_port'));

    // Attempt to send email
    $mail_sent = mail($to, $email_subject, $email_body, $headers_string);

    if ($mail_sent) {
        error_log("Email sent successfully");
        echo json_encode([
            'status' => 'success',
            'message' => 'Uw bericht is succesvol verzonden'
        ]);
    } else {
        error_log("Failed to send email - mail() returned false");
        $error = error_get_last();
        error_log("Last error: " . print_r($error, true));
        
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Er is een probleem opgetreden bij het verzenden van uw bericht'
        ]);
    }
} else {
    error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method Not Allowed'
    ]);
}
?>



