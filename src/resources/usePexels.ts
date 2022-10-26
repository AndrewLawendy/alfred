// @ts-nocheck
import { createClient, PhotosWithTotalResults } from "pexels";

import useFetch from "hooks/useFetch";

const client = createClient(process.env.REACT_APP_PEXELS_API_ID as string);

function getPicture(query: string, per_page: number) {
  return client.photos.search({
    query: `male clothing ${query}`,
    per_page,
    orientation: "square",
    size: "small",
    page: Math.floor(Math.random() * 10 + 1),
  });
}

const usePexels = (query: string, per_page = 10) => {
  return useFetch<PhotosWithTotalResults>(() => getPicture(query, per_page));
};

export default usePexels;
