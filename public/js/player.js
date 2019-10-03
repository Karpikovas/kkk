function Player() {

  var audioElement = $('audio');
  var currentAudioControl;

  function init() {
    bindEvents();
  }

  /*------------------События интерфейса аудио-------------------------*/
  function bindAudioEvents(audioControl) {

    audioControl.on('play', () => {

      if (currentAudioControl === undefined) {
        currentAudioControl = audioControl;
        currentAudioControl[0].enable();
        audioElement[0].src = `tracks/download/${ audioControl.parents('.card').data().id }`;
        audioElement[0].load();
      } else if (currentAudioControl !== audioControl) {
        if (!audioElement[0].paused) {
          currentAudioControl[0].togglePlay();
          audioElement[0].pause();
        }
        loadNextTrack(audioControl);
      }
      audioElement[0].play();
    });


    audioControl.on('pause', () => {audioElement[0].pause()});
    audioControl.on('volumechange', (e) => {
      audioElement[0].volume = audioControl[0].volume;
    });

    audioControl.on('timechange', (e) => {
      audioElement[0].currentTime = e.detail * audioElement[0].duration / 100;
    });

    audioControl.on('speedchange', () => audioElement[0].playbackRate = audioControl[0].speed);
  }

  /*----------События тэга Audio---------------------*/
  function bindEvents() {
    audioElement.on ('timeupdate' ,function() {
      if (currentAudioControl) {
        currentAudioControl[0].value = audioElement[0].currentTime / audioElement[0].duration * 100;
      }
    });

    audioElement.on('ended',function () {
      currentAudioControl[0].togglePlay();
      currentAudioControl[0].value = 0;
    });

  }

  /*------------Загрузка следующего трека------------------*/
  function loadNextTrack(elem) {


    currentAudioControl[0].disable();
    currentAudioControl = elem;
    currentAudioControl[0].enable();

    audioElement[0].src = `tracks/download/${ elem.parents('.card').data().id }`;
    audioElement[0].load();
  }

  return {
    init: init,
    bindAudioEvents: bindAudioEvents
  };

}
