async function fetchCommitsForRepo(owner, repo) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`;

    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

async function loadDevlogs() {
    const container = document.getElementById('devlogs-container');

    if (!container) {
        console.error('[Devlogs] container not found');
        return;
    }

    container.innerHTML = '<p class="output">loading devlogs...</p>';

    try {
        const userRepos = await fetchJson(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`
        );

        const orgRepos = await fetchJson(
            `https://api.github.com/orgs/${GITHUB_ORG_NAME}/repos?per_page=100`
        );

        const repos = [...userRepos, ...orgRepos].filter(r =>
            !r.fork &&
            !EXCLUDED_REPOS.includes(r.name)
        );

        const commitsByRepo = await Promise.all(
            repos.map(async (repo) => {
                const commits = await fetchCommitsForRepo(
                    repo.owner.login,
                    repo.name
                );

                return {
                    repo: repo.name,
                    owner: repo.owner.login,
                    commits
                };
            })
        );

        const grouped = new Map();

        for (const r of commitsByRepo) {
            const key = `${r.owner}/${r.repo}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    repo: r.repo,
                    owner: r.owner,
                    commits: []
                });
            }

            grouped.get(key).commits.push(...r.commits);
        }

        const groupedArray = Array.from(grouped.values());

        for (const r of groupedArray) {
            r.commits.sort(
                (a, b) =>
                    new Date(b.commit.author?.date || 0) -
                    new Date(a.commit.author?.date || 0)
            );
        }

        container.innerHTML = groupedArray.map(r => {
            const label =
                r.owner === GITHUB_ORG_NAME
                    ? `${GITHUB_ORG_NAME} - ${r.repo}`
                    : r.repo;

            const commitsHtml = r.commits
                .slice(0, 5)
                .map(c => `
                    <p class="commit-message">• ${c.commit.message}</p>
                    <p class="meta">${c.commit.author?.date ?? ''}</p>
                `)
                .join('');

            return `
                <div class="expendable-item">
                    <div class="expendable-title" onclick="toggleExpendable(this)">
                        ▶ ${label}
                    </div>

                    <div class="expendable-content">
                        ${commitsHtml}
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error('[Devlogs] error:', err);
        container.innerHTML = '<p class="output">failed to load devlogs</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadDevlogs);