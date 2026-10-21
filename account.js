// Prototype: browser storage is not a production authentication boundary.
const Accounts = (() => {
    const key = 'supernovo.accounts.v1', sessionKey = 'supernovo.session.v1';
    const read = () => JSON.parse(localStorage.getItem(key) || '[]');
    const write = users => localStorage.setItem(key, JSON.stringify(users));
    const normalize = email => email.trim().toLowerCase();
    const hex = bytes => Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
    async function digest(password, salt) {
        const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        return hex(new Uint8Array(await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 210000}, material, 256)));
    }
    return {
        async register(name, email, password) {
            email = normalize(email); name = name.trim();
            if (!name) throw new Error('Informe seu nome.');
            if (password.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.');
            if (read().some(user => user.email === email)) throw new Error('Este e-mail já está cadastrado. Entre na sua conta.');
            const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
            const hash = await digest(password, salt);
            const users = read();
            if (users.some(user => user.email === email)) throw new Error('Este e-mail já está cadastrado.');
            users.push({name, email, salt, hash, address: null}); write(users);
            sessionStorage.setItem(sessionKey, email);
        },
        async login(email, password) {
            email = normalize(email);
            const user = read().find(user => user.email === email);
            if (!user || await digest(password, user.salt) !== user.hash) throw new Error('E-mail ou senha incorretos.');
            sessionStorage.setItem(sessionKey, email);
        },
        current() { return read().find(user => user.email === sessionStorage.getItem(sessionKey)); },
        saveAddress(address) {
            const users = read(), user = users.find(user => user.email === sessionStorage.getItem(sessionKey));
            if (!user) throw new Error('Entre novamente para continuar.');
            user.address = address; write(users);
        },
        logout() { sessionStorage.removeItem(sessionKey); }
    };
})();
