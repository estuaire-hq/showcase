"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "@/sanity/schemas";
import { structure } from "@/sanity/structure";

export default defineConfig({
	name: "default",
	title: "Estuaire",
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "",
	basePath: "/studio",
	plugins: [
		structureTool({ structure }),
		presentationTool({
			previewUrl: {
				previewMode: {
					enable: "/api/draft-mode/enable",
				},
			},
		}),
		visionTool(),
	],
	schema: {
		types: schemaTypes,
	},
});
