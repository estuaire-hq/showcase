import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/lib/sanity/client";

export const dynamic = "force-dynamic";

const token = process.env.SANITY_API_READ_TOKEN ?? "";

export const { GET } = defineEnableDraftMode({
	client: client.withConfig({ token }),
});
