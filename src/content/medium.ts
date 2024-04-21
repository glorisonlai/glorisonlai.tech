import Parser from "rss-parser";

type MediumBlog = {
  title: string;
  link: string;
  "content:encoded": string;
};

export type Post = {
  title: string;
  link: string;
  desc: string;
  image: string;
};

const parser = new Parser<{}, MediumBlog>({
  customFields: {
    feed: [],
    item: ["title", "link", "content:encoded"],
  },
});

const parseContent = (post: MediumBlog): Post => {
  const postContent = post["content:encoded"];

  const imgRegex = /<img.*?src="(.+?)"/;
  const imgMatch = postContent.match(imgRegex);
  const imgSrc = imgMatch ? imgMatch[1] : "";

  // Strip repeat of title
  // Limit to 40 chars
  // Get contents within <p>
  const pRegex = /(?<=<p>)(\w|\s|\p{P})*(?=<\/p>)/gu;
  const titleLen = post.title.length;
  const descMatches = postContent.match(pRegex) ?? [];

  const desc = descMatches
    .flatMap((sentence) => sentence.split(" "))
    .slice(0, 40)
    .join(" ");

  return {
    title: post.title,
    link: post.link,
    image: imgSrc,
    desc,
  };
};

export const getContent = async () => {
  const mediumRssUri = "https://medium.com/feed/@lai.glorison";

  const mediumRes = await parser.parseURL(mediumRssUri).catch((e) => {
    throw Error(`Could not fetch from Medium\n` + e);
  });

  const parsedContent = mediumRes.items.map(parseContent);

  return parsedContent;
};
