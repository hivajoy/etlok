const fs = require('fs');
const path = './hashUsage.json';

let usageLog = [];

if (fs.existsSync(path)) {
    usageLog = JSON.parse(fs.readFileSync(path));
}

// Save each hash usage with timestamp
function save(hash) {
    const entry = {
        hash,
        timestamp: Date.now()
    };
    usageLog.push(entry);
    fs.writeFileSync(path, JSON.stringify(usageLog));
}

// Get top 20 hashes used in the last 7 days
function getTopHashes() {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentEntries = usageLog.filter(entry => entry.timestamp >= sevenDaysAgo);

    const countMap = {};
    for (const entry of recentEntries) {
        countMap[entry.hash] = (countMap[entry.hash] || 0) + 1;
    }

    const sorted = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    return sorted.map(([hash, count]) => ({ hash, count }));
}

module.exports = {
    save,
    getTopHashes
};
