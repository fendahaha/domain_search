function postJson(url, data = null, headers = {}) {
    let _data = null;
    if (data) {
        _data = JSON.stringify(data);
    }
    return fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            ...headers
        },
        redirect: "follow",
        credentials: 'include',
        mode: "cors",
        body: _data,
        cache: 'no-store',
    })
}

function postForm(url, data = null, headers = {}) {
    let formData = null;
    if (data) {
        formData = new FormData();
        for (let key in data) {
            formData.append(key, data[key])
        }
    }

    return fetch(url, {
        method: 'POST',
        headers: {
            ...headers
        },
        redirect: "follow",
        credentials: 'include',
        mode: "cors",
        body: formData,
        cache: 'no-store',
    })
}

function get(url, data = null, headers = {}) {
    let urlWithParams = url;
    if (data) {
        const queryString = new URLSearchParams(data).toString();
        urlWithParams = `${url}?${queryString}`;
    }
    return fetch(urlWithParams, {
        method: 'GET',
        redirect: "follow",
        credentials: 'include',
        mode: "cors",
        headers: {
            ...headers
        },
        cache: 'no-store',
    })
}

export const backend = {
    // prefix: 'https://api.domainsearch.fenda',
    prefix: process.env.NEXT_PUBLIC_API_PREFIX,
    get: function (url, data = null, headers = {}) {
        return get(this.prefix + url, data, headers)
    },
    postJson: function (url, data = null, headers = {}) {
        return postJson(this.prefix + url, data, headers)
    },
    postForm: function (url, data = null, headers = {}) {
        return postForm(url, data, headers)
    }
}
export const frontend = {
    prefix: process.env.NEXT_PUBLIC_API_PREFIX,
    get: function (url, data = null, headers = {}) {
        return get(this.prefix + url, data, headers)
    },
    postJson: function (url, data = null, headers = {}) {
        return postJson(this.prefix + url, data, headers)
    },
    postForm: function (url, data = null, headers = {}) {
        return postForm(this.prefix + url, data, headers)
    }
}
export const frontend_util = {
    _: function (promise) {
        return promise
            .then(res => res.ok ? res.json() : Promise.reject(false))
            .then(r => r ? r : Promise.reject(false))
            .catch(reason => false)
    },
    get: function (url, data = null, headers = {}) {
        return this._(frontend.get(url, data, headers))
    },
    postJson: function (url, data = null, headers = {}) {
        return this._(frontend.postJson(url, data, headers))
    },
    postForm: function (url, data = null, headers = {}) {
        return this._(frontend.postForm(url, data, headers))
    },
}