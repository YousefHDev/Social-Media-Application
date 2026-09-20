const hashtagPattern = /#([A-Za-z0-9_]{1,50})/g;

export const extractHashtags = (content = '') => {
  const matches = content.matchAll(hashtagPattern);
  return [...new Set([...matches].map((match) => match[1].toLowerCase()))].slice(0, 10);
};

export const normalizeHashtags = (tags = []) => (
  [...new Set(
    tags
      .filter((tag) => typeof tag === 'string')
      .map((tag) => tag.trim().replace(/^#/, '').toLowerCase())
      .filter((tag) => /^[a-z0-9_]{1,50}$/.test(tag))
  )].slice(0, 10)
);

export const getPostHashtags = (content, tags = []) => (
  [...new Set([...normalizeHashtags(tags), ...extractHashtags(content)])].slice(0, 10)
);
