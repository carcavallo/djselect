<?php

namespace util;

use SendGrid\Mail\Mail;
use Exception;

class SendGridMailer
{
    private $sendGrid;

    public function __construct(string $apiKey)
    {
        $this->sendGrid = new \SendGrid($apiKey);
    }

    public function sendEmailNotification(string $toEmail, string $subject, string $content)
    {
        $email = new Mail();
        $email->setFrom("alessiopirovino@gmail.com", "DJSELECT");
        $email->setSubject($subject);
        $email->addTo($toEmail);
        $email->addContent("text/html", $content);

        try {
            $response = $this->sendGrid->send($email);
        } catch (Exception $e) {
            error_log("Email could not be sent. Error: {$e->getMessage()}");
        }
    }
}
