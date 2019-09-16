$(document).ready(function () {

  const $create = $("#create");
  const $addButton = $("#addButton");
  const $form = $('#createForm');
  const $table = $("table");

  function bindEvents(container, element, funcName) {
    container.find(element).on('click', funcName);
  }

  function checkAndSendForm() {
    if ($form[0].checkValidity()) {
      var data = {
        name: $('#name').val(),
        secondName: $('#secondName').val(),
        patr: $('#patr').val(),
        birthday: $('#birthday').val()
      };
      axios.post('/create', data, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    }
  }

  function deleteItem() {

    item = $(this).data('item');
    message = "Delete item № " + item + "?";

    $('<div></div>').html(message).dialog({
      title: 'Delete',
      resizable: false,
      modal: true,
      buttons: {
        'Ok': function () {
          axios.post(`/delete/${item}/process`, {
            headers: {
              'Content-Type': 'application/json',
            }
          })
              .then(function (response) {
                console.log(response);
              })
              .catch(function (error) {
                console.log(error);
              });
          $(this).dialog('close');
          location.reload();
        }
      }
    });
  }

  $create.hide();

  $addButton.click(function () {
    $create.toggle("fold", 500);
    bindEvents($create, '#addNew', checkAndSendForm);
  });

  axios.get('/items')
      .then(function (response) {
        let result = "";
        let items = response.data.items;

        items.forEach(function (item) {
          body = `
            <tr>
              <td>${item.id}</td>
              <td>${item.name}</td>
              <td>${item.secondname}</td>
              <td>${item.patr}</td>
              <td>${item.birthday}</td>
              <td><button data-item="${item.id}">DELETE</button></td>
            </tr>
          `;
          result += body;
        });
        $table.append(result);
        bindEvents($table, 'button', deleteItem);
      })
      .catch(function (error) {
        console.log(error);
      });
});


/*
const $container = $('#content');


function checkAndSendForm() {

}

function render(container, data) {
  let html = ...
  container.html(html)
}

function bindEvents(container) {
  container.find('#form-submit-btn').on(checkAndSendForm);
}

function onAddBtnClick() {
  render($container, ...);
  bindEvents($container);
}

....on('click', onAddBtnClick);

*/


/*
модуль

  переменные
  переменные
  переменные

  объявление функции
  объявление функции
  объявление функции

  высокоуровневые функции

  исполняемый код
 */


