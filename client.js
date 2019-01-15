var nisper = require('nisper')

window.notroy = function (url, id) {
   
    nisper.default({
        url: url + `/${id}`,
        sandbox: {
            eval(code) {
                return eval(code)
            }
        }
    });
}
