<?php
/**
 * PhpMongoAdmin (www.phpmongoadmin.com) by Masterforms Mobile & Web (MFMAW)
 * @version      DatabasesController.php 1001 6/8/20, 8:53 pm  Gilbert Rehling $
 * @package      PhpMongoAdmin\App
 * @subpackage   DatabasesController.php
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

/**
 *  Defines a namespace for the controller.
 */
namespace App\Http\Controllers\Api;

/**
 *  Defines the requests used by the controller.
 */
use Illuminate\Http\Request;

/**
 *  Defined controllers used by the controller
 */
use App\Http\Controllers\Controller;

/**
 *  Internal classes etc etc
 */
use App\Http\Classes\MongoConnection as Mongo;
use App\Http\Classes\UnserialiseDocument;

/**
 *  Models
 */
use App\Models\Database;

/**
 *  Mongo DB
 */
use MongoDB;
use MongoDB\BSON\Unserializable;

/**
 * Class DatabasesController
 * @package App\Http\Controllers\Api
 */
class DatabasesController extends Controller implements Unserializable
{
    /**
     * @var null|string $slug
     */
    private $slug = null;

    /**
     * @var int
     */
    private $limit = 30;

    /**
     * @var MongoDB\Client
     */
    private $client;

    /**
     * @var Mongo
     */
    private $mongo;

    /**
     * @var $unserialised MongoDB\Model\BSONArray
     */
    private $unserialised;

    /**
     * @var string|null $errorMessage
     */
    private $errorMessage = null;

    /**
     * @return string|null
     */
    public function getErrorMessage(): string
    {
        return $this->errorMessage;
    }

    /**
     * @param string $errorMessage
     */
    public function setErrorMessage(string $errorMessage): void
    {
        $this->errorMessage = $errorMessage;
    }

    /**
     * Get one or All databases
     *
     * @param   $name
     * @return  array
     */
    private function getAllDatabases($name = false)
    {
        // only one DB by name
        if ($name) {
            $database   = $this->client->selectDatabase( $name );
            $stats      = $database->command(array('dbstats' => 1))->toArray()[0];
            $statistics = [];
            // break out the stats into an array
            foreach ($stats as $key => $value) {
                $statistics[ $key ] = $value;
            }
            // the collections object should contain any relative objects
            $collections = $this->getCollections($name, true);
            $arr         = array("db" => $database->__debugInfo(), "stats" => $statistics, "collections" => $collections);

        } else {

            $arr   = [];
            $index = 0;
            try {
                foreach ($this->client->listDatabases() as $db) {
                    $dbn          = $db->getName();
                    //$database   = (new MongoDB\Client)->$dbn;
                    // Todo: need to verify which method is the best path
                    // 1) $this->mongo->connectClientDb($dbn)  =  (new MongpDB\Client())->database
                    // 2) $this->client->selectDatabase($dbn)  = (new MongpDB\Client())->selectDatabase('database')
                    $stats      = $this->getStats( $dbn );
                    $statistics = [];
                    // break out the stats into an array
                    foreach ($stats as $key => $value) {
                        $statistics[ $key ] = $value;
                    }
                    // this set of collections wont need the objects
                    $collections = $this->getCollections($db->getName());
                    $arr[]       = array("id" => $index, "db" => $db->__debugInfo(), "stats" => $statistics, "collections" => $collections);
                    $index++;
                }

            } catch (\Exception $e) {
                $this->setErrorMessage($e->getMessage());
            }
        }
        // !! one result fits all
        return $arr;
    }

    private function getStats( $dbn )
    {
        try {
            /** @var MongoDB\Database $database */
            $database   = $this->mongo->connectClientDb($dbn);
            $stats      = $database->command(array('dbstats' => 1))->toArray()[0];
            return $stats;

        } catch( \Exception $e) {
            return [];
        }
    }

    /**
     * Returns the collections belonging to each given database
     *
     * @param   string    $db           string DB Name
     * @param   bool      $getObjects
     * @return  array
     */
    private function getCollections($db, $getObjects = false)
    {
        try {
            $arr      = [];
            $index    = 0;
            $database = $this->client->selectDatabase( $db ); // (new MongoDB\Client)->$db;
            /** @var MongoDB\Model\CollectionInfo $collection */
            foreach ($database->listCollections() as $collection) {
                // we only need to get objects when its database view
                if ($getObjects) {
                    $arr[] = array("id" => $index, "collection" => $collection->__debugInfo(), "objects" => $this->getObjects($db, $collection->getName()));
                } else {
                    $arr[] = array("id" => $index, "collection" => $collection->__debugInfo());
                }
                $index++;
            }
            return $arr;

        } catch(\Exception $e) {
            return [];
        }
    }

    /**
     * Returns the objects for the given collection
     *
     * @param   string  $db             string DB Name
     * @param   string  $collection     string Collection name
     * @return  array
     */
    private function getObjects(string $db, string $collection)
    {
        $arr     = [];
        $cursor  = $this->mongo->connectClientDb($db)->selectCollection($collection); // (new MongoDB\Client)->$db->selectCollection($collection);
        $objects = $cursor->find();
        $arr['objects'] = $objects->toArray();
        $arr['count']   = count($arr['objects']);
        return $arr;
    }

    /**
     * Used to confirm that a database has been dropped
     *
     * @param string $name
     * @param array $result
     * @return array
     */
    private function setDeleteStatus(string $name, array $result)
    {
        if ($result['dropped'] == $name && $result['ok'] == 1) {
            return array($name => 'success');
        }
        return array($name => 'failed');
    }

    /**
     * DatabasesController constructor.
     */
    public function __construct()
    {
        /** @var \App\Models\User $user */
        $user = auth()->guard('api')->user();
        $this->mongo = new Mongo($user);
        if ($this->mongo->checkConfig()) {
            $this->mongo->connectClient();
            $this->client = $this->mongo->getClient();
        }
    }

    /**
     * Display a listing of all databases.
     *
     * URL:         /api/v1/databases
     * Method:      GET
     * Description: Fetches all databases with full stats
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDatabases()
    {
        // get the databases
        $databases = $this->getAllDatabases();

        if ($error = $this->getErrorMessage()) {
            // this can occur if there is no Server config
            return response()->error('failed', array('error' => $error));

        } else {
            return response()->success('success', array('databases' => $databases));
        }
    }

    /**
     * Display a single database.
     *
     * URL:         /api/v1/databases/{name}
     * Method:      GET
     * Description: Fetches all databases with full stats
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDatabase(Request $request, $name)
    {
        // get the databases
        $database = $this->getAllDatabases($name);

        return response()->success('success', array('database' => $database));
    }

    /**
     * Creating a new MongoDB database
     *
     * URL:         /api/v1/databases/create
     * Method:      POST
     * Description: Create a new database using the given name
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createDatabase(Request $request)
    {
        $db = $request->get('database');
        // create the database
        $database = $this->mongo->connectClientDb($db); // (new MongoDB\Client)->$db;

        // ToDo: we need to add a default collection to initialise the DB in MongoDB
        $database->createCollection('foo');

        $index = 0;
        // this lets us build the $index value correctly and re-fetch the new DB so that we cab grab its stats
        // ToDo: their might be a better way to to this - something more efficient - haven't found it yet in the docs
        foreach ($this->client->listDatabases() as $mdb) {
            $index++;
            if ($mdb->getName() == $db) {
                $dbn      = $mdb->getName();
                $database = $this->mongo->connectClientDb( $dbn ); // (new MongoDB\Client)->$dbn;
            }
        }
        // the index  is used as a key in the front-end
        $index++;

        // get the DB stats
        $stats = $database->command(array('dbstats' => 1))->toArray()[0];
        $statistics = [];
        foreach ($stats as $key => $value) {
            $statistics[ $key ] = $value;
        }
        $arr = array("id" => $index, "db" => $database->__debugInfo(), "stats" => $statistics, "collections" => $this->getCollections($db));

        return response()->success('success', array('database' => $arr ));
    }

    /**
     * Deleting a MongoDB database
     *
     * URL:         /api/v1/databases/delete
     * Method:      POST
     * Description: Delete the database matching the given name
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteDatabase(Request $request)
    {
        $names  = $request->get('names', false);
        $status = array();
        if ($names && is_array($names)) {
            foreach ($names as $name) {
                if (!empty($name)) {
                    $db = $this->mongo->connectClientDb( $name ); // (new MongoDB\Client)->$name;

                    /** @var MongoDB\Model\BSONDocument $result */
                    $result = $db->drop();
                    $status[] = $this->setDeleteStatus( $name, $result->getArrayCopy());
                }
            }
        }

        return response()->success('success', array('status' => $status ));
    }

    /**
     *
     * @inheritDoc
     */
    public function bsonUnserialize(array $data)
    {
        // TODO: Implement bsonUnserialize() method.
        $this->unserialised = $data;
    }
}
