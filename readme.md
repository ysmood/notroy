You can setup your own server or use mine.

## Quick Start


Inject this script into a page

```html
<script src="https://n.vane.im/{id}"></script>
```

The `{id}` should be unique for each page, so that you can control different pages
independently.


### Execute Random Code on Page

Now you are able to execute any code on that page, for example

```bash
curl https://n.vane.im/{id} -d 'alert("ok")'
```

The page should alert "ok".


### Get Return Value

The example below will return the user agent of that page.

```bash
curl https://n.vane.im/{id} -d 'navigator.userAgent'
```

The client will auto-handle promise.

### Live Reload Page

Use it to auto-reload the page
when file changes during the development.
Get `guard` cli tool from [here](https://github.com/ysmood/gokit).

```
cd to-my-project
guard -- curl https://n.vane.im/{id} -d 'location.reload()'
```
