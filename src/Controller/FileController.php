<?php

namespace App\Controller;


use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;


class FileController extends AbstractController
{
  public function uploadFile(Request $request, ParameterBagInterface $params)
  {
    $message = "";

    $fileDir = $params->get('FILE_DIRECTORY');
    $file = $request->files->get('file');


    try {
      $date = date("Y-m-d");
      $dir = $fileDir.'/'.$date.'/';

      $tmpfile = tempnam($dir, date('U'));
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

}
