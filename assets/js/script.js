window.addEventListener('DOMContentLoaded', (event) => {
    let placemarks = [];
    // let's pretend that this is what I get from backend
    const list = [
        {
            id: 1,
            coords_x: '59.881218',
            coords_y: '30.304226',
            title: 'ул. Заставская д.31 к.2',
            name: 'ПВЗ Грастин',
            delivery_cost: '250 руб.',
            storage: '7 дней',
            delivery_time: '1-3 дня',
            metro: 'м. Арбатская',
            address: 'ул. Крупская  26',
            info: 'Стоимость доставки 200 руб. Хранение 3 дня',
            point: 'Пункт выдачи "Арбатский"',
            route: 'Lorem ipsum'
        },
        {
            id: 2,
            coords_x: '59.92663',
            coords_y: '30.348495',
            title: 'ул. Крупская д.63 к.43',
            name: 'ПВЗ Грастин',
            delivery_cost: '500 руб.',
            storage: '14 дней',
            delivery_time: '2-6 дней',
            metro: 'м. Арбатская',
            address: 'ул. Новый Арбат 26',
            info: 'Стоимость доставки 200 руб. Хранение 3 дня',
            point: 'Пункт выдачи "Арбатский"',
            route: 'lorem '
        },
        {
            id: 3,
            coords_x: '59.932450',
            coords_y: '30.254037',
            title: 'ул. Заставская д.31 к.2',
            name: 'ПВЗ Грастин',
            delivery_cost: '250 руб.',
            storage: '7 дней',
            delivery_time: '1-3 дня',
            metro: 'м. Арбатская',
            address: '27-я линия Васильевского острова, 16Б',
            info: 'Стоимость доставки 200 руб. Хранение 3 дня',
            point: 'Пункт выдачи "Арбатский"',
            route: 'Lorem ipsum'
        },
        {
            id: 4,
            coords_x: '59.920587',
            coords_y: '30.339099',
            title: 'Звенигородская улица, 14',
            name: 'Lorem ipsum',
            delivery_cost: '600 руб.',
            storage: '7 дней',
            delivery_time: '1-3 дня',
            metro: 'м. Арбатская',
            address: 'Звенигородская улица, 14',
            info: 'Стоимость доставки 200 руб. Хранение 3 дня',
            point: 'Пункт выдачи "Арбатский"',
            route: 'Lorem ipsum'
        },
        {
            id: 5,
            coords_x: '59.906070',
            coords_y: '30.403229',
            title: 'Хрустальная улица, 31литО',
            name: 'Lorem ipsum',
            delivery_cost: '600 руб.',
            storage: '20 дней',
            delivery_time: '7-10 дней',
            metro: 'м. Арбатская',
            address: 'Хрустальная улица, 31литО',
            info: 'Стоимость доставки 200 руб. Хранение 3 дня',
            point: 'Пункт выдачи "Арбатский"',
            route: 'Lorem ipsum'
        }
    ]

    ymaps.ready(init);
    function init() {
        let htmlList = list;
        const cardList = document.querySelector('.card__list');
        const filterInput = document.querySelector('#filter');
        const detailCard = document.querySelector('.card__detail');
        const backButton = document.querySelector('.card__back');
        const filterLength = document.querySelector('.filter__number');
        let mql = window.matchMedia('(max-width: 576px)');

        if (mql.matches) {
            const bodyHeight = document.querySelector('body').offsetHeight;
            const asideHeight = document.querySelector('aside').offsetHeight;
            console.log(`body height: ${bodyHeight}`);
            console.log(`aside height: ${asideHeight}`);
            document.querySelector('#map').style.height = `${bodyHeight - asideHeight}px`;
        }

        let myMap = new ymaps.Map("map", {
            center: [59.93909, 30.315877],
            zoom: 12
        });

        list.forEach(elem => {
            addBalloon(elem);
            updateFilterNumber();
        })

        function updateFilterNumber() {
            filterLength.innerHTML = `${htmlList.length}`;
        }

        filterInput.addEventListener('input', function () {
            clearList(cardList);
            htmlList = [];
            myMap.geoObjects.removeAll();
            const inputValue = filterInput.value;

            if (inputValue.trim() !== undefined) {
                for (const elem of list) {
                    if (elem.address.toLowerCase().includes(inputValue.toLowerCase())) {
                        htmlList.push(elem);
                        renderCard(elem);
                    }
                }
            } else {
                htmlList = list;
                list.forEach(elem => {
                    renderCard(elem);
                })
                myMap.setCenter([59.93909, 30.315877], 12, { duration: 300 })
            }
            htmlList.forEach(elem => {
                addBalloon(elem);
            })
            attachDetails();
            updateFilterNumber();
        })

        function clearList(parent) {
            const keepElem = document.querySelector('.card__detail');
            [...parent.children]
                .forEach(child => child !== keepElem ? parent.removeChild(child) : null);
        }

        let promise = new Promise(function (resolve, reject) {
            let itemsProcessed = 0;

            htmlList.forEach((elem, i, array) => {
                renderCard(elem);
                itemsProcessed++;
                if (itemsProcessed === array.length) {
                    resolve();
                }
            })
        })

        promise.then(function () {
            attachDetails();
        })

        function renderCard(item) {
            let text = `<div class="card__item" data-id="${item.id}">` +
                `<span class="card__metro">${item.metro}</span>` +
                `<span class="card__address">${item.address}</span>` +
                `<span class="card__info">${item.info}</span>` +
                `</div>`;

            cardList.insertAdjacentHTML('beforeend', text);
        }

        function attachDetails() {
            cards = document.querySelectorAll('.card__item');
            cards.forEach(elem => {
                let id = elem.getAttribute('data-id');
                elem.addEventListener('click', function () {
                    showDetails(id);
                }, false);
            })
        }

        function showDetails(id) {
            let item = list.find(elem => elem.id === Number(id));
            const detailContent = document.querySelectorAll('.card__detail-content');
            detailContent.forEach(elem => {
                elem.remove();
            })
            let point = '';
            let address = '';
            let route = '';

            if (item.point !== undefined) {
                point = `<span class="card__text">${item.point}</span>`;
            }
            if (item.address !== undefined) {
                address = `<span class="card__text">Адрес: ${item.address}</span>`;
            }
            if (item.route !== undefined) {
                route = `<span class="card__text">Как добраться: </span>` +
                    `<span class="card__info">${item.route}</span>`;
            }

            let content = `<div class="card__detail-content">` +
                point +
                address +
                route +
                `</div>`;

            detailCard.insertAdjacentHTML('beforeend', content);
            detailCard.style.opacity = 1;
            detailCard.style.pointerEvents = 'all';
            document.querySelectorAll('.card__item').forEach(elem => {
                elem.style.height = 0;
                elem.style.opacity = 0;
                elem.style.pointerEvents = 'none';
            })
            placemarks[item.id].balloon.open();
            myMap.setCenter([item.coords_x, item.coords_y], 14, { duration: 300 });
        }

        function addBalloon(elem) {
            let title = '',
                name = '',
                price = '',
                storage = '',
                time = '';

            if (elem.title !== undefined) {
                title = `<span class="map__title">${elem.title}</span>`;
            }
            if (elem.name !== undefined) {
                name = `<span class="map__item"><b>${elem.name}</b></span>`;
            }
            if (elem.delivery_cost !== undefined) {
                price = `<span class="map__item">Стоимость доставки: <b>${elem.delivery_cost}</b></span>`;
            }
            if (elem.storage !== undefined) {
                storage = `<span class="map__item">Хранение: <b>${elem.delivery_cost}</b></span>`;
            }
            if (elem.delivery_time !== undefined) {
                time = `<span class="map__item">Доставка до пункта: <b>${elem.delivery_cost}</b></span>`;
            }

            myMap.geoObjects
                .add(placemarks[elem.id] = new ymaps.Placemark([elem.coords_x, elem.coords_y], {
                    balloonContent: title +
                        `<div class="map__list">` +
                        `<div class="map__info">` +
                        name +
                        price +
                        `</div>` +
                        `<div class="map__info">` +
                        storage +
                        time +
                        `</div>` +
                        `</div>`
                }, {
                    preset: 'islands#icon',
                    iconColor: '#0095b6',
                    iconLayout: 'default#image',
                    iconImageHref: './assets/img/location.svg',
                    iconImageSize: [32, 32],
                }))
        }

        backButton.addEventListener('click', function () {
            detailCard.style.opacity = 0;
            detailCard.style.pointerEvents = 'none';
            document.querySelectorAll('.card__item').forEach(elem => {
                elem.style.height = 'initial';
                elem.style.opacity = 1;
                elem.style.pointerEvents = 'all';
            });
            placemarks.forEach(elem => {
                elem.balloon.close();
            })
            myMap.setCenter([59.93909, 30.315877], 12, { duration: 300 })
        })
    }
});