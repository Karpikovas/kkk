$(document).ready(function () {
  const TAGCONTAINER = $('*[data-tags-list-type="all"]');
  const SELECTEDTAGS = $('*[data-tags-list-type="selected"]');
  const INPUTCATEGORY = $('*[data-select-type="tags-list"]');

  var tagsArray = [];

  function init() {
    // getCategories();
    bindEvents();
  }

  function bindEvents() {
    /*---------------- Получение тэгов при изменении значения в выпадающем списке ------------*/
    // INPUTCATEGORY.on('change', function(event){ getTags(this.value) });

    INPUTCATEGORY.on('change', function(event){ select(this.value) });

    /*----------------- Добавление тэга в "выбранные" при клике на тэг -----------------*/
    TAGCONTAINER.on('click', '.tag', function (event) {  selectTag($(this)) });

    $('.card-body').on('click', '.tag', function (event) {
      returnTag($(this));
    })
  }

  function select(value) {
    let tag = INPUTCATEGORY.find(`option[value=${value}]`);
    let span =`<span class="badge badge-primary tag">${ value }</span>`
    $('.card-body').append(span);
    tag.hide();

  }

  function returnTag(span) {
    let value = span.text();
    $(`option[value=${value}]`).toggle();
    span.remove();
  }

  function getCategories() {
    axios.get('/tags/categories')
      .then(function (response) {

        let result = "";
        let categories = response.data.data;

        categories.forEach(function (item) {
          let category = `<option value="${ item.name }">${ item.name }</option>`;
          result += category;
        });
        INPUTCATEGORY.append(result);
      })
  }

  /*------------------------ Получение и вывод тэгов-----------------------------------------*/

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

            let tagTemplate = `
            <span 
              class="badge badge-pill tag" 
              style="background: ${ item.color }"
              data-category="${ item.category_name }"
              data-name="${ item.name }"
              data-id="${ item.id }">
              ${ item.name }
            </span>`;

            result += tagTemplate;
          });

          TAGCONTAINER.html(result);
        })
    }
  }

  /*----------------- Выбор тэга для трека -------------------------------*/

  function selectTag(currentTag) {

    let tagID = currentTag.data().id;

    if (!tagsArray.includes(tagID)) {
      let newTag = currentTag.clone();

      let btnDelete = `
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>`;

      newTag.append(btnDelete);
      newTag.appendTo(SELECTEDTAGS);
      tagsArray.push(tagID);
    }
  }
  init();
});
