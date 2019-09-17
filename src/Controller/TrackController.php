<?php

namespace App\Controller;


use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;


class TrackController extends AbstractController
{
  public function uploadFile(Request $request, ParameterBagInterface $params)
  {
    $message = "";

    $fileDir = $params->get('FILE_DIRECTORY');
    $file = $request->files->get('file');


    try {
      $key = 'KEY';
      $date = date("Y-m-d");
      $dir = $fileDir.'/'.$date.'/';


      $tmpfile = tempnam($dir, uniqid());
      unlink($tmpfile);
      $pieces = explode("/", $tmpfile);
      $filename = array_pop($pieces);

      $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
      $safeFileName = $filename.'.'.$file->guessExtension();


      $filesystem = new Filesystem();


      if (!$filesystem->exists($dir)) {
        $filesystem->mkdir($dir);
      };

      $file->move($dir, $safeFileName);
    } catch (FileException $exception) {
      $message = $exception;
    }

    return $this->json(['status' => "OK", 'message' => $message, 'data' => []]);
  }

  public function downloadFile(Request $request, $fileName, ParameterBagInterface $params) {

    $fileDir = $params->get('FILE_DIRECTORY');

    $pieces = explode("-", $fileName);
    $date = date("Y-m-d", array_shift($pieces));

    $file = $fileDir.'/'.$date.'/'.$fileName;

    $response = new BinaryFileResponse($file);
    return $response;

  }

}
