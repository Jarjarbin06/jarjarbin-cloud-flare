const GITHUB_USERNAME = 'Jarjarbin06';
const GITHUB_ORG_NAME = 'Jarjarbin-Studio';
const EXCLUDED_REPOS = [
    'Jarjarbin06',
    'jarjarbin-cloud-flare',
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
    console.log(`[GitHub] Fetching: ${url}`);

    try {
        const res = await fetch(url);

        console.log(`[GitHub] Response status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`[GitHub] API error body for ${url}:`, errorText);
            throw new Error(`GitHub API error (${res.status}) on ${url}`);
        }

        const data = await res.json();

        console.log(`[GitHub] Success: ${url}`);
        console.log(`[GitHub] Items received:`, Array.isArray(data) ? data.length : 'not array');

        return data;

    } catch (err) {
        console.error(`[GitHub] Fetch failed for ${url}`, err);
        throw err;
    }
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
