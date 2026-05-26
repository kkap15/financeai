'use client'

import { useCallback, useEffect, useRef, useState } from "react";

const INACTIVE_TIMEOUT = 10 * 60 * 1000;
const BANNER_THRESHOLD = 0.7;
const BANNER_TIME = INACTIVE_TIMEOUT * BANNER_THRESHOLD;
const MODAL_TIME = INACTIVE_TIMEOUT - 60 * 1000;
const CHANNEL_NAME= 'financeai_activity';
const LAST_ACTIVITY_KEY = 'financeai_last_activity';

export function useInactivityLogout() {
    const [showBanner, setShowBanner] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const bannerTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const modalTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const logoutTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const channelRef = useRef<BroadcastChannel | undefined>(undefined);
    const showModalRef = useRef(false);

    const doLogout = useCallback(() => {
            localStorage.removeItem(LAST_ACTIVITY_KEY);
            try {
                localStorage.setItem(LAST_ACTIVITY_KEY, '0');
                localStorage.removeItem(LAST_ACTIVITY_KEY);
            } catch {}
        window.location.assign('/auth/logout');
    }, []);

    const resetTimers = useCallback(() => {
        clearTimeout(bannerTimer.current);
        clearTimeout(modalTimer.current);
        clearTimeout(logoutTimer.current);

        setShowBanner(false);
        setShowModal(false);
        showModalRef.current = false;

        bannerTimer.current = setTimeout(() => setShowBanner(true), BANNER_TIME);
        modalTimer.current = setTimeout(() => { showModalRef.current = true; setShowModal(true); }, MODAL_TIME);
        logoutTimer.current = setTimeout(() => doLogout(), INACTIVE_TIMEOUT);

        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        channelRef.current?.postMessage({type: 'activity'});
    }, [doLogout]);

    const stayLoggedIn = useCallback(() => {
        setShowModal(false);
        showModalRef.current = false;
        resetTimers();
    }, [resetTimers]);

    const mountedRef = useRef(false);

    useEffect(() => {
        channelRef.current = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current.onmessage = (event) => {
            if (event.data.type === 'activity' && !showModalRef.current) {
                resetTimers();
            }
        }

        const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click'];

        const handleActivity = () => {
            if (!mountedRef.current) return;
            if (!showModalRef.current) {
                resetTimers();
            }
        }

        const stored = localStorage.getItem(LAST_ACTIVITY_KEY);

        if (stored) {
            const elapsed = Date.now() - parseInt(stored, 10);
            if (elapsed >= INACTIVE_TIMEOUT) {
                localStorage.removeItem(LAST_ACTIVITY_KEY);
                resetTimers();
            } else {
                const remaining = INACTIVE_TIMEOUT - elapsed;
                const bannerRemaining = BANNER_TIME - elapsed;
                const modalRemaining = MODAL_TIME - elapsed;

                if (bannerRemaining <= 0) {
                    setShowBanner(true);
                } else {
                    bannerTimer.current = setTimeout(() => {
                        setShowBanner(true);
                    }, bannerRemaining);
                }

                if (modalRemaining <= 0) {
                    showModalRef.current = true;
                    setShowModal(true);
                } else {
                    modalTimer.current = setTimeout(() => { 
                        showModalRef.current = true; 
                        setShowModal(true) 
                    }, modalRemaining);
                }
                logoutTimer.current = setTimeout(() => doLogout(), remaining);
            } 
        } else {
            resetTimers();
        }
        
        setTimeout(() => {
            mountedRef.current = true;
            events.forEach(e => window.addEventListener(e, handleActivity))
        }, 2000);

        return () => {
            mountedRef.current = false;
            clearTimeout(bannerTimer.current);
            clearTimeout(modalTimer.current);
            clearTimeout(logoutTimer.current);
            channelRef.current?.close();
            events.forEach(e => window.removeEventListener(e, handleActivity));
        }
    }, [])

    return { showBanner, showModal, stayLoggedIn }
}