"use client";

import AirdropForm from "@/components/AirdropForm";

export function HomeContent() {
    return (
        <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-8">
            <AirdropForm isUnsafeMode={false} onModeChange={() => {}} />
        </main>
    )
}