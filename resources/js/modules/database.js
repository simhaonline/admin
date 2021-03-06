/*
 * PhpMongoAdmin (www.phpmongoadmin.com) by Masterforms Mobile & Web (MFMAW)
 * @version      database.js 1001 6/8/20, 8:58 pm  Gilbert Rehling $
 * @package      PhpMongoAdmin\resources
 * @subpackage   database.js
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
* ----------------------------------------------------
* VUEX modules/server.js
* ----------------------------------------------------
* The Vuex data store for server component views
*/

/*
*   Fetch the API to handle the requests
*/
import DatabaseApi from '../api/database.js'

/*
*   Imports the Event Bus to pass events on tag updates
*/
import { EventBus } from '../event-bus.js';

export const database = {
    /*
    *   Defines the 'state' being monitored for the module
    */
    state: {
        databases: [],
        databasesLoadStatus: 0,
        database: {},
        activeDatabase: null,
        databaseLoadStatus: 0,
        displayDatabase: {},
        displayDatabaseStatus: 0,
        createDatabaseStatus: 0,
        deleteDatabaseStatus: 0,
        errorData: {}
    },

    /*
    *   Defines the actions available for the database module
    */
    actions: {
        /*
        *   Loads the database from the API
        */
        loadDatabases( { commit, rootState, dispatch } ) {
            commit( 'setDatabasesLoadStatus', 1 );

            DatabaseApi.getDatabases()
                .then( ( response ) => {
                    if (response.data.success == true) {
                        commit( 'setDatabases', response.data.data.databases );
                        commit( 'setDatabasesLoadStatus', 2 );
                    } else {
                        console.log(response.data.errors);
                        commit( 'setErrorData', response.data.errors );
                        commit( 'setDatabasesLoadStatus', 3 );
                    }
                })
                .catch( (error) => {
                    console.log(error);
                    commit( 'setDatabases', [] );
                    commit( 'setDatabasesLoadStatus', 3 );
                    commit( 'setErrorData', error.errors );
                    EventBus.$emit('no-results-found', { notification: 'No databases were returned from the api - please try again later' });
                });
        },

        /*
        *   Loads a database from the API
        */
        loadDatabase( { commit, rootState, dispatch }, data ) {
            commit( 'setDatabaseLoadStatus', 1 );

            commit( 'setDatabase', {} );

            DatabaseApi.getDatabase( data )
                .then( ( response ) => {
                    console.log("fetched db: " + data);
                    commit( 'setActiveDatabase', data );
                    commit( 'setDatabase', response.data.data.database );
                    commit( 'setDatabaseLoadStatus', 2 );

                    let collections = response.data.data.database.collections;
                    dispatch('setDbCollections', collections);
                })
                .catch( (error) => {
                    commit( 'setDatabase', {} );
                    commit( 'setDatabaseLoadStatus', 3 );
                    commit( 'setErrorData', error.errors );
                    console.log(error);
                    EventBus.$emit('no-results-found', { notification: 'No database was returned from the api - please try again later' });
                });
        },

        /*
        *   Because we set the 'admin' database on site - we can clear the stored DB before rendering the single DB view
        */
        clearDatabase( { commit }) {
            commit ( 'clearDatabaseObject' );
        },

        /*
        *   Create a new database - add result to database array
        */
        createDatabase( { commit, rootState, dispatch }, data ) {
            commit( 'setCreateDatabaseStatus', 1);

            DatabaseApi.createDatabase( data )
                .then( ( response ) => {
                    commit( 'setCreatedDatabase', response.data.data.database );
                    commit( 'setCreateDatabaseStatus', 2 );
                })
                .catch( (error) => {
                    commit( 'setCreateDatabaseStatus', 3 );
                    commit( 'setErrorData', error);
                    console.log(error);
                });
        },

        /*
        *   Delete one or more databases - remove database from array
        */
        deleteDatabase( { commit, rootState, dispatch }, data ) {
            commit( 'setDeleteDatabaseStatus', 1);

            DatabaseApi.deleteDatabase( data )
                .then( ( response ) => {
                    commit( 'setDeletedDatabase', data );
                    commit( 'setDeleteDatabaseStatus', 2 );
                })
                .catch( (error) => {
                    commit( 'setDeleteDatabaseStatus', 3 );
                    commit( 'setErrorData', error);
                    console.log(error);
                });
        },

        setCollection( { commit }, data) {
            commit( 'setCollectionToDatabase', data);
        },

        /*
        *   Set the active database - useful for database tracking
        *   ToDo: this also gets set when the DB is fetched - this may be redundant
        */
        setActiveDatabase( { commit }, data ) {
            commit( 'setActiveDatabase', data );
        }
    },

    /*
    *   Defines the mutations used for the database module
    */
    mutations: {
        /*
        *   Set the database load status
        */
        setDatabasesLoadStatus( state, status ) {
            state.databaseLoadStatus = status;
        },

        /*
        *   Sets the databases
        *   ToDo: !! to prevent loading errors we need to add a 'default' Database to the database object
        *   We can use the admin db as default
        */
        setDatabases( state, databases ) {
            state.databases = databases;
            state.database  = databases.find(db => db.db.name === 'admin');
        },

        /*
        *   Set the database load status
        */
        setDatabaseLoadStatus( state, status ) {
            state.databaseLoadStatus = status;
        },

        /*
        *   Sets the database
        */
        setDatabase( state, database ) {
            state.database = database;
        },

        /*
        * Clears the DB so that its data wont show on initial component rendering
        */
        clearDatabaseObject( state, empty ) {
            state.database = {};
        },

        /*
        *   Set the display database
        */
        setDisplayDatabase( state, database) {
            state.displayDatabase = database;
        },

        /*
        *   Set the display database status
        */
        setDisplayDatabaseStatus( state, status) {
            state.displayDatabaseStatus = status;
        },

        /*
        *   Set the create database status
        */
        setCreateDatabaseStatus( state, status) {
            state.createDatabaseStatus = status;
        },

        /*
        *   Add the new database into the existing array
        */
        setCreatedDatabase( state, database ) {
            state.databases.push( database );
        },

        /*
        *   Set the delete database status
        */
        setDeleteDatabaseStatus( state, status) {
            state.deleteDatabaseStatus = status;
        },

        /*
        *   Set (remove) the deleted database(s) from the existing array
        */
        setDeletedDatabase( state, databases ) {
            databases.forEach( (value, index) => {
                let arr = [];
                state.databases = state.databases.map( db => {
                    return db.db.name !== value;
                });
                /*state.databases.forEach( (db, index) => {
                    if (db.db.name !== value) {
                        arr.push(db);
                    }
                });*/
                //state.databases = arr;
            });
        },

        /*
        *   Save the error data for reference
        */
        setErrorData( state, error ) {
            state.errorData = error;
        },

        /*
         * With luck - save the new collection into the current exibited database
         */
        setCollectionToDatabase( state, collection ) {
            if (state.database) {
                if (state.database.collections) {
                    state.database.collections.push(collection);
                }
            }
        },

        /*
        *   Set the active database
        */
        setActiveDatabase(state, database) {
            state.activeDatabase = database;
        }
    },

    /*
    *   Define the getters used by the database module
    */
    getters: {
        /*
        *   Return the databases load status
        */
        getDatabasesLoadStatus( state ) {
            return state.databasesLoadStatus;
        },

        /*
        *   Return the databases
        */
        getDatabases( state ) {
            return state.databases;
        },

        /*
        *   Return the database load status
        */
        getDatabaseLoadStatus( state ) {
            return state.databaseLoadStatus;
        },

        /*
        *   Return the database
        */
        getDatabase( state ) {
            return state.database;
        },

        /*
        *   Return the display database status
        */
        getDisplayDatabaseStatus( state ) {
            return state.displayDatabaseStatus;
        },

        /*
        *   Return the display database
        */
        getDisplayDatabase: (state) => (id) => {
            console.log("getDisplayDatabase: " + id);
            if (state.database && state.database.id !== '') {
                console.log("database found!!");
                return state.database;

            } else {
                let database = state.database.find(database => database.id === id);
                if (database) {
                    console.log("setting display database state: " + id);
                    state.displayDatabaseStatus = id;
                    state.displayDatabase = database;
                    return database;
                }
            }
        },

        /*
        *   Get the create database status
        */
        getCreateDatabaseStatus( state ) {
            return state.createDatabaseStatus;
        },

        /*
        *   Get the delete database status
        */
        getDeleteDatabaseStatus( state ) {
            return state.deleteDatabaseStatus;
        },

        /*
        *   Get the stats array (object) from the database object
        */
        getStats( state ) {
            if (state.database) {
                return state.database.stats;
            }
        },

        /*
        *   Fetch any active error
        */
        getErrorData( state ) {
            return state.errorData;
        },

        /*
        *   Get the active database
        */
        getActiveDatabase( state) {
            return state.activeDatabase;
        }
    }
};
