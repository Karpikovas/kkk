$(document).ready(function () {

  const CONTAINER = $(".container");
  const TAGCONTAINER = $(".nav-item.tags");
  const SELECTEDTAGS = $(".nav-item.tags-selected");
  const INPUTSEARCH = $('input[name="search"]');
  const INPUTCATEGORY = $('.main-select');

  const SPINNER = `<div class="label_download">Загрузка...</div>`;

  var inProgress = false;

  // Параметры запроса аудио
  var startRow = 0;
  var tagsArray = [];




  function init() {
    getCards();
    getCategories();
    bindEvents();
  }

  function bindEvents() {

    $(window).scroll(function (event) {
      if ($(window).scrollTop() + $(window).height() >= $(document).height() - 50 && !inProgress) {
        getCards();
      }
    });

    $('.main-select').on('change', function(event){ getTags(this.value) });
    TAGCONTAINER.on('click', '.tag', function (event) {  selectTag($(this)) });

    TAGCONTAINER.on('click', '.tag > .close', function (event) {
      event.stopPropagation();
      removeTag($(this).parent())
    });

    SELECTEDTAGS.on('click', '.tag > .close', function (event) {  removeSelectedTag($(this).parent()) });

    INPUTSEARCH.keyup(function(event){
      if(event.keyCode == 13){
        event.preventDefault();
        search();
      }
    });

    $('.nav-item > .btn.btn-info').on('click', function (event) { search() });
    $('.nav-item').on('click','.btn.btn-success',  function (event) { addNewTag() });

  }

  // Не знаю, что лучше, просто выполнить remove или обновить тэги
  function removeTag(tag) {
    axios.post(`/tags/delete/${ tag.data().id }`)
      .then(function (response) {
        removeSelectedTag(tag);
        tag.remove();
        // getTags(INPUTCATEGORY.val());
      })
  }



  function removeSelectedTag(tag) {

    for(let i = 0; i < tagsArray.length; i++){
      if ( tagsArray[i] === tag.data().id) {
        tagsArray.splice(i, 1);
        //tag.remove();
        SELECTEDTAGS.find($(`*[data-id=${tag.data().id}]`)).remove();
        break;
      }
    }
  }

  function addNewTag() {
    let nameInput = $('input[name="tag-name"]');
    let colorInput = $('input[name="tag-color"]');
    let categoryInput = $('.new-select');

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

  function search() {
    startRow = 0;
    CONTAINER.empty();
    getCards();
  }

  function prepareParams() {
    params = {
      row: startRow,
      start_date: $("input[name='start_date']").val(),
      end_date: $("input[name='end_date']").val(),
      key: INPUTSEARCH.val(),
      tags: tagsArray.join(' ')
    };

    return params;
  }

  function selectTag(currentTag) {
    tagID = currentTag.data().id;
    if (!tagsArray.includes(tagID)) {
      currentTag.clone().appendTo(SELECTEDTAGS);
      tagsArray.push(tagID);
    }

  }

  function getTags(category) {

    if (category.localeCompare("Все")) {

      axios.get('/tags', {
        params: {
          category: category
        }
      })
          .then(function (response) {

            let result = "";
            let tags = response.data.data;


            tags.forEach(function (item) {
              let tagTemplate = `<span 
                            class="badge badge-pill tag" 
                            style="background: ${ item.color }"
                            data-category="${ item.category_name }"
                            data-name="${ item.name }"
                            data-id="${ item.id }">
                            ${ item.name }
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                          </span>`;
              result += tagTemplate;
            });

            TAGCONTAINER.html(result);
          })
    }


  }

  function getCategories() {
    axios.get('/tags/categories')
      .then(function (response) {

        let result = "";
        let categories = response.data.data;

        categories.forEach(function (item) {
          let dropdownItem = `<option value="${ item.name }">${ item.name }</option>`;
          result += dropdownItem;
        });

        $("select.form-control").append(result);
      })
  }

  function getCards() {
    inProgress = true;
    CONTAINER.append(SPINNER);

    axios.get('/tracks', {
      params: prepareParams()
    })
      .then(function (response) {

        $(".label_download").remove();
        startRow += 10;

        let result = "";
        let tracks = response.data.data;

        if (response.data.data.length > 0) {
          inProgress = false;
        }

        tracks.forEach(function (item) {
          let cardTemplate = `
          <div class="card">
            <div class="card-header">
              <div class="row">
                  <div class="col">
                      ${item.name}
                  </div>
                  <div class="col-lg-1">
                      <a class="btn" data-toggle="modal" data-target="#deleteModal">
                          <span class="fas fa-trash-alt btn-delete"/>
                      </a>
                  </div>
                  <div class="col-md-auto">
                      <a class="btn" data-toggle="modal" data-target="#exampleModal">
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
            cardTemplate += `<span 
                            class="badge badge-pill tag" 
                            style="background: ${tag.color}">
                              ${tag.name}
                          </span>`;
          });


          cardTemplate += `<p class="card-text">
                           ${item.comment ? item.comment : ""}                       
                          </p>
                          </div>
                       </div>`;
          result += cardTemplate;
        });
        CONTAINER.append(result);

        /*--------Здесь нужно сделать bind эвентов для кнопок карточки--------*/
        //bindEvents($table, 'button', deleteItem);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  init();
});

