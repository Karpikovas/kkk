$(document).ready(function () {

  const CONTAINER = $(".container");

  /*------- Контейнеры для тэгов (выбранных/невыбранных) в поле поиска ------------------*/

  const TAGCONTAINER = $('*[data-tags-list-type="all"]');
  const TRACKTAGCONTAINER = $('*[data-form-type="tags_all"]');

  /*------- Контейнеры для тэгов (выбранных/невыбранных) в окне редактирования трека ------*/

  const SELECTEDTAGS = $('*[data-tags-list-type="selected"]');
  const TRACKSELECTEDTAGS = $('*[data-form-type="tags_selected"]');

  const INPUTSEARCH = $('input[name="search"]');
  const INPUTFILE = $('input[name="file"]');

  const EDITTAGS = $('#accordion');

  const SPINNER = '<div class="label_download">Загрузка...</div>';

  var inProgress = false;
  var player;


  /* ------------ Параметры запроса аудио ----------------- */
  var params = {
    row: 0,
    start_date: null,
    end_date: null,
    key: null,
    tags: null
  };

  var deletedTags = [];

  /* ---------- Начальная инициализация ----------------------*/

  function init() {
    getTracks();
    getCategories();
    bindEvents();

    player = new Player();
    player.init()


  }

  function bindEvents() {

    /*---------------- Динамическая подгрузка контента при достижении низа страницы ----------*/

    $(window).scroll(function (event) {
      if ($(window).scrollTop() + $(window).height() >= $(document).height() - 50 && !inProgress) {
        getTracks();
      }
    });

    /*----------------- Добавление тэга в "выбранные" при клике на тэг (КОНТЕЙНЕР ПОИСКА)-----------------*/

    TAGCONTAINER.on('change', function (event) { selectTag(TAGCONTAINER, SELECTEDTAGS) });


    /*---------- Удаление тэга из списка выбранных и возвращение в список (КОНТЕЙНЕР ПОИСКА) ------------------*/

    SELECTEDTAGS.on('click', '.tag', function (event) { returnTag($(this), TAGCONTAINER); });


    /*----------------- Добавление тэга в "выбранные" при клике на тэг (КОНТЕЙНЕР В РЕДАКТИРОВАНИИ ТРЕКА)-----------------*/

    TRACKTAGCONTAINER.on('change', function (event) { selectTag(TRACKTAGCONTAINER, TRACKSELECTEDTAGS) });


    /*---------- Удаление тэга из списка выбранных и возвращение в список (КОНТЕЙНЕР В РЕДАКТИРОВАНИИ ТРЕКА) -------------*/

    TRACKSELECTEDTAGS.on('click', '.tag', function (event) { returnTag($(this), TRACKTAGCONTAINER); });


    /*------------------------------ Загрузка файла на сервер ---------------------------*/

    INPUTFILE.on('change', function(event){ uploadFile() });

    /*---------------- Поиск при нажатии enter в поле поиска -----------------------*/

    INPUTSEARCH.keyup(function(event){
      if(event.keyCode === 13){
        event.preventDefault();
        search();
      }
    });

    /*------------------- Поиск при клике на кнопку "Применить" ---------------------------*/

    $('*[data-btn-type="apply"]').on('click', function (event) { search() });


    /*------------------- Сохранение информации о треке при редактировании -------------------------*/

    $('*[data-btn-type="save_track"]').on('click', function (event) {
      saveTracksInfo($('#modalInfo').data().id)
    });


    /*---------------------------- Удаление трека ----------------------------------*/

    $('*[data-btn-type="delete_track"]').on('click', function (event) {
      deleteTrack($('#deleteModal').data().id)
    });


    /*--------------------- Открытие параметров редактирования трека --------------*/

    CONTAINER.on('click', '*[data-btn-type="edit_track"]', function (event) {
      getTracksInfo($(this).parents('.card').data().id)
    });


    /*---------------------- Открытие окна удаления трека -----------------------------*/

    CONTAINER.on('click', '*[data-btn-type="ask_delete_track"]', function (event) {
      askDeleteTrack($(this).parents('.card').data().id)
    });

    /*-------------------- Открытие тэгов в категории в окне редактирования тэгов ------------*/
    EDITTAGS.on('click', 'button.btn.btn-link', function (event) {
      $(this).parents('.card').find('>.collapse').collapse('toggle');
    });

    /*---------------------- Открытие панели добавления нового тэга ----------------------*/
    EDITTAGS.on('click', 'a.btn', function (event) {
      openNewTagControl($(this).parent());
    });

    /*----------------------- Сброс изменений в окне редактирования тэгов при закрытии --------------------*/
    $("#editTags").on("hidden.bs.modal", function () {
      onCloseEditModal();
    });

    /*------------------------ Сохранение изменений в тэгах -----------------------------------*/
    $('*[data-btn-type="save_tag_changes"]').on('click', function (event) {

      $('#editTags').off('hidden.bs.modal');
      $('#editTags').modal('hide');
      saveTagsChanges();
      setTimeout(function() {
        $('#editTags').on('hidden.bs.modal', function(event) {
          onCloseEditModal();
        });
      }, 1000);

    });

    /* -------------------- Добавление новго тэга при нажатии на enter ----------------------*/
    EDITTAGS.on('keyup', 'input[name="tag-name"]', function(event){
      if(event.keyCode === 13){
        event.preventDefault();
        appendNewTag($(this));
      }
    });

    /*----------------- Удаление тэга при клике на крестик (условное) -------------------------*/

    EDITTAGS.on('click', '.tag > .close', function (event) {
      deleteTag($(this))
    });

  }

  /*------------------- Скрытие тэга (условное удаление) ------------------*/
  function deleteTag(tag) {
    if (tag.parent().data().id !== "new")
      deletedTags.push(tag.parent().data().id);
    tag.parent().hide();
  }

  /*------------------- Сохранение изменений при редактировании тэгов ------------------------*/
  function saveTagsChanges() {

    let promises = [];
    EDITTAGS.find(".card .badge[data-id='new']").each(function () {

      let newTag = {
        name: $(this).data().name,
        color: $(this).data().color,
        category_name: $(this).data().category
      };

      promises.push(axios.post('/tags/add', newTag));
    });

    deletedTags.forEach(function (tag) {
      promises.push(axios.post(`/tags/delete/${ tag }`));
      SELECTEDTAGS.find($(`*[data-id=${tag}]`)).remove();
    });

    axios.all(promises)
        .then(function (response) {
          getTags();
          search();
        });
    deletedTags = [];
  }

  /*--------------- Возвращение в исходное состояние контейнера с редактированием тэгов ----------------------*/
  function onCloseEditModal() {
    EDITTAGS.find('.card .badge').show();
    EDITTAGS.find('.card .badge[data-id="new"]').remove();
  }

  /*----------------- Добавление нового тэга (условное) -----------------------------------*/
  function appendNewTag(input) {

    // Проверка валидации
    if (input[0].checkValidity()) {

      let color = input.parents('.card').find('input[name="tag-color"]').val();
      let category = input.parents('.card').data().category;
      let name = input.val();


      let tagTemplate = `
      <span
        class="badge badge-pill tag"
        style="background: ${ color }"
        data-color="${ color }"
        data-category="${ category }"
        data-name="${ name }"
        data-id="new">
        ${ name }

        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
      </span>`;

      $(tagTemplate).insertBefore(EDITTAGS.find(`.card[data-category="${ category }"]`).find('a.btn'));
    }
    input.val('');
  }

  /*---------------- Сохранение файла на сервер и открытие окна редактирования --------------------------*/

  function uploadFile() {
    let track = INPUTFILE[0].files[0];
    let formData = new FormData();

    formData.append("path", track);

    axios.post('/tracks/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(function (response) {
        let trackID = response.data.data[0].id;
        getTracksInfo(trackID)
      })
  }

  /*------------ Выбор параметров и сохранение новой информации о треке по ID -------------------*/

  function saveTracksInfo(ID) {
    let tagsArray = [];

    TRACKSELECTEDTAGS.find('.tag').each(function (tag) {
      tagsArray.push($(this).data().id)
    });


    axios.post(`/tracks/update/${ID}`, {
      comment: $('*[data-form-type="comment"]').val(),
      tags: tagsArray.join(' ')
    })
        .then(function (response) {
          $('#modalInfo').modal('hide');
          search();
        })
        .catch(function (error) {
          console.log(error);
        });
  }

  /*------------ Получение информации о треке по ID ----------------------------*/

  function getTracksInfo(track) {

    TRACKTAGCONTAINER.find('option').show();

    axios.get(`/tracks/${ track }`)
        .then(function (response) {

          let track = response.data.data;


          $('*[data-form-type="name"]').html(`Название: ${ track.name }`);
          $('*[data-form-type="comment"]').html(`${ track.comment ? track.comment : ""}`);

          let result = "";
          track.tags.forEach(function (tag) {

            let tagTemplate = `
              <span
                class="badge badge-pill tag"
                style="background: ${ tag.color }"
                data-category="${ tag.category_name }"
                data-name="${ tag.name }"
                data-id="${ tag.id }">
                ${ tag.name }
      
              </span>`;

            let tagSelected = TRACKTAGCONTAINER.find(`option[data-category="${ tag.category_name }"][value="${tag.name}"]`);
            tagSelected.hide();
            result += tagTemplate;
          });

          TRACKSELECTEDTAGS.html('Выбранные тэги:' +  result);

          $('#modalInfo').modal('show');
          $('#modalInfo').data('id', track.id)

        })
  }

  function askDeleteTrack(ID) {
    $('#deleteModal').data('id', ID);
  }

  /*-------------------- Удаление трека по ID ---------------------------*/

  function deleteTrack(ID) {

    axios.post(`/tracks/delete/${ ID }`)
        .then(function (response) {

          CONTAINER.find(`.card[data-id="${ ID }"]`).remove();
          $('#deleteModal').modal('hide');
        })
  }

  /* ---------------------- Возвращение тэга в список ------------------- */

  function returnTag(span, tagContainer) {
    let value = span.text();
    let category = span.data().category;
    tagContainer.find($(`option[value=${value}][data-category="${category}"]`)).show();
    span.remove();
  }

  /*----------------- Выбор тэга для поиска (добавление в выбранные) -------------------------------*/

  function selectTag(tagContainer, selectedTags) {
    let tag = tagContainer.find('option:selected');

      let tagTemplate = `
        <span
          class="badge badge-pill tag"
          style="background: ${ tag.data().color }"
          data-category="${ tag.data().category }"
          data-name="${ tag.data().name }"
          data-id="${ tag.data().id }">
          ${ tag.val() }

        </span>`;

    selectedTags.append(tagTemplate);
    tag.hide();
  }

  /*---------------------- Получение категорий тэгов ------------------------------*/

  function getCategories() {
    axios.get('/tags/categories')
        .then(function (response) {

          let result = "";
          let categories = response.data.data;

          appendCategoriesToEditModal(categories);

          categories.forEach(function (item) {
            let category = `<optgroup label="${ item.name }"></optgroup>`;
            result += category;
          });

          TAGCONTAINER.append(result);
          TRACKTAGCONTAINER.append(result);
          getTags();
        })
  }

  /*-------------- Добавление категорий тэгов в модальное окно их редактирования -----------------------*/
  function appendCategoriesToEditModal(categories) {
    let result = "";

    categories.forEach(function (item) {
      let category = `<div class="card" data-category="${ item.name }">

                        <div class="card-header">
                          <h5 class="mb-0">
                            <button class="btn btn-link" data-toggle="collapse" aria-expanded="true" >
                              ${ item.name }
                            </button>
                          </h5>
                        </div>
                        
                        <div class="collapse"  data-parent="#accordion">
                          <div class="card-body">
                            
                            <div class="text-left" data-tags-list-type="selected">
          
                              <a class="btn" >
                                <span class="fas fa-plus-circle btn-new-tag" ></span>
                              </a>
          
                              <div class="collapse mt-3" >
                                <div class="input-group mb-3">
                                  <input 
                                    type="text" 
                                    class="form-control" 
                                    placeholder="Название тэга" 
                                    name="tag-name" required>
                                    
                                  <div class="input-group-append">
                                    <input type="color" value="#e66465" placeholder="Цвет тэга" name="tag-color">
                                  </div>
                                  
                                </div>
                                
                              </div>
          
                            </div>
                          </div>
                        </div>
                      </div>`;
      result += category;
    });
    EDITTAGS.append(result);
    EDITTAGS.find('.card:first-child > .collapse').collapse('show');
  }

  function openNewTagControl(area) {
    area.find('.collapse').collapse('toggle');
    toggleIcon(area);

  }

  /*-------------- Добавление тэгов в модальное окно их редактирования -----------------------*/
  function appendTagsToEditModal(tags) {
    EDITTAGS.find('.card span.badge').remove();
    tags.forEach(function (tag) {

      let tagTemplate = `
        <span
          class="badge badge-pill tag"
          style="background: ${ tag.color }"
          data-category="${ tag.category_name }"
          data-name="${ tag.name }"
          data-id="${ tag.id }">
          ${ tag.name }

          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
              <span aria-hidden="true">&times;</span>
          </button>
        </span>`;

      $(tagTemplate).insertBefore(EDITTAGS.find(`.card[data-category="${ tag.category_name }"]`).find('a.btn'));
    });
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

  /*------------------------ Получение и вывод тэгов-----------------------------------------*/

  function getTags() {
    TAGCONTAINER.find('optgroup').empty();
    TRACKTAGCONTAINER.find('optgroup').empty();

    axios.get('/tags')
        .then(function (response) {

          let tags = response.data.data;

          appendTagsToEditModal(tags);

          tags.forEach(function (item) {

            let tagTemplate = `
              <option
                value="${ item.name }"
                data-color="${ item.color }"
                data-category="${ item.category_name }"
                data-name="${ item.name }"
                data-id="${ item.id }">
                ${ item.name }
              </option>`;

            TAGCONTAINER.find(`optgroup[label=${item.category_name}]`).append(tagTemplate);
            TRACKTAGCONTAINER.find(`optgroup[label=${item.category_name}]`).append(tagTemplate);
          });

        })

  }

  /*------------------------Получение списка трэков -----------------------------*/

  function getTracks() {
    inProgress = true;
    CONTAINER.append(SPINNER);

    axios.get('/tracks', {
      params: params
    })
        .then(function (response) {

          $(".label_download").remove();

          params.row += 10;

          let result = "";
          let tracks = response.data.data;

          if (response.data.data.length > 0) {
            inProgress = false;
          }

          tracks.forEach(function (item) {
            let cardTemplate = `
            <div 
                class="card"
                data-id="${item.id}"
            >
              <div class="card-header">
                <div class="row">
                    <div class="col-9">
                        ${item.name}
                    </div>
                    <div class="col-1">
                        <a class="btn" data-toggle="modal" data-target="#deleteModal" data-btn-type="ask_delete_track">
                            <span class="fas fa-trash-alt btn-delete"/>
                        </a>
                    </div>
                    <div class="col-1">
                        <a class="btn"  data-btn-type="edit_track">
                            <span class="fas fa-edit"/>
                        </a>
                    </div>
                </div>
                <div class="row">
                    <div class="col text-muted">
                        ${item.datetime}
                    </div>
                </div>
                </div>
              <div class="card-body text-right">
                <audio-control></audio-control>`

            item.tags.forEach(function (tag) {

              cardTemplate += `
              <span 
                class="badge badge-pill tag" 
                style="background: ${tag.color}">
                  ${tag.name}
              </span>`;
            });


            cardTemplate += `
              <p class="card-text">
               ${item.comment ? item.comment : ""}                       
              </p>
              </div>
           </div>`;

            result += cardTemplate;
          });
          CONTAINER.append(result);

          $('audio-control').each(function (control) {
            player.bindAudioEvents($(this));
          })

        })
        .catch(function (error) {
          console.log(error);
        });
  }

  /*--------------------- Подготовка параметров поиска ----------------------*/

  function prepareParams() {

    let tagsArray = [];

    SELECTEDTAGS.find('.tag').each(function (tag) {
      tagsArray.push($(this).data().id)
    });

    params = {
      row: 0,
      start_date: $("input[name='start_date']").val(),
      end_date: $("input[name='end_date']").val(),
      key: INPUTSEARCH.val(),
      tags: tagsArray.join(' ')
    };
  }

  /*---------------- Новый поиск с очисткой содержимого контейнера ------------------------------*/

  function search() {
    prepareParams();
    CONTAINER.empty();
    getTracks();
  }

  init();

});

