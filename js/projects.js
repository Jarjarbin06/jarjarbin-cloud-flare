function cleanValue(str) {
    if (!str) return null;
    return str.replace(/"/g, '').trim();
}

function cleanText(str) {
    if (!str) return "";
    return str.trim();
}

function parseBadges(raw) {
    if (!raw) return [];

    return raw
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);
}

function upgradeBadgeStyle(url) {
    if (!url) return url;

    if (url.includes("style=")) {
        return url.replace(/style=[^&]+/, "style=for-the-badge");
    }

    return url.includes("?")
        ? `${url}&style=for-the-badge`
        : `${url}?style=for-the-badge`;
}

function renderBadgeLine(line) {
    const match = line.match(/!\[(.*?)\]\((.*?)\)/);
    if (!match) return "";

    const alt = match[1];
    let src = match[2];

    src = upgradeBadgeStyle(src);

    return `<img src="${src}" alt="${alt}" class="badge" />`;
}

function renderBadgeBlock(lines) {
    if (!lines || lines.length === 0) return "";

    return lines
        .map(line => {
            return `<div class="badge-line">
                ${renderBadgeLine(line)}
            </div>`;
        })
        .join("");
}

function renderStatus(lines) {
    if (!lines || lines.length === 0) return "";

    return `<div class="status-block">
        ${lines.map(line => renderBadgeLine(line)).join("")}
    </div>`;
}

async function fetchRepoFile(owner, repo, path) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;

    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

async function enrichRepo(repo) {
    const owner = repo.owner?.login || "unknown";
    const name = repo.name;

    const [version, status, badges] = await Promise.all([
        fetchRepoFile(owner, name, "VERSION"),
        fetchRepoFile(owner, name, "STATUS"),
        fetchRepoFile(owner, name, "BADGES")
    ]);

    return {
        ...repo,
        meta: {
            version: cleanValue(version),
            status: parseBadges(status),
            badges: parseBadges(badges)
        }
    };
}

async function fetchProjects() {
    const grid = document.getElementById('projects-grid');

    if (!grid) {
        console.error('[Projects] #projects-grid not found in DOM');
        return;
    }

    console.log('[Projects] Loading projects...');

    try {
        const userRepos = await fetchJson(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
        );

        const orgRepos = await fetchJson(
            `https://api.github.com/orgs/${GITHUB_ORG_NAME}/repos?sort=updated&per_page=100`
        );

        const repos = [...userRepos, ...orgRepos].filter(r =>
            !r.fork &&
            !EXCLUDED_REPOS.includes(r.name)
        );

        grid.innerHTML = `<p class="output">loading project metadata...</p>`;

        const enriched = await Promise.all(repos.map(enrichRepo));

        const valid = enriched.filter(r =>
            r.meta.version || r.meta.status.length || r.meta.badges.length
        );

        if (valid.length === 0) {
            grid.innerHTML = '<p class="output">no active projects found.</p>';
            return;
        }

        grid.innerHTML = valid.map(repo => {
            const owner = repo.owner?.login || "unknown";

            const displayName =
                owner === GITHUB_ORG_NAME
                    ? `${GITHUB_ORG_NAME} - ${repo.name}`
                    : repo.name;

            const description = cleanText(repo.description);

            return `
                <div class="project-card">
                    <h3>${displayName}</h3>

                    ${description ? `<p class="project-description">${description}</p>` : ""}

                    <div class="meta">
                        <span class="lang">${repo.language || "unknown"}</span>
                        <span>★ ${repo.stargazers_count ?? 0}</span>
                        <span class="version">${repo.meta.version || ""}</span>
                    </div>

                    <div class="project-status">
                        ${renderStatus(repo.meta.status)}
                    </div>

                    <div class="project-badges">
                        ${renderBadgeBlock(repo.meta.badges)}
                    </div>

                    <a href="${repo.html_url}" target="_blank">
                        view on github →
                    </a>
                </div>
            `;
        }).join('');

        console.log('[Projects] Render complete ✔');

    } catch (error) {
        console.error('[Projects] Fatal error:', error);
        grid.innerHTML = '<p class="output">could not load projects.</p>';
    }
}

document.addEventListener('DOMContentLoaded', fetchProjects);
