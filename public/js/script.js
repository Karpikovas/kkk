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

  const SPINNER = '<div class="label_download">Загрузка...</div>';

  var inProgress = false;


  /* ------------ Параметры запроса аудио ----------------- */
  var params = {
    row: 0,
    start_date: null,
    end_date: null,
    key: null,
    tags: null
  };

  /* ---------- Начальная инициализация ----------------------*/

  function init() {
    getTracks();
    getCategories();
    bindEvents();
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

    // TAGCONTAINER.on('click', '.tag', function (event) {  selectTag($(this)) });

    /*----------------- Удаление тэга из БД пр клике на крестик -------------------------*/

    // TAGCONTAINER.on('click', '.tag > .close', function (event) {
    //   event.stopPropagation();
    //   removeTag($(this).parent())
    // });


    // SELECTEDTAGS.on('click', '.tag > .close', function (event) {  removeSelectedTag($(this).parent()) });
    /*--------------------- Добавление нового тэга при клике на кнопку "Добавить" --------------*/
    // $('*[data-btn-type="btn-new-tag"]').on('click',  function (event) { addNewTag() });


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

          categories.forEach(function (item) {
            let category = `<optgroup label="${ item.name }"></optgroup>`;
            result += category;
          });

          TAGCONTAINER.append(result);
          TRACKTAGCONTAINER.append(result);
          getTags();
        })
  }

  /*------------------------ Получение и вывод тэгов-----------------------------------------*/

  function getTags() {
    TAGCONTAINER.find('option').empty();
    TRACKTAGCONTAINER.find('option').empty();

    axios.get('/tags')
        .then(function (response) {

          let result = "";
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

            TAGCONTAINER.find(`optgroup[label=${item.category_name}]`).append(tagTemplate)
            TRACKTAGCONTAINER.find(`optgroup[label=${item.category_name}]`).append(tagTemplate)
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
  /*--------------------- Удаление тэга (включает удаление из БД и удаление из поля выбранных тэгов) --------------------*/
  // Не знаю, что лучше, просто выполнить remove или обновить тэги
  // function removeTag(tag) {
  //
  //   axios.post(`/tags/delete/${ tag.data().id }`)
  //     .then(function (response) {
  //
  //       removeSelectedTag(tag);
  //       tag.remove();
  //       // getTags(INPUTCATEGORY.val());
  //     })
  // }

  /*------------------------ Удаление тэга из поля выбранных ----------------------------*/
  // function removeSelectedTag(tag) {
  //
  //   for(let i = 0; i < tagsArray.length; i++){
  //     if ( tagsArray[i] === tag.data().id) {
  //       tagsArray.splice(i, 1);
  //       SELECTEDTAGS.find($(`*[data-id=${tag.data().id}]`)).remove();
  //       break;
  //     }
  //   }
  // }

  /*------------------------ Добавление нового тэга ----------------------------------*/
  // function addNewTag() {
  //   let nameInput = $('input[name="tag-name"]');
  //   let colorInput = $('input[name="tag-color"]');
  //   let categoryInput = $('*[data-select-type="new-tags-list"]');
  //
  //   // Проверка валидации
  //   if (nameInput[0].checkValidity()) {
  //
  //     let newTag = {
  //       name: nameInput.val(),
  //       color: colorInput.val(),
  //       category_name: categoryInput.val()
  //     };
  //
  //     axios.post('/tags/add', newTag)
  //       .then(function (response) {
  //         if (categoryInput.val() === INPUTCATEGORY.val()) {
  //           getTags(INPUTCATEGORY.val())
  //         }
  //       })
  //   }
  // }




});

