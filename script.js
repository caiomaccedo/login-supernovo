const container = document.getElementById('container');
function clearAuthForm(form) {
    form.reset();
    form.querySelectorAll('input').forEach(input => { input.value = ''; });
    form.querySelector('.form-message').textContent = '';
}
window.addEventListener('pageshow', () => {
    document.querySelectorAll('.form-container form').forEach(clearAuthForm);
});
document.getElementById('register').addEventListener('click', () => {
    clearAuthForm(document.querySelector('.sign-up form'));
    container.classList.add('active');
});
document.getElementById('login').addEventListener('click', () => container.classList.remove('active'));
for (const mode of ['sign-up', 'sign-in']) {
    const form = document.querySelector(`.${mode} form`);
    form.autocomplete = 'off';
    form.querySelectorAll('input').forEach(input => { input.autocomplete = 'off'; });
    if (mode === 'sign-up') form.elements.password.autocomplete = 'new-password';
    if (mode === 'sign-up') form.elements.password.minLength = 8;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const button = form.querySelector('button'), message = form.querySelector('.form-message');
        button.disabled = true;
        message.textContent = 'Aguarde…';
        try {
            const data = new FormData(form);
            if (mode === 'sign-up') await Accounts.register(data.get('name'), data.get('email'), data.get('password'));
            else await Accounts.login(data.get('email'), data.get('password'));
            location.assign(mode === 'sign-in' ? 'profile.html?welcome=1' : 'profile.html');
        } catch (error) { message.textContent = error.message || 'Não foi possível continuar.'; }
        finally { button.disabled = false; }
    });
    form.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
        event.preventDefault();
        form.querySelector('.form-message').textContent = link.closest('.social-icons')
            ? 'Login social em breve. Use e-mail e senha.' : 'Recuperação de senha em breve.';
    }));
}
