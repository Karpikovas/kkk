$(document).ready(function () {

  const $createFormContainer = $("#create");
  const $showCreateFormBtn = $("#addButton");
  const $createForm = $('#createForm');
  const $table = $("table");

  const $nameInput = $("#name");
  const $secondNameInput = $("#secondName");
  const $patrInput = $("#patr");
  const $birthdayInput = $("#birthday");


  function clearCreateForm() {
    $nameInput.val("");
    $secondNameInput.val("");
    $patrInput.val("");
    $birthdayInput.val("");
  }

  function checkAndSendForm(submitEvent) {
    submitEvent.preventDefault();
    submitEvent.stopPropagation();

    if ($createForm[0].checkValidity()) {

      var data = {
        name: $('#name').val(),
        secondName: $('#secondName').val(),
        patr: $('#patr').val(),
        birthday: $('#birthday').val()
      };

      axios.post('/create', data)
          .then(function (response) {
            clearCreateForm();
            loadList();
          })
          .catch(function (error) {
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
          axios.post(`/delete/${item}/process`)
              .then(function (response) {
                loadList();
              })
              .catch(function (error) {
              });
          $(this).dialog('close');
        }
      }
    });
  }


  function bindEvents() {

    $showCreateFormBtn.click(function () {
      $createFormContainer.toggle("fold", 500);
    });

    $createForm.submit(checkAndSendForm);

    $table.find('button').click(deleteItem);
  }


  function loadList() {

    return axios.get('/items')
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
          $table.find('tbody').html(result);
        })
        .catch(function (error) {
        });
  }


  loadList().then(bindEvents);


});
