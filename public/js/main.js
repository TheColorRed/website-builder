"use strict";
var builder;
(function (builder) {
    async function submit(form) {
        let el = (typeof form == 'string' ? document.querySelector(form) : form);
        if (!el.reportValidity())
            return;
        let data = new FormData(el);
        let obj = {};
        Array.from(data.entries()).forEach(i => obj[i[0]] = i[1]);
        let response = await fetch(el.action, {
            method: el.method,
            body: JSON.stringify(obj)
        });
        let text = await response.text();
        try {
            return JSON.parse(text);
        }
        catch (e) {
            return text;
        }
    }
    builder.submit = submit;
})(builder || (builder = {}));
var builder;
(function (builder) {
    document.addEventListener('DOMContentLoaded', e => {
        Array.from(document.querySelectorAll('.toggle-password')).forEach(el => {
            // Get the associated elements
            let toggle = el.querySelector('.toggle');
            let input = el.querySelector('input[type=password]');
            // Disable link elements
            toggle.addEventListener('click', e => e.preventDefault());
            // Make sure the element is an input element and it's type is "password"
            if (!(input instanceof HTMLInputElement) || input.type != 'password')
                return;
            // Toggle the input element once clicked
            toggle.addEventListener('click', () => input.type = input.type == 'password' ? 'text' : 'password');
        });
    });
})(builder || (builder = {}));
var builder;
(function (builder) {
    document.addEventListener('DOMContentLoaded', e => {
        let btn = document.querySelector('#install');
        btn.addEventListener('click', e => {
            builder.submit(btn.closest('form'));
        });
    });
})(builder || (builder = {}));
