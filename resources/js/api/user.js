/*
 * PhpMongoAdmin (www.phpmongoadmin.com) by Masterforms Mobile & Web (MFMAW)
 * @version      user.js 1001 6/8/20, 8:58 pm  Gilbert Rehling $
 * @package      PhpMongoAdmin\resources
 * @subpackage   user.js
 * @link         https://github.com/php-mongo/admin PHP MongoDB Admin
 * @copyright    Copyright (c) 2020. Gilbert Rehling of MMFAW. All rights reserved. (www.mfmaw.com)
 * @licence      PhpMongoAdmin is an Open Source Project released under the GNU GPLv3 license model.
 * @author       Gilbert Rehling:  gilbert@phpmongoadmin.com (www.gilbert-rehling.com)
 *  php-mongo-admin - License conditions:
 *  Contributions to our suggestion box are welcome: https://phpmongotools.com/suggestions
 *  This web application is available as Free Software and has no implied warranty or guarantee of usability.
 *  See licence.txt for the complete licensing outline.
 *  See https://www.gnu.org/licenses/license-list.html for information on GNU General Public License v3.0
 *  See COPYRIGHT.php for copyright notices and further details.
 */

/*
*   Imports the PHP Mongo Admin URL from the config.
*/
import { MONGO_CONFIG } from '../config.js';

/*
* Import the Event bus
*/
import { EventBus } from '../event-bus.js';

export default {
    /*
    *  GET   /api/v1/user - get the current authenticated user
    */
    getUser: function() {
        return axios.get( MONGO_CONFIG.API_URL + '/user' );
    },

    /*
    *  PUT  /api/v1/user - create or update a user
    */
    putUpdateUser: function( name, email, password ) {
        return axios.put( MONGO_CONFIG.API_URL + '/user',
            {
                name: name,
                email: email,
                password: password
            });
    },

    /*
    *  POST  /api/v1/user - register a new user
    */
    postUser: function( name, email, password ) {
        return axios.post( MONGO_CONFIG.API_URL + '/user',
            {
                name: name,
                email: email,
                password: password,
                _token: window.axios.defaults.headers.common['X-CSRF-TOKEN']
            });
    },

    /*
    *  POST  /api/v1/user/login - login a user
    */
    loginUser: function( user, password ) {
        return axios.post( MONGO_CONFIG.API_URL + '/user/login',
            {
                user: user,
                password: password,
                _token: window.axios.defaults.headers.common['X-CSRF-TOKEN']
            });
    },

    /*
    *   GET /api/v2/user/logout/{uid}  - logs out the user
    */
    logoutUser: function( uid ) {
        return axios.get( MONGO_CONFIG.API_URL + '/user/logout/' + uid);
    },

    /*
    *   GET  /api/v1/user/fetch/{uid} - get the current authenticated user
    */
    fetchUser: function( uid ) {
        return axios.get( MONGO_CONFIG.API_URL + '/user/fetch/' + uid );
    },

    /*
    *   GET /api/v1/user/email/{email} - Check | verify an email address
    */
    checkEmail: function( email ) {
        return axios.get( MONGO_CONFIG.API_URL + '/user/email/' + email );
    },

    /*
    *   GET /api/v1/user/location - Get the users location from IpInfo
    */
    getUserLocation: function() {
        return axios.get( MONGO_CONFIG.API_URL + '/user/location' );
    },

    /*
    *   GET /api/v1/user/states/{country} - Get the users states based on country code
    */
    getUserStates: function(country) {
        return axios.get( MONGO_CONFIG.API_URL + '/user/states/' + country);
    },
}
