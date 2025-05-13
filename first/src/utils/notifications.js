
let lastNotificationTimeout;
export function showNotification(message, type, title = '', timeToRemove = 3000) {
    if (!type) return;

    const divName = 'message_notification';
    const div = document.getElementById(divName);

    div.classList.add(type);
    div.classList.remove('close-animation');
    div.classList.add('open-animation');

    const icons = div.querySelector('.icon');
    icons.querySelectorAll('svg').forEach(icon => {
        icon.style.display = 'none';
    });

    document.getElementById(`${divName}_${type}_icon`).style.display = 'inline-block';
    document.getElementById(`${divName}_title`).innerHTML = title;
    document.getElementById(`${divName}_content`).innerHTML = message;

    if (lastNotificationTimeout) clearTimeout(lastNotificationTimeout);
    lastNotificationTimeout = setTimeout(() => {
        div.classList.remove('open-animation');
        div.classList.add('close-animation');
        lastNotificationTimeout = null;

        lastNotificationTimeout = setTimeout(() => {
            div.classList.remove(type);
            lastNotificationTimeout = null;
        }, 500);
    }, timeToRemove);
}

export function showNotificationError(message, title = '', timeToRemove = 8000) {
    showNotification(message, 'error', title, timeToRemove);
}

export function showNotificationSuccess(message, title = '', timeToRemove) {
    showNotification(message, 'success', title, timeToRemove);
}