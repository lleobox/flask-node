import { ServerResponse } from 'http';

import { render } from './render';

export interface ResponseData {
    entiry: string;
    status: number;
    headers: Object
}

interface CookieValue {
    key: string;
    value: string;
    maxAge?: number;
    expires?: number;
    domain?: string;
    path?: string;
}

const defaultHeader = {
    'Content-Type': 'text/html'
}

export class Response {
    private res: ServerResponse;

    constructor(res: ServerResponse) {
        this.res = res;
    }

    private finish(status: number, headers: Object, entiry?: Object) {
        let res = this.res;

        headers = Object.assign(defaultHeader, headers);

        res.writeHead(status, headers);
        if (entiry !== undefined) res.write(entiry);

        res.end();
    }

    setCookie(...cookies: CookieValue[]) {
        cookies.forEach((data) => {
            let cookie = `${data.key}=${data.value}; `;

            if (data.maxAge !== undefined) cookie += `Max-Age = ${data.maxAge}; `;
            if (data.domain !== undefined) cookie += `Domain  = ${data.domain}; `;
            if (data.expires !== undefined) cookie += `Expires = ${data.expires}; `;
            if (data.path !== undefined) cookie += `Path    = ${data.path}; `;

            this.res.setHeader('Set-Cookie', cookie);
        })
    }

    abort(status = 401) {
        this.finish(status, {});
    }

    redirect(url: string) {
        let status = 301;
        let headers = {
            'Location': url
        }

        this.finish(status, headers);
    }

    render(templatePath: string, data?: Object) {
        let response = render(templatePath, data);

        this.end(response);
    }

    end(response: string | ResponseData, status: number = 200) {
        let entiry;
        let headers = {};

        if (typeof response === 'string') {
            entiry = response;
        } else {
            entiry = response.entiry;
            headers = response.headers;
            status = response.status;
        }

        this.finish(status, headers, entiry);
    }
}