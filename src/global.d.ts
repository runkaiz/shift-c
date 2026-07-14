/// <reference types="@sveltejs/kit" />
/// <reference types="@cloudflare/workers-types" />

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				EMAIL?: { send(message: unknown): Promise<unknown> };
				CRON_SECRET: string;
				EMAIL_FROM_ADDRESS: string;
				DRY_RUN_EMAIL?: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
		}
	}
}

export {};
