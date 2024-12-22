import groq from "groq";
groq`*[_type == "post" && slug.current == $slug][0]`;
const postsQuery = groq`*[_type == "post" && defined(slug.current)] | order(_createdAt desc)`;
const load = async (event) => {
  const { loadQuery } = event.locals;
  const initial = await loadQuery(postsQuery);
  return {
    query: postsQuery,
    options: { initial }
  };
};
export {
  load
};
