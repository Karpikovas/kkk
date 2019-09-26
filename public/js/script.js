$(document).ready(function () {

  const CONTAINER = $(".container");

  const TAGCONTAINER = $('*[data-tags-list-type="all"]');

  const SELECTEDTAGS = $('*[data-tags-list-type="selected"]');

  const INPUTSEARCH = $('input[name="search"]');

      // const INPUTCATEGORY = $('*[data-select-type="tags-list"]');

  const INPUTFILE = $('input[name="file"]')

  const SPINNER = '<div class="label_download">Загрузка...</div>';

  var inProgress = false;

  // Параметры запроса аудио
  var tagsArray = [];
  var params = {
    row: 0,
    start_date: null,
    end_date: null,
    key: null,
    tags: null
  };


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


    TAGCONTAINER.on('change', function (event) { selectTag() });

    SELECTEDTAGS.on('click', '.tag', function (event) {
      returnTag($(this));
    });

    INPUTFILE.on('change', function(event){ uploadFile() });

    /*---------------- Поиск при нажатии enter в поле поиска -----------------------*/
    INPUTSEARCH.keyup(function(event){
      if(event.keyCode === 13){
        event.preventDefault();
        search();
      }
    });

    /*----------------- Добавление тэга в "выбранные" при клике на тэг -----------------*/
    // TAGCONTAINER.on('click', '.tag', function (event) {  selectTag($(this)) });

    /*----------------- Удаление тэга из БД пр клике на крестик -------------------------*/
    TAGCONTAINER.on('click', '.tag > .close', function (event) {
      event.stopPropagation();
      removeTag($(this).parent())
    });

    /*------------------ Удаление тэга из списка выбранных ----------------------------------*/
    SELECTEDTAGS.on('click', '.tag > .close', function (event) {  removeSelectedTag($(this).parent()) });


    /*------------------- Поиск при клике на кнопку "Применить" ---------------------------*/
    $('*[data-btn-type="apply"]').on('click', function (event) { search() });

    /*--------------------- Добавление нового тэга при клике на кнопку "Добавить" --------------*/
    $('*[data-btn-type="btn-new-tag"]').on('click',  function (event) { addNewTag() });


    CONTAINER.on('click', '*[data-btn-type="edit_card"]', function (event) { getTrackInfo($(this).parents('.card').data().id) })
  }

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
        window.location.replace("/new");
      })
  }

  function getTrackInfo(track) {
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
            result += tagTemplate;
          });

          $('*[data-form-type="tags_selected"]').html(result);


          // tags.forEach(function (item) {
          //
          //   let tagTemplate = `
          //     <option
          //       value="${ item.name }"
          //       data-color="${ item.color }"
          //       data-category="${ item.category_name }"
          //       data-name="${ item.name }"
          //       data-id="${ item.id }">
          //       ${ item.name }
          //     </option>`;
          //
          //   TAGCONTAINER.find(`optgroup[label=${item.category_name}]`).append(tagTemplate)
          // });

        })
  }

// ---------------------- Возвращение тэга в список -------------------

  function returnTag(span) {
    for(let i = 0; i < tagsArray.length; i++){
      if ( tagsArray[i] === span.data().id) {

        tagsArray.splice(i, 1);
        let value = span.text();
        $(`option[value=${value}]`).toggle();
        span.remove();
        break;
      }
    }


  }

  /*----------------- Выбор тэга для поиска (добавление в выбранные) -------------------------------*/
  function selectTag() {
    let tag = TAGCONTAINER.find('option:selected');

      let tagTemplate = `
        <span
          class="badge badge-pill tag"
          style="background: ${ tag.data().color }"
          data-category="${ tag.data().category }"
          data-name="${ tag.data().name }"
          data-id="${ tag.data().id }">
          ${ tag.val() }

        </span>`;

    tagsArray.push(tag.data().id)
    SELECTEDTAGS.append(tagTemplate);
    tag.hide();
  }
  /*------------------------ Получение и вывод тэгов-----------------------------------------*/

  // function getTags(category) {
  //
  //   if (category.localeCompare("Все")) {
  //
  //     axios.get('/tags', {
  //       params: {
  //         category: category
  //       }
  //     })
  //       .then(function (response) {
  //
  //         let result = "";
  //         let tags = response.data.data;
  //
  //
  //         tags.forEach(function (item) {
  //
  //           let tagTemplate = `
  //             <span
  //               class="badge badge-pill tag"
  //               style="background: ${ item.color }"
  //               data-category="${ item.category_name }"
  //               data-name="${ item.name }"
  //               data-id="${ item.id }">
  //               ${ item.name }
  //               <button type="button" class="close" data-dismiss="alert" aria-label="Close">
  //                   <span aria-hidden="true">&times;</span>
  //               </button>
  //             </span>`;
  //
  //           result += tagTemplate;
  //         });
  //
  //         TAGCONTAINER.html(result);
  //       })
  //   }
  // }

  function getTags() {
     TAGCONTAINER.find('option').empty();

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
            });

          })

  }

  /*--------------------- Удаление тэга (включает удаление из БД и удаление из поля выбранных тэгов) --------------------*/
  // Не знаю, что лучше, просто выполнить remove или обновить тэги
  function removeTag(tag) {

    axios.post(`/tags/delete/${ tag.data().id }`)
      .then(function (response) {

        removeSelectedTag(tag);
        tag.remove();
        // getTags(INPUTCATEGORY.val());
      })
  }

  /*------------------------ Удаление тэга из поля выбранных ----------------------------*/
  function removeSelectedTag(tag) {

    for(let i = 0; i < tagsArray.length; i++){
      if ( tagsArray[i] === tag.data().id) {
        tagsArray.splice(i, 1);
        SELECTEDTAGS.find($(`*[data-id=${tag.data().id}]`)).remove();
        break;
      }
    }
  }

  /*------------------------ Добавление нового тэга ----------------------------------*/
  function addNewTag() {
    let nameInput = $('input[name="tag-name"]');
    let colorInput = $('input[name="tag-color"]');
    let categoryInput = $('*[data-select-type="new-tags-list"]');

    // Проверка валидации
    if (nameInput[0].checkValidity()) {

      let newTag = {
        name: nameInput.val(),
        color: colorInput.val(),
        category_name: categoryInput.val()
      };

      axios.post('/tags/add', newTag)
        .then(function (response) {
          if (categoryInput.val() === INPUTCATEGORY.val()) {
            getTags(INPUTCATEGORY.val())
          }
        })
    }
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
        getTags();
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
                        <a class="btn" data-toggle="modal" data-target="#deleteModal">
                            <span class="fas fa-trash-alt btn-delete"/>
                        </a>
                    </div>
                    <div class="col-1">
                        <a class="btn" data-toggle="modal" data-target="#exampleModal" data-btn-type="edit_card">
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

        /*-------- нужно сделать bind эвентов для кнопок карточки--------*/

      })
      .catch(function (error) {
        console.log(error);
      });
  }

  /*--------------------- Подготовка параметров поиска ----------------------*/

  function prepareParams() {
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

