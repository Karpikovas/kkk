$(document).ready(function () {

  const CONTAINER = $(".container");
  var TAGCONTAINER = $(".nav-item.tags");
  const SELECTEDTAGS = $(".nav-item.tags-selected");

  var startRow = 0;
  const SPINNER = `<div class="label_download">Загрузка...</div>`;
  var inProgress = false;


  // function bindEvents(container, element, action, funcName) {
  //   container.find(element).on('click', funcName);
  // }


  function init() {

    inProgress = true;
    CONTAINER.append(SPINNER);

    getCards();
    getCategories();

    bindEvents();

    $(window).scroll(function () {
      if ($(window).scrollTop() + $(window).height() >= $(document).height() - 50 && !inProgress) {
        getCards();
        inProgress = true;
        CONTAINER.append(SPINNER);
      }
    });
  }

  function bindEvents() {
    //$("select.main-select").on('change', getTags());

    $('.main-select').on('change', function(e){ getTags(this.value) });
    TAGCONTAINER.delegate('.tag', 'click', function (e) {  $(this).clone().appendTo(SELECTEDTAGS) })


  }

  function getTags(category) {

    TAGCONTAINER.empty();
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
                            style="background: ${ item.color }">
                              ${ item.name }
                          </span>`;
              result += tagTemplate;
            });

            TAGCONTAINER.append(result);

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

    axios.get('/tracks', {
      params: {
        row: startRow
      }
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

