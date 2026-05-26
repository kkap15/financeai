'use client'

import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import React from "react";
import InactivityBanner from "./InactivityBanner";
import InactivityModal from "./InactivityModal";

export default function InactivityWrapper({
    children
} : {
    children: React.ReactNode
}) {
    const {showBanner, showModal, stayLoggedIn} = useInactivityLogout();

    return(
        <>
            {showBanner && !showModal && (
                <InactivityBanner onDismiss={stayLoggedIn} />
            )}
            {showModal && (
                <InactivityModal onStay={stayLoggedIn} />
            )}
            {children}
        </>
    )
}