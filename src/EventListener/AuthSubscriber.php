<?php


namespace App\EventListener;


use App\Controller\TokenAuthenticatedController;
use App\Lib\LibUser;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\KernelEvents;

class AuthSubscriber implements EventSubscriberInterface
{
  private $user;

  public function __construct(LibUser $user)
  {
    $this->user = $user;
  }

  public function onKernelController(ControllerEvent $event)
  {
    $controller = $event->getController();
    if (!is_array($controller)) {
      return;
    }

    if ($controller[0] instanceof TokenAuthenticatedController) {
      $key = $event->getRequest()->headers->get('key');

      if (!$this->user->checkAuth($key)) {
        throw new AccessDeniedHttpException('This action needs a valid token!');
      }
    }
  }

  public static function getSubscribedEvents()
  {
    return [
        KernelEvents::CONTROLLER => 'onKernelController',
    ];
  }
}