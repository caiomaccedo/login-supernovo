const user = Accounts.current();
if (!user) location.replace('index.html');
else {
    document.querySelector('.profile-card').hidden = false;
    document.getElementById('account-name').textContent = user.name;
    document.getElementById('account-email').textContent = user.email;
    const form = document.getElementById('address-form');
    const message = document.getElementById('address-message');
    const card = document.querySelector('.profile-card');
    let finishing = false;
    document.getElementById('offers-button').addEventListener('click', () => {
        const text = 'Olá! Quero conferir as ofertas do Supernovo Balcão Atacado.';
        location.assign(`https://wa.me/5583996213465?text=${encodeURIComponent(text)}`);
    });
    function showWelcome() {
        document.querySelector('.profile-intro').hidden = true;
        document.querySelector('.profile-content').hidden = true;
        const welcome = document.querySelector('.welcome-screen');
        welcome.hidden = false;
        card.classList.add('is-complete');
        document.getElementById('welcome-title').focus({preventScroll:true});
        welcome.classList.remove('motion-enter');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            welcome.classList.add('motion-enter');
        }));
    }
    if (user.address || new URLSearchParams(location.search).get('welcome') === '1') showWelcome();
    form.noValidate = true;
    for (const field of form.querySelectorAll('input, select')) {
        const tooltip = document.createElement('span');
        tooltip.className = 'field-tooltip';
        tooltip.id = `hint-${field.name}`;
        tooltip.setAttribute('role', 'tooltip');
        tooltip.hidden = true;
        field.closest('label').append(tooltip);
        let timer;
        const hide = () => {
            clearTimeout(timer);
            tooltip.hidden = true;
            field.removeAttribute('aria-describedby');
        };
        const schedule = () => {
            hide();
            timer = setTimeout(() => {
                if (field.validity.valid) return;
                tooltip.textContent = field.validity.valueMissing
                    ? (field.tagName === 'SELECT' ? 'Selecione seu estado para continuar.' : 'Preencha este campo para continuar.')
                    : (field.name === 'postalCode' ? 'Informe um CEP com 8 números.' : 'Confira a informação deste campo.');
                tooltip.hidden = false;
                field.setAttribute('aria-describedby', tooltip.id);
            }, 2000);
        };
        field.addEventListener('mouseenter', schedule);
        field.addEventListener('mouseleave', hide);
        field.addEventListener('focus', schedule);
        field.addEventListener('blur', hide);
        field.addEventListener('input', hide);
        field.addEventListener('change', hide);
    }
    for (const state of ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']) {
        form.elements.state.add(new Option(state, state));
    }
    if (user.address) {
        for (const [key, value] of Object.entries(user.address)) if (form.elements.namedItem(key)) form.elements.namedItem(key).value = value;
        document.querySelector('.profile-intro h1').textContent = 'Que bom ter você de volta!';
        message.textContent = 'Seu endereço está salvo. Você pode editá-lo aqui.';
    }
    form.elements.postalCode.addEventListener('input', event => {
        const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
        event.target.value = digits.length > 5 ? `${digits.slice(0,5)}-${digits.slice(5)}` : digits;
    });
    form.addEventListener('submit', event => {
        event.preventDefault();
        if (finishing) return;
        if (!form.checkValidity()) {
            message.textContent = 'Confira os campos obrigatórios e informe um CEP com 8 números.';
            form.querySelector(':invalid')?.focus();
            return;
        }
        const address = Object.fromEntries(Array.from(new FormData(form), ([key, value]) => [key, value.trim()]));
        for (const field of ['street','number','district','city']) {
            if (!address[field]) { message.textContent = 'Preencha os campos obrigatórios.'; form.elements.namedItem(field).focus(); return; }
        }
        try {
            Accounts.saveAddress(address);
            finishing = true;
            form.querySelector('button[type="submit"]').disabled = true;
            form.querySelector('button[type="submit"]').textContent = 'Cadastro salvo!';
            showWelcome();
        } catch { message.textContent = 'Não foi possível salvar. Verifique o armazenamento do navegador.'; }
    });
}
