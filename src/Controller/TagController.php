<?php


namespace App\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use App\Lib\LibTag;

class TagController extends AbstractController
{

  public function getTagsList(Request $request, LibTag $tag)
  {
    $tags = $tag->getTagsList();
    return $this->json(['status' => "OK", 'message' => [], 'data' => $tags]);
  }


  public function addNewTrack(Request $request, LibTag $tag)
  {
    $name = $request->request->get('name');
    $categoryName = $request->request->get('category_name');
    $color = $request->request->get('color');

    $tag->addNewTag($name, $categoryName, $color);
    return $this->json(['status' => "OK", 'message' => [], 'data' => []]);
  }

  public function deleteTag($tagID, LibTag $tag)
  {
    $tag->deleteTagByID($tagID);
    return $this->json(['status' => "OK", 'message' => [], 'data' => []]);
  }

  public function updateTag(Request $request, $tagID, LibTag $tag)
  {
    $name = $request->request->get('name');
    $categoryName = $request->request->get('category_name');
    $color = $request->request->get('color');

    $tag->updateTagByID($tagID, $name, $categoryName, $color);
    return $this->json(['status' => "OK", 'message' => [], 'data' => []]);
  }

  public function getCategories(LibTag $tag) {
    $categories = $tag->getCategoriesList();
    return $this->json(['status' => "OK", 'message' => [], 'data' => $categories]);
  }
}
