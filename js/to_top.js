$(function () {

    let lastScrollPosition = 0;
    let showButton = false;
    const closeButtonHTML = g_is_guest
        ? '<div class="close_panel" title="Убрать панель прокрутки"><span class="close dotted">убрать</span></div>'
        : '';

    // Создаем кнопку "Наверх"
    const toTopButton = $(`
        <div class="to_top">
            <div class="to_top_panel">
                <div class="to_top_button" title="Наверх">
                    <span class="arrow">&uarr;</span> 
                    <span class="label">наверх</span>
                </div>
                ${closeButtonHTML}
            </div>
        </div>
    `);

    $('body').append(toTopButton);

    const $panel = $('.to_top_panel', toTopButton);
    const $arrow = $('.to_top_button .arrow', toTopButton);
    const $label = $('.to_top_button .label', toTopButton);

    // Обработка клика по кнопке "Наверх"/"Вниз"
    $panel.on('click', function () {
        if (toTopButton.hasClass('has_position')) {
            toTopButton.removeClass('has_position');
            $arrow.html('&uarr;');
            $label.text('наверх');
            $.scrollTo(lastScrollPosition, 100, { axis: 'y' });
            lastScrollPosition = 0;
        } else {
            toTopButton.addClass('has_position');
            $arrow.html('&darr;');
            $label.text('вниз');
            lastScrollPosition = window.pageYOffset;
            $.scrollTo($('body'), 100, { axis: 'y' });
        }
    });

    // Закрытие панели
    $('.close_panel', toTopButton).on('click', function (e) {
        e.preventDefault();
        $.post('/json/settings/disable_scrollup/', { action: 'disable' }, function (json) {
            if (json.messages === 'ok') {
                toTopButton.remove();
                $.jGrowl(
                    'Панель отключена. Вы можете настроить показ панели в <a href="/settings/others/">настройках</a>.',
                    { sticky: true }
                );
            } else {
                show_system_error(json);
            }
        });
    });

    // Обработка скролла с оптимизацией
    let scrollTimeout;
    $(window).on('scroll', function () {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            handleScroll();
        }, 50);
    });

    function handleScroll() {
        toggleButtonVisibility();

        // Проверка направления скролла
        if (lastScrollPosition < window.pageYOffset && toTopButton.hasClass('has_position')) {
            showButton = false;
        }
        lastScrollPosition = window.pageYOffset;
    }

    // Показ/скрытие кнопки
    function toggleButtonVisibility() {
        if (window.pageYOffset > 400) {
            if (!showButton) {
                toTopButton.fadeIn();
                toTopButton.removeClass('has_position');
                $arrow.html('&uarr;');
                $label.text('наверх');
                showButton = true;
            }
        } else if (showButton && !toTopButton.hasClass('has_position')) {
            toTopButton.fadeOut();
            showButton = false;
        }
    }

    // Инициализация
    toggleButtonVisibility();
});
