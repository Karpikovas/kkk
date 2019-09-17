<?php

$arr = [
  1,
  2,
  3
];

$arr_bd = [
  2,
  3,
  4
];

$diff = array_diff($arr, $arr_bd);
print_r($diff);

$diff = array_diff($arr_bd, $arr);
print_r($diff);





