$(document).ready(function () {


  function init() {
    bindEvents();
  }

  function bindEvents() {
    $('a.btn').on('click', function (event) {
      openTagControl($(this).parent());
    })
  }

  function openTagControl(area) {
    if ($('#newTag').parent()[0] !== area[0]) {
      $('#newTag').removeClass('show');
      $('#newTag').appendTo(area);
    }


    $('#newTag').collapse('toggle');

  }
  init();
});
