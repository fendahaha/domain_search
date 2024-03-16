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
    const queryString = new URLSearchParams(data).toString();
    const urlWithParams = data !== null ? `${url}?${queryString}` : url;
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
    prefix: 'https://api.domainsearch.fenda',
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
    prefix: 'https://api.domainsearch.fenda',
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