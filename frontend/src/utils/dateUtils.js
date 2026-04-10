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

function parseUtcTimestamp(value) {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

    const normalizedValue =
        typeof value === 'string' && !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)
            ? `${value}Z`
            : value;

    const parsedDate = new Date(normalizedValue);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatTime(utcTimestamp) {
    const parsedDate = parseUtcTimestamp(utcTimestamp);
    if (!parsedDate) return '';
    return parsedDate.toLocaleTimeString('en-IN', IST_OPTIONS);
}

export function toISTTime(isoString) {
    return formatTime(isoString);
}

export function toISTDate(isoString) {
    const parsedDate = parseUtcTimestamp(isoString);
    if (!parsedDate) return '';
    return parsedDate.toLocaleDateString('en-IN', IST_DATE_OPTIONS);
}

export function toISTDateTime(isoString) {
    const parsedDate = parseUtcTimestamp(isoString);
    if (!parsedDate) return '';
    return parsedDate.toLocaleString('en-IN', IST_FULL_DATE_OPTIONS);
}

export function toISTWeekday(timestamp) {
    const parsedDate = parseUtcTimestamp(timestamp * 1000);
    if (!parsedDate) return '';
    return parsedDate.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata', 
        weekday: 'short' 
    });
}
