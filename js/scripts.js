const AW = {};

$.validator.addMethod('mobileRu', function (phone_number, element) {
  const ruPhone_number = phone_number.replace(/\(|\)|\s+|-/g, "");
  return this.optional(element) || ruPhone_number.length > 9 && /^((\+7|7|8)+([0-9]){10})$/.test(ruPhone_number);
}, "Введите корректный номер телефона");

AW.FANCYBOX_DEFAULTS = {
  hideScrollbar: false,
  Hash: false,
  Thumbs: {
    type: 'classic',
  },
  Toolbar: {
    display: {
      left: ['infobar'],
      middle: [
        'zoomIn',
        'zoomOut',
      ],
      right: ['close'],
    },
  },
}

AW.initMask = function ($field) {
  const type = $field.attr('data-mask');
  let result;
  switch (type) {
    case 'phone':
      result = IMask($field[0], {
        mask: '+{7} (000) 000-00-00',
        lazy: $field.hasClass('field-input1'),
        placeholderChar: '_'
      });
      break;
  }

  return result;
};

AW.validateForm = function ($el) {
  if ($el.length === 0) return;

  const validator = $el.validate({
    ignore: [],
    errorClass: 'form-group__error',
    errorPlacement: function (error, element) {
      const $parent = $(element).closest('.form-group, .form-group1');
      $parent.append(error);
    },
    highlight: function (element) {
      const $parent = $(element).closest('.form-group, .form-group1');
      $parent.addClass('form-group_error');
    },
    unhighlight: function (element) {
      const $parent = $(element).closest('.form-group, .form-group1');
      $parent.removeClass('form-group_error');
    },
    submitHandler: function (form, event) {
      event.preventDefault();
      const trigger = $el.attr('data-onsubmit-trigger');
      if (trigger) {
        $(document).trigger(trigger, { event, form });
      } else {
        form.submit();
      }
    }
  });

  // Добавление правил валидации
  $el.find('.field-input1, .field-input2, .checkbox__input, select').each(function () {
    const $input = $(this);

    if ($input.is(':required')) {
      $input.rules('add', {
        required: true,
        messages: {
          required: 'Заполните это поле',
        }
      });
    }

    if ($input.attr('data-type') === 'phone') {
      $input.rules('add', {
        mobileRu: true,
        messages: {
          mobileRu: 'Неверный формат',
        }
      });
    }

    if ($input.attr('data-type') === 'email') {
      $input.rules('add', {
        email: true,
        messages: {
          email: 'Неверный формат',
        }
      });
    }
  });

  // Переключение видимости пароля
  $el.on('click', '.form-group1__icon.toggle-password', function (e) {
    e.preventDefault();

    const $icon = $(this);
    const $parent = $icon.closest('.form-group1');
    const $input = $parent.find('input[data-type="password"]');

    if ($input.length > 0) {
      const isPassword = $input.attr('type') === 'password';
      $input.attr('type', isPassword ? 'text' : 'password');

      // Переключаем отображение иконок
      $parent.find('.form-group1__icon').each(function () {
        $(this).toggleClass('hidden');
      });
    }
  });

  return validator;
};

AW.StepCounter = class {
  /**
   * Constructor function for creating an instance of the class.
   *
   * @param {jQuery} $element - The jQuery element to bind the functionality to.
   * @param {function} callback - The callback function to be executed on value change.
   * @throws {Error} Throws an error if the element is not found.
   * @return {void}
   */
  constructor($element, callback) {
    if (!$element) throw Error('Element not found!');
    this.element = $element;
    this.callback = callback || null;
    this.btnIncreaseElement = $element.find('[data-stepcounter="+"]');
    this.btnDecreaseElement = $element.find('[data-stepcounter="-"]');
    this.fieldElement = $element.find('[data-stepcounter-input]');
    this.valueElement = $element.find('[data-stepcounter-value]');

    this.maxValue = Number(this.fieldElement.attr('max')) || 10000;
    this.minValue = Number(this.fieldElement.attr('min')) || 0;
    this.step = Number(this.fieldElement.attr('step')) || 1;
    this.value = Number(this.fieldElement.val());

    this.btnIncreaseElement.on('click', this.handleBtnIncrease.bind(this));
    this.btnDecreaseElement.on('click', this.handleBtnDecrease.bind(this));

    this.validateValue(this.value);
  }

  /**
   * Handles the click event of the increase button.
   *
   * @param {Event} event - The click event object.
   * @return {undefined} This function does not return a value.
   */
  handleBtnIncrease(event) {
    event.preventDefault();
    this.updateValue(this.value + this.step);
  }

  /**
   * Handles the click event of the decrease button.
   *
   * @param {Event} event - The click event object.
   * @return {undefined} This function does not return a value.
   */
  handleBtnDecrease(event) {
    event.preventDefault();
    this.updateValue(this.value - this.step);
  }

  /**
   * Updates the value of the object and renders it.
   *
   * @param {number} newValue - The new value to be assigned.
   * @param {boolean} noValidate - Flag indicating whether the value should be validated. Defaults to false.
   */
  updateValue(newValue, noValidate = false) {
    const validatedValue = noValidate ? newValue : this.validateValue(newValue);
    this.value = validatedValue;
    this.renderValue(this.value);
    if (this.callback) {
      this.callback(this.value);
    }
  }

  /**
   * Disables a button based on the given parameter.
   *
   * @param {string} btn - The button to enable. It can be either 'increase' or 'decrease'.
   */
  disableBtn(btn) {
    if (btn === 'increase') {
      this.btnIncreaseElement.attr('disabled', true);
    }
    if (btn === 'decrease') {
      this.btnDecreaseElement.attr('disabled', true);
    }
  }

  /**
   * Enables a button based on the given parameter.
   *
   * @param {string} btn - The button to enable. It can be either 'increase' or 'decrease'.
   */
  enableBtn(btn) {
    if (btn === 'increase') {
      this.btnIncreaseElement.attr('disabled', false);
    }
    if (btn === 'decrease') {
      this.btnDecreaseElement.attr('disabled', false);
    }
  }

  /**
   * Validates the given value based on the minimum and maximum values.
   *
   * @param {number} value - The value to be validated.
   * @return {number} The validated value within the specified range.
   */
  validateValue(value) {
    let validatedValue;
    if (value >= this.maxValue) {
      validatedValue = this.maxValue;
      this.disableBtn('increase');
    } else if (value <= this.minValue) {
      validatedValue = this.minValue;
      this.disableBtn('decrease');
    } else {
      validatedValue = value;
      this.enableBtn('increase');
      this.enableBtn('decrease');
    }
    return validatedValue;
  }

  /**
   * Renders the value by updating the field element's value
   * and the value element's text.
   *
   * @param {Number} value - The value to be rendered.
   */
  renderValue(value) {
    this.fieldElement.val(value);
    this.valueElement.text(value);
  }

  /**
   * Retrieves the current value.
   *
   * @return {number} The current value.
   */
  getCurrentValue() {
    return this.value;
  }

  /**
   * This function destroys the event listeners for the button elements.
   */
  destroy() {
    this.btnIncreaseElement.off('click', this.handleBtnIncrease.bind(this));
    this.btnDecreaseElement.off('click', this.handleBtnDecrease.bind(this));
  }
};

AW.duplicateSwiperSlides = function (el, slidesPerView) {
  const $slides = $(el).find('.swiper-slide');
  const $wrapper = $(el).find('.swiper-wrapper');
  if ($slides.length < slidesPerView * 2 && $slides.length > 3) {
    $slides.each(function () {
      $(this).clone().appendTo($wrapper);
    });
  }
}

AW.initSliderIntro = function ($el) {
  return new Swiper($el[0], {
    loop: true,
    spaceBetween: 0,
    slidesPerView: 1,
    speed: 200,
    pagination: {
      el: $el.find('.swiper-pagination')[0],
    },
    navigation: {
      nextEl: $el.find('.swiper-nav1_next')[0],
      prevEl: $el.find('.swiper-nav1_prev')[0],
    }
  });
}

AW.initSliderPopular = function ($el) {
  const $wrapper = $('[data-swiper-wrapper="popular"]');
  const $navNext = $wrapper.find('.swiper-nav_next');
  const $navPrev = $wrapper.find('.swiper-nav_prev');
  const $pagination = $wrapper.find('.swiper-pagination');
  const $slides = $el.find('.swiper-slide');
  return new Swiper($el[0], {
    loop: true,
    spaceBetween: 5,
    slidesPerView: 2,
    speed: 200,
    navigation: {
      nextEl: $navNext[0],
      prevEl: $navPrev[0],
    },
    pagination: {
      el: $pagination[0],
    },
    breakpoints: {
      1100: {
        slidesPerView: 3,
        loop: $slides.length < 6 ? false : true,
        spaceBetween: 20
      }
    }
  });
}

AW.initSliderNews = function ($el) {
  const wrapper = $el[0].closest('[data-swiper-wrapper="news"]');
  const $slides = $el.find('.swiper-slide');
  const instance = new Swiper($el[0], {
    loop: true,
    spaceBetween: 5,
    slidesPerView: 'auto',
    speed: 200,
    navigation: {
      nextEl: wrapper.querySelector('.swiper-navbar .swiper-nav_next'),
      prevEl: wrapper.querySelector('.swiper-navbar .swiper-nav_prev'),
    },
    pagination: {
      el: wrapper.querySelector('.swiper-pagination'),
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
        loop: $slides.length < 4 ? false : true,
        spaceBetween: 15,
        navigation: {
          nextEl: wrapper.querySelector('.heading-complex .swiper-nav_next'),
          prevEl: wrapper.querySelector('.heading-complex .swiper-nav_prev'),
        },
      },
      1100: {
        slidesPerView: 3,
        loop: $slides.length < 6 ? false : true,
        spaceBetween: 20
      }
    }
  });
}

AW.initSliderSimilar = function ($el) {
  const wrapper = $el[0].closest('[data-swiper-wrapper="similar"]');
  const $slides = $el.find('.swiper-slide');

  const nextButtons = [
    wrapper.querySelector('.swiper-navbar .swiper-nav_next'), // Мобильная версия
    wrapper.querySelector('.heading-complex .swiper-nav_next') // Десктопная версия
  ].filter(Boolean);

  const prevButtons = [
    wrapper.querySelector('.swiper-navbar .swiper-nav_prev'), // Мобильная версия
    wrapper.querySelector('.heading-complex .swiper-nav_prev') // Десктопная версия
  ].filter(Boolean);

  const instance = new Swiper($el[0], {
    loop: true,
    spaceBetween: 5,
    slidesPerView: 'auto',
    speed: 200,
    navigation: {
      nextEl: nextButtons,
      prevEl: prevButtons,
    },
    pagination: {
      el: wrapper.querySelector('.swiper-navbar .swiper-pagination'),
    },
    breakpoints: {
      480: {
        slidesPerView: 1,
        loop: $slides.length < 4 ? false : true,
        spaceBetween: 15,
      },
      480: {
        slidesPerView: 1.5,
        loop: $slides.length < 4 ? false : true,
        spaceBetween: 15,
      },
      640: {
        slidesPerView: 2,
        loop: $slides.length < 4 ? false : true,
        spaceBetween: 15,
      },
      992: {
        slidesPerView: 2.5,
        loop: $slides.length < 4 ? false : true,
        spaceBetween: 15,
      },
      1200: {
        slidesPerView: 3,
        loop: $slides.length < 6 ? false : true,
        spaceBetween: 20
      },
      1550: {
        slidesPerView: 4,
        loop: $slides.length < 4 ? false : true,
        spaceBetween: 20,
      },

    }
  });
};

AW.initProductSlider = function ($el) {
  const $wrapper = $('[data-swiper-wrapper="product-card"]');
  const $navNext = $wrapper.find('.swiper-nav_next');
  const $navPrev = $wrapper.find('.swiper-nav_prev');

  // Инициализация миниатюр (thumbs)
  const thumbsSwiper = new Swiper('.top-block-product__thumbs .swiper-thumbs', {
    observer: true,
    observeParents: true,
    slidesPerView: 5,
    spaceBetween: 12,
    direction: 'vertical',
    speed: 400,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    breakpoints: {
      0: {
        direction: 'horizontal',
        slidesPerView: 5.4,
      },
      1100: {
        direction: 'vertical',
        slidesPerView: 5,
      },
    },
  });

  // Инициализация основного слайдера
  const mainSwiper = new Swiper('.top-block-product__sliders .swiper-product-card', {
    thumbs: {
      swiper: thumbsSwiper,
    },
    observer: true,
    observeParents: true,
    slidesPerView: 1,
    spaceBetween: 2,
    speed: 400,
    navigation: {
      nextEl: $navNext[0],
      prevEl: $navPrev[0],
    },
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
  });
};

AW.fadeMain = function () {
  $('.main-wrapper-outer').addClass('main-wrapper-outer_faded');
}

AW.unfadeMain = function () {
  $('.main-wrapper-outer').removeClass('main-wrapper-outer_faded');
}

AW.showSearch = function () {
  $('.header__inner').removeClass('header__inner_active');
  $('.header__burger .btn-burger').show();
  $('.header__burger .btn-burger-close[data-action="hideMenuMobile"]').hide();

  $('.header-search').addClass('header-search_active');
  $('.header-search__input').focus();

  $('.header').addClass('header_search-active');
  AW.fadeMain();
}

AW.hideSearch = function () {
  $('.header-search').removeClass('header-search_active');
  $('.header-search__input').val('');
  $('.header').removeClass('header_search-active');
  AW.hideSearchDropdown();
  AW.unfadeMain();
}

AW.showSearchDropdown = function () {
  $('.header-search__dropdown').addClass('header-search__dropdown_active');
}

AW.hideSearchDropdown = function () {
  $('.header-search__dropdown').removeClass('header-search__dropdown_active');
}

AW.resetForm = function ($form) {
  $form.find('input').each(function () {
    if ($(this).attr('data-mask')) {
      const mask = AW.initMask($(this));
      mask.value = '';
    } else {
      $(this).val('');
    }
  });
  $form.find('.form-group1').removeClass('form-group1_error');
  $form.find('.form-group1__error').remove();
}

AW.buildNotification = function (title, name, photo) {
  return `
    <div class="card-notification">
      <button data-action="removeNotification" class="card-notification__close" type="button">
        <svg aria-hidden="true" width="14" height="14">
          <use xlink:href="img/sprite.svg#close1"></use>
        </svg>
        <span class="v-h">Скрыть уведомление</span>
      </button>
      <div class="card-notification__photo">
        <img src="${photo}" alt="">
      </div>
      <div class="card-notification__data">
        <div class="card-notification__title">
          <a href="cart.html">${title}</a>
        </div>
        <div class="card-notification__name">${name}</div>
      </div>
    </div>
  `;
}

AW.addNotificationToStack = function ($notification) {
  $('.notifications-stack').append($notification);
  setTimeout(() => {
    $notification.addClass('card-notification_removed');
    setTimeout(() => {
      $notification.remove();
    }, 300);
  }, 3000);
}

AW.modal = new HystModal({
  linkAttributeName: "data-hystmodal",
  closeOnOverlay: false,
  afterClose: (modal) => {
    // switch ($(modal.element).attr('id')) {
    //   case 'modalConfirm': {
    //     $('#modalConfirm [data-confirm-ok]').off('click');
    //     $('#modalConfirm [data-confirm-cancel]').off('click');
    //     break;
    //   }

    //   case 'modalVacancy': {
    //     AW.resetForm($('#modalVacancy form'));
    //     break;
    //   }
    // }
  },
});

AW.showMenuMobile = function () {
  $('.header__inner').addClass('header__inner_active');
  $('.header__burger .btn-burger').hide();
  $('.header__burger .btn-burger-close[data-action="hideMenuMobile"]').show();
  AW.fadeMain();
}

AW.hideMenuMobile = function () {
  $('.header__inner').removeClass('header__inner_active');
  $('.header__burger .btn-burger').show();
  $('.header__burger .btn-burger-close[data-action="hideMenuMobile"]').hide();
  AW.unfadeMain();
}

$(document).ready(() => {

  $('.card-info').on('click', function () {
    const $notification = $(AW.buildNotification('В корзину', 'Токарная пластина DNMG150608-TM TC1369, 10 шт/уп', 'img/popular2.webp'));
    AW.addNotificationToStack($notification);
  });

  $(window).on('keyup', (event) => {
    if (event.keyCode === 27) {
      if ($('.header-search').hasClass('header-search_active')) {
        AW.hideSearch();
      }
    }
  });
  Fancybox.defaults.Hash = false;
  Fancybox.defaults.l10n = {
    CLOSE: 'Закрыть',
    NEXT: 'Следующий',
    PREV: 'Предыдущий',
    MODAL: 'Вы можете закрыть это окно нажав на клавишу ESC',
    ERROR: 'Что-то пошло не так, пожалуйста, попробуйте еще раз',
    IMAGE_ERROR: 'Изображение не найдено',
    ELEMENT_NOT_FOUND: 'HTML элемент не найден',
    AJAX_NOT_FOUND: 'Ошибка загрузки AJAX : Не найдено',
    AJAX_FORBIDDEN: 'Ошибка загрузки AJAX : Нет доступа',
    IFRAME_ERROR: 'Ошибка загрузки страницы',
    ZOOMIN: 'Увеличить',
    ZOOMOUT: 'Уменьшить',
    TOGGLE_THUMBS: 'Галерея',
    TOGGLE_SLIDESHOW: 'Слайдшоу',
    TOGGLE_FULLSCREEN: 'На весь экран',
    DOWNLOAD: 'Скачать'
  };

  Fancybox.bind('[data-fancybox]', AW.FANCYBOX_DEFAULTS);

  // Этот хак помогает избежать прыжков анимации при загрузке страницы
  $('body').removeClass('preload');

  $('[data-validate]').each(function () {
    AW.validateForm($(this));
  });

  $('[data-swiper="intro"]').each(function () {
    AW.initSliderIntro($(this));
  });

  $('[data-swiper="popular"]').each(function () {
    AW.initSliderPopular($(this));
  });

  $('[data-swiper="news"]').each(function () {
    AW.initSliderNews($(this));
  });

  $('[data-swiper="product-card"]').each(function () {
    AW.initProductSlider($(this));
  });

  $('[data-swiper="similar"]').each(function () {
    AW.initSliderSimilar($(this));
  });

  $('[data-mask]').each(function () {
    AW.initMask($(this));
  });

  $('[data-stepcounter]').each(function () {
    new AW.StepCounter($(this));
  });

  $('[data-select1]').each(function () {
    new TomSelect($(this)[0], {
      controlInput: null,
      create: true,
      render: {
        item: function (data, escape) {
          return `
            <div class="item">
              ${escape(data.text)}
            </div>
          `;
        },
      },
      onInitialize: function () {
        $(this.control).append(`
          <svg aria-hidden="true" width="14" height="9">
            <use xlink:href="img/sprite.svg#chevron1"></use>
          </svg>
        `);
      }
    });
  });

  $('[data-expandable-handle]').click(function () {
    const $parent = $(this).closest('[data-expandable]');
    const $accordion = $(this).closest('[data-container="accordion"]');
    if ($parent.attr('data-expandable') === 'collapsed') {
      $accordion.find('[data-expandable="expanded"] [data-expandable-clip]').css('overflow', 'hidden');
      $accordion.find('[data-expandable="expanded"]').attr('data-expandable', 'collapsed');
      $parent.attr('data-expandable', 'expanded');
      setTimeout(() => {
        // Небольшой костыль для ровной работы экспандера
        $parent.find('[data-expandable-clip]').css('overflow', 'visible');
      }, 250);
    } else {
      $parent.find('[data-expandable-clip]').css('overflow', 'hidden');
      $parent.attr('data-expandable', 'collapsed');
    }
  });

  $('.swiper-catalog-wrapper').each(function () {
    const $navNext = $(this).find('.swiper-nav_next');
    const $navPrev = $(this).find('.swiper-nav_prev');
    new Swiper($(this).find('.swiper-catalog')[0], {
      loop: false,
      spaceBetween: 31,
      slidesPerView: 1,
      watchSlidesProgress: true,
      navigation: {
        nextEl: $navNext[0],
        prevEl: $navPrev[0],
      },
      breakpoints: {
        650: {
          slidesPerView: 2,
        },
        900: {
          slidesPerView: 3,
        },
        1280: {
          slidesPerView: 4,
        }
      }
    });
  });

  $('body').on('click', function (event) {
    if (
      $('.header-search').hasClass('header-search_active')
      &&
      $(event.target).attr('data-action') !== 'showSearch'
      &&
      $(event.target).closest('[data-action="showSearch"]').length === 0
      &&
      $(event.target).closest('.header-search').length === 0
      &&
      !$(event.target).hasClass('header-search')
    ) {
      AW.hideSearch();
    }

    if (
      $('.dropdown').hasClass('dropdown_active')
      &&
      $(event.target).attr('data-action') !== 'toggleDropdown'
      &&
      $(event.target).closest('[data-action="toggleDropdown"]').length === 0
      &&
      $(event.target).closest('.dropdown').length === 0
      &&
      !$(event.target).hasClass('dropdown')
    ) {
      $('.dropdown.dropdown_active').removeClass('dropdown_active');
    }

    if ($(event.target).attr('data-action')) {
      const alias = $(event.target).attr('data-action');
      switch (alias) {
        case 'removeNotification': {
          const $element = $(event.target).closest('.card-notification');
          $element.addClass('card-notification_removed');
          setTimeout(() => {
            $element.remove();
          }, 300);
          break;
        }
      }
    }
  });

  $('body').on('click', '[data-action]', function (event) {
    const alias = $(this).attr('data-action');

    switch (alias) {
      case 'showMenuMobile': {
        AW.showMenuMobile();
        break;
      }

      case 'hideMenuMobile': {
        AW.hideMenuMobile();
        break;
      }

      case 'showSearch': {
        AW.showSearch();
        break;
      }

      case 'hideSearch': {
        AW.hideSearch();
        break;
      }

      case 'toggleDropdown': {
        const $dropdown = $(this).closest('.dropdown');
        $('.dropdown.dropdown_active').removeClass('dropdown_active');
        $dropdown.toggleClass('dropdown_active')
        break;
      }
    }
  });

  $('body').on('input', '[data-action-input]', function (event) {
    const alias = $(this).attr('data-action-input');

    switch (alias) {
      case 'testAction': {
        break;
      }
    }
  });

  $('.btn-load').click(function () {
    $(this).find('.spinner').toggleClass('spinner_active');
  });

  const menuBlockTitles = document.querySelectorAll('.menu-block__title');

  if (menuBlockTitles) {
    menuBlockTitles.forEach(menuBlockTitle => {
      menuBlockTitle.addEventListener("click", function (e) {
        const menuBlock = this.closest('.menu-block');
        if (menuBlock) {
          menuBlock.classList.toggle("active");
        }
      });
    });
  }

  const filterBlocks = document.querySelectorAll('.filter-block');
  if (filterBlocks) {
    filterBlocks.forEach(filterBlock => {
      const topTrigger = filterBlock.querySelector('.filter-block__top');
      const closeButton = filterBlock.querySelector('.filter-block__close');

      const openFilter = () => {
        document.documentElement.classList.add('filter-open');
        AW.fadeMain();
      };

      const closeFilter = () => {
        document.documentElement.classList.remove('filter-open');
        AW.unfadeMain();
      };

      topTrigger.addEventListener('click', openFilter);

      closeButton.addEventListener('click', closeFilter);
    });
  }

  const addToCartButtons = document.querySelectorAll('.btn-catalog');
  if (addToCartButtons) {
    addToCartButtons.forEach(button => {
      const parentBlock = button.closest('.card-product-catalog__buy-descr');
      if (!parentBlock) return;

      const stepCounter = parentBlock.querySelector('.stepcounter');

      button.addEventListener('click', () => {
        stepCounter.classList.add('active');

        button.classList.add('hidden');
      });
    });
  }

  const productCatalogs = document.querySelectorAll('.card-product-catalog');
  if (productCatalogs) {
    function adjustLogoPosition() {

      const windowWidth = window.innerWidth;

      if (windowWidth < 1550) {
        productCatalogs.forEach(productCatalog => {
          const blocks = productCatalog.querySelector('.card-product__blocks');
          const logo = productCatalog.querySelector('.card-product-catalog__logo');

          if (blocks && logo) {
            // Вычисляем ширину .card-product__blocks
            const blockWidth = blocks.offsetWidth;
            logo.style.left = `${blockWidth + 10}px`; // Ширина блока + отступ
          } else if (logo) {
            // Если .card-product__blocks отсутствует, устанавливаем left = 7px
            logo.style.left = '7px';
          }
        });
      } else {
        productCatalogs.forEach(productCatalog => {
          const logo = productCatalog.querySelector('.card-product-catalog__logo');
          if (logo) {
            logo.style.left = '';
          }
        });
      }
    }
    window.addEventListener('resize', () => {
      adjustLogoPosition();
    });
  }

  const checklists = document.querySelectorAll('.checklist');
  if (checklists) {
    checklists.forEach(checklist => {
      const items = checklist.querySelectorAll('.order-checkbox-text');

      items.forEach(item => {
        item.addEventListener('click', () => {
          items.forEach(otherItem => {
            otherItem.classList.remove('checked');
          });

          item.classList.add('checked');
        });
      });
    });
  }

  const catalogButton = document.querySelector('.btn-catalog');
  const closeButton = document.querySelector('.menu-block__close');
  const productsBlock = document.querySelector('.header__products');

  const toggleProducts = () => {
    productsBlock.classList.toggle('active');
  };
  const hideProducts = () => {
    productsBlock.classList.remove('active');
  };

  if (catalogButton) {
    catalogButton.addEventListener('click', (event) => {
      event.preventDefault();
      toggleProducts();
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', (event) => {
      event.preventDefault();
      hideProducts();
    });
  }
});
