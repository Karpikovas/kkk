'use strict';

/*----------Шаблон слайдера-----------------------------*/
const sliderTemplate = document.createElement('template');

sliderTemplate.innerHTML = `
  <style>
    .audio__slider__back {
      height: 0.5em;
      min-width: 100px;
      width: 100%;
      background: #DDA0DD;
      border-radius: 10px;
    }
    
    .small {
      min-width: 30px;
    }
    
    .audio__slider__front {
      height: 100%;
      width: 50%;
      background: #BA55D3;
      
      border-radius: 10px;
      margin: 0;
      padding: 0;
    }
  </style>
  
  <div class="audio__slider__back">
    <div class="audio__slider__front"></div>
  </div>
`;

class Slider extends HTMLElement {

  constructor() {
    super();

    /*---------------Создание Shadow Root------------*/
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(sliderTemplate.content.cloneNode(true));


    this.sliderFront = this.shadowRoot.querySelector('.audio__slider__front');
    this.sliderContainer = this.shadowRoot.querySelector('.audio__slider__back');

    this.bindEvents();
  }

  connectedCallback() {
    /*------Выбор значений из атрибутов--------------*/

    this.value = this.getAttribute('value') || undefined;
    this.min = this.getAttribute('min') || 0;
    this.max = this.getAttribute('max') || 100;


    /*---------Изменение размера слайдера при наличии атрибута small--------------*/
    if (this.hasAttribute('small')) {
      this.sliderContainer.classList.add('small');
    }
  }

  static get observedAttributes() {
    return ['value'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.sliderFront.style.width = newValue + '%';
  }

  get value() {
    return this.getAttribute('value');
  }
  set value(value) {
    this.setAttribute('value', value);
  }

  get max() {
    return this.getAttribute('max');
  }

  set max(value) {
    this.setAttribute('max', value);
  }

  get min() {
    return this.getAttribute('min');
  }
  set min(value) {
    this.setAttribute('min', value);
  }

  bindEvents() {
    this.sliderContainer.onmousedown = (evt) => {


      let move = (evt) => {
        let left = evt.pageX - sliderCoords.left;

        if (left < 0) {
          left = 0;
        }
        let right = this.sliderContainer.offsetWidth;

        if (left > right) {
          left = right;
        }

        this.value = (this.max - this.min) * (left / right);

        /*-------------Создание события slide-----------------*/
        this.dispatchEvent(new CustomEvent('slide', {
          bubbles: true,
          composed: true,
          detail: this.value
        }));

      };

      let sliderCoords = getCoords(this.sliderContainer);
      move(evt);

      document.onmousemove = (evt) => {
        move(evt);
      };

      document.onmouseup = () => {
        document.onmousemove = document.onmouseup = null;
      };
    };

    this.sliderFront.ondragstart = function () {
      return false;
    };
  }

}

function getCoords(elem) {
  let box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

customElements.define('simple-slider', Slider);
