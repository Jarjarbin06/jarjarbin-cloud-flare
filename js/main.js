/* -- PROJECTS - GitHub API -- */

const GITHUB_USERNAME = 'Jarjarbin06';
const EXCLUDED_REPOS = [
    'Jarjarbin06',
    'portfolio',
    'Stumper04',
    'WS_GoodPractices',
    'sans-ta_bs103cypher',
    'sans-ta_bsmy-hunter'
];

async function fetchProjects() {
    const grid = document.getElementById('projects-grid');

    try {
        const response = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`
        );

        if (!response.ok) throw new Error('GitHub API error');

        const repos = await response.json();

        const filtered = repos.filter(repo =>
            !repo.fork &&
            !EXCLUDED_REPOS.includes(repo.name)
        );

        if (filtered.length === 0) {
            grid.innerHTML = '<p class="output">no repositories found.</p>';
            return;
        }

        grid.innerHTML = filtered.map(repo => `
      <div class="project-card">
        <h3>${repo.name}</h3>
        <p>${repo.description || 'no description provided.'}</p>
        <div class="meta">
          <span class="lang">${repo.language || 'unknown'}</span>
          <span>★ ${repo.stargazers_count}</span>
        </div>
        <a href="${repo.html_url}" target="_blank">view on github →</a>
      </div>
    `).join('');

    } catch (error) {
        grid.innerHTML = '<p class="output">could not fetch repositories.</p>';
        console.error(error);
    }
}


/* -- CONTACT FORM -- */

async function handleContact(event) {
    event.preventDefault();

    const status = document.getElementById('form-status');
    const button = event.target.querySelector('button');

    const payload = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim(),
    };

    button.disabled = true;
    button.textContent = 'sending...';
    status.textContent = '';

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Server error');

        status.textContent = '✓ message sent successfully.';
        status.style.color = 'var(--green)';
        event.target.reset();

    } catch (error) {
        status.textContent = '✗ something went wrong. try again.';
        status.style.color = 'var(--red)';
        console.error(error);
    } finally {
        button.disabled = false;
        button.textContent = 'send_message()';
    }
}


/* -- INIT -- */

document.addEventListener('DOMContentLoaded', () => {
    fetchProjects();
    document.getElementById('contact-form').addEventListener('submit', handleContact);
});