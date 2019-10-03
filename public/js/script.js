$(document).ready(function () {

  const CONTAINER = $(".container");

  /*------- Контейнеры для тэгов (выбранных/невыбранных) в поле поиска ------------------*/

  const ALL_TAGS = $('*[data-tags-list-type="all"]');
  const SELECTED_TAGS = $('*[data-tags-list-type="selected"]');


  /*------- Контейнеры для тэгов (выбранных/невыбранных) в окне редактирования трека ------*/

  const TRACK_ALL_TAGS = $('*[data-form-type="tags_all"]');
  const TRACK_SELECTED_TAGS = $('*[data-form-type="tags_selected"]');

  const INPUT_SEARCH = $('input[name="search"]');
  const INPUT_FILE = $('input[name="file"]');

  const EDIT_TAGS = $('#accordion');

  const SPINNER = '<div class="label_download">Загрузка...</div>';

  var inProgress = false;
  var player;

  var tagInfo = {
    isDeleted: false,
    isNew:false
  };

  /* ------------ Параметры запроса на поиск аудио ----------------- */
  var searchTracksParams = {
    row: 0,
    start_date: null,
    end_date: null,
    key: null,
    tags: null
  };


  var categoriesAndTags;
  var currentCategoriesAndTags;

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

    ALL_TAGS.on('change', function (event) {
      selectTag(ALL_TAGS, SELECTED_TAGS);

    });


    /*---------- Удаление тэга из списка выбранных и возвращение в список (КОНТЕЙНЕР ПОИСКА) ------------------*/

    SELECTED_TAGS.on('click', '.tag', function (event) { returnTag($(this), ALL_TAGS); });


    /*----------------- Добавление тэга в "выбранные" при клике на тэг (КОНТЕЙНЕР В РЕДАКТИРОВАНИИ ТРЕКА)-----------------*/

    TRACK_ALL_TAGS.on('change', function (event) {
      selectTag(TRACK_ALL_TAGS, TRACK_SELECTED_TAGS);

    });


    /*---------- Удаление тэга из списка выбранных и возвращение в список (КОНТЕЙНЕР В РЕДАКТИРОВАНИИ ТРЕКА) -------------*/

    TRACK_SELECTED_TAGS.on('click', '.tag', function (event) { returnTag($(this), TRACK_ALL_TAGS); });


    /*------------------------------ Загрузка файла на сервер ---------------------------*/

    INPUT_FILE.on('change', function(event){ uploadFile() });

    /*---------------- Поиск при нажатии enter в поле поиска -----------------------*/

    INPUT_SEARCH.keyup(function(event){
      if(event.keyCode === 13){
        event.preventDefault();
        search();
      }
    });

    EDIT_TAGS.on('submit', 'form', function (event) {
      event.preventDefault();
      event.stopPropagation()
    });

    /*------------------- Поиск при клике на кнопку "Применить" ---------------------------*/

    $('*[data-btn-type="apply"]').on('click', function (event) { search() });


    /*------------------- Сохранение информации о треке при редактировании -------------------------*/

    $('*[data-btn-type="save_track"]').on('click', function (event) {
      saveTracksInfo($('#modalInfo').data().id);

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

    /*--------------------- Открытие категории с тэгами в окне редактирования ---------------------*/

    EDIT_TAGS.on('click', 'button.btn.btn-link', function (event) {
      $(this).parents('.card').find('>.collapse').collapse('toggle');

    });

    /*------------------------- Открытие панели добавления нового тэга ------------------------*/

    EDIT_TAGS.on('click', 'a.btn', function (event) {
      openNewTagControl($(this).parent());
    });

    /*----------------------- Сохранение изменений в тэгах --------------------------------*/

    $('*[data-btn-type="save_tag_changes"]').on('click', function (event) {

      $('#editTags').modal('hide');
      saveTagsChanges();

    });

    /*-------------------- Открытие окна редактирования тэгов -------------------------*/

    $('.btn-new-tag').on('click', function (e) {
      appendCategoriesAndTagsToEditModal();
    });

    /* --------------------- Добавление нового тэга по enter -------------------*/

    EDIT_TAGS.on('keyup', 'input[name="tag-name"]', function(event){
      if(event.keyCode === 13){
        event.preventDefault();
        event.stopPropagation();
        appendNewTag($(this));
      }
    });

    /* --------------------- Добавление нового тэга по клике на кнопку -------------------*/

    EDIT_TAGS.on('click', 'button.btn.btn-success', function(event){
      event.preventDefault();
      event.stopPropagation();
      appendNewTag( $(this));
    });

    /*----------------- Удаление тэга -------------------------*/

    EDIT_TAGS.on('click', '.tag > .close', function (event) {
      deleteTagFromEdit($(this))
    });


  }

  /*------------------- Удаление тэга ---------------------------*/

  function deleteTagFromEdit(area) {

    let id = area.parent().data().id.toString();

    let objIndex = currentCategoriesAndTags.findIndex((obj => obj.name === area.parent().data().category));
    let tagIndex = currentCategoriesAndTags[objIndex].tags.findIndex((obj => obj.id === id));

    if (id.indexOf('new') === -1 ) {

      currentCategoriesAndTags[objIndex].tags[tagIndex].isDelete = true;
    } else {
      currentCategoriesAndTags[objIndex].tags.splice(tagIndex, 1);
    }

    area.parent().hide();

  }
  /*--------------------------- Сохранение изменений в тэгах ----------------------*/

  function saveTagsChanges() {

    let promises =[];

    let newTags = currentCategoriesAndTags.reduce((a, obj) => {
      let filtered = obj.tags.filter(({isNew}) => true === isNew);

      if (filtered.length) {

        filtered.forEach(function (tag) {
          let newTag = {
            name: tag.name,
            color: tag.color,
            category_name: tag.category_name
          };

          promises.push(axios.post('/tags/add', newTag));
        });
      }
      return a;
    }, []);


    let tagsToDelete = currentCategoriesAndTags.reduce((a, obj) => {
      let filtered = obj.tags.filter(({isDelete}) => true === isDelete);

      if (filtered.length) {

        filtered.forEach(function (tag) {
          SELECTED_TAGS.find(`.badge[data-id="${tag.id}"]`).remove();
          promises.push(axios.post(`/tags/delete/${ tag.id }`));
        });
      }
      return a;
    }, []);

    axios.all(promises)
        .then(function() {
          categoriesAndTags.forEach(function (category) {
            category.tags = [];
          });
          getTags();
        });


  }

  /*------------------------ Добавление нового тэга ----------------------------------*/

  function appendNewTag(area) {

    let input = area.parents('.card').find('input[name="tag-name"]');
    // Проверка валидации
    if (input[0].checkValidity()) {

      let color = area.parents('.card').find('input[name="tag-color"]').val();
      let category = area.parents('.card').data().category;
      let name = input.val();

      let newTag = {
        id: 'new_' + name,
        name: name,
        category_name: category,
        color: color,
      };

      newTag = Object.assign(newTag, tagInfo);
      newTag.isNew = true;

      let objIndex = currentCategoriesAndTags.findIndex((obj => obj.name === category));
      currentCategoriesAndTags[objIndex].tags = [...currentCategoriesAndTags[objIndex].tags, ...[newTag]];

      let tagTemplate = `
      <span
        class="badge badge-pill tag"
        style="background: ${ color }"
        data-color="${ color }"
        data-category="${ category }"
        data-name="${ name }"
        data-id="new_${ name }">
        ${ name }
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
      </span>`;

      $(tagTemplate).insertBefore(EDIT_TAGS.find(`.card[data-category="${ category }"] a.btn`));
      input.val('');
    }

  }

  /*---------------- Сохранение файла на сервер и открытие окна редактирования --------------------------*/

  function uploadFile() {
    let track = INPUT_FILE[0].files[0];
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

    TRACK_SELECTED_TAGS.find('.tag').each(function (tag) {
      tagsArray.push($(this).data().id)
    });


    axios.post(`/tracks/update/${ID}`, {
      comment: $('*[data-form-type="comment"]').val(),
      tags: tagsArray.join(' ')
    })
        .then(function (response) {
          search();
          $('#modalInfo').modal('hide');
        })
        .catch(function (error) {
          console.log(error);
        });
  }

  /*------------ Получение информации о треке по ID ----------------------------*/

  function getTracksInfo(track) {

    TRACK_SELECTED_TAGS.find('option').show();

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
                <span >&times;</span>
              </span>`;

            let tagSelected = TRACK_ALL_TAGS.find(`option[value=${ tag.name }][data-category="${ tag.category_name}"]`);
            tagSelected.hide();
            result += tagTemplate;
          });

          TRACK_SELECTED_TAGS.html('Выбранные тэги:' +  result);

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
    let value = span.data().name.toString();
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
           <span aria-hidden="true">&times;</span>
        </span>`;

    selectedTags.append(tagTemplate);
    tagContainer.find('option:first').prop('selected', true);
    tag.hide();
  }

  /*---------------------- Получение категорий тэгов ------------------------------*/

  function getCategories() {
    axios.get('/tags/categories')
        .then(function (response) {

          let result = "";
          let categories = response.data.data;

          categoriesAndTags = Object.assign([], categories);
          categoriesAndTags = categoriesAndTags.map(function (category) {
            return Object.assign({}, category, { tags: [] });
          });

          categories.forEach(function (item) {
            let category = `<optgroup label="${ item.name }"></optgroup>`;
            result += category;
          });

          let defaultOption = '<option selected value="">Выберите тэг...</option>';

          ALL_TAGS.append(defaultOption);
          ALL_TAGS.append(result);

          TRACK_ALL_TAGS.append(defaultOption);
          TRACK_ALL_TAGS.append(result);

          getTags();
        })
  }

  /*-------------- Добавление категорий тэгов в модальное окно их редактирования -----------------------*/
  function appendCategoriesAndTagsToEditModal() {
    let result = "";

    currentCategoriesAndTags = JSON.parse(JSON.stringify(categoriesAndTags));


    currentCategoriesAndTags.forEach(function (item) {
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
                            
                            <div class="text-left" data-tags-list-type="selected">`;

      item.tags.forEach(function (tag) {
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
        category += tagTemplate;
      });

      category +=`<a class="btn" >
                <span class="fas fa-plus btn-new-tag" ></span>
              </a>
              <div class="collapse mt-3" >
                  <form class="form-row was-validated"  novalidate="">
                      <div class="col-7">
                          <label for="validationCustom01">Название</label>
                          <input id="validationCustom01" type="text" class="form-control" placeholder="Название тэга" name="tag-name" required>
                          <div class="invalid-feedback">
                              Название не должно быть пустым.
                          </div>
                      </div>
                      <div class="col-2">
                          <label for="validationCustom02">Цвет</label>
                          <input id="validationCustom02" type="color" value="#e66465" class="form-control" placeholder="Цвет тэга" name="tag-color">
                      </div>
                      <div class="col-3">
                          <button type="button" class="btn btn-success" >
                              Добавить
                          </button>
                      </div>
                  </form>
                
              </div>
            </div>
          </div>
        </div>
      </div>`;
      result += category;
    });

    EDIT_TAGS.html(result);
    EDIT_TAGS.find('.card:first-child > .collapse').collapse('show');

    $('#editTags').modal('show');
  }

  /*--------------------- Открытие панели добавления нового тэга ----------------------*/
  function openNewTagControl(area) {
    area.find('.collapse').collapse('toggle');
    area.find('input#validationCustom01.form-control').focus();
    toggleIcon(area);

  }

  /*----------------------- Изменение иконки добавления новго тэга--------------------------*/
  function toggleIcon(area) {
    let icon = area.find('a.btn span');

    if (icon.hasClass('fa-plus')) {
      icon.removeClass('fa-plus');
      icon.addClass('fa-times');
    } else {
      icon.addClass('fa-plus');
      icon.removeClass('fa-times');
    }
  }
  /*------------------------ Получение и вывод тэгов-----------------------------------------*/

  function getTags() {
    ALL_TAGS.find('optgroup').empty();
    TRACK_ALL_TAGS.find('optgroup').empty();

    axios.get('/tags')
        .then(function (response) {

          let tags = response.data.data;


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

            let objIndex = categoriesAndTags.findIndex((obj => obj.name === item.category_name));

            categoriesAndTags[objIndex].tags = [...categoriesAndTags[objIndex].tags, ...[Object.assign(item, tagInfo)]];

            ALL_TAGS.find(`optgroup[label=${item.category_name}]`).append(tagTemplate);
            TRACK_ALL_TAGS.find(`optgroup[label=${item.category_name}]`).append(tagTemplate);
          });

        });

  }

  /*------------------------Получение списка трэков -----------------------------*/

  function getTracks() {
    inProgress = true;
    CONTAINER.append(SPINNER);

    axios.get('/tracks', {
      params: searchTracksParams
    })
        .then(function (response) {

          $(".label_download").remove();

          searchTracksParams.row += 10;

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

    SELECTED_TAGS.find('.tag').each(function (tag) {
      tagsArray.push($(this).data().id)
    });

    searchTracksParams = {
      row: 0,
      start_date: $("input[name='start_date']").val(),
      end_date: $("input[name='end_date']").val(),
      key: INPUT_SEARCH.val(),
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
