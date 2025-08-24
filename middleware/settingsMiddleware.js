const Setting = require('../models/Setting');

const socialMediaSettingsMiddleware = async (req, res, next) => {
    try {
        const settings = await Setting.getAll();
        res.locals.socialMediaSettings = {
            facebook_url: settings.facebook_url || '',
            twitter_url: settings.twitter_url || '',
            instagram_url: settings.instagram_url || '',
            linkedin_url: settings.linkedin_url || '',
            youtube_url: settings.youtube_url || ''
        };
        next();
    } catch (err) {
        console.error('Error loading social media settings:', err);
        res.locals.socialMediaSettings = {}; // Provide empty object on error
        next();
    }
};

module.exports = socialMediaSettingsMiddleware;