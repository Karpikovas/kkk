'use strict';

const audioTemplate = document.createElement('template');

audioTemplate.innerHTML = `
  <style>
    .audio {
      display: flex;
      flex: auto;
      justify-content: space-between;
      align-items: center;
      margin: 1em;
      height: 2.5em;
      
      max-width: 31em;
      min-width: 3em;
    
      background: #9370DB;
      border-radius: 10px;
      border: 2px dashed white;
      -webkit-user-select: none;
    }
    .audio__item {
      margin: 5px 0.7em 0;
      /*margin-left: 0.7em;*/
    }
    .audio__icon {
      font-size: 20px;
      color: white;
      background-color: Transparent;
      background-repeat:no-repeat;
      border: none;
      cursor:pointer;
      overflow: hidden;
      outline:none;
      opacity: 0.6;
    }
    .audio__icon:hover {
      opacity: 1;
    }
    .text-label {
      text-align: center;
      color: white;
      cursor: default;
      -webkit-user-select: none;
    }
    .disabled {
      pointer-events: none;
      opacity: 0.3;
    }
    simple-slider {
      flex-grow: 5;
    }
    volume-slider {
      flex-grow: 3;
    }
    button {
    padding: 0;
    }
    i {
    width: 22px;
    }
  </style>
  
  <div class="audio">
  
    <button class="audio__item audio__icon">
      <i class="fas fa-play" aria-hidden="true"></i>
    </button>
    
    <simple-slider min="0" max="100" value="0" class="audio__item disabled"></simple-slider>
    
    <volume-slider volume="0.50" class="audio__item disabled"></volume-slider>
    
    
    <div class="audio__item text-label disabled">1x</div>
    
  </div>
  <link rel="stylesheet" href="https://kit-free.fontawesome.com/releases/latest/css/free.min.css" media="all">
`;


class AudioControl extends HTMLElement {
  constructor(src) {
    super();

    this.src = src;
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(audioTemplate.content.cloneNode(true));

    this.btnPlay = this.shadowRoot.querySelector('.audio__icon');
    this.playIcon = this.shadowRoot.querySelector('.fas');
    this.btnSpeed = this.shadowRoot.querySelector('.audio__item.text-label');

    this.volumeSlider = this.shadowRoot.querySelector('volume-slider');
    this.progressBar = this.shadowRoot.querySelector('simple-slider');

    this.bindEvents();
  }



  static get observedAttributes() {
     return ['value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value') {
      this.progressBar.value = newValue;
    }
  }
  get src() {
    return this.getAttribute('src') || undefined;
  }

  set src(value) {
    this.setAttribute('src', value);
  }

  get volume() {
    return this.getAttribute('volume') || undefined;
  }

  set volume(value) {
    this.setAttribute('volume', value);
  }

  get value() {
    return this.getAttribute('value') || undefined;
  }

  set value(value) {
    this.setAttribute('value', value);
  }

  get speed() {
    return this.getAttribute('speed') || undefined;
  }

  set speed(value) {
    this.setAttribute('speed', value);
  }

  togglePlay() {
    if (this.playIcon.classList.contains('fa-play')) {
      this.dispatchEvent(new CustomEvent('play', {
        bubbles: true,
        composed: true
      }));
      toggleIcon(this.playIcon, 'fa-play', 'fa-pause-circle');
    } else {
      this.dispatchEvent(new CustomEvent('pause', {
        bubbles: true,
        composed: true
      }));
      toggleIcon(this.playIcon, 'fa-pause-circle', 'fa-play');
    }
  }

  bindEvents() {
    this.btnPlay.onclick = () => {
      this.togglePlay();
    };

    this.volumeSlider.addEventListener('change', () => {
      this.volume = this.volumeSlider.volume;

      this.dispatchEvent(new CustomEvent('volumechange', {
        bubbles: true,
        composed: true,
      }));



    });

    this.progressBar.addEventListener('slide', (e) => {
      this.value = e.detail;

      this.dispatchEvent(new CustomEvent('timechange', {
        bubbles: true,
        composed: true,
        detail: e.detail
      }));
    });

    this.btnSpeed.onclick = () => {
      if (this.btnSpeed.innerText !== '2x') {
        this.btnSpeed.innerText = '2x';
        this.speed = 2;
      } else {
        this.btnSpeed.innerText = '1x';
        this.speed = 1;
      }
      this.dispatchEvent(new CustomEvent('speedchange', {
        bubbles: true,
        composed: true
      }));
    };
  }

  disable() {
    this.volumeSlider.classList.add('disabled');
    this.progressBar.classList.add('disabled');
    this.btnSpeed.classList.add('disabled');
  }

  enable() {
    this.volumeSlider.classList.remove('disabled');
    this.progressBar.classList.remove('disabled');
    this.btnSpeed.classList.remove('disabled');
  }

}
function toggleIcon(icon, remove, add) {
  icon.classList.remove(remove);
  icon.classList.add(add);
}
customElements.define('audio-control', AudioControl);
