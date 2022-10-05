# Operator Server

Operator Server is an authoring and testing application designed specifically for TTPs.

## Get started

Install the requirements and start the server:
```
pip install -r requirements.txt
yarn build
python server.py
```

To do development, you must compile all static resources (/client directory) as they are changed. You can do this
automatically by running this command in a separate terminal:
To compile your CSS:
```
yarn run dev
```

## Advanced

### Back End

Built on top of the Vertebrae framework, the backend is structured in the standard design (Routes, Services, databases).

The backend leverages two databases:

* Relational: Postgres stores all TTP manifest and results from testing.
* S3: AWS S3 storage contains all source and compiled code samples.

### Front End

The front end (FE) is a minimal dependency GUI that uses jQuery to interact with the DOM but otherwise relies
only on standard JavaScript to perform all functions. 

All static resources live in the ```client``` directory:

* assets: images and icons
* css: SCSS files. These are compiled into a single ```app.css```.
* templates: the ```index.html``` page that represents the only HTML page in this app.
* js: JavaScript files, further organized by:
  * api.js: a module that connects the FE to the server-side API.
  * main.js: this is where the application starts.
  * page.js: a module representing the entire webpage on top of the DOM.
  * dom: template DOM elements that get attached to the Page module.
  * lib: external libraries dropped into this app.
  * plugins: independent classes that will show up on the right navigation bar.
  * screens: code editing screens that allow you to build TTPs.
