<?php


namespace App\EventListener;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

class CORSListener extends AbstractController
{
  public function onKernelResponse(ResponseEvent $event)
  {
    $response = $event->getResponse();
    $response->headers->set('Access-Control-Allow-Origin', '*');

  }
}