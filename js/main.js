/* -- PROJECTS - GitHub API -- */

const GITHUB_USERNAME = 'Jarjarbin06';
const GITHUB_ORG_NAME = 'Jarjarbin-Studio';

const EXCLUDED_REPOS = [
    'Jarjarbin06',
    'portfolio',
    'Stumper04',
    'WS_GoodPractices',
    'sans-ta_bs103cypher',
    'sans-ta_bsmy-hunter',
    'BSCP',
    'CLI-Game-Engine',
    'map_tool',
    'epitech_console'
];

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GitHub API error: ${url}`);
    return res.json();
}

async function fetchProjects() {
    const grid = document.getElementById('projects-grid');

    try {
        const [userRepos, orgRepos] = await Promise.all([
            fetchJson(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`),
            fetchJson(`https://api.github.com/orgs/${GITHUB_ORG_NAME}/repos?sort=updated&per_page=100`)
        ]);

        // merge + deduplicate by repo name + owner
        const allReposMap = new Map();

        [...userRepos, ...orgRepos].forEach(repo => {
            const key = `${repo.owner.login}/${repo.name}`;
            allReposMap.set(key, repo);
        });

        const repos = Array.from(allReposMap.values());

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