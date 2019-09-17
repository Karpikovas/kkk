<?php

namespace App\Controller;


use App\Lib\LibTrack;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;


class TrackController extends AbstractController
{
  public function uploadFile(Request $request, ParameterBagInterface $params, LibTrack $track)
  {


    $fileDir = $params->get('FILE_DIRECTORY');
    $file = $request->files->get('file');


    $key = 'KEY';
    $date = date("Y-m-d");
    $datetime = date("Y-m-d h:m:s");
    $dir = $fileDir.'/'.$date.'/';


    $tmpfile = @tempnam($dir, uniqid());
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

    $path = $date.'/'.$safeFileName;

    $track->addNewTrack($originalFilename, $path, $datetime, NULL);

    return $this->json(['status' => "OK", 'message' => [], 'data' => []]);
  }

  public function updateFileInfo(Request $request, $fileID, ParameterBagInterface $params, LibTrack $track)
  {
    $comment = $request->request->get('comment');

    $tags = $request->request->get('tags');
    if ($tags) {
      $tags = explode(',', $tags);
//      $tagsArray = [];
//      foreach ($tags as $tag) {
//
//        $tagsArray[] = [
//            "name"=> $tag
//        ];
//      }
    }

    $currentTags = [];
    foreach ($track->getTagsByID($fileID) as $tag) {
      $currentTags[] = $tag["name"];
    }
    //$currentTags = array_values($track->getTagsByID($fileID));


    $newTags = array_values(array_diff($tags, $currentTags));
    $deletedTags = array_values(array_diff($currentTags, $tags));

    $track->updateTrackByID($fileID,  $comment);

    return $this->json(['status' => "OK", 'message' => [], 'data' => [$deletedTags]]);
  }

  /*
   * получение аудио по id в БД
   * */
  public function downloadFile($fileID, ParameterBagInterface $params, LibTrack $track)
  {

    $fileDir = $params->get('FILE_DIRECTORY');
    $path = $track->getTrackPathByID($fileID);


    $file = $fileDir.'/'.$path[0]["path"];

    $response = new BinaryFileResponse($file);
    return $response;

  }

  public function deleteFile(ParameterBagInterface $params, $fileID, LibTrack $track)
  {

    $fileDir = $params->get('FILE_DIRECTORY');
    $path = $track->getTrackPathByID($fileID);

    $file = $fileDir.'/'.$path[0]["path"];

    unlink($file);

    $track->deleteTrackByID($fileID);
    return $this->json(['status' => "OK", 'message' => [], 'data' => []]);

  }

  public function getTracksList(Request $request, LibTrack $track) {
    $startDate = $request->query->get('start_date');
    $endDate = $request->query->get('end_date');
    $key = $request->query->get('key');
    $tags = $request->query->get('tags');
    if ($tags) {
      $tags = explode(',', $tags);
    }

    $tracks = $track->getTracksList($key, $startDate, $endDate, $tags);
    return $this->json(['status' => "OK", 'message' => [], 'data' => $tracks]);
  }


}
