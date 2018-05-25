# ICGC-Cookie-GDPR

A small cookie consent banner that complies with the EU GDPR.

This library presents the user with a small banner that shows two buttons to comply with the EU GDPR law. 

If the user **allows** the use of cookies, one is set to remember the selected option and enables the tracking by Google Analytics. If the user **denies** the use of cookies, the option is stored and Google Analytics trackers are disabled.

## Using the banner on your website
### Get the required files
* Copy the files found in the _dist_ folder to your project and use it in your html


```html
<link rel="stylesheet" href="./dist/cookies-icgc.min.css">
<script src="./dist/cookies-icgc.js"></script>
```

* or use the github stored files to always use the last version
```html
<link rel="stylesheet" href="https://raw.githubusercontent.com/gencat/ICGC-Cookie-GDPR/master/dist/cookies-icgc.min.css">
<script src="https://raw.githubusercontent.com/gencat/ICGC-Cookie-GDPR/master/dist/cookies-icgc.js"></script>
```

### Create the cookie manager object in a script
```html
<script>
		new icgc.CookiesICGC("yourdomain.com", ["your-google-analytics-id", "another-google-analytics-id"], {configBtnSelector: "#config-button-selector"});
</script>
```
Where:

* The first parameter should be the domain where the cookies are stored
* The second one is a list of Google Analytics Tracking IDs that will be enabled/disabled if the user allows/disallows it
* The third one is an options parameter that's used to configure the popup. You can find the list of possible parameters [here](https://raw.githubusercontent.com/gencat/ICGC-Cookie-GDPR/master/src/defaultOptions.js) but the most important ones are the following ones:

|Element|Subelement|Description|
|---|---|---|
|cookie|name|This is the name of the cookie that will be set to save the user preferences|
||path| This is the url path that the cookie belongs to. The cookie can only be read at this location |
|content|message|The text used by the popup|
||allow|The text used in the Allow button|
||deny|The text used in the Deny button|
||href|The URL where the user will be directed when the privacy policy link is pressed|

## Building and testing the library

Install the dependencies
```
npm install
```

Building the library
```
npm run build-dev
```
Testing the library
```
npm run lint
npm run test-unit
```
Building to release
```
npm run build-min
```

To see an extensive list of the available scripts you can take a look [here](https://github.com/geostarters/js-project-template#provided-scripts)

## Acknowledgements
This cookie consent banner is heavily based on the [Insites cookieconsent](https://github.com/insites/cookieconsent) work and has been adapted to meet the requirements of the ICGC

## License
This library is provided under the [MIT licence](http://opensource.org/licenses/MIT)


