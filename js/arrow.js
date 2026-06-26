const scrollArrow = document.getElementById('scroll-arrow');

function getFirstSection() {
    const sections = Array.from(document.querySelectorAll('section'));
    return sections.find(sec => sec.id && sec.id !== 'hero') || null;
}

function updateArrow() {
    const scrollY = window.scrollY;

    if (scrollY < 100) {
        scrollArrow.textContent = '↓';
        scrollArrow.dataset.state = 'down';
    } else {
        scrollArrow.textContent = '↑';
        scrollArrow.dataset.state = 'up';
    }
}

scrollArrow.addEventListener('click', () => {
    const firstSection = getFirstSection();

    if (scrollArrow.dataset.state === 'down') {
        if (firstSection) {
            firstSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

window.addEventListener('scroll', updateArrow);
updateArrow();