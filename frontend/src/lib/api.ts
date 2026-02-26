'use client';

import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';

const API_BASE_STORAGE_KEY = 'api_use_secondary';

let useSecondary = typeof window !== 'undefined' && localStorage.getItem(API_BASE_STORAGE_KEY) === '1';

function switchToSecondary() {
    useSecondary = true;
    localStorage.setItem(API_BASE_STORAGE_KEY, '1');
}

export function isUsingSecondary() { return useSecondary; }

function switchToPrimary() {
    useSecondary = false;
    localStorage.removeItem(API_BASE_STORAGE_KEY);
}

// On page load, if we were using secondary, probe primary to see if it's recovered.
// Stored as a promise so sendAPIRequest can await it before sending any request.
const primaryProbe: Promise<void> = (typeof window !== 'undefined' && useSecondary)
    ? fetch(process.env.NEXT_PUBLIC_API_BASE + '/health', { method: 'HEAD' })
        .then(response => { if (response.ok) switchToPrimary(); })
        .catch(() => { /* primary still down, keep using secondary */ })
    : Promise.resolve();

export function connectSocket(
    opts?: Partial<ManagerOptions & SocketOptions>,
    onSwitchedToSecondary?: () => void
): Socket {
    const base = useSecondary
        ? process.env.NEXT_PUBLIC_API_BASE_SECONDARY!
        : process.env.NEXT_PUBLIC_API_BASE!;

    const socket = io(base, opts);

    if (!useSecondary) {
        socket.io.once('reconnect_failed', () => {
            switchToSecondary();
            onSwitchedToSecondary?.();
        });
    }

    return socket;
}

export async function sendAPIRequest(endpoint: string, method: string, authToken?: string, data?: any): Promise<Response> {
    await primaryProbe;

    const base = useSecondary
        ? process.env.NEXT_PUBLIC_API_BASE_SECONDARY
        : process.env.NEXT_PUBLIC_API_BASE;

    try {
        const response = await fetch(base + endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(authToken && { Authorization: `Bearer ${authToken}` }),
            },
            body: data ? JSON.stringify(data) : undefined,
        });

        if (!useSecondary && response.status >= 500) {
            switchToSecondary();
            return sendAPIRequest(endpoint, method, authToken, data);
        }

        return response;
    } catch {
        if (!useSecondary) {
            switchToSecondary();
            return sendAPIRequest(endpoint, method, authToken, data);
        }
        throw new Error('Both API servers unreachable');
    }
}

