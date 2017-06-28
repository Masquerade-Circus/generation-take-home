/**
 * Session Manager gist
 * https://gist.github.com/Masquerade-Circus/658da13cde895a5f7e26e11d59bb1a71#file-sessionmanager-min-js
 */
let sessionManager = function (t,e,n,a) {
    var i = function (t,e) {
        return void 0 != t ? i.f(t, e) : i.data
    };return i.data = t.getItem(e) ? JSON.parse(t.getItem(e)) : a || {},i.s = function () {
        t.setItem(e, JSON.stringify(i.data))
    },i.f = function (t,e) {
        for (var a,r,f = t.split(n),o = i.data; f.length > 1;)r = f.shift(),(void 0 == o[r] || "object" != typeof o[r]) && (o[r] = {}),o = o[r];return a = f.shift(),void 0 === e ? o[a] : (null === e ? delete o[a] : o[a] = e,i.s(),i)
    },i
};

let storage = localStorage || sessionStorage;
let session = sessionManager(storage, 'favorite_stores', '->', {stores: []});

export default session;
