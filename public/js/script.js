$(document).ready(function () {
  const CONTAINER = $(".container");
  var startRow = 0;
  var spinner = `<div class="label_download">Загрузка...</div>`;


  getCards();

  function getCards() {
    axios.interceptors.request.use(config => {
      CONTAINER.append(spinner);
      return config;
    }, error => {
      return Promise.reject(error);
    });

    axios.get('/tracks', {
      params: {
        row: startRow
      }
    })
        .then(function (response) {

          $(".label_download").remove();

          let result = "";
          let tracks = response.data.data;

          tracks.forEach(function (item) {
            let cardTemplate = `
            <div class="card">
              <div class="card-header">
                <div class="row">
                    <div class="col">
                        ${ item.name }
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
                        ${ item.datetime }
                    </div>
                </div>
                </div>
              <div class="card-body text-right">
                <audio-control></audio-control>`

                item.tags.forEach(function (tag) {
                  cardTemplate += `<span 
                              class="badge badge-pill tag" 
                              style="background: ${tag.color}">
                                ${ tag.name }
                            </span>`;
                });


            cardTemplate+= `<p class="card-text"></p>
              </div>
            </div>`;
            result += cardTemplate;
          });
          CONTAINER.append(result);
          //bindEvents($table, 'button', deleteItem);
        })
        .catch(function (error) {
          console.log(error);
        });
  }

});

