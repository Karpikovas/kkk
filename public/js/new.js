$(document).ready(function () {


  function init() {
    bindEvents();
  }

  function bindEvents() {
    $('a.btn').on('click', function (event) {
      openNewTagControl($(this).parent());
    })

    $('button.btn.btn-link').on('click', function (event) {
      // $('.btn .btn-link').parents('card').find('.collapse').collapse('toggle');
      console.log($(this).parents('.card').find('.collapse'));
    })
  }

  function openNewTagControl(area) {
    area.find('.collapse').collapse('toggle');
    toggleIcon(area);

  }

  function toggleIcon(area) {
    let icon = area.find('a.btn span');

    if (icon.hasClass('fa-plus-circle')) {
      icon.removeClass('fa-plus-circle');
      icon.addClass('fa-times-circle');
    } else {
      icon.addClass('fa-plus-circle');
      icon.removeClass('fa-times-circle');
    }

  }
  init();
});
