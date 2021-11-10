// Variables
const root = document.documentElement;
const body = root.querySelector('body');
const section = document.getElementById('api-grid');
const favSection = document.getElementById('favorites')
let favSectionFlexBox = document.createElement('div');
favSectionFlexBox.classList = 'fav-flex-container container';
const active = 'active';



const dataList = '[data-list]';
let dataListLinks = document.querySelectorAll(dataList);


const modalOpen = '[data-open]';
const modalClose = '[data-close]';
const isVisible = 'is-visible';
let openModal = document.querySelectorAll(modalOpen);
let navButton;

// original lists
let originalList = [];
let reverseOriginalList = [];
let monsters = [];
let spells = [];
let traps = [];
let cardList = [originalList, reverseOriginalList, monsters, spells, traps];
let closeModal;

// fav lists
let favOriginalList = [];
let favReverseList = [];
let favMonsters = [];
let favSpells = [];
let favTraps = [];
let favCardList = [favOriginalList, favReverseList, favMonsters, favSpells, favTraps];

// gallery toggle variables
let slides, buttons, previous, next, current;

// functions

// creating sorted all(original), reverse, monsters, or spell/trap
const sortingCards = (data) => {
    for (let index = 0; index < data.length; index++) {
        const card = data[index];
        card['alphaOrder'] = index;
        originalList.push(card);
        reverseOriginalList.unshift(card);
        if (card.type.includes('Monster')) {
            monsters.push(card);
        } else if (card.type.includes('Spell')) {
            spells.push(card);
        } else if (card.type.includes('Trap')) {
            traps.push(card);
        }
    }
}

// card data in html form.
const paintDOM = (data) => {
    let count = 0;
    for (let cardIndex = 0; count < data.length; cardIndex++) {
        if (data[cardIndex]) {
           count++; 
        }
        if (count % 10 === 0 && count === 10) {
            paintPage(data, count, cardIndex);
            const firstContainer = document.querySelector('.card-flex-container');
            firstContainer.classList.add('active');
        } else if (count % 10 === 0) {
            paintPage(data, count, cardIndex);
        } else if (count === data.length) {
            paintPage(data, count, cardIndex);
        }
    }
}

//display of 10 per container
const paintPage = (data, count, cardIndex) => {
    const cardFlexBox = document.createElement('div');
    cardFlexBox.classList = 'card-flex-container';
    section.appendChild(cardFlexBox)
    if (count % 10 !== 0) {
        for (let index = count - (count % 10); index <= cardIndex; index++) {
            const card = data[index];
            if (card !== -1) {
                paintCard(card,cardFlexBox);
            }
        }
    } else {
        for (let index = count - 10; index <= cardIndex; index++) {
            const card = data[index];
            if (card !== -1) {
                paintCard(card,cardFlexBox);
            }
        }
    }

}

// individual cards
const paintCard = (card, div) => {
    div.innerHTML += `
    <div class="card-container" data-open="${card.name}" data-type="${card.type}">
        <div class="crop">    
            <img src="${card.card_images[0].image_url}" alt="card image">
        </div>
        <h4>${card.name}</h4>
        <p>${card.type}</p>
        <div class="card-popup-box">
            <div>
            Click to find out more!
            </div>
        </div>
    </div>
    `;
}

// Getting API data in proper format
const fetchData = async () => {
    const result = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=Dark Magician');
    const json = await result.json();
    const cardData = json.data.map(card => ({
        name: card.name,
        type: card.type, 
        level: card.level, 
        atk: card.atk, 
        def: card.def, 
        desc: card.desc, 
        card_images: card.card_images,
        favorite: false 
    }));
    sortingCards(cardData);
    paintDOM(originalList);
}
 
// Option Toggle Bar
const toggleNav = ({target}) => {
    const expanded = target.getAttribute('aria-expanded') === 'true' || false;
    for (const button of navButton) {
        if (button === target) {
            button.setAttribute('aria-expanded', !expanded);
        }  
    }
}

// popUp Card Info
const spellTrapCheck = (attribute) => {
    if (attribute) {
        return attribute;
    } else {
        return 'N/A';
    }
}

// adding card to new list and deleting from old list
const addCard = (ele, currentList) => {
    let currentCardList, newCardList;
    for (let index = 0; index < currentList.length; index++) {
        const card = currentList[index];
        if (card.name !== originalList[index].name) {
            currentCardList = favCardList;
            newCardList = cardList;
            setActive(dataListLinks[5],'.sorted')
            break;
        } else {
            currentCardList = cardList;
            newCardList = favCardList;
            setActive(dataListLinks[0],'.sorted')
        }
    }

    let chosenCard;
    const chosenPopUpCardHTML = document.getElementById(ele.id);
    chosenPopUpCardHTML.classList.remove('is-visible');
    for (const list of currentCardList) {
        for (let index = 0; index < list.length; index++) {
            const cardInList = list[index];
            if (ele.id === cardInList.name) {
                cardInList.favorite = cardInList.favorite ? false : true;
                chosenCard = list.splice(index,1);
            }
        }
    }

    setTimeout(function() {
        chosenPopUpCardHTML.remove();
    },400);
    
    updateLists(...chosenCard, newCardList);
}

// Each card being ordered alphabetically (original Lists)
const sortAlphaOrderOriginal = (array) => {
    for (let index = 0; index < array.length; index++) {
        let newList = [];
        if (index === 1) {
            let count = 49;
            while (count >= 0) {
                const matchedCard = array[index].find(card => card.alphaOrder === count);
                count--;
                if (matchedCard) {
                    newList.push(matchedCard);
                }
            }
        } else {
            let count = 0;
            while (count < 50) {
                const matchedCard = array[index].find(card => card.alphaOrder === count);
                count++;
                if (matchedCard) {
                    newList.push(matchedCard);
                }
            }
            
        }

        if (index === 0) {
            originalList = newList;
        } else if (index === 1) {
            reverseOriginalList = newList;
        } else if (index === 2) {
            monsters = newList;
        } else if (index === 3) {
            spells = newList;
        } else if (index === 4) {
            traps = newList;
        }
    }
}

// Each card being ordered alphabetically (fav Lists)
const sortAlphaOrderFavs = (array) => {
    for (let index = 0; index < array.length; index++) {
        let newList = [];
        if (index === 1) {
            let count = 49;
            while (count >= 0) {
                const matchedCard = array[index].find(card => card.alphaOrder === count);
                count--;
                if (matchedCard) {
                    newList.push(matchedCard);
                }
            }
        } else {
            let count = 0;
            while (count < 50) {
                const matchedCard = array[index].find(card => card.alphaOrder === count);
                count++;
                if (matchedCard) {
                    newList.push(matchedCard);
                }
            }
            
        }
        if (index === 0) {
            favOriginalList = newList;
        } else if (index === 1) {
            favReverseList = newList;
        } else if (index === 2) {
            favMonsters = newList;
        } else if (index === 3) {
            favSpells = newList;
        } else if (index === 4) {
            favTraps = newList;
        }
    }
}


const sortList = () => {
    const containers = document.querySelectorAll('.card-flex-container');
    for (const element of containers) {
        element.remove();
    }
    const oldFavContainer = document.querySelector('.fav-flex-container');
    oldFavContainer.remove();
    const favContainer = document.createElement('div');
    favContainer.classList = 'fav-flex-container container';


    // had to separate them despite being practically similar functions due to their if statements.
    sortAlphaOrderOriginal(cardList);
    sortAlphaOrderFavs(favCardList);

    paintDOM(originalList);
    for (const card of favOriginalList) {
        paintCard(card, favContainer)
    }
    favSection.appendChild(favContainer);
    openModal = document.querySelectorAll(modalOpen);
    openModalCheck(originalList, favOriginalList);
    slides = document.querySelectorAll('.card-flex-container');
    buttons = document.querySelectorAll('.slide-control-container button');
    update();
}

// selected card being added to the correct array of new lists
const updateLists = (card, cardList) => {
        for (let index = 0; index < cardList.length; index++) {
            const list = cardList[index];
            if (index === 0) {
                list.push(card)
            } else if (index === 1) {
                list.unshift(card);
            } else if (index === 2 && card.type.includes('Monster')) {
                list.push(card);
            } else if (index === 3 && card.type.includes('Spell')) {
                list.push(card);
            } else if (index === 4 && card.type.includes('Trap')) {
                list.push(card);
            }
        }
    sortList();
}

// gather and prepare for click events on cards and fav modal
const openModalCheck = (original, favorites) => {
    for (const list of [original, favorites]) {
        for (const ele of openModal) {
            ele.addEventListener('click', function() {
                const modalId = this.dataset.open;
                const modalChosen = list.filter(card => card.name === modalId);
                if (modalId === 'favorites') {
                    document.getElementById(modalId).classList.add(isVisible);
                } else {
                    popUpCard(modalChosen[0]);
                    setTimeout(function() {
                        document.getElementById(modalId).classList.add(isVisible);
                    }, 100)
                    favButtonCheck(list);
                }
                closeModalCheck(modalClose);
            });
        }
    }
}

// modalClose Function - to close all popups and favorites
const closeModalCheck = (attribute) => {
    closeModal = document.querySelectorAll(attribute);
    for (const elm of closeModal) {
        elm.addEventListener('click', function() {
            const modalId = this.dataset.close;
            if (modalId === 'favorites') {
                document.getElementById(modalId).classList.remove(isVisible);
            } else {
                this.parentElement.parentElement.parentElement.classList.remove(isVisible);
                setTimeout(function() {
                    elm.parentElement.parentElement.parentElement.remove();
                },400);
            }
        })
    }
}

// favButton function
const favButtonCheck = (currentList) => {
    const buttonFav = document.getElementsByClassName('pop-btn');
    for (const ele of buttonFav) {
        ele.addEventListener('click', function() {
            addCard(ele, currentList);
        });
    }
}

// popup card html
const popUpCard = (card) => {
    const div = document.createElement('div');
    div.setAttribute('data-animation', 'slideInOutTop');
    div.setAttribute('id', card.name);
    div.className = 'modal';
    div.innerHTML = `
    <div class="modal-dialog">
        <header class="modal-header">
            <h3>${card.name}</h3>
            <i class="fas fa-times" data-close></i>
        </header>

        <div class="modal-body">
            <div class="img-wrapper crop">
                <img src="${card.card_images[0].image_url}"></img>
            </div>
            <div class="text-wrapper">
                <div class="basic-card-info">
                    <p>Type: ${card.type}</p>
                    <p>Level: ${spellTrapCheck(card.level)}</p>
                    <p>Attack: ${spellTrapCheck(card.atk)}</p>
                    <p>Defense: ${spellTrapCheck(card.def)}</p>
                </div>
                <div class="card-desc">
                    ${card.desc}
                </div>
            </div>
            <button id="${card.name}" class="btn btn-primary pop-btn">${!card.favorite ? 'Add to Favorites!' : 'Remove from Favorites!'}</button>
        </div>

    </div>
    `;
    body.appendChild(div);
}

// setActive
const setActive = (elm, selector) => {
    if (document.querySelector(`${selector}.${active}`) !== null) {
        document.querySelector(`${selector}.${active}`).classList.remove(active);
    };
    elm.classList.add(active);
}

//cardCount
const cardCount = () => {
    const section = document.querySelector('.card-count');
    const div = document.createElement('div');
    div.innerHTML = `
    <h3 class="header-md">Card Counts</h3>
    <div class="count-flex-box">
    <div class="header-sm">Total Cards: ${originalList.length}</div>
    <div class="header-sm">Total Monsters: ${monsters.length}</div>
    <div class="header-sm">Total Spells: ${spells.length}</div>
    <div class="header-sm">Total Traps: ${traps.length}</div>
    </div>
    `;
    section.appendChild(div);
}

//favorites navBar 
const favNavBar = () => {
    const favSection = document.getElementById('favorites');
    favSection.innerHTML += `
    <nav class="nav-bar container">
    <div class="img-container">
        <img src="https://images2.imgbox.com/79/d6/CU5rQtCF_o.png" alt="logo">
    </div>
    <h1 class="title header-lg">Dark Magician Theme</h1>
    </nav>

    <div class="option-container container">
        <button class="favorites-link btn btn-primary" aria-expanded="false" aria-controls="favDropdown">
            Favorite Options
        </button>
        <button class="navbar-toggler btn btn-primary" data-close="favorites">
            Back to Deck
        </button>
        <ul id="fav-page" class="ul-defaults-none header-sm">
            <li data-list="fav-original" class="sorted btn btn-alt">A-Z</li>
            <li data-list="fav-reverse"  class="sorted btn btn-alt">Z-A</li>
            <li data-list="fav-monsters" class="sorted btn btn-alt">Monsters</li>
            <li data-list="fav-spells" class="sorted btn btn-alt">Spells</li>
            <li data-list="fav-traps" class="sorted btn btn-alt">Traps</li>

        </ul>
    </div>
    `;
    favSection.appendChild(favSectionFlexBox);
}

// to make sure it toggles the api grid slide carousel appropriately
const update = () => {
    slides.forEach(slide => {
        slide.classList.remove('active', 'previous', 'next');
    })
    slides[prev].classList.add('previous');
    slides[current].classList.add('active');
    slides[next].classList.add('next');
}

const goToNum = (number) => {
    current = number;
    next = current < slides.length - 1 ? current + 1 : 0;
    prev = current > 0 ? current - 1 : slides.length - 1;
    update();
}

const goToNext = () => current < slides.length - 1 ? goToNum(current + 1) : goToNum(0);
const goToPrev = () => current > 0 ? goToNum(current - 1) : goToNum(slides.length - 1);


// Activating all functions after fetching data. 
window.onload = async function() {
    await fetchData();
    cardCount();
    favNavBar();
    //update open modal options
    openModal = document.querySelectorAll(modalOpen);
    dataListLinks = document.querySelectorAll(dataList);

    // show sorted cards per category
    for (const link of dataListLinks) {
        link.addEventListener('click', function() {
            setActive(link, '.sorted');
            const list = this.dataset.list;
            if (list.includes('fav')) {
                const oldFavContainer = document.querySelector('.fav-flex-container');
                oldFavContainer.remove();
                const favContainer = document.createElement('div');
                favContainer.classList = 'fav-flex-container container';
                if (list === 'fav-original') {
                    for (const card of favOriginalList) {
                        paintCard(card, favContainer)
                    }
                } else if (list === 'fav-reverse') {
                    for (const card of favReverseList) {
                        paintCard(card, favContainer)
                    }
                } else if (list === 'fav-monsters') {
                    for (const card of favMonsters) {
                        paintCard(card, favContainer)
                    }
                } else if (list === 'fav-spells') {
                    for (const card of favSpells) {
                        paintCard(card, favContainer)
                    }
                } else if (list === 'fav-traps') {
                    for (const card of favTraps) {
                        paintCard(card, favContainer)
                    }
                }
                favSection.appendChild(favContainer);
            } else {
                const containers = document.querySelectorAll('.card-flex-container');
                for (const element of containers) {
                    element.remove();
                }
                if (list === 'original') {
                    paintDOM(originalList);
                } else if (list === 'reverse') {
                    paintDOM(reverseOriginalList);
                } else if (list === 'monsters') {
                    paintDOM(monsters);
                } else if (list === 'spells') {
                    paintDOM(spells);
                } else if (list === 'traps') {
                    paintDOM(traps);
                    document.querySelector('.card-flex-container').classList.add('active');
                }
            }
            openModal = document.querySelectorAll(modalOpen);
            slides = document.querySelectorAll('.card-flex-container');
            openModalCheck(originalList, favOriginalList);
            buttons = document.querySelectorAll('.slide-control-container button');
        })
    }

    
    // Options button in navbar
    navButton = document.querySelectorAll('button[aria-expanded]');

    
    //open popModal & check for closeModal
    openModalCheck(originalList, favOriginalList);
    

    // black screen click escape
    document.addEventListener('click', e => {
        if (e.target === document.querySelector('.modal.is-visible')) {
            const module = document.querySelector('.modal.is-visible');
            module.classList.remove(isVisible);
            setTimeout(function() {
                module.remove();
            },400);
        }
    })

    // ESCAPE KEY
    document.addEventListener('keyup', e => {
        if (e.key === 'Escape') {
            const module = document.querySelector('.modal.is-visible');
            module.classList.remove(isVisible);
            setTimeout(function() {
                module.remove();
            },400);        
        }
    })

    // slide carousel
    slides = document.querySelectorAll('.card-flex-container');
    buttons = document.querySelectorAll('.slide-control-container button');

    current = 0;
    next = current < slides.length - 1 ? current + 1 : 0;
    prev = current > 0 ? current - 1 : slides.length - 1;

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', () => i === 0 ? goToPrev() : goToNext())
    }
    
    update();

    // Options Toggle
    for (const button of navButton) {
        button.addEventListener('click', toggleNav);
    }

}