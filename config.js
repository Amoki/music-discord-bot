require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    helperRoleId: process.env.HELPER_ROLE_ID,
    needHelpRoleId: process.env.NEED_HELP_ROLE_ID,
};
