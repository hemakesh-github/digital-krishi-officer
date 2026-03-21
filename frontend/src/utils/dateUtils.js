const IST_OPTIONS = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
};

const IST_DATE_OPTIONS = {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: '2-digit'
};

const IST_FULL_DATE_OPTIONS = {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
};

export function toISTTime(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('en-IN', IST_OPTIONS);
}

export function toISTDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-IN', IST_DATE_OPTIONS);
}

export function toISTDateTime(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('en-IN', IST_FULL_DATE_OPTIONS);
}

export function toISTWeekday(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleDateString('en-IN', { 
        timeZone: 'Asia/Kolkata', 
        weekday: 'short' 
    });
}
