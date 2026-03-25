export const playNotificationSound = (type = 'soft') => {
    if (type === 'silent') return;

    const sounds = {
        soft: 'https://assets.mixkit.co/active_storage/sfx/2861/2861-preview.mp3', // Simple ping
        alarm: 'https://assets.mixkit.co/active_storage/sfx/1000/1000-preview.mp3' // Urgent alert
    };

    const audio = new Audio(sounds[type] || sounds.soft);
    audio.play().catch(err => {});
};

export const NOTIFICATION_SOUNDS = [
    { label: 'Silent', value: 'silent' },
    { label: 'Soft Tone', value: 'soft' },
    { label: 'Alarm Tone', value: 'alarm' }
];
