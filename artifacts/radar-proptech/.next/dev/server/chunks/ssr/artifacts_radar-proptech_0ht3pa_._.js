module.exports = [
"[project]/artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts
/* __next_internal_action_entry_do_not_use__ [{"40182cbeb8ad260604c1f70ee5f29beebcf9ae25d3":{"name":"joinWaitlist"}},"artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts",""] */ __turbopack_context__.s([
    "joinWaitlist",
    ()=>joinWaitlist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$106$2e$1$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.106.1/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.6_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function joinWaitlist(data) {
    if (!data.email || !data.zona || !data.nombre || !data.telefono || !data.agencia) {
        return {
            error: "Todos los campos de contacto son obligatorios."
        };
    }
    const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$106$2e$1$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://yokwjkiwfqwrmmivvpym.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabaseAdmin.from("waitlist").insert([
        data
    ]);
    if (error) {
        if (error.code === '23505') {
            return {
                error: "Este email ya está en la lista de espera."
            };
        }
        console.error("Waitlist DB Error:", error.message);
        return {
            error: "Error interno del servidor. Inténtalo de nuevo."
        };
    }
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    joinWaitlist
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$6_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(joinWaitlist, "40182cbeb8ad260604c1f70ee5f29beebcf9ae25d3", null);
}),
"[project]/artifacts/radar-proptech/.next-internal/server/app/(marketing)/page/actions.js { ACTIONS_MODULE0 => \"[project]/artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$radar$2d$proptech$2f$app$2f28$marketing$292f$actions$2f$waitlist$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts [app-rsc] (ecmascript)");
;
}),
"[project]/artifacts/radar-proptech/.next-internal/server/app/(marketing)/page/actions.js { ACTIONS_MODULE0 => \"[project]/artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40182cbeb8ad260604c1f70ee5f29beebcf9ae25d3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$radar$2d$proptech$2f$app$2f28$marketing$292f$actions$2f$waitlist$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["joinWaitlist"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$radar$2d$proptech$2f2e$next$2d$internal$2f$server$2f$app$2f28$marketing$292f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$artifacts$2f$radar$2d$proptech$2f$app$2f28$marketing$292f$actions$2f$waitlist$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/artifacts/radar-proptech/.next-internal/server/app/(marketing)/page/actions.js { ACTIONS_MODULE0 => "[project]/artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$artifacts$2f$radar$2d$proptech$2f$app$2f28$marketing$292f$actions$2f$waitlist$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/artifacts/radar-proptech/app/(marketing)/actions/waitlist.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=artifacts_radar-proptech_0ht3pa_._.js.map