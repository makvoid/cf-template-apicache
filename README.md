# HarperDB Custom Functions API Cache

This HarperDB API Cache Custom Function will relay any API request through a HarperDB, returning a cached version if it has one, or make the origin API call, store, and return the result if it doesn't.

## Install

To include this project in your custom functions, clone it into your custom_functions folder:

`git clone https://github.com/HarperDB-Add-Ons/cf-template-apicache.git [PATH_TO_YOUR_HDB_FOLDER]/custom-functions/api-cache`

## Configure

Next, configure your API Relay's behavior in `[PATH_TO_YOUR_HDB_FOLDER]/custom-functions/api-cache/helpers/config.js`. Defaults are listed below:

- MAX_AGE_SECONDS = 300
- METHODS_TO_CACHE = `["GET"]`

**After configuring your API Relay, be sure to restart your custom function server so the settings take effect.** You can do this using the `restart_service` operation, or using the `Restart Server` button in the Custom Functions section of [HarperDB Studio](https://studio.harperdb.io).

## Implement

Finally, modify your application's API calls to hit your HarperDB Api Relay by prepending the API Relay URL to your API URL:

- Old: https://my-api.com/v1/my-endpoint?user=12345
- New: [MY_HDB_CF_SERVER_URL]/api-cache?https://my-api.com/v1/my-endpoint?user=12345
