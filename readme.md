You can setup your own server (`npm i notroy`) or use the demo service https://n.vane.im.

## Quick Start


Inject this script into a page

```html
<script src="https://n.vane.im/{id}"></script>
```

The `{id}` should be unique for each page, so that you can control different pages
independently. Anyone who has the id can control the page, so you'd better treat it as
a password. Multiple pages can share a same id (actually the id is group id, which can be used for broadcast).
If you left the id empty, a random id will be generated, it will be printed in the console.


### Execute Random Code on Page

Now you are able to execute any code on that page, for example

```bash
curl https://n.vane.im/{id} -d "alert('ok')"
```

The page should alert "ok".


### Get Return Value

The example below will return the user agent of that page.

```bash
curl https://n.vane.im/{id} -d "navigator.userAgent"
```

The client will auto-handle promise.

### Remote Assistant

Useful when you want to remote debug some production bug from a customer's page.

Let the user run this in their browser's address bar (for some browsers they will remove the `javascript:` prefix when you paste, you have to type it manually)

```
javascript:(function(e){e.src='https://n.vane.im/{id}';document.body.appendChild(e)})(document.createElement('script'))
```


### Live Reload Page

Use it to auto-reload the page
when file changes during the development.
Get `guard` cli tool from [here](https://github.com/ysmood/gokit).

```
cd to-my-project
guard -- curl https://n.vane.im/{id} -d "location.reload()"
```
