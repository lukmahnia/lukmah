const db = require('../config/db');

class Setting {
    static getAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM Settings', (err, rows) => {
                if (err) {
                    return reject(err);
                }
                const settings = {};
                rows.forEach(row => {
                    settings[row.key] = row.value;
                });
                resolve(settings);
            });
        });
    }

    static update(key, value) {
        return new Promise((resolve, reject) => {
            db.run('UPDATE Settings SET value = ? WHERE key = ?', [value, key], function(err) {
                if (err) {
                    return reject(err);
                }
                resolve({ changes: this.changes });
            });
        });
    }

    static bulkUpdate(settings) {
        const promises = Object.entries(settings).map(([key, value]) => {
            return new Promise((resolve, reject) => {
                db.run('UPDATE Settings SET value = ? WHERE key = ?', [value, key], (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });

        return Promise.all(promises);
    }
}

module.exports = Setting;