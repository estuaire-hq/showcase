import { defineQuery } from "next-sanity";

export const HOME_PAGE_QUERY = defineQuery(/* groq */ `
  *[_id == "homePage"][0]{
    title,
    tagline
  }
`);

export { defineQuery };
