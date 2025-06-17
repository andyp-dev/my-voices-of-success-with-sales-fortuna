document.addEventListener('DOMContentLoaded', () => {
  const reviewsCarouselContainer = document.querySelector('.reviews-carousel');
  const reviewsTrack = document.querySelector('.reviews-carousel__track');
  const navArrowLeft = document.querySelector('.nav-arrow--left');
  const navArrowRight = document.querySelector('.nav-arrow--right');
  const paginationDotsContainer = document.querySelector('.pagination');

  let currentOffset = 0;
  let cardsPerView = 3; // Базове значення для десктопу
  let slideMovementUnit;
  let maxOffsetToScroll;

  // Функція для оновлення розмірів каруселі та розрахунків
  function updateCarouselDimensions() {
    reviewsTrack.children.length;

    // Динамічно визначаємо cardsPerView на основі брейкпойнтів
    if (window.innerWidth <= 768) {
      // tablet-sm і нижче
      cardsPerView = 1;
    } else if (window.innerWidth <= 992) {
      // tablet-md
      cardsPerView = 1; // Якщо на tablet-md теж 1 картка
    } else if (window.innerWidth <= 1200) {
      // desktop-lg
      cardsPerView = 2;
    } else {
      // desktop-xl і вище
      cardsPerView = 3;
    }

    const firstReviewCard = reviewsTrack.querySelector('.review-card');
    if (!firstReviewCard) {
      console.warn('No review cards found in the carousel track.');
      return;
    }

    // Отримання фактичної ширини картки та CSS gap
    const cardWidth = firstReviewCard.offsetWidth;
    const computedTrackStyle = window.getComputedStyle(reviewsTrack);
    const carouselGap = parseFloat(computedTrackStyle.gap); // Отримаємо числове значення gap

    // Розмір одиниці прокрутки: ширина картки + проміжок
    slideMovementUnit = cardWidth + carouselGap;

    // Якщо cardsPerView = 1, а gap = 0 на мобільних, slideMovementUnit = cardWidth
    // Це забезпечує коректну роботу, навіть якщо gap не діє на всіх брейкпойнтах

    // Обчислення максимального офсету для прокрутки
    // Це сума всіх карток + проміжків мінус видима область
    maxOffsetToScroll =
      reviewsTrack.scrollWidth - reviewsCarouselContainer.offsetWidth;

    // Обмежуємо maxOffsetToScroll нулем, щоб уникнути від'ємних значень
    // (якщо вміст менший за контейнер, прокрутка не потрібна)
    maxOffsetToScroll = Math.max(0, maxOffsetToScroll);

    // Клампаємо поточний офсет, щоб він не виходив за межі
    currentOffset = Math.max(0, Math.min(currentOffset, maxOffsetToScroll));

    // Оновлюємо позицію треку
    reviewsTrack.style.transform = `translateX(-${currentOffset}px)`;

    // --- Debugging Logs ---
    console.group('Carousel Dimensions Update');
    console.log('Window Width:', window.innerWidth);
    console.log('Cards Per View (Calculated):', cardsPerView);
    console.log('First Card OffsetWidth:', cardWidth);
    console.log('Carousel Gap (from CSS):', carouselGap);
    console.log('Slide Movement Unit:', slideMovementUnit);
    console.log(
      'reviewsCarouselContainer.offsetWidth (Visible Area):',
      reviewsCarouselContainer.offsetWidth,
    );
    console.log(
      'reviewsTrack.scrollWidth (Total Content Width):',
      reviewsTrack.scrollWidth,
    );
    console.log('Max Offset To Scroll:', maxOffsetToScroll);
    console.log('Current Offset (after clamping):', currentOffset);
    console.groupEnd();
    // --- End Debugging Logs ---

    updatePaginationDots();
    updateButtonStates();
  }

  // Функція для оновлення стану кнопок навігації (активні/неактивні)
  function updateButtonStates() {
    if (navArrowLeft) {
      navArrowLeft.disabled = currentOffset === 0;
    }
    if (navArrowRight) {
      navArrowRight.disabled = currentOffset >= maxOffsetToScroll;
    }
  }

  // Функція для оновлення точок пагінації
  function updatePaginationDots() {
    if (!paginationDotsContainer) return;

    // Очищаємо існуючі точки
    paginationDotsContainer.innerHTML = '';

    // Забезпечуємо мінімум одну сторінку, якщо прокрутка не потрібна
    const actualNumPages = Math.max(
      1,
      Math.ceil(maxOffsetToScroll / slideMovementUnit) + 1,
    );

    for (let i = 0; i < actualNumPages; i++) {
      const dot = document.createElement('span');
      dot.classList.add('pagination__dot');

      // Визначаємо активну точку
      // currentCardIndex - це індекс першої видимої картки
      // Простіший варіант:
      const pageOffset = i * slideMovementUnit;
      if (
        currentOffset >= pageOffset &&
        currentOffset < pageOffset + slideMovementUnit
      ) {
        dot.classList.add('pagination__dot--active');
      }

      // Додаємо обробник кліку для навігації за допомогою точок
      dot.addEventListener('click', () => {
        let targetOffset = i * slideMovementUnit;
        // Обмежуємо цільовий офсет
        currentOffset = Math.min(targetOffset, maxOffsetToScroll);
        reviewsTrack.style.transform = `translateX(-${currentOffset}px)`;
        updateButtonStates();
        updatePaginationDots(); // Оновлюємо, щоб активна точка змінилася
      });
      paginationDotsContainer.appendChild(dot);
    }
    // Оновлення активної точки після створення всіх точок, щоб логіка була більш надійною
    const dots = paginationDotsContainer.querySelectorAll('.pagination__dot');
    // Якщо currentOffset == maxOffsetToScroll, то остання точка має бути активною
    let activeDotIndex = Math.round(currentOffset / slideMovementUnit);
    if (dots[activeDotIndex]) {
      dots[activeDotIndex].classList.add('pagination__dot--active');
    } else if (currentOffset === maxOffsetToScroll && dots.length > 0) {
      // Якщо ми в кінці, але заокруглення не спрацювало, активуємо останню точку
      dots[dots.length - 1].classList.add('pagination__dot--active');
    }
  }

  // Обробники кліків для стрілок навігації
  if (navArrowLeft) {
    navArrowLeft.addEventListener('click', () => {
      currentOffset -= slideMovementUnit;
      currentOffset = Math.max(0, currentOffset); // Не дозволяємо йти нижче 0
      reviewsTrack.style.transform = `translateX(-${currentOffset}px)`;
      updateButtonStates();
      updatePaginationDots();
    });
  }

  if (navArrowRight) {
    navArrowRight.addEventListener('click', () => {
      currentOffset += slideMovementUnit;
      currentOffset = Math.min(currentOffset, maxOffsetToScroll); // Не дозволяємо йти вище maxOffsetToScroll
      reviewsTrack.style.transform = `translateX(-${currentOffset}px)`;
      updateButtonStates();
      updatePaginationDots();
    });
  }

  // Ініціалізація каруселі при завантаженні сторінки
  window.addEventListener('load', updateCarouselDimensions);
  // Оновлення каруселі при зміні розміру вікна
  window.addEventListener('resize', updateCarouselDimensions);

  // Початкова ініціалізація на випадок, якщо load вже спрацював до DOMContentLoaded
  // або якщо DOMContentLoaded спрацьовує раніше, ніж всі зображення завантажаться.
  updateCarouselDimensions();
});
