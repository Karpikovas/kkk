<?php


namespace App\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class SiteController extends AbstractController
{
  public function index() {

    return $this->render(
        'site/index.html.twig', []
    );
  }

}
